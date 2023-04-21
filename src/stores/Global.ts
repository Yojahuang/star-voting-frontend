import {defineStore} from "pinia"
import { ref, watch } from "vue"
import BrowserWallet from "@/composables/wallet"

export const useGlobalStore = defineStore('global', () => {
    type chain = 'ThunderCore' | "ThunderCore Testnet" | "Linea Testnet" | "Gnosis"
    const selectedChain = ref<chain>('ThunderCore')

    const chainInfoMap = {
        "ThunderCore": {
            chainId: 108,
            rpcUrl: "https://mainnet-rpc.thundercore.com",
            nativeCurrency: {
                name: "TT",
                symbol: "TT",
                decimals: 18
            }
        },
        "ThunderCore Testnet" : {
            chainId: 18,
            rpcUrl: "https://testnet-rpc.thundercore.com",
            nativeCurrency: {
                name: "TST",
                symbol: "TST",
                decimals: 18
            }
        },
        "Linea Testnet" : {
            chainId: 59140,
            rpcUrl: "https://rpc.goerli.linea.build",
            nativeCurrency: {
                name: "ETH",
                symbol: "ETH",
                decimals: 18
            }
        },
        "Gnosis" : {
            chainId: 100,
            rpcUrl: "https://rpc.gnosischain.com",
            nativeCurrency: {
                name: "xdai",
                symbol: "xdai",
                decimals: 18
            }
        },
    }

    watch(selectedChain, async() => {
        const wallet = new BrowserWallet()
        const chainInfo = chainInfoMap[selectedChain.value]
        await wallet.switchChain(chainInfo.chainId, chainInfo.rpcUrl, selectedChain.value, chainInfo.nativeCurrency)
    })

    return {selectedChain, chainInfoMap}
})