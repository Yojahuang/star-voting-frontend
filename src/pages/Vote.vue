<template>
    <v-card :disabled="disableCount > 0" :loading="disableCount > 0" variant="tonal" class="mx-auto w-75">
        <div class="text-h3 mx-4 my-4">{{ payload.title }}</div>

        <div class="mx-4 my-4">{{ payload.description }}</div>

        <div v-show="pollInfo.showRealtimeResult" class="mx-auto mx-4 my-4" style="width: 600px; height: 400px" id="echart">
        </div>


        <div class="font-weight-thin mx-4 my-4">
            Your remaining votes:
            <p class="font-weight-bold d-inline" :style="{ color: remainVoteFontColor() }">
                {{ calculateRemainVote() }}
            </p>
        </div>

        <div class="mx-4 my-4">
            <template v-for="(option, index) in payload.options">
                <div class="mx-4 my-4 d-flex align-center w-100 mx-auto justify-start">
                    <div class="mx-2">{{ option }}</div>
                    <v-text-field class="w-auto mx-2" :disabled="disabledState.voteTextfield" :rules="voteRules"
                        hide-details="auto" v-model="vote[index]">
                        <template #prepend-inner><v-icon @click="decreaseVote(index)" icon="mdi-minus"></v-icon></template>
                        <template #append-inner><v-icon @click="increaseVote(index)" icon="mdi-plus"></v-icon></template>
                    </v-text-field>
                </div>
            </template>
        </div>
        <v-divider></v-divider>

        <div class="d-flex mx-4 my-4">
            <v-btn class="mx-2" prepend-icon="mdi-account-plus" :disabled="disabledState.joinVote" @click="joinPoll()">Join
                the
                vote</v-btn>
            <v-btn class="mx-2" :disabled="stateEnum[pollInfoOnChain.state] != 'Ongoing'" @click="castVote()">Vote</v-btn>
            <v-btn class="mx-2" v-if="
                browserWallet.getAddress() ==
                pollInfoOnChain.ownerAddress &&
                stateEnum[pollInfoOnChain.state] == 'Created'
            " @click="startPoll()" prepend-icon="mdi-toggle-switch">Start Vote</v-btn>
            <v-btn class="mx-2" v-if="
                browserWallet.getAddress() ==
                pollInfoOnChain.ownerAddress &&
                stateEnum[pollInfoOnChain.state] == 'Ongoing'
            " @click="endPoll()" prepend-icon="mdi-toggle-switch">End Vote</v-btn>
        </div>
    </v-card>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref, reactive, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { Buffer } from 'buffer'
import { useGlobalStore } from '@/stores/Global'

import { BSON } from 'bson';

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
import { getEvents } from '@/composables/EtherLog'
import { encryptMessage, decryptMessage, generateKeyPair } from '@/composables/Crypto'

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

const disabledState = reactive({
    voteTextfield: false,
    joinVote: false
})

const calculateVoteTextfieldDisabled = async () => {
    if (stateEnum[pollInfoOnChain.state] != 'Ongoing') return true
    const result = await inMemberGroup()
    if (!result) return true
    return false
}

const calculateJoinVoteDisabled = async () => {
    if (stateEnum[pollInfoOnChain.state] != 'Created') return true
    const result = await inMemberGroup()
    if (result) return true

    return false
}

const inMemberGroup = async () => {
    const globalStore = useGlobalStore()
    const { selectedChain } = storeToRefs(globalStore)

    const identityStr = localStorage.getItem('identity')
    if (identityStr == null) return false
    const { commitment } = new Identity(identityStr)

    const memberInGroup = await getGroupMembers(selectedChain.value, pollId.toString())

    for (let i = 0; i < memberInGroup.length; ++i) {
        console.log(memberInGroup[i])
        if (commitment.toString() == memberInGroup[i]) {
            return true
        }
    }
    return false
}

const pollInfoOnChain = reactive({
    ownerAddress: '',
    state: 0,
})

const getStateFromBlockchain = async () => {
    const StarVoting = new StarVotingContract()
    StarVoting.init()
    const result = await StarVoting.getPollState(pollId)
    pollInfoOnChain.state = result
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
    pollInfoOnChain.ownerAddress = result
}

const browserWallet = new BrowserWallet()

const disableCount = ref(2)

const route = useRoute()
const routeId = route.params.id
const pollId = BigInt('0x' + routeId)
const passcode: string = (route.params.passcode) as any

let pollInfo: any = {}

const getInfo = async () => {
    pollInfo = await getInfoFromBlockchain()
    pollInfo = JSON.parse(pollInfo)
}

onMounted(async () => {
    await getInfo()
    await getOwnerOfVoteFromBlockchain()
    await getStateFromBlockchain()

    disabledState.joinVote = await calculateJoinVoteDisabled()
    disabledState.voteTextfield = await calculateVoteTextfieldDisabled()

    disableCount.value = disableCount.value - 1
    await decryptPollDetail()
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
    disableCount.value = disableCount.value + 1

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
    group.addMembers(memberInGroup)

    // Vote Data Processing
    const StarVoting = new StarVotingContract()
    StarVoting.init()

    // Pack vote data as [index0, voteCount0, index1, voteCount1, ...]
    let dataByteArray = new Uint8Array(vote.value.length * 2)
    for (let i = 0; i < vote.value.length; i += 2) {
        dataByteArray[i] = i;
        dataByteArray[i + 1] = vote.value[i]
    }

    // If this isn't a realtime poll, encrypt the vote data
    let serializedData: Buffer
    if (pollInfo.showRealtimeResult != true) {
        // Query encryptionKey and encrypt vote data
        const encryptionKey = await StarVoting.getEncryptionKey(pollId)
        const encryptedData = await encryptMessage(Buffer.from(dataByteArray), Buffer.from(encryptionKey, 'base64'))

        serializedData = Buffer.from(BSON.serialize(encryptedData))
    } else {    // If this is a realtime poll, don't encrypt the vote data
        serializedData = Buffer.from(BSON.serialize(dataByteArray))
    }

    // Proof Generation
    let fullProof: FullProof
    const voteData = serializedData.toString('base64')

    fullProof = await generateProof(identity, group, pollId, Buffer.from(voteData))

    await StarVoting.castVote(
        voteData,
        fullProof.nullifierHash,
        pollId,
        fullProof.proof
    )

    // Remove the identity from local storage
    // localStorage.removeItem("identity")
    disableCount.value = disableCount.value - 1
}

const startPoll = async () => {
    disableCount.value = disableCount.value + 1

    const keyPair = await generateKeyPair()

    const publicKeyBase64 = keyPair.publicKey.toString('base64')
    const privateKeyBase64 = keyPair.privateKey.toString('base64')

    localStorage.setItem('publicKey', publicKeyBase64)
    localStorage.setItem('privateKey', privateKeyBase64)

    const StarVoting = new StarVotingContract()
    StarVoting.init()

    await StarVoting.startPoll(pollId, publicKeyBase64)

    disableCount.value = disableCount.value - 1
}

const endPoll = async () => {
    const StarVoting = new StarVotingContract()
    StarVoting.init()

    const privateKeyBase64 = localStorage.getItem('privateKey') || ''

    await StarVoting.endPoll(pollId, privateKeyBase64)
}

const joinPoll = async () => {
    disableCount.value = disableCount.value + 1

    const identity = new Identity()
    const { trapdoor, nullifier, commitment } = identity
    // Send commitment to smart contract to join the group!
    localStorage.setItem('identity', identity.toString())

    const StarVoting = new StarVotingContract()
    StarVoting.init()

    await StarVoting.addVoter(pollId, commitment)

    disableCount.value = disableCount.value - 1
}

const parseRealtimeResult = async (): Promise<number[]> => {
    const globalStore = useGlobalStore()
    const { selectedChain } = storeToRefs(globalStore)

    const voteAddedEvents: any = await getEvents(selectedChain.value, 'VoteAdded')
    const filteredVoteAddedEvents = voteAddedEvents.reduce((acc: any, cur: any) => {
        if (cur.pollId == pollId.toString()) {
            acc.push(cur)
        }
        return acc
    }, [])

    console.log(filteredVoteAddedEvents)

    const result: number[] = []
    if (pollInfo.showRealtimeResult == true) {
        for (let i = 0; i < payload.value.options.length; i++) result.push(10)
    } else {
        for (let i = 0; i < payload.value.options.length; i++) result.push(0)
    }

    // the code of parsing realtime result from blockchain
    console.log(result)
    return result
}

const setupChart = async () => {
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
                data: await parseRealtimeResult(),
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
    if (typeof pollInfo.payload == 'string') return 0

    let ans = payload.value.voteCount

    for (let i = 0; i < payload.value.options.length; ++i) {
        let cost = vote.value[i]
        if (pollInfo.useQuadratic) cost = cost * cost
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

const decryptPollDetail = async () => {
    console.log(pollInfo)
    const bytePayload = AES.decrypt(pollInfo.payload, passcode)
    try {
        pollInfo.payload = JSON.parse(bytePayload.toString(encUtf8))

        payload.value = pollInfo.payload
        for (let i = 0; i < pollInfo.payload.options.length; ++i) vote.value.push(0)
    } catch (error) {
        alert('Passcode is wrong!')
        console.log(error)
        return
    }

    disableCount.value = disableCount.value - 1
    await setupChart()
}
</script>
