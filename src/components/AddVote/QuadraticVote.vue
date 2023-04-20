<template>
    <div class="mx-4">

        <div class="form-title my-4">Title</div>
        <v-text-field hide-details="auto" v-model="title" label="Title"></v-text-field>

        <div class="form-title my-4">Description</div>
        <v-textarea hide-details="auto" v-model="description" label="Description"></v-textarea>

        <div v-if="hasDeadline">
            <div class="form-title my-4">End at</div>
            <VueDatePicker v-model="date" text-input :dark="theme.global.current.value.dark" />
        </div>

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
        <v-text-field hide-details="auto" label="How many tokens each people should have"></v-text-field>
        <v-checkbox v-model="hasDeadline" hide-details="auto" label="Closed vote on a fixed date"></v-checkbox>
        <v-checkbox v-model="privacyMode" hide-details="auto" label="Privacy mode"></v-checkbox>

        <v-btn class="w-100 my-4" color="primary">Create</v-btn>
    </div>
</template>

<script setup lang="ts">

import { ref } from "vue"
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { useTheme } from "vuetify"

const theme = useTheme()
const title = ref("")
const description = ref("")
const options = ref<string[]>([])
const newOption = ref("")
const date = ref()
const hasDeadline = ref(true)
const privacyMode = ref(false)

const addOption = () => {
    if (newOption.value != "")
        options.value.push(newOption.value)
    newOption.value = ""
}

const removeOption = (idx: number) => {
    options.value.splice(idx, 1)
}
</script>