import { ethers } from "ethers"
import { ref, toRaw } from "vue"
import { useGlobalStore } from "@/stores/Global"
import { storeToRefs } from "pinia"

export default class BrowserWallet {
    address = ref<string>("")

    switchChain = async(chainId: number, rpcUrl: string, chainName: string, nativeCurrency: any)=>{
        const ethereum = (window as any).ethereum
        
        try {
            await ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x' + chainId.toString(16)}],
            });
        } catch (error) {
            try {
                await ethereum.request({
                    method: 'wallet_addEthereumChain',
                    params: [
                        {
                            chainId: '0x' + chainId.toString(16),
                            rpcUrls: [rpcUrl],
                            chainName,
                            nativeCurrency
                        },
                    ],
                });
            } catch (addError) {
                console.error(addError);
            }
            // console.error(error);
        }
    }

    connect = async () => {
        const ethereum = (window as any).ethereum
        const provider = new ethers.providers.Web3Provider(ethereum, 'any')

        const globalStore = useGlobalStore()
        
        // get the chain selected in the select
        const { selectedChain } = storeToRefs(globalStore)
        
        const chainMap = toRaw(globalStore.chainInfoMap)

        // MetaMask requires requesting permission to connect users accounts
        await provider.send("eth_requestAccounts", [])
        
        const chainInfo = chainMap[selectedChain.value]
        await this.switchChain(chainInfo.chainId, chainInfo.rpcUrl, selectedChain.value, chainInfo.nativeCurrency);

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