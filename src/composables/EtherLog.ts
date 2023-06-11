import { ethers } from 'ethers'
import ABI from '@/assets/StarVoting.json'
import StarVotingContract from '@/composables/StarVoting'

export type ChainName =
    | 'Linea Testnet'
    | 'ThunderCore Testnet'
    | 'Chiado(Gnosis) testnet'

type Event =
    | 'GroupCreated'
    | 'MemberAdded'
    | 'MemberUpdated'
    | 'MemberRemoved'
    | 'PollCreated'
    | 'PollStarted'
    | 'VoteAdded'
    | 'PollEnded';

const URLMap = {
    'Linea Testnet': 'https://explorer.goerli.linea.build/api/eth-rpc',
    'ThunderCore Testnet': 'https://explorer-testnet.thundercore.com/api/eth-rpc',
    'Chiado(Gnosis) testnet': 'https://blockscout.com/gnosis/chiado/api/eth-rpc',
}

const eventKeyword = [
    "pollId", "coordinator", "encryptionKey", "vote", "decryptionKey",
    "groupId", "merkleTreeDepth", "zeroValue", "index", "identityCommitment",
    "merkleTreeRoot", "newIdentityCommitment"
]

const eventSignatureMap = {
    'GroupCreated': '0x0d000126c26c1bbe400fd2332187f75d58b69306f9ec47b408686189d3a00833',
    'MemberAdded': '0x19239b3f93cd10558aaf11423af70c77763bf54f52bcc75bfa74d4d13548cde9',
    'MemberUpdated': '0xea3588e4a2a0c93d6a0e69dfeaf7496f43ccccf02ad9ce0a5b7627cbca4b61b1',
    'MemberRemoved': '0x3108849c053c77b8073a11256dffb5ffd5b55e93e105a355e1c9061db890d871',

    'PollCreated': '0xb447d309fd3b1a27466cdb08ccc02ee5188e9c71fc58af042bafe3e0bb451230',
    'PollStarted': '0xd98b04626cc7c61b3e1903c1fdf653b72f88d67afa9b71ccb81c79cb967cfdce',
    'VoteAdded': '0x0ac6ee434e2e22214897d8dcdfce63aaae60241483ea57f3b72b404221b2ceac',
    'PollEnded': '0x6cccde3929a60a7b5f3ef66f6d0b185ac2e1962c4b42c9acc4c4bed6a664e3a5'
}


function getRequestBody(eventName: Event) {
    const starVotingContract = new StarVotingContract()
    starVotingContract.init()

    // TODO: use pagniation when event log have more than 1000+ data
    const requestBody = {
        "id": 0,
        "jsonrpc": "2.0",
        "method": "eth_getLogs",
        "params": [
            {
                "address": starVotingContract.address,
                "fromBlock": "earliest",
                "toBlock": "latest",
                "topics": [
                    eventSignatureMap[eventName]
                ]
            }
        ]
    }

    return requestBody
}

async function sendRequest(chainName: ChainName, body: any) {
    const url = URLMap[chainName]
    const data =  await fetch(url, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    })
    return data.json()
}


function parseLog(data: string, topics: string[]) {
    const iface = new ethers.utils.Interface(ABI)
    return iface.parseLog({data, topics})
}

const getEvents = async (chainName: ChainName, eventName: Event) => {
    const requestBody = getRequestBody(eventName)
    const data = await sendRequest(chainName, requestBody)
    const result: any[] = []

    data.result.forEach((log: any) => {
        const args = parseLog(log.data, log.topics).args
        const args2: any = {}
        eventKeyword.forEach((keyword) => {
            if (args[keyword])
                args2[keyword] = args[keyword].toString()
        })
        result.push(args2)
    })

    return result
}

export { getEvents }