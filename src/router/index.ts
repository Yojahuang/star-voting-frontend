import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/pages/Home.vue'
import Votes from '@/pages/Votes.vue'
import Vote from '@/pages/Vote.vue'
import AddVote from '@/pages/AddVote.vue'

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
    },
    {
        path: '/addvote',
        name: 'Addvote',
        component: AddVote
    }
]

export default createRouter({ history, routes })