import { BigNumberish, ethers } from 'ethers'
import contractABI from '@/assets/StarVoting.json'
import BrowserWallet from '@/composables/wallet'
import { storeToRefs } from 'pinia'
import { useGlobalStore } from '@/stores/Global'

export default class StarVotingContract {
    static merkleTreeDepth = 20
    address = '0xAC3d9886750b7Ac602E0900aAb13F597910F4700'
    starVotingContract: ethers.Contract | undefined = undefined
    option = { gasLimit: 20_000_000 }

    init = () => {
        const ethereum = (window as any).ethereum
        const provider = new ethers.providers.Web3Provider(ethereum, 'any')

        const { selectedChain } = storeToRefs(useGlobalStore())

        if (selectedChain.value == 'Linea Testnet') {
            this.address = '0xF5cf95cbA9E7E7c7831b07A0D3998Ac31A109857'
        } else {
            this.address = '0xAC3d9886750b7Ac602E0900aAb13F597910F4700'
        }

        if (provider != null)
            this.starVotingContract = new ethers.Contract(
                this.address,
                contractABI,
                provider
            )
    }

    getEncryptionKey = async (pollId: BigInt) => {
        if (this.starVotingContract == undefined) return

        let encryptionKey
        try {
            encryptionKey = await this.starVotingContract.getEncryptionKey(
                pollId
            )
        } catch (error) {
            console.log(error)
        }

        return encryptionKey
    }

    getDecryptionKey = async (pollId: BigInt) => {
        if (this.starVotingContract == undefined) return

        let decryptionKey
        try {
            decryptionKey = await this.starVotingContract.getDecryptionKey(
                pollId
            )
        } catch (error) {
            console.log(error)
        }

        return decryptionKey
    }

    getEncryptedPollInfo = async (pollId: BigInt) => {
        if (this.starVotingContract == undefined) return

        let encryptedPollInfo
        try {
            encryptedPollInfo =
                await this.starVotingContract.getEncryptedPollInfo(pollId)
        } catch (error) {
            console.log(error)
        }

        return encryptedPollInfo
    }

    waitTx = async (tx: any) => {
        const receipt = await tx.wait()
        console.log(receipt)
    }

    createPoll = async (
        pollId: BigInt,
        livePoll: boolean,
        isPrivate: boolean,
        encryptedInfo: string
    ) => {
        const ethereum = (window as any).ethereum
        const provider = new ethers.providers.Web3Provider(ethereum, 'any')
        const signer = provider.getSigner()

        const browserWallet = new BrowserWallet()
        const coordinator = browserWallet.getAddress()

        if (signer == null || this.starVotingContract == undefined) return

        const tx = await this.starVotingContract
            .connect(signer)
            .createPoll(
                pollId,
                coordinator,
                StarVotingContract.merkleTreeDepth,
                livePoll,
                isPrivate,
                encryptedInfo,
                this.option
            )
        await this.waitTx(tx)
    }

    getPollCoordinator = async (pollId: BigInt) => {
        if (this.starVotingContract == null) return null

        return await this.starVotingContract.getPollCoordinator(pollId)
    }

    getPollState = async (pollId: BigInt) => {
        if (this.starVotingContract == null) return null

        return await this.starVotingContract.getPollState(pollId)
    }

    addVoter = async (pollId: BigInt, commitment: bigint) => {
        const ethereum = (window as any).ethereum
        const provider = new ethers.providers.Web3Provider(ethereum, 'any')
        const signer = provider.getSigner()

        if (this.starVotingContract == undefined) return

        const tx = await this.starVotingContract
            .connect(signer)
            .addVoter(pollId, commitment, this.option)

        await this.waitTx(tx)
    }

    startPoll = async (pollId: BigInt, encryptionKey: string) => {
        const ethereum = (window as any).ethereum
        const provider = new ethers.providers.Web3Provider(ethereum, 'any')
        const signer = provider.getSigner()

        if (this.starVotingContract == undefined) return

        const tx = await this.starVotingContract
            .connect(signer)
            .startPoll(pollId, encryptionKey, this.option)

        await this.waitTx(tx)
    }

    endPoll = async (pollId: BigInt, decryptionKey: string) => {
        const ethereum = (window as any).ethereum
        const provider = new ethers.providers.Web3Provider(ethereum, 'any')
        const signer = provider.getSigner()

        if (this.starVotingContract == undefined) return

        const tx = await this.starVotingContract
            .connect(signer)
            .endPoll(pollId, decryptionKey, this.option)
        await this.waitTx(tx)
    }

    castVote = async (
        vote: string,
        nullifierHash: BigNumberish,
        pollId: BigNumberish,
        proof: BigNumberish[]
    ) => {
        const ethereum = (window as any).ethereum
        const provider = new ethers.providers.Web3Provider(ethereum, 'any')
        const signer = provider.getSigner()

        if (this.starVotingContract == undefined) return

        const tx = await this.starVotingContract
            .connect(signer)
            .castVote(vote, nullifierHash, pollId, proof, this.option)
        await this.waitTx(tx)
    }
}
