import { ethers } from 'ethers'
import ABI from '@/assets/StarVoting.json'
import StarVotingContract from '@/composables/StarVoting'

export type chainName =
    | 'Linea Testnet'
    | 'ThunderCore Testnet'
    | 'Chiado(Gnosis) testnet'

const maximumBlockRange = 172800

// interface ResultMap {
//     [key: string]: any[]
// }

// const parseResult: ResultMap = {
//     'GroupCreated': [],
//     'MemberAdded': [],
//     'MemberUpdated': [],
//     'MemberRemoved': [],
//     'PollCreated': [],
//     'PollStarted': [],
//     'VoteAdded': [],
//     'PollEnded': []
// }

// const blockMap = {
//     'ThunderCore Testnet': {
//         startBlock: 104926408,
//     },
//     'Linea Testnet': {
//         startBlock: 532009,
//     },
//     'Chiado(Gnosis) testnet': {
//         startBlock: 3584426,
//     },
// }
// type event =
//     | 'GroupCreated'
//     | 'MemberAdded'
//     | 'MemberUpdated'
//     | 'MemberRemoved'
//     | 'PollCreated'
//     | 'PollStarted'
//     | 'VoteAdded'
//     | 'PollEnded'
const eventNameArr = ['GroupCreated', 'MemberAdded', 'MemberUpdated', 'MemberRemoved', 'PollCreated', 'PollStarted', 'VoteAdded', 'PollEnded'] as const;
type event = 'GroupCreated' | 'MemberAdded' | 'MemberUpdated' | 'MemberRemoved' | 'PollCreated' | 'PollStarted' | 'VoteAdded' | 'PollEnded';

let blockMap = {
    'ThunderCore Testnet': {
        'GroupCreated': { startBlock: 104926408, result: [] as any[] },
        'MemberAdded': { startBlock: 104926408, result: [] as any[] },
        'MemberUpdated': { startBlock: 104926408, result: [] as any[] },
        'MemberRemoved': { startBlock: 104926408, result: [] as any[] },
        'PollCreated': { startBlock: 104926408, result: [] as any[] },
        'PollStarted': { startBlock: 104926408, result: [] as any[] },
        'VoteAdded': { startBlock: 104926408, result: [] as any[] },
        'PollEnded': { startBlock: 104926408, result: [] as any[] },
    },
    'Linea Testnet': {
        'GroupCreated': { startBlock: 532009, result: [] as any[] },
        'MemberAdded': { startBlock: 532009, result: [] as any[] },
        'MemberUpdated': { startBlock: 532009, result: [] as any[] },
        'MemberRemoved': { startBlock: 532009, result: [] as any[] },
        'PollCreated': { startBlock: 532009, result: [] as any[] },
        'PollStarted': { startBlock: 532009, result: [] as any[] },
        'VoteAdded': { startBlock: 532009, result: [] as any[] },
        'PollEnded': { startBlock: 532009, result: [] as any[] },
    },
    'Chiado(Gnosis) testnet': {
        'GroupCreated': { startBlock: 3584426, result: [] as any[] },
        'MemberAdded': { startBlock: 3584426, result: [] as any[] },
        'MemberUpdated': { startBlock: 3584426, result: [] as any[] },
        'MemberRemoved': { startBlock: 3584426, result: [] as any[] },
        'PollCreated': { startBlock: 3584426, result: [] as any[] },
        'PollStarted': { startBlock: 3584426, result: [] as any[] },
        'VoteAdded': { startBlock: 3584426, result: [] as any[] },
        'PollEnded': { startBlock: 3584426, result: [] as any[] },
    },
}

const getGroupCreatedEvent = async (
    contract: ethers.Contract,
    startBlock: number,
    endBlock: number
) => {
    const filter = contract.filters.GroupCreated()

    let events = await contract.queryFilter(filter, startBlock, endBlock)

    const parsedEvents = []
    for (let i = 0; i < events.length; i++) {
        const args: any = events[i].args
        const parsedEvent = {
            groupId: args.groupId.toString() as string,
            merkleTreeDepth: args.merkleTreeDepth.toString() as string,
            zeroValue: args.zeroValue.toString() as string,
        }
        parsedEvents.push(parsedEvent)
    }
    return parsedEvents
}

const getMemberAddedEvent = async (
    contract: ethers.Contract,
    startBlock: number,
    endBlock: number
) => {
    const filter = contract.filters.MemberAdded()

    let events = await contract.queryFilter(filter, startBlock, endBlock)

    const parsedEvents = []
    for (let i = 0; i < events.length; i++) {
        const args: any = events[i].args
        const parsedEvent = {
            groupId: args.groupId.toString() as string,
            index: args.index.toString() as string,
            identityCommitment: args.identityCommitment.toString() as string,
            merkleTreeRoot: args.merkleTreeRoot.toString() as string,
        }
        parsedEvents.push(parsedEvent)
    }
    return parsedEvents
}

const getMemberUpdatedEvent = async (
    contract: ethers.Contract,
    startBlock: number,
    endBlock: number
) => {
    const filter = contract.filters.MemberUpdated()

    let events = await contract.queryFilter(filter, startBlock, endBlock)

    const parsedEvents = []
    for (let i = 0; i < events.length; i++) {
        const args: any = events[i].args
        const parsedEvent = {
            groupId: args.groupId.toString() as string,
            index: args.index.toString() as string,
            identityCommitment: args.identityCommitment.toString() as string,
            newIdentityCommitment:
                args.newIdentityCommitment.toString() as string,
            merkleTreeRoot: args.merkleTreeRoot.toString() as string,
        }
        parsedEvents.push(parsedEvent)
    }
    return parsedEvents
}

const getMemberRemovedEvent = async (
    contract: ethers.Contract,
    startBlock: number,
    endBlock: number
) => {
    const filter = contract.filters.MemberRemoved()

    let events = await contract.queryFilter(filter, startBlock, endBlock)

    const parsedEvents = []
    for (let i = 0; i < events.length; i++) {
        const args: any = events[i].args
        const parsedEvent = {
            groupId: args.groupId.toString() as string,
            index: args.index.toString() as string,
            identityCommitment: args.identityCommitment.toString() as string,
            merkleTreeRoot: args.merkleTreeRoot.toString() as string,
        }
        parsedEvents.push(parsedEvent)
    }
    return parsedEvents
}

const getPollCreatedEvent = async (
    contract: ethers.Contract,
    startBlock: number,
    endBlock: number
) => {
    const filter = contract.filters.PollCreated()

    let events = await contract.queryFilter(filter, startBlock, endBlock)

    const parsedEvents = []
    for (let i = 0; i < events.length; i++) {
        const args: any = events[i].args
        const parsedEvent = {
            pollId: args.pollId.toString() as string,
            coordinator: args.coordinator.toString() as string,
        }
        parsedEvents.push(parsedEvent)
    }
    return parsedEvents
}

const getPollStartedEvent = async (
    contract: ethers.Contract,
    startBlock: number,
    endBlock: number
) => {
    const filter = contract.filters.PollStarted()

    let events = await contract.queryFilter(filter, startBlock, endBlock)

    const parsedEvents = []
    for (let i = 0; i < events.length; i++) {
        const args: any = events[i].args

        const parsedEvent = {
            pollId: args.pollId.toString() as string,
            coordinator: args.coordinator.toString() as string,
            encryptionKey: args.encryptionKey.toString() as string,
        }
        parsedEvents.push(parsedEvent)
    }
    return parsedEvents
}

const getVoteAddedEvent = async (
    contract: ethers.Contract,
    startBlock: number,
    endBlock: number
) => {
    const filter = contract.filters.VoteAdded()

    let events = await contract.queryFilter(filter, startBlock, endBlock)

    const parsedEvents = []
    for (let i = 0; i < events.length; i++) {
        const args: any = events[i].args

        const parsedEvent = {
            pollId: args.pollId.toString() as string,
            vote: args.vote.toString() as string,
        }
        parsedEvents.push(parsedEvent)
    }
    return parsedEvents
}

const getPollEndedEvent = async (
    contract: ethers.Contract,
    startBlock: number,
    endBlock: number
) => {
    const filter = contract.filters.PollEnded()

    let events = await contract.queryFilter(filter, startBlock, endBlock)

    const parsedEvents = []
    for (let i = 0; i < events.length; i++) {
        const args: any = events[i].args

        const parsedEvent = {
            pollId: args.pollId.toString() as string,
            coordinator: args.coordinator.toString() as string,
            decryptionKey: args.decryptionKey.toString() as string,
        }
        parsedEvents.push(parsedEvent)
    }
    return parsedEvents
}

// 1. wait for star's address to fill in
// 2. find provider url -> not really sure
function getContract(chainName: chainName) {
    let provider: any
    let contract

    if (chainName === 'ThunderCore Testnet') {
        // chain 1 deployed -> on going -> good
        provider = new ethers.providers.WebSocketProvider(
            'wss://testnet-ws.thundercore.com'
        )
    } else if (chainName === 'Linea Testnet') {
        provider = new ethers.providers.JsonRpcProvider(
            'https://rpc.goerli.linea.build/'
        )
    } else if (chainName === 'Chiado(Gnosis) testnet') {
        // chain 2 deployed -> on going
        provider = new ethers.providers.JsonRpcProvider(
            'https://rpc.chiadochain.net'
        )
    }

    const starVotingContract = new StarVotingContract()
    starVotingContract.init()
    const address = starVotingContract.address

    contract = new ethers.Contract(address, ABI, provider)
    return { contract, provider }
}

// Get the block number
const getBlockNumber = async (provider: any) => {
    const blockNumber = await provider.getBlockNumber()
    return blockNumber
}

const getInfo = async (eventName: event, contract: ethers.Contract, startBlock: number, endBlock: any) => {
    // for group
    if (eventName === 'GroupCreated') {
        let info
        info = await getGroupCreatedEvent(contract, startBlock, endBlock)
        return info
    } else if (eventName === 'MemberAdded') {
        let info
        info = await getMemberAddedEvent(contract, startBlock, endBlock)
        return info
    } else if (eventName === 'MemberUpdated') {
        let info
        info = await getMemberUpdatedEvent(contract, startBlock, endBlock)
        return info
    } else if (eventName === 'MemberRemoved') {
        let info
        info = await getMemberRemovedEvent(contract, startBlock, endBlock)
        return info
    } else if (eventName === 'PollCreated') {
        let info
        info = await getPollCreatedEvent(contract, startBlock, endBlock)
        return info
    } else if (eventName === 'PollStarted') {
        let info
        info = await getPollStartedEvent(contract, startBlock, endBlock)
        return info
    } else if (eventName === 'VoteAdded') {
        let info = await getVoteAddedEvent(contract, startBlock, endBlock)
        return info
    } else {
        let info
        info = await getPollEndedEvent(contract, startBlock, endBlock)
        return info
    }
}

const getEvents = async (chainName: chainName, eventName: event) => {
    const { contract, provider } = getContract(chainName)

    const endBlock = await getBlockNumber(provider)
    let currentStartBlock = blockMap[chainName][eventName].startBlock

    while (currentStartBlock < endBlock) {
        let currentEndBlock = currentStartBlock + maximumBlockRange - 1
        if (currentEndBlock > endBlock) currentEndBlock = endBlock

        const tmpResult = await getInfo(eventName, contract, currentStartBlock, currentEndBlock)
        blockMap[chainName][eventName].result.push(...tmpResult)

        currentStartBlock = currentEndBlock + 1
    }

    // renew startBlock
    blockMap[chainName][eventName].startBlock = endBlock + 1

    return blockMap[chainName][eventName].result
}

export {
    getEvents,
    getVoteAddedEvent,
    getPollStartedEvent,
    getPollCreatedEvent,
    getMemberRemovedEvent,
    getMemberUpdatedEvent,
    getMemberAddedEvent,
    getGroupCreatedEvent,
    getPollEndedEvent,
}
