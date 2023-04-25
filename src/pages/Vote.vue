<template>
    <v-dialog v-model="memberDialog">
        <v-card class="w-50 mx-auto" max-height="500">
            <div class="text-center mt-4 font-weight-bold">Joined User Commitments</div>

            <div v-for="member in pollInfoOnChain.currentMemberInGroup" class="my-4 text-center mx-auto w-100">
                <v-icon v-if="member == myCommitment.toString()" icon="mdi-account"></v-icon>
                0x{{ BigInt(member).toString(16) }}
            </div>
        </v-card>
    </v-dialog>

    <v-card :disabled="disableCount > 0" :loading="disableCount > 0" variant="tonal" class="mx-auto w-75">
        <div class="text-h3 mx-4 my-4">{{ payload.title }}</div>

        <div class="mx-4 my-4">{{ payload.description }}</div>

        <v-chip @click="memberDialog = true" class="mx-4 my-4">
            <div class="font-weight-bold d-inline">{{ pollInfoOnChain.currentMemberInGroup.length }}&nbsp;</div> people has
            joined
            the vote
        </v-chip>

        <v-chip>
            {{ usedChain }}
        </v-chip>

        <v-progress-linear v-model="getStatePercentage" color="blue-grey" height="25">
            <strong>{{ stateEnum[pollInfoOnChain.state] }}</strong>
        </v-progress-linear>

        <div v-show="pollInfo.showRealtimeResult || pollInfoOnChain.state == 2" class="mx-auto mx-4 my-4"
            style="width: 800px; height: 500px" id="echart">
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
                        hide-details="auto" v-model="selectedVote[index]">
                        <template #prepend-inner><v-icon @click="decreaseVote(index)" icon="mdi-minus"></v-icon></template>
                        <template #append-inner><v-icon @click="increaseVote(index)" icon="mdi-plus"></v-icon></template>
                    </v-text-field>
                </div>
            </template>
        </div>
        <v-divider></v-divider>

        <div class="d-flex mx-4 my-4">
            <v-btn class="mx-2" prepend-icon="mdi-refresh" @click="refresh()">Refresh vote info</v-btn>
            <v-btn class="mx-2" prepend-icon="mdi-account-plus" :disabled="disabledState.joinVote" @click="joinPoll()">Join
                the vote</v-btn>
            <v-btn class="mx-2" :disabled="disabledState.voteTextfield" @click="castVote()">Vote</v-btn>
            <v-btn class="mx-2" v-if="browserWallet.getAddress() ==
                pollInfoOnChain.ownerAddress &&
                stateEnum[pollInfoOnChain.state] == 'Created'
                " @click="startPoll()" prepend-icon="mdi-toggle-switch">Start Vote</v-btn>
            <v-btn class="mx-2" v-if="browserWallet.getAddress() ==
                pollInfoOnChain.ownerAddress &&
                stateEnum[pollInfoOnChain.state] == 'Ongoing'
                " @click="endPoll()" prepend-icon="mdi-toggle-switch">End Vote</v-btn>
        </div>
    </v-card>

    <v-dialog v-model="showLoadingCircle">
        <v-card class="mx-auto" width="300" height="300">
            <div class="d-flex w-100 h-100 align-center">
                <div class="w-100 mx-auto">
                    <v-progress-circular :size="100" class="mx-auto w-100 my-2" indeterminate color="#f4dde9">
                    </v-progress-circular>
                    <div class="my-2 text-center">
                        Waiting for block confirmation. <br />(Ex: on-chain
                        query)
                    </div>
                </div>
            </div>
        </v-card>
    </v-dialog>

    <v-snackbar color="error" v-model="snackbarData.show">
        {{ snackbarData.msg }}
        <template v-slot:actions>
            <v-btn class="text-white" variant="text" @click="snackbarData.show = false">
                Close
            </v-btn>
        </template>
    </v-snackbar>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref, reactive, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { Buffer } from 'buffer'
import { useGlobalStore } from '@/stores/Global'

import { BSON } from 'bson'

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
import * as eccryptoJS from 'eccrypto-js'

const snackbarData = reactive({
    msg: '',
    show: false,
})

const myCommitment = ref(BigInt(0))

const showSnackbar = (msg: string) => {
    snackbarData.msg = msg
    snackbarData.show = true
}

const voteRules = [
    (value: string) => {
        if (Number(value) < 0) return "Can't be negative"
        if (Number.isNaN(Number(value))) return 'Please input a number'
        if (calculateRemainVote() < 0) return 'Remain vote < 0'
        return true
    },
]

const stateEnum = ['Created', 'Ongoing', 'Ended']

const disabledState = reactive({
    voteTextfield: false,
    joinVote: false,
})

const showLoadingCircle = computed(() => {
    return disableCount.value > 0
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

    const identityStr = localStorage.getItem(`${pollId.toString()}_identity`)
    if (identityStr == null) return false
    const { commitment } = new Identity(identityStr)

    myCommitment.value = commitment

    const memberInGroup = await getGroupMembers(
        selectedChain.value,
        pollId.toString()
    )

    for (let i = 0; i < memberInGroup.length; ++i) {
        if (commitment.toString() == memberInGroup[i]) {
            return true
        }
    }
    return false
}

const pollInfoOnChain = reactive({
    ownerAddress: '',
    state: 0,
    currentMemberInGroup: [] as string[]
})

const getStatePercentage = computed(() => {
    const answer = [33, 66, 100]
    return answer[pollInfoOnChain.state]
})

const getInfoFromBlockchain = async () => {
    const StarVoting = new StarVotingContract()
    StarVoting.init()
    const result = await StarVoting.getEncryptedPollInfo(pollId)

    const state = await StarVoting.getPollState(pollId)
    pollInfoOnChain.state = state

    const owner = await StarVoting.getPollCoordinator(pollId)
    pollInfoOnChain.ownerAddress = owner

    const member = await getGroupMembers(
        selectedChain.value,
        pollId.toString()
    )
    pollInfoOnChain.currentMemberInGroup = member

    return result
}

const browserWallet = new BrowserWallet()

const disableCount = ref(0)

const route = useRoute()
const routeId = route.params.id
const pollId = BigInt('0x' + routeId)
const passcode: string = route.params.passcode as any
const usedChain: string = window.atob(route.params.usedChain as any)

let pollInfo: any = {}

const globalStore = useGlobalStore()
const { selectedChain } = storeToRefs(globalStore)

const memberDialog = ref(false)

const getInfo = async () => {
    pollInfo = await getInfoFromBlockchain()
    pollInfo = JSON.parse(pollInfo)
}

onMounted(async () => {
    selectedChain.value = usedChain as any
    await refresh()
})

const refresh = async () => {
    disableCount.value = disableCount.value + 1

    await getInfo()

    disabledState.joinVote = await calculateJoinVoteDisabled()
    disabledState.voteTextfield = await calculateVoteTextfieldDisabled()

    await decryptPollDetail()
    disableCount.value = disableCount.value - 1
}

const payload = ref({
    title: '',
    description: '',
    voteCount: 0,
    options: [],
    useQuadratic: false,
})

const selectedVote = ref<number[]>([])

const castVote = async () => {
    disableCount.value = disableCount.value + 1

    const identityStr = localStorage.getItem(`${pollId.toString()}_identity`)
    if (identityStr == undefined) return

    // Fetch group members to rebuild merkle tree
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
    let dataByteArray = new Uint8Array(selectedVote.value.length * 2)
    for (let i = 0, cur = 0; i < selectedVote.value.length; i += 1, cur += 2) {
        dataByteArray[cur] = i
        dataByteArray[cur + 1] = selectedVote.value[i]
    }

    // If this isn't a realtime poll, encrypt the vote data
    let serializedData: Buffer
    if (pollInfo.showRealtimeResult != true) {
        // Query encryptionKey and encrypt vote data
        const encryptionKey = await StarVoting.getEncryptionKey(pollId)
        const encryptedData = await eccryptoJS.encrypt(
            Buffer.from(encryptionKey, 'base64'),
            Buffer.from(dataByteArray)
        )

        serializedData = Buffer.from(BSON.serialize(encryptedData))
    } else {
        // If this is a realtime poll, don't encrypt the vote data
        serializedData = Buffer.from(dataByteArray)
    }

    // Proof Generation
    let fullProof: FullProof
    const voteData = serializedData.toString('base64')

    fullProof = await generateProof(
        identity,
        group,
        pollId,
        Buffer.from(voteData)
    )

    try {

        await StarVoting.castVote(
            voteData,
            fullProof.nullifierHash,
            pollId,
            fullProof.proof
        )
    } catch (error) {
        await refresh()
        disableCount.value = disableCount.value - 1
        console.log("Error catched", error)
        showSnackbar("Error: Unexpected behavior happened!, try refresh and reconnect your wallet!")
        return
    }

    await parseRealtimeResult()

    // Remove the identity from local storage
    // localStorage.removeItem(`${pollId.toString()}_identity`)
    await refresh()

    disableCount.value = disableCount.value - 1
}

const startPoll = async () => {
    disableCount.value = disableCount.value + 1

    const keyPair = await eccryptoJS.generateKeyPair()

    const publicKeyBase64 = keyPair.publicKey.toString('base64')
    const privateKeyBase64 = keyPair.privateKey.toString('base64')

    localStorage.setItem(`${pollId.toString()}_publicKey`, publicKeyBase64)
    localStorage.setItem(`${pollId.toString()}_privateKey`, privateKeyBase64)

    const StarVoting = new StarVotingContract()
    StarVoting.init()

    try {
        await StarVoting.startPoll(pollId, publicKeyBase64)
    } catch (error) {
        await refresh()
        disableCount.value = disableCount.value - 1
        console.log("Error catched", error)
        showSnackbar("Error: Unexpected behavior happened!, try refresh and reconnect your wallet!")
        return
    }

    pollInfoOnChain.state = pollInfoOnChain.state + 1
    disableCount.value = disableCount.value - 1

    await refresh()
}

const endPoll = async () => {
    disableCount.value = disableCount.value + 1
    const StarVoting = new StarVotingContract()
    StarVoting.init()

    const privateKeyBase64 =
        localStorage.getItem(`${pollId.toString()}_privateKey`) || ''

    console.log(privateKeyBase64)

    pollInfoOnChain.state = pollInfoOnChain.state + 1

    try {
        await StarVoting.endPoll(pollId, privateKeyBase64)
    } catch (error) {
        await refresh()
        disableCount.value = disableCount.value - 1
        console.log("Error catched", error)
        showSnackbar("Error: Unexpected behavior happened!, try refresh and reconnect your wallet!")
        return
    }


    await refresh()

    disableCount.value = disableCount.value - 1
}

const joinPoll = async () => {
    disableCount.value = disableCount.value + 1

    const identity = new Identity()
    const { trapdoor, nullifier, commitment } = identity
    // Send commitment to smart contract to join the group!
    localStorage.setItem(`${pollId.toString()}_identity`, identity.toString())

    const StarVoting = new StarVotingContract()
    StarVoting.init()

    try {
        await StarVoting.addVoter(pollId, commitment)
    } catch (error) {
        await refresh()
        disableCount.value = disableCount.value - 1
        console.log("Error catched", error)
        showSnackbar("Error: Unexpected behavior happened!, try refresh and reconnect your wallet!")
        return
    }

    await refresh()

    disableCount.value = disableCount.value - 1
}

const parseRealtimeResult = async (): Promise<number[]> => {
    const globalStore = useGlobalStore()
    const { selectedChain } = storeToRefs(globalStore)

    const voteAddedEvents: any = await getEvents(
        selectedChain.value,
        'VoteAdded'
    )
    const filteredVoteAddedEvents = voteAddedEvents.reduce(
        (acc: any, cur: any) => {
            if (cur.pollId == pollId.toString()) {
                acc.push(cur)
            }
            return acc
        },
        []
    )

    const result: number[] = []
    for (let i = 0; i < payload.value.options.length; i++) result.push(0)

    if (pollInfo.showRealtimeResult == true) {
        for (const voteData of filteredVoteAddedEvents) {
            const voteDataArray = Uint8Array.from(
                Buffer.from(voteData.vote, 'base64')
            )

            const userVoteData = []
            for (let i = 0; i < payload.value.options.length; i += 1) userVoteData.push(0)
            let remainVote = payload.value.voteCount


            for (let i = 0; i < voteDataArray.length; i += 2) {
                userVoteData[voteDataArray[i]] += voteDataArray[i + 1]
            }

            if (payload.value.useQuadratic) {
                for (let i = 0; i < payload.value.options.length; i += 1) {
                    remainVote -= userVoteData[i] * userVoteData[i]
                }
            } else {
                for (let i = 0; i < payload.value.options.length; i += 1) {
                    remainVote -= userVoteData[i]
                }
            }

            // put voteData info back to result
            if (remainVote >= 0) {
                for (let i = 0; i < payload.value.options.length; i += 1) {
                    result[i] += userVoteData[i]
                }
            }
        }
        return result
    }

    const StarVoting = new StarVotingContract()
    StarVoting.init()

    const decryptionKey = await StarVoting.getDecryptionKey(pollId)

    console.log(decryptionKey.length)

    if (decryptionKey.length < 1) return result


    for (const voteData of filteredVoteAddedEvents) {
        const doc = BSON.deserialize(Buffer.from(voteData.vote, 'base64'))
        const encryptedObject = {
            iv: Buffer.from(doc.iv.buffer),
            ephemPublicKey: Buffer.from(doc.ephemPublicKey.buffer),
            ciphertext: Buffer.from(doc.ciphertext.buffer),
            mac: Buffer.from(doc.mac.buffer),
        }

        const decryptedData = await eccryptoJS.decrypt(
            Buffer.from(decryptionKey, 'base64'),
            encryptedObject
        )
        const decryptedVoteData = Uint8Array.from(decryptedData)
        for (let i = 0; i < decryptedVoteData.length; i += 2) {
            result[decryptedVoteData[i]] += decryptedVoteData[i + 1]
        }
    }
    return result
}

const setupChart = async () => {
    let myChart = echarts.init(document.getElementById('echart') as any)
    const option = {
        xAxis: {
            type: 'category',
            data: payload.value.options,
            axisLabel: {
                show: true,
                rotate: 45,
                fontSize: 12,
                width: 100,
                overflow: 'truncate',
                ellipsis: '...'
            }
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                // Use axis to trigger tooltip
                type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
            }
        },
        legend: {
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
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
    selectedVote.value[index]--

    if (selectedVote.value[index] < 0) {
        selectedVote.value[index]++
    }
}

const increaseVote = (index: number) => {
    selectedVote.value[index]++

    if (calculateRemainVote() < 0) {
        selectedVote.value[index]--
    }
}

const calculateRemainVote = () => {
    if (typeof pollInfo.payload == 'string') return 0

    let ans = payload.value.voteCount

    for (let i = 0; i < payload.value.options.length; ++i) {
        let cost = selectedVote.value[i]
        if (pollInfo.payload.useQuadratic) cost = cost * cost
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
    disableCount.value = disableCount.value + 1
    const bytePayload = AES.decrypt(pollInfo.payload, passcode)
    try {
        pollInfo.payload = JSON.parse(bytePayload.toString(encUtf8))

        payload.value = pollInfo.payload
        for (let i = 0; i < pollInfo.payload.options.length; ++i)
            selectedVote.value.push(0)
    } catch (error) {
        alert('Passcode is wrong!')
        console.log(error)
        return
    }

    await setupChart()
    disableCount.value = disableCount.value - 1
}
</script>
