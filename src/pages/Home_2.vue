<script setup lang="ts"></script>

<template>
    <div id="my-page" class="mx-auto w-75">
        <div class="text-h4 my-8 font-weight-bold">What we offer</div>
        <div class="d-flex align-center justify-space-between my-2">
            <div class="mx-2 landing-card">
                <v-icon icon="mdi-comment-edit" size="45"></v-icon>
                <div class="text-h4 font-weight-bold">Poll Privacy</div>
                Powered by AES
            </div>
            <div class="mx-2 landing-card">
                <v-icon icon="mdi-head-question" size="45"></v-icon>
                <div class="text-h4 font-weight-bold">Honesty / Soundness</div>
                Powered by Zero-Knowledge Semaphore
            </div>
            <div class="mx-2 landing-card">
                <v-icon icon="mdi-comment-edit" size="45"></v-icon>
                <div class="text-h4 font-weight-bold">Anonymity</div>
                Powered by Zero-Knowledge Semaphore &amp; Merkle Tree
            </div>
            <div class="mx-2 landing-card">
                <v-icon icon="mdi-comment-edit" size="45"></v-icon>
                <div class="text-h4 font-weight-bold">Raise Public Awareness</div>
                Powered by Quadratic Voting
            </div>
        </div>
        <div class="d-flex align-center justify-space-between my-2">
            <div class="mx-2 landing-card">
                To ensure poll confidentiality, we encrypt details with a symmetric key, and restrict key access to group
                members only. Vote counts of each option are visible to the public at the end of the vote, but options
                meanings remain private.
            </div>
            <div class="mx-2 landing-card">
                We ensure that the identity of the person who generated a specific proof record cannot be traced back by
                anyone, even the poll coordinator, utilizing zero-knowledge technology. Also, the honesty of poll results
                can be verified through decrypting the proof, which was uploaded on chain during the voting process, using
                the private key released at the end of the poll.
            </div>
            <div class="mx-2 landing-card">
                No individual in a group can be identified as the source of a specific voting signal (e.g., choosing option
                n) through reverse engineering, due to the irreversibility provided by Semaphore's implementation of Merkle
                tree.
            </div>
            <div class="mx-2 landing-card">
                Quadratic voting can raise public awareness of different voting topics, as the way an individual allocates
                one's voting resources can result in diverse outcomes. To promote public attention to public issues, we have
                included quadratic voting as a voting option.
            </div>
        </div>
    </div>
</template>

<style scoped>
.landing-card {
    font-size: 17px;
    height: 200px;
    width: 300px;
}

#my-page {
    max-width: 1200px;
    margin: 10 auto;
}
</style>
