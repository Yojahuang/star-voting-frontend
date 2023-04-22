<template>
    <div class="mx-auto w-75">
        <div v-if="!hasDecrypted()">
            <v-text-field autofocus v-model="passcode" @keyup.enter="decrypt" label="Passcode"></v-text-field>
        </div>

        <div class="text-h3 my-4">{{ payload.title }}</div>

        <div class="my-4">{{ payload.description }}</div>

        <div v-show="info.showRealtimeResult" class="mx-auto my-4" style="width: 600px;height:400px;" id="echart">
        </div>

        <div class="font-weight-thin">Your remaining votes: <p class="font-weight-bold d-inline"
                :style="{ color: remainVoteFontColor() }">{{ calculateRemainVote() }}
            </p>
        </div>


        <div class="my-4">
            <template v-for="(option, index) in payload.options">
                <div class="d-flex align-center w-100 mx-auto justify-start">
                    <div class="mx-2">{{ option }}</div>
                    <v-text-field class="w-auto mx-2" :rules="voteRules" hide-details="auto" v-model="vote[index]">
                        <template #prepend-inner><v-icon @click="decreaseVote(index)" icon="mdi-minus"></v-icon></template>
                        <template #append-inner><v-icon @click="increaseVote(index)" icon="mdi-plus"></v-icon></template>
                    </v-text-field>
                </div>

            </template>
        </div>
        <v-divider></v-divider>

        <div class="d-flex my-4">
            <v-btn class="mx-2" prepend-icon="mdi-account-plus" :disabled="stateEnum[voteInfoOnChain.state] != 'Created'"
                @click="joinVote()">Join
                the vote</v-btn>
            <v-btn class="mx-2" :disabled="stateEnum[voteInfoOnChain.state] != 'Ongoing'" @click="castVote()">Vote</v-btn>
            <v-btn class="mx-2"
                v-if="browserWallet.getAddress() == voteInfoOnChain.ownerAddress && stateEnum[voteInfoOnChain.state] == 'Created'"
                @click="startVote()" prepend-icon="mdi-toggle-switch">Start
                Vote</v-btn>
            <v-btn class="mx-2"
                v-if="browserWallet.getAddress() == voteInfoOnChain.ownerAddress && stateEnum[voteInfoOnChain.state] == 'Ongoing'"
                @click="endVote()" prepend-icon="mdi-toggle-switch">End
                Vote</v-btn>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ethers } from "ethers"
import { ref, reactive } from "vue"
import AES from 'crypto-js/aes';
import encUtf8 from 'crypto-js/enc-utf8'
import * as echarts from 'echarts';
import { Identity } from "@semaphore-protocol/identity"
import { Group } from "@semaphore-protocol/group"

import StarVotingContract from "@/composables/StarVoting"
import BrowserWallet from "@/composables/wallet"
import { getGroupMembers } from '@/composables/Group'

import { useGlobalStore } from '@/stores/Global';

import * as eccryptoJS from 'eccrypto-js';
import { Buffer } from 'buffer';


import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';

const voteRules = [(value: string) => {
    console.log(vote.value)
    if (Number(value) < 0) return "Can't be negative"
    if (Number.isNaN(Number(value))) return "Please input a number"
    if (calculateRemainVote() < 0) return "Remain vote < 0"
    return true
},]

const stateEnum = ["Created", "Ongoing", "Ended"]

const voteInfoOnChain = reactive({
    ownerAddress: "",
    state: 0,
})

const getStateFromBlockchain = async () => {
    const StarVoting = new StarVotingContract()
    StarVoting.init()
    const result = await StarVoting.getPollState(pollId)
    voteInfoOnChain.state = result
}

const getInfoFromBlockchain = async () => {
    const StarVoting = new StarVotingContract()
    StarVoting.init()
    const result = await StarVoting.getEncryptedPollInfo(pollId)
    return result
}

const getOwnerOfVoteFromBlockchain = async () => {
    const StarVoting = new StarVotingContract()
    StarVoting.init()

    const result = await StarVoting.getPollCoordinator(pollId)

    voteInfoOnChain.ownerAddress = result
}

const browserWallet = new BrowserWallet()

const passcodeDialog = ref(true)

const passcode = ref("t031")

const route = useRoute()
const routeId = route.params.id
const pollId = ethers.BigNumber.from("0x" + routeId)

let info: any = {}

const getInfo = async () => {
    info = await getInfoFromBlockchain()
    info = JSON.parse(info)
}

onMounted(async () => {
    await getInfo()
    await getOwnerOfVoteFromBlockchain()
    await getStateFromBlockchain()
})

const payload = ref({
    title: "",
    description: "",
    voteCount: 0,
    options: [],
    useQuadratic: false,
})
const vote = ref<number[]>([])

const hasDecrypted = () => {
    try {
        const checklist = [info.payload.title, info.payload.description, info.payload.options, info.payload.voteCount]
        for (let i = 0; i < checklist.length; ++i) if (checklist[i] == undefined) return false
    } catch (error) {
        return false
    }
    return true
}

const castVote = async() => {
    const identityStr = localStorage.getItem("identity")
    if (identityStr == undefined) return

    console.log("Casting vote")
    const identify = new Identity(identityStr)

    // Fetch group members to rebuild merkle tree
    const globalStore = useGlobalStore()
    const { selectedChain } = storeToRefs(globalStore)

    const memberInGroup = await getGroupMembers(selectedChain.value, pollId.toString())
    console.log(memberInGroup)


    // Remove the identity from local storage
    // localStorage.removeItem("identity")
}

const endVote = async () => {

}

const startVote = async () => {
    const keyPair = eccryptoJS.generateKeyPair();

    const publicKeyBase64 = keyPair.publicKey.toString('base64')
    const privateKeyBase64 = keyPair.privateKey.toString('base64')

    localStorage.setItem("publicKey", publicKeyBase64);
    localStorage.setItem("privateKey", privateKeyBase64);

    const StarVoting = new StarVotingContract()
    StarVoting.init()

    await StarVoting.startPoll(pollId, publicKeyBase64)
}

const joinVote = async () => {
    const identity = new Identity()
    const { trapdoor, nullifier, commitment } = identity
    // Send commitment to smart contract to join the group!
    localStorage.setItem("identity", identity.toString())

    const StarVoting = new StarVotingContract()
    StarVoting.init()

    await StarVoting.addVoter(pollId, commitment)
}

const parseRealtimeResult = (): number[] => {
    const result: number[] = []
    if (info.showRealtimeResult == true) {
        for (let i = 0; i < payload.value.options.length; i++) result.push(10)
    } else {
        for (let i = 0; i < payload.value.options.length; i++) result.push(0)
    }

    // the code of parsing realtime result from blockchain
    console.log(result)
    return result
}

const setupChart = () => {
    let myChart = echarts.init((document.getElementById('echart') as any));
    const option = {
        xAxis: {
            type: 'category',
            data: payload.value.options
        },
        yAxis: {
            type: 'value'
        },
        series: [
            {
                data: parseRealtimeResult(),
                type: 'bar',
            }
        ]
    };

    myChart.setOption(option)
}

const decreaseVote = (index: number) => {
    vote.value[index]--

    if (vote.value[index] < 0) {
        vote.value[index]++
    }
}

const increaseVote = (index: number) => {
    vote.value[index]++

    if (calculateRemainVote() < 0) {
        vote.value[index]--
    }
}

const calculateRemainVote = () => {
    if (typeof info.payload == 'string') return 0

    let ans = payload.value.voteCount

    for (let i = 0; i < payload.value.options.length; ++i) {
        let cost = vote.value[i]
        if (info.useQuadratic) cost = cost * cost
        ans = ans - cost
    }
    return ans
}

const remainVoteFontColor = () => {
    if (calculateRemainVote() >= 0) {
        return 'green'
    } else {
        return 'red'
    }
}

const decrypt = () => {
    console.log(info)
    const bytePayload = AES.decrypt(info.payload, passcode.value)
    try {
        info.payload = JSON.parse(bytePayload.toString(encUtf8))
        console.log(info.payload.title)
        console.log(info.payload.description)
        console.log(info.payload.options)
        console.log(info.payload.voteCount)
        console.log(info.payload.useQuadratic)

        payload.value = info.payload

        for (let i = 0; i < info.payload.options.length; ++i) vote.value.push(0)

        console.log(info.payload)
    } catch (error) {
        alert('Passcode is wrong!')
        console.log(error)
        return
    }

    passcodeDialog.value = false
    setupChart()
}
</script>