import { BigNumberish, ethers } from "ethers"
import contractABI from "@/assets/StarVoting.json"
import BrowserWallet from "@/composables/wallet"

export default class StarVotingContract {
    static merkleTreeDepth = 20
    address = "0xAC3d9886750b7Ac602E0900aAb13F597910F4700"
    starVotingContract: ethers.Contract | undefined = undefined
    option = { gasLimit: 20_000_000 }

    init = () => {
        const ethereum = (window as any).ethereum
        const provider = new ethers.providers.Web3Provider(ethereum, 'any')

        if (provider != null)
            this.starVotingContract = new ethers.Contract(this.address, contractABI, provider)
    }

    getEncryptedPollInfo = async (pollId: ethers.BigNumber) => {
        if (this.starVotingContract == undefined) return

        let encryptedPollInfo
        try {
            encryptedPollInfo = await this.starVotingContract.getEncryptedPollInfo(
                pollId
            );
        } catch (error) {
            console.log(error)
        }

        return encryptedPollInfo
    }

    createPoll = async (pollId: ethers.BigNumber, livePoll: boolean, isPrivate: boolean, encryptedInfo: string) => {
        const ethereum = (window as any).ethereum
        const provider = new ethers.providers.Web3Provider(ethereum, 'any')
        const signer = provider.getSigner()

        const browserWallet = new BrowserWallet()
        const coordinator = browserWallet.getAddress()

        if (signer == null || this.starVotingContract == undefined) return

        await this.starVotingContract.connect(signer).createPoll(pollId, coordinator, StarVotingContract.merkleTreeDepth, livePoll, isPrivate, encryptedInfo, this.option)
    }

    getPollCoordinator = async (pollId: ethers.BigNumber) => {
        if (this.starVotingContract == null) return null

        return await this.starVotingContract.getPollCoordinator(pollId)
    }

    getPollState = async (pollId: ethers.BigNumber) => {
        if (this.starVotingContract == null) return null

        return await this.starVotingContract.getPollState(pollId)
    }

    addVoter = async (pollId: ethers.BigNumber, commitment: bigint) => {
        const ethereum = (window as any).ethereum
        const provider = new ethers.providers.Web3Provider(ethereum, 'any')
        const signer = provider.getSigner()

        if (this.starVotingContract == undefined) return

        await this.starVotingContract.connect(signer).addVoter(pollId, commitment, this.option)
    }

    startPoll = async (pollId: ethers.BigNumber, encryptionKey: string) => {
        const ethereum = (window as any).ethereum
        const provider = new ethers.providers.Web3Provider(ethereum, 'any')
        const signer = provider.getSigner()

        if (this.starVotingContract == undefined) return

        await this.starVotingContract.connect(signer).startPoll(pollId, encryptionKey, this.option)
    }

    castVote = async (vote: string,
        nullifierHash: BigNumberish,
        pollId: BigNumberish,
        proof: BigNumberish[]) => {
        const ethereum = (window as any).ethereum
        const provider = new ethers.providers.Web3Provider(ethereum, 'any')
        const signer = provider.getSigner()

        if (this.starVotingContract == undefined) return

        await this.starVotingContract.connect(signer).castVote(vote, nullifierHash, pollId, proof, this.option)

    }

}