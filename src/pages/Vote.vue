<template>
    <div class="mx-auto w-75">
        <div v-if="passcodeDialog">
            <v-text-field
                autofocus
                v-model="passcode"
                @keyup.enter="decryptPollDetail"
                label="Passcode"
            ></v-text-field>
        </div>
    </div>

    <v-card :disabled="passcodeDialog" variant="tonal" class="mx-auto w-75">
        <div class="text-h3 mx-4 my-4">{{ payload.title }}</div>

        <div class="mx-4 my-4">{{ payload.description }}</div>

        <div
            v-show="info.showRealtimeResult"
            class="mx-auto mx-4 my-4"
            style="width: 600px; height: 400px"
            id="echart"
        ></div>

        <div class="font-weight-thin mx-4 my-4">
            Your remaining votes:
            <p
                class="font-weight-bold d-inline"
                :style="{ color: remainVoteFontColor() }"
            >
                {{ calculateRemainVote() }}
            </p>
        </div>

        <div class="mx-4 my-4">
            <template v-for="(option, index) in payload.options">
                <div
                    class="mx-4 my-4 d-flex align-center w-100 mx-auto justify-start"
                >
                    <div class="mx-2">{{ option }}</div>
                    <v-text-field
                        class="w-auto mx-2"
                        :rules="voteRules"
                        hide-details="auto"
                        v-model="vote[index]"
                    >
                        <template #prepend-inner
                            ><v-icon
                                @click="decreaseVote(index)"
                                icon="mdi-minus"
                            ></v-icon
                        ></template>
                        <template #append-inner
                            ><v-icon
                                @click="increaseVote(index)"
                                icon="mdi-plus"
                            ></v-icon
                        ></template>
                    </v-text-field>
                </div>
            </template>
        </div>
        <v-divider></v-divider>

        <div class="d-flex mx-4 my-4">
            <v-btn
                class="mx-2"
                prepend-icon="mdi-account-plus"
                :disabled="stateEnum[voteInfoOnChain.state] != 'Created'"
                @click="joinPoll()"
                >Join the vote</v-btn
            >
            <v-btn
                class="mx-2"
                :disabled="stateEnum[voteInfoOnChain.state] != 'Ongoing'"
                @click="castVote()"
                >Vote</v-btn
            >
            <v-btn
                class="mx-2"
                v-if="
                    browserWallet.getAddress() ==
                        voteInfoOnChain.ownerAddress &&
                    stateEnum[voteInfoOnChain.state] == 'Created'
                "
                @click="startPoll()"
                prepend-icon="mdi-toggle-switch"
                >Start Vote</v-btn
            >
            <v-btn
                class="mx-2"
                v-if="
                    browserWallet.getAddress() ==
                        voteInfoOnChain.ownerAddress &&
                    stateEnum[voteInfoOnChain.state] == 'Ongoing'
                "
                @click="endPoll()"
                prepend-icon="mdi-toggle-switch"
                >End Vote</v-btn
            >
        </div>
    </v-card>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref, computed, reactive, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import * as eccryptoJS from 'eccrypto-js'
import { Buffer } from 'buffer'
import { useGlobalStore } from '@/stores/Global'

import AES from 'crypto-js/aes'
import encUtf8 from 'crypto-js/enc-utf8'
import * as echarts from 'echarts'

// ZK Dependencies
import { Identity } from '@semaphore-protocol/identity'
import { Group } from '@semaphore-protocol/group'
import { FullProof } from '@semaphore-protocol/proof'
import { generateProof } from '@/composables/Proof'

import StarVotingContract from '@/composables/StarVoting'
import BrowserWallet from '@/composables/wallet'
import { getGroupMembers } from '@/composables/Group'

const voteRules = [
    (value: string) => {
        console.log(vote.value)
        if (Number(value) < 0) return "Can't be negative"
        if (Number.isNaN(Number(value))) return 'Please input a number'
        if (calculateRemainVote() < 0) return 'Remain vote < 0'
        return true
    },
]

const stateEnum = ['Created', 'Ongoing', 'Ended']

const voteInfoOnChain = reactive({
    ownerAddress: '',
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

const passcode = ref('t031')

const route = useRoute()
const routeId = route.params.id
const pollId = BigInt('0x' + routeId)

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
    title: '',
    description: '',
    voteCount: 0,
    options: [],
    useQuadratic: false,
})

const vote = ref<number[]>([])

const castVote = async () => {
    const identityStr = localStorage.getItem('identity')
    if (identityStr == undefined) return

    // Fetch group members to rebuild merkle tree
    const globalStore = useGlobalStore()
    const { selectedChain } = storeToRefs(globalStore)

    const identity = new Identity(identityStr)
    const group = new Group(
        pollId.toString(),
        StarVotingContract.merkleTreeDepth
    )

    const memberInGroup = await getGroupMembers(
        selectedChain.value,
        pollId.toString()
    )
    console.log(memberInGroup)

    group.addMembers(memberInGroup)

    // TODO: Casting vote data and encrypt it
    const data = '123123'
    let fullProof: FullProof
    fullProof = await generateProof(identity, group, pollId, Buffer.from(data))

    const StarVoting = new StarVotingContract()
    StarVoting.init()

    console.log(pollId)
    console.log(typeof pollId)

    await StarVoting.castVote(
        data,
        fullProof.nullifierHash,
        pollId,
        fullProof.proof
    )

    // Remove the identity from local storage
    // localStorage.removeItem("identity")
}

const endPoll = async () => {}

const startPoll = async () => {
    const keyPair = eccryptoJS.generateKeyPair()

    const publicKeyBase64 = keyPair.publicKey.toString('base64')
    const privateKeyBase64 = keyPair.privateKey.toString('base64')

    localStorage.setItem('publicKey', publicKeyBase64)
    localStorage.setItem('privateKey', privateKeyBase64)

    const StarVoting = new StarVotingContract()
    StarVoting.init()

    await StarVoting.startPoll(pollId, publicKeyBase64)
}

const joinPoll = async () => {
    const identity = new Identity()
    const { trapdoor, nullifier, commitment } = identity
    // Send commitment to smart contract to join the group!
    localStorage.setItem('identity', identity.toString())

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
    let myChart = echarts.init(document.getElementById('echart') as any)
    const option = {
        xAxis: {
            type: 'category',
            data: payload.value.options,
        },
        yAxis: {
            type: 'value',
        },
        series: [
            {
                data: parseRealtimeResult(),
                type: 'bar',
            },
        ],
    }

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

const decryptPollDetail = () => {
    console.log(info)
    const bytePayload = AES.decrypt(info.payload, passcode.value)
    try {
        info.payload = JSON.parse(bytePayload.toString(encUtf8))

        payload.value = info.payload
        for (let i = 0; i < info.payload.options.length; ++i) vote.value.push(0)
    } catch (error) {
        alert('Passcode is wrong!')
        console.log(error)
        return
    }

    passcodeDialog.value = false
    setupChart()
}
</script>
