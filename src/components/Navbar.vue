<template>
    <div class="d-flex justify-space-between align-center w-100" style="height: 50px">
        <div class="d-flex justify-start align-center">
            <div class="mx-2"><b @click="navigateTo('')">E voting</b></div>
            <v-btn class="mx-2" variant="text" @click="navigateTo('votes')">Votes</v-btn>
            <v-btn class="mx-2" variant="text" @click="navigateTo('roadmap')">Roadmap</v-btn>
        </div>
        <div class="d-flex justify-start align-center">
            <v-btn class="mx-2" @click="toggleTheme()" icon="mdi-theme-light-dark" variant="text"></v-btn>
            <v-btn class="mx-2" variant="outlined" color="primary">Connect</v-btn>
        </div>
    </div>
    <v-divider></v-divider>
</template>

<script setup lang="ts">
import { useTheme } from "vuetify"
import router from '@/router/index'

const theme = useTheme()

const toggleTheme = () => {
    theme.global.name.value = theme.global.current.value.dark ? 'light' : 'dark'
}

const navigateTo = (prefix: string) => {
    router.push(`/${prefix}`)
}

const connectWallet = () => {

}
</script>