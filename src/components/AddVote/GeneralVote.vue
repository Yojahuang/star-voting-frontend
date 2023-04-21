<template>
    <div class="mx-4">

        <div class="form-title my-4">Title</div>
        <v-text-field hide-details="auto" v-model="title" label="Title"></v-text-field>

        <div class="form-title my-4">Description</div>
        <v-textarea hide-details="auto" v-model="description" label="Description"></v-textarea>

        <div class="form-title my-4">Options</div>
        <template v-for="(option, index) in options">
            <v-text-field hide-details="auto" v-model="options[index]" label="Option">
                <template #append-inner>
                    <v-icon @click="removeOption(index)" icon="mdi-trash-can"></v-icon>
                </template>
            </v-text-field>
        </template>
        <v-text-field hide-details="auto" @keydown.enter="addOption()" v-model="newOption" label="Add option">
            <template #append-inner>
                <v-icon @click="addOption()" icon="mdi-plus"></v-icon>
            </template>
        </v-text-field>

        <div class="form-title my-4">Settings</div>
        <v-checkbox hide-details="auto" v-model="useQuadratic" label="Use quadratic voting"></v-checkbox>
        <v-text-field hide-details="auto" v-model="voteCount" label="How many votes each people should have"></v-text-field>
        <v-text-field hide-details="auto" v-model="passcode" label="Passcode"></v-text-field>

        <v-btn class="w-100 my-4" @click="createVote" color="primary">Create</v-btn>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import AES from 'crypto-js/aes';

const title = ref("")
const description = ref("")
const options = ref<string[]>([])
const newOption = ref("")
const useQuadratic = ref(false)
const passcode = ref("")
const voteCount = ref(1)

const addOption = () => {
    if (newOption.value != "")
        options.value.push(newOption.value)
    newOption.value = ""
}

const removeOption = (idx: number) => {
    options.value.splice(idx, 1)
}

const createVote = () => {
    const payload: any = {
        title: title.value,
        description: description.value,
        options: options.value,
        voteCount: voteCount.value
    }

    const payloadCiphertext = AES.encrypt(JSON.stringify(payload), passcode.value).toString()

    const result = {
        useQuadratic: useQuadratic.value,
        options: options.value.length,
        payload: payloadCiphertext,
    }

    console.log(JSON.stringify(result))

    // Upload result to smart contract!
}
</script>

<style scoped>
.form-title {
    font-weight: bold;
    font-size: 18px;
}
</style>