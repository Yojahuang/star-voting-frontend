<template>
    <div class="mx-auto w-75">
        <div v-if="!hasDecrypted()">
            <v-text-field autofocus v-model="passcode" @keyup.enter="decrypt" label="Passcode"></v-text-field>
        </div>

        <div class="text-h3 my-4">{{ payload.title }}</div>

        <div class="my-4">{{ payload.description }}</div>

        <div v-show="payload.revealRealtimeResult" class="mx-auto my-4" style="width: 600px;height:400px;" id="echart">
        </div>

        <div class="font-weight-thin">Your remaining votes: <p class="font-weight-bold d-inline"
                :style="{ color: remainVoteFontColor() }">{{ calculateRemainVote() }}
            </p>
        </div>


        <div class="my-4">
            <template v-for="(option, index) in payload.options">
                <div class="d-flex align-center w-100 mx-auto justify-start">
                    <div class="mx-2">{{ option }}</div>
                    <v-text-field class="w-auto mx-2" hide-details="auto" v-model="vote[index]">
                        <template #prepend-inner><v-icon @click="decreaseVote(index)" icon="mdi-minus"></v-icon></template>
                        <template #append-inner><v-icon @click="increaseVote(index)" icon="mdi-plus"></v-icon></template>
                    </v-text-field>
                </div>

            </template>
        </div>
        <v-divider></v-divider>

        <div class="d-flex my-4">
            <v-btn class="mx-2" @click="joinVote()">Join the vote</v-btn>
            <v-btn class="mx-2" @click="sendVote()">Vote</v-btn>
            <v-btn class="mx-2" prepend-icon="mdi-share-variant">Share</v-btn>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref } from "vue"
import AES from 'crypto-js/aes';
import encUtf8 from 'crypto-js/enc-utf8'
import * as echarts from 'echarts';
import { Identity } from "@semaphore-protocol/identity"

const passcodeDialog = ref(true)

const info: any = { "useQuadratic": false, "options": 2, "payload": "U2FsdGVkX18+gVJVZU1h7MDW6xDofBw8lVd+NfzazaCnHnd0G1Zo/03e98mXQ8H4ysZRr+btNMMhRI/5ns5R/wAGa0gRXcGtEUlBUZsZ8tDkORoUN3HS1usn08N8M1kloGqYoIKFCJjZH5FvuOpWsQsh/dMQkHfdEhmVLXn9tjURDMlI2PN9O7N906VWCxDk0Karhn4Y8IhevI1+gido8KZ5DLiXXFkGia0h6e7YLt8=" }
const passcode = ref("t031")

const route = useRoute()
const routeId = route.params.id

const payload = ref({
    title: "",
    description: "",
    voteCount: 0,
    options: [],
    revealRealtimeResult: false,
})
const vote = ref<number[]>([])

const hasDecrypted = () => {
    const checklist = [info.payload.title, info.payload.description, info.payload.options, info.payload.voteCount]
    for (let i = 0; i < checklist.length; ++i) if (checklist[i] == undefined) return false
    return true
}

const joinVote = () => {
    const identity = new Identity()
    const { trapdoor, nullifier, commitment } = identity
    // Send commitment to smart contract to join the group!
    localStorage.setItem("identity", identity.toString())
}

const sendVote = () => {
    const identityStr = localStorage.getItem("identity")
    if (identityStr == undefined) return

    localStorage.removeItem("identity")


    const identify = new Identity(identityStr)
}

const parseRealtimeResult = (): number[] => {
    const result: number[] = []
    if (payload.value.revealRealtimeResult == false) {
        for (let i = 0; i < info.options; i++) result.push(0)
        return result
    }

    // the code of parsing realtime result from blockchain
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
                data: parseRealtimeResult,
                type: 'bar'
            }
        ]
    };

    myChart.setOption(option)
}

const decreaseVote = (index: number) => {
    vote.value[index]--
}

const increaseVote = (index: number) => {
    vote.value[index]++

    if (calculateRemainVote() < 0) {
        vote.value[index]--
    }
}

const calculateRemainVote = () => {
    if (typeof info.payload == 'string') return 0

    let ans = info.payload.voteCount

    for (let i = 0; i < info.options; ++i) {
        let cost = vote.value[i]
        if (info.useQuadratic) cost = cost * cost
        ans = ans - cost
    }
    return ans
}

const remainVoteFontColor = () => {
    if (calculateRemainVote() >= 0) {
        return 'white'
    } else {
        return 'red'
    }
}

const decrypt = () => {
    const bytePayload = AES.decrypt(info.payload, passcode.value)
    try {
        info.payload = JSON.parse(bytePayload.toString(encUtf8))
        console.log(info.payload.title)
        console.log(info.payload.description)
        console.log(info.payload.options)
        console.log(info.payload.voteCount)
        console.log(info.payload.revealRealtimeResult)

        payload.value = info.payload

        for (let i = 0; i < info.options; ++i) vote.value.push(0)
    } catch (error) {
        alert('Passcode is wrong!')
        console.log(error)
        return
    }

    passcodeDialog.value = false
    setupChart()
}
</script>