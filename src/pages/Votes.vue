<script setup lang="ts">
import router from '@/router/index'
import { type } from 'os';

const votes = [
    {
        title: 'US president Election',
        index: 1,
        finishedAt: '2023/07/19 20:45'
    },
    {
        title: '三年六班班長選舉',
        index: 2,
        finishedAt: '2023/04/19 20:45'
    },
    {
        title: '2022 公投',
        index: 3,
        finishedAt: '2023/07/19 20:45'
    }
]

const navigateTo = (url: number | string) => {
    if (typeof url == 'string') {
        router.push(`${url}`)
    } else {
        router.push(`/vote/${url}`)
    }
}
</script>

<template>
    <br />
    <div class="mx-auto w-75">
        <v-text-field placeholder="Search 3 votings...">
            <template #prepend>
                <v-icon icon="mdi-magnify"></v-icon>
            </template>
        </v-text-field>
        <br />
        <div class="d-flex align-center justify-space-between">
            <div class="text-h5">
                <b>Ongoing votings</b>
            </div>
            <v-btn @click="navigateTo('/addvote')" variant="tonal" color="primary">Create vote</v-btn>
        </div>

        <br />
        <v-card class="w-75 mx-auto">
            <v-list lines="one">
                <v-list-item @click="navigateTo(vote.index)" active-color="primary" variant="plain" v-for="vote in votes"
                    :key="vote.index" :title="vote.title">
                    <template #prepend>
                        <b>#{{ vote.index }}</b>&nbsp;
                    </template>
                    <template #append>
                        End at&nbsp;<b>{{ vote.finishedAt }}</b>
                    </template>
                </v-list-item>
            </v-list>
        </v-card>
    </div>
</template>

<style scoped></style>
