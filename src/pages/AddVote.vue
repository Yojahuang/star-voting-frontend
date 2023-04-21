<template>
    <div class="w-75 mx-auto">
        <v-card max-width=500 class="mx-auto">
            <template #title>
                <div class="text-lg-h4 font-weight-bold">Create Vote</div>
            </template>
            <v-divider></v-divider>
            <GeneralVote />
        </v-card>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import GeneralVote from "@/components/AddVote/GeneralVote.vue"

const tab = ref('General')
</script>