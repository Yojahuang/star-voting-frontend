<script setup lang="ts">
import { reactive } from 'vue'

const cards = reactive([
    {
        title: 'Poll Privacy',
        subtitle: 'Powered by AES',
        text: 'To ensure poll confidentiality, we encrypt details with a symmetric key, and restrict key access to group members only. Vote counts of each option are visible to the public at the end of the vote, but options meanings remain private.',
        icon: 'mdi-shield-account',
        show: true,
        showText: false,
        flex: 6,
    },
    {
        title: 'Honesty / Soundness',
        subtitle: 'Powered by Zero-Knowledge Semaphore',
        text: 'We use zero-knowledge to ensure that the identity secret generating a specific proof cannot be traced back. Also, the honesty of poll results(on-chain) can be verified through decrypting the signal using the private key released at the end of the poll.',
        icon: 'mdi-hand-front-left',
        show: true,
        showText: false,
        flex: 6,
    },
    {
        title: 'Anonymity',
        subtitle: 'Powered by Zero-Knowledge Semaphore',
        text: "No individual in a group can be identified as the source of a specific voting signal (e.g., choosing option n) through reverse engineering, due to the irreversibility provided by Semaphore Protocol.",
        icon: 'mdi-incognito',
        show: true,
        showText: false,
        flex: 6,
    },
    {
        title: 'Raise Public Awareness',
        subtitle: 'Powered by Quadratic Voting',
        text: "Quadratic voting can raise public awareness of different voting topics, as the way an individual allocates one's voting resources can result in diverse outcomes. To promote public attention to public issues, we have included quadratic voting as a voting option.",
        icon: 'mdi-bullhorn-variant',
        show: true,
        showText: false,
        flex: 6,
    },
])

const flipcard = (idx: number) => {
    cards[idx].show = false
    setTimeout(() => {
        cards[idx].show = true
        cards[idx].showText = !cards[idx].showText
    }, 300)
}
</script>

<template>
    <div id="my-page" class="mx-auto w-75">
        <div class="text-h4 my-6 font-weight-bold">What we offer</div>

        <div class="mx-auto w-100">
            <v-row dense>
                <v-col v-for="(card, idx) in cards" :cols="card.flex" class="mx-auto">
                    <v-expand-transition>
                        <v-card @click="flipcard(idx)" v-show="card.show" class="mx-auto my-4" elevation="21" width="400"
                            height="300" variant="tonal">
                            <template v-if="card.showText">
                                <div class="mx-auto w-75 h-100 d-flex align-center font-center">
                                    {{ card.text }}
                                </div>
                            </template>
                            <template v-else>
                                <div class="mx-auto w-100 h-100 d-flex align-center font-center">
                                    <div class="w-100 mx-auto">
                                        <v-icon class="mx-auto w-100" size="40" :icon="card.icon"></v-icon>
                                        <v-card-title align="center" class="text-center">{{ card.title }}</v-card-title>
                                        <v-card-subtitle justify="center" class="text-center">
                                            {{ card.subtitle }}
                                        </v-card-subtitle>
                                    </div>
                                </div>
                            </template>
                        </v-card>
                    </v-expand-transition>
                </v-col>
            </v-row>
        </div>
    </div>
</template>

<style scoped></style>
