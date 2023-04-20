<template>
    Index: {{ routeId }}

    <div class="text-h3">{{ info.title }}</div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
const routeId = route.params.id

const info = {
    title: 'US president Election',
    index: 1,
    finishedAt: '2023/07/19 20:45'
}
</script>