import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/pages/Home.vue'
import Vote from '@/pages/Vote.vue'
import AddVote from '@/pages/AddVote.vue'

let history = createWebHistory()
let routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
    },
    {
        path: '/vote/:id/:passcode',
        name: 'Vote',
        component: Vote,
    },
    {
        path: '/addvote',
        name: 'Addvote',
        component: AddVote,
    },
]

export default createRouter({ history, routes })
