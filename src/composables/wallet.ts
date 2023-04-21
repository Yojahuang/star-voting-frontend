import { ethers } from "ethers"
import { ref } from "vue"

export default class BrowserWallet {
    address = ref<string>("")

    connect = async () => {
        const ethereum = (window as any).ethereum
        const provider = new ethers.providers.Web3Provider(ethereum)

        // get the chain selected in the select

        // Check the chain ID of the connected network
        const chainIdList = [100, 18, 108, 59140]; // Replace with your list of allowed chain IDs
        const chainId = await provider.getNetwork().then(network => network.chainId)
        if (!chainIdList.includes(chainId)) {
            throw new Error("Invalid Ethereum network. Please switch to the correct network.");
        }

        // MetaMask requires requesting permission to connect users accounts
        await provider.send("eth_requestAccounts", [])

        const providerURL = provider.connection.url

        const address = await provider.getSigner().getAddress()
        this.address.value = address

        localStorage.setItem("address", address)
        localStorage.setItem("providerURL", providerURL)
    }

    getAddress = () => {
        return this.address
    }

    getProvider = () => {
        const providerURL = localStorage.getItem("providerURL")

        if (providerURL == null) {
            return null
        }

        const provider = new ethers.providers.JsonRpcProvider(providerURL)

        return provider
    }

    disconnect = () => {
        localStorage.removeItem("address")
        localStorage.removeItem("providerURL")
        this.address.value = ""
    }
}