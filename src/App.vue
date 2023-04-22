<script setup lang="ts">
import Navbar from '@/components/Navbar.vue'
import { onMounted } from 'vue'
import { useGlobalStore } from '@/stores/Global'
import { storeToRefs } from 'pinia'
import { chainName } from '@/composables/EtherLog'

onMounted(() => {
    const { selectedChain } = storeToRefs(useGlobalStore())
    const storage = localStorage.getItem('selectedChain')
    if (storage != null) {
        selectedChain.value = storage as chainName
    }
})
</script>

<template>
    <v-app>
        <Navbar></Navbar>
        <router-view />
    </v-app>
</template>

<style scoped></style>
