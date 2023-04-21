<template>
    Index: {{ routeId }}
    <div class="text-h3">{{ info.payload.title }}</div>
    <div class="text-h4">{{ info.payload.description }}</div>

    <v-dialog v-model="passcodeDialog" transition="dialog-bottom-transition">
        <div class="mx-auto w-75">
            <v-card max-width="500" class="mx-auto">
                <template #title>Input passcode</template>
                <v-divider></v-divider>
                <v-text-field v-model="passcode" @keyup.enter="decrypt" label="Passcode"></v-text-field>
                <v-btn @click="decrypt">Send</v-btn>
            </v-card>
        </div>
    </v-dialog>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref } from "vue"
import AES from 'crypto-js/aes';
import encUtf8 from 'crypto-js/enc-utf8'

const passcodeDialog = ref(true)

const info: any = { "useQuadratic": false, "options": 2, "payload": "U2FsdGVkX18TXN+OelRnnXnAASJnPWPbs1VtqYFy0EqDS70cqN3ZRkU5DgswmraylxgLz+E3HMGbGdqNzydBFQczwO8VqqvkhsWf97eSbs8=" }
const passcode = ref("t03")

const route = useRoute()
const routeId = route.params.id

const decrypt = () => {
    const bytePayload = AES.decrypt(info.payload, passcode.value)
    try {
        info.payload = JSON.parse(bytePayload.toString(encUtf8))
        console.log(info.payload.title)
        console.log(info.payload.description)
        console.log(info.payload.options)
        console.log(info.payload.voteCount)
    } catch (error) {
        alert('Passcode is wrong!')
        return
    }

    passcodeDialog.value = false
}
</script>