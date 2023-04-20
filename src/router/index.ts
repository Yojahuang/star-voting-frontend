import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/pages/Home.vue'
import Votes from '@/pages/Votes.vue'
import Vote from '@/pages/Vote.vue'

let history = createWebHistory()
let routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/votes',
        name: 'Votes',
        component: Votes
    },
    {
        path: '/vote/:id',
        name: 'Vote',
        component: Vote
    }
]

export default createRouter({ history, routes })