import { ethers } from "ethers"
import { ref } from "vue"

export default class BrowserWallet {
    address = ref<string>("")

    connect = async () => {
        const ethereum = (window as any).ethereum
        const provider = new ethers.providers.Web3Provider(ethereum)

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