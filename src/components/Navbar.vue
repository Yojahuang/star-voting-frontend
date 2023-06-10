<template>
    <div v-if="!smAndDown" class="d-flex justify-space-between align-center w-100"
        style="height: 50px; background-color: #3f51b5">
        <div class="d-flex justify-start align-center">
            <div class="ml-5 mr-2 text-white text-button">
                <b @click="navigateTo('')">Star Voting</b>
            </div>
            <v-btn class="mx-2 text-white" variant="text" @click="navigateTo('addvote')">Votes</v-btn>
            <v-btn class="mx-2 text-white" variant="text" @click="navigateTo('roadmap')">Roadmap</v-btn>
        </div>
        <div class="d-flex justify-start align-center">
            <v-btn class="mx-2 text-white" @click="toggleTheme()" icon="mdi-theme-light-dark" variant="text"></v-btn>

            <v-select class="mx-2 text-white" v-model="selectedChain" :items="[
                'ThunderCore Testnet',
                'Linea Testnet',
                'Chiado(Gnosis) testnet',
            ]" hide-details="auto" density="comfortable"></v-select>

            <v-chip class="mx-2 text-white" v-if="address != ''">{{
                beautifyAddress()
            }}</v-chip>
            <v-btn class="mx-2" v-if="address == ''" @click="connectWallet()" variant="outlined"
                color="secondary">Connect</v-btn>
            <v-btn class="ml-2 mr-5" v-if="address != ''" @click="disconnectWallet()" variant="outlined"
                color="warning">Disconnect</v-btn>
        </div>
    </div>
    <div v-else class="d-flex justify-space-between align-center w-100" style="height: 50px; background-color: #3f51b5">
        <div class="d-flex justify-start align-center">
            <div class="ml-5 mr-2 text-white text-button">
                <b @click="navigateTo('')">Star Voting</b>
            </div>
        </div>
        <div class="d-flex justify-start align-center">
            <v-btn class="mx-2 text-white" @click="toggleTheme()" icon="mdi-theme-light-dark" variant="text"></v-btn>

            <v-btn class="mx-2 text-white" icon="mdi-account" @click="toggleAccountDialog()" variant="tonal"></v-btn>

            <v-btn class="mx-2 text-white" icon="mdi-menu" @click="toggleMenu()" variant="tonal"></v-btn>
        </div>
    </div>
    <div v-if="showMenu" class="pb-2" style="background-color: #3f51b5;">
        <v-btn class="d-block m-2 text-white" variant="text" @click="navigateTo('addvote')">Votes</v-btn>
        <v-btn class="d-block m-2 text-white" variant="text" @click="navigateTo('roadmap')">Roadmap</v-btn>

    </div>

    <v-dialog v-model="accountDialog">
        <v-card>
            <v-card-text>
                <div class="m-2">
                    Your address: {{ beautifyAddress() }}
                </div>
                <v-select class="m-2" v-model="selectedChain" :items="[
                    'ThunderCore Testnet',
                    'Linea Testnet',
                    'Chiado(Gnosis) testnet',
                ]" hide-details="auto" density="comfortable"></v-select>
            </v-card-text>
            <v-card-actions>
                <v-btn class="mx-2" v-if="address == ''" @click="connectWallet()" variant="outlined"
                    color="secondary">Connect</v-btn>
                <v-btn class="ml-2 mr-5" v-if="address != ''" @click="disconnectWallet()" variant="outlined"
                    color="warning">Disconnect</v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
    <v-divider class="mb-6"></v-divider>
</template>

<script setup lang="ts">
import { useTheme } from 'vuetify'
import router from '@/router/index'
import BrowserWallet from '@/composables/wallet'
import { useGlobalStore } from '@/stores/Global'
import { storeToRefs } from 'pinia'
import { onMounted, ref } from 'vue'
import { useDisplay } from 'vuetify'

const { smAndDown } = useDisplay()

const { selectedChain } = storeToRefs(useGlobalStore())

const theme = useTheme()

const wallet = new BrowserWallet()
const address = wallet.address

const showMenu = ref(false)
const accountDialog = ref(false)

onMounted(() => {
    wallet.getAddress()
})

const beautifyAddress = (): string => {
    const addr = address.value
    if (addr == '') return ''

    const length = addr.length
    return addr.substring(0, 4) + '...' + addr.substring(length - 4, length)
}

const toggleMenu = () => {
    showMenu.value = !showMenu.value;
}

const toggleAccountDialog = () => {
    accountDialog.value = !accountDialog.value
}

const toggleTheme = () => {
    theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
}

const navigateTo = (prefix: string) => {
    router.push(`/${prefix}`)
    showMenu.value = false
}

const connectWallet = async () => {
    await wallet.connect()
}

const disconnectWallet = () => {
    wallet.disconnect()
}
</script>
