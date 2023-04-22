import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import BrowserWallet from '@/composables/wallet'

export const useGlobalStore = defineStore('global', () => {
    type chain =
        | 'ThunderCore Testnet'
        | 'Linea Testnet'
        | 'Chiado(Gnosis) testnet'
    const selectedChain = ref<chain>('ThunderCore Testnet')

    const shouldBeDisabled = ref(false)

    const chainInfoMap = {
        'ThunderCore Testnet': {
            chainId: 18,
            rpcUrl: 'https://testnet-rpc.thundercore.com',
            nativeCurrency: {
                name: 'TST',
                symbol: 'TST',
                decimals: 18,
            },
        },
        'Linea Testnet': {
            chainId: 59140,
            rpcUrl: 'https://rpc.goerli.linea.build',
            nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
            },
        },
        'Chiado(Gnosis) testnet': {
            chainId: 10200,
            rpcUrl: 'https://rpc.chiadochain.net',
            nativeCurrency: {
                name: 'xDAI',
                symbol: 'xDAI',
                decimals: 18,
            },
        },
    }

    watch(selectedChain, async () => {
        const wallet = new BrowserWallet()
        const chainInfo = chainInfoMap[selectedChain.value]
        await wallet.switchChain(
            chainInfo.chainId,
            chainInfo.rpcUrl,
            selectedChain.value,
            chainInfo.nativeCurrency
        )

        localStorage.setItem('selectedChain', selectedChain.value)
    })

    return { selectedChain, chainInfoMap, shouldBeDisabled }
})
