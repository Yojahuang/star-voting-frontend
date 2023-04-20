<template>
    <div class="w-75 mx-auto">
        <v-card max-width=500 class="mx-auto">
            <v-tabs v-model="tab" bg-color="primary">
                <v-tab value="General">General voting</v-tab>
                <v-tab value="Quadratic">Quadratic voting</v-tab>
            </v-tabs>
            <v-divider></v-divider>
            <v-window v-model="tab">
                <v-window-item value="General">
                    <GeneralVote />
                </v-window-item>

                <v-window-item value="Quadratic">
                    <QuadraticVote />
                </v-window-item>
            </v-window>
        </v-card>
    </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import GeneralVote from "@/components/AddVote/GeneralVote.vue"
import QuadraticVote from "@/components/AddVote/QuadraticVote.vue"

const tab = ref('General')
</script>