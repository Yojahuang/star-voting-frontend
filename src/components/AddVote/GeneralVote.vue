<template>
    <div class="mx-4">

        <div class="form-title my-4">Title</div>
        <v-text-field hide-details="auto" v-model="data.title" label="Title"></v-text-field>

        <div class="form-title my-4">Description</div>
        <v-textarea hide-details="auto" v-model="data.description" label="Description"></v-textarea>

        <div class="form-title my-4">Options</div>
        <template v-for="(option, index) in data.options">
            <v-text-field hide-details="auto" v-model="data.options[index]" label="Option">
                <template #append-inner>
                    <v-icon @click="removeOption(index)" icon="mdi-trash-can"></v-icon>
                </template>
            </v-text-field>
        </template>
        <v-text-field hide-details="auto" @keydown.enter="addOption()" v-model="data.newOption" label="Add option">
            <template #append-inner>
                <v-icon @click="addOption()" icon="mdi-plus"></v-icon>
            </template>
        </v-text-field>

        <div class="form-title my-4">Settings</div>
        <v-checkbox hide-details="auto" v-model="data.useQuadratic" label="Use quadratic voting"></v-checkbox>
        <v-checkbox hide-details="auto" v-model="data.showRealtimeResult" label="Show realtime result"></v-checkbox>
        <v-checkbox class="mb-2"
            :messages="data.publicVote ? '' : 'If you make the vote private, you\'ll have to collect commitments by yourself'"
            v-model="data.publicVote" label="Make the vote public">
        </v-checkbox>

        <v-text-field hide-details="auto" v-model="data.voteCount"
            label="How many votes each people should have"></v-text-field>
        <v-text-field hide-details="auto" v-model="data.passcode"
            label="Passcode, please make sure you don't lose it"></v-text-field>

        <v-btn class="w-100 my-4" @click="createVote" color="primary">Create</v-btn>
    </div>

    <v-dialog v-model="data.shareVotelinkDialog">
        <v-card class="mx-auto w-75" max-width="300">
            <v-icon class="mx-auto" icon="mdi-check-bold" size="50"></v-icon>
            Your vote has been created! <br />
            <div class="d-flex align-center w-100 justify-center">
                <v-text-field @click="copyLink()" v-model="data.voteLink"></v-text-field>
                <v-btn variant="text" @click="copyLink()" icon="mdi-content-copy"></v-btn>
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

    <v-snackbar v-model="data.snackbar">
        Link copied!

        <template v-slot:actions>
            <v-btn class="text-white" variant="text" @click="data.snackbar = false">
                Close
            </v-btn>
        </template>
    </v-snackbar>
</template>

<script setup lang="ts">
import { reactive } from "vue"
import AES from 'crypto-js/aes';
import { v4 as uuidv4 } from 'uuid';
import { ethers } from "ethers"
import StarVotingContract from "@/composables/StarVoting"


const data = reactive({
    title: "",
    description: "",
    options: [] as string[],
    newOption: "",
    useQuadratic: false,
    passcode: "",
    voteCount: 1,
    shareVotelinkDialog: false,
    pollUuid: "",
    snackbar: false,
    showRealtimeResult: false,
    publicVote: true,
    voteLink: ""
})

const snackbarData = reactive({
    msg: "",
    show: false,
})


const showSnackbar = (msg: string) => {
    snackbarData.msg = msg
    snackbarData.show = true
}

const addOption = () => {
    if (data.newOption != "")
        data.options.push(data.newOption)
    else
        showSnackbar("Error: Option shouldn't be null")
    data.newOption = ""
}

const removeOption = (idx: number) => {
    data.options.splice(idx, 1)
}

const copyLink = async () => {
    await navigator.clipboard.writeText(data.voteLink)
    data.snackbar = true
}

const createVote = async () => {
    const voteData: any = {
        showRealtimeResult: data.showRealtimeResult,
        payload: {}
    }
    const payload: any = {
        title: data.title,
        description: data.description,
        options: data.options,
        voteCount: data.voteCount,
        useQuadratic: data.useQuadratic,
    }

    const payloadCiphertext = AES.encrypt(JSON.stringify(payload), data.passcode).toString()

    voteData.payload = payloadCiphertext

    console.log(JSON.stringify(voteData))

    const uuid = uuidv4()
    let utf8Encode = new TextEncoder();

    data.pollUuid = (ethers.utils.keccak256(utf8Encode.encode(uuid))).slice(2)

    const uuidBigNumber = ethers.BigNumber.from("0x" + data.pollUuid)

    // Upload result to smart contract!
    const StarVoting = new StarVotingContract()
    StarVoting.init()
    await StarVoting.createPoll(uuidBigNumber, data.showRealtimeResult, data.publicVote, JSON.stringify(voteData))

    // Show share link to coordinator
    data.shareVotelinkDialog = true
    data.voteLink = window.location.origin + `/vote/${data.pollUuid}`
}
</script>

<style scoped>
.form-title {
    font-weight: bold;
    font-size: 18px;
}
</style>