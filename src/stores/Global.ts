import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import BrowserWallet from '@/composables/wallet'

export const useGlobalStore = defineStore('global', () => {
    type chain =
        | 'ThunderCore Testnet'
        | 'Linea Testnet'
        | 'Chiado(Gnosis) testnet'
    interface ChainInfo {
        chainId: number,
        rpcUrl: string,
        nativeCurrency: any,
        blockExplorerUrls: string[]
    }

    interface ChainInfoMap {
        [key: string]: ChainInfo
    }
    const selectedChain = ref<chain>('ThunderCore Testnet')

    const shouldBeDisabled = ref(false)

    const chainInfoMap: ChainInfoMap = {
        'ThunderCore Testnet': {
            chainId: 18,
            rpcUrl: 'https://testnet-rpc.thundercore.com',
            nativeCurrency: {
                name: 'TST',
                symbol: 'TST',
                decimals: 18,
            },
            blockExplorerUrls: ["https://explorer-testnet.thundercore.com/"]
        },
        'Linea Testnet': {
            chainId: 59140,
            rpcUrl: 'https://rpc.goerli.linea.build',
            nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
            },
            blockExplorerUrls: ["https://explorer.goerli.linea.build/"]
        },
        'Chiado(Gnosis) testnet': {
            chainId: 10200,
            rpcUrl: 'https://rpc.chiadochain.net',
            nativeCurrency: {
                name: 'xDAI',
                symbol: 'xDAI',
                decimals: 18,
            },
            blockExplorerUrls: ["https://blockscout.com/gnosis/chiado"]
        },
    }

    watch(selectedChain, async () => {
        const wallet = new BrowserWallet()
        const chainInfo = chainInfoMap[selectedChain.value]
        await wallet.switchChain(
            chainInfo.chainId,
            chainInfo.rpcUrl,
            selectedChain.value,
            chainInfo.nativeCurrency,
            chainInfo.blockExplorerUrls
        )

        localStorage.setItem('selectedChain', selectedChain.value)
    })

    return { selectedChain, chainInfoMap, shouldBeDisabled }
})
