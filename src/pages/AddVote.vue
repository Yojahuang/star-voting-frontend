<template>
    <div class="w-75 mx-auto">
        <v-card
            :disabled="shouldBeDisabled"
            :loading="shouldBeDisabled"
            max-width="500"
            class="mx-auto"
        >
            <template #title>
                <div class="text-lg-h4 font-weight-bold">Create Vote</div>
            </template>
            <v-divider></v-divider>
            <GeneralVote />
        </v-card>
    </div>
</template>

<script setup lang="ts">
import GeneralVote from '@/components/AddVote/GeneralVote.vue'
import { useGlobalStore } from '@/stores/Global'
import { storeToRefs } from 'pinia'

const { shouldBeDisabled } = storeToRefs(useGlobalStore())
</script>
