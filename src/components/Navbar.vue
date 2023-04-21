<template>
    <div class="d-flex justify-space-between align-center w-100" style="height: 50px; background-color: #3f51b5;">
        <div class="d-flex justify-start align-center">
            <div class="mx-2 text-white"><b @click="navigateTo('')">E voting</b></div>
            <v-btn class="mx-2 text-white" variant="text" @click="navigateTo('votes')">Votes</v-btn>
            <v-btn class="mx-2 text-white" variant="text" @click="navigateTo('roadmap')">Roadmap</v-btn>
        </div>
        <div class="d-flex justify-start align-center">
            <v-btn class="mx-2 text-white" @click="toggleTheme()" icon="mdi-theme-light-dark" variant="text"></v-btn>
            <!-- <v-select hide-details="auto" :items="items" v-model="selectedChain">
                <template #selection="{item}">
                    <img :src="getIconURL(item.value.image)" width="30" height="30" />
                </template>
                <template #item="{item}">
                    <div class="d-flex align-center">
                        <img :src="getIconURL(item.value.image)" width="30" height="30" />
                        <div>{{ item.value.name }}</div>
                    </div>
                </template>
            </v-select> -->

            <v-select
                v-model="selected"
                :items="['ThunderCore', 'ThunderCore Testnet', 'Linea Testnet', 'Gnosis']"
                hide-details="auto"
                density="comfortable"
            ></v-select>

            <v-chip v-if="address != ''">{{ beautifyAddress() }}</v-chip>
            <v-btn class="mx-2" v-if="address == ''" @click="connectWallet()" variant="outlined"
                color="secondary">Connect</v-btn>
            <v-btn class="mx-2" v-if="address != ''" @click="disconnectWallet()" variant="outlined"
                color="secondary">Disconnect</v-btn>
        </div>
    </div>
    <v-divider class="mb-6"></v-divider>
</template>

<script setup lang="ts">
import { useTheme } from "vuetify"
import router from '@/router/index'
import BrowserWallet from "@/composables/wallet"
import { ref } from "vue"

const selected = ref('ThunderCore')

const items = ref([{name: 'ThunderCore', image: 'ThunderCore_icon'}])
const selectedChain = ref({name: 'ThunderCore', image: 'ThunderCore_icon'})

const getIconURL = (name: string): string => {
    const result = new URL(`/src/assets/chains/${name}.svg`, import.meta.url);
    return result.href;
};

const theme = useTheme()

const wallet = new BrowserWallet()
const address = wallet.address

const beautifyAddress = (): string => {
    const addr = address.value
    if (addr == "") return ""

    const length = addr.length;
    return addr.substring(0, 4) + "..." + addr.substring(length - 4, length)
}

const toggleTheme = () => {
    theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
}

const navigateTo = (prefix: string) => {
    router.push(`/${prefix}`)
}

const connectWallet = async () => {
    await wallet.connect()
}

const disconnectWallet = () => {
    wallet.disconnect()
}

</script>