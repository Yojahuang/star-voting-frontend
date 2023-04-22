import { ethers } from "ethers";
import ABI from "@/assets/StarVoting.json"
const address = "0xAC3d9886750b7Ac602E0900aAb13F597910F4700";

const blockMap = {
    "ThunderCore Testnet": {
        "startBlock": 104926408
    },
    "Linea Testnet": {
        "startBlock": 532009  // need for renew
    },
    "Chiado(Gnosis) testnet": {
        "startBlock": 3584426  // need for renew -> not yet has block
    },
}

// for group
const getGroupCreatedEvent = async (contract, startBlock, endBlock) => {
    const filter = contract.filters.GroupCreated();
    // console.log("\nQuerying the GroupCreated events...");
    let events = await contract.queryFilter(filter, startBlock, endBlock);
    // console.log(
    //     `${events.length} have been emitted by the  between blocks ${startBlock} & ${endBlock}`
    // );

    const parsedEvents = [];
    for (let i = 0; i < events.length; i++) {
        const parsedEvent = {
            groupId: events[i].args.groupId.toString(),
            merkleTreeDepth: events[i].args.merkleTreeDepth.toString(),
            zeroValue: events[i].args.zeroValue.toString()
        };
        parsedEvents.push(parsedEvent);
    }
    return parsedEvents;
};

const getMemberAddedEvent = async (contract, startBlock, endBlock) => {
    const filter = contract.filters.MemberAdded();
    // console.log("\nQuerying the MemberAdded events...");
    let events = await contract.queryFilter(filter, startBlock, endBlock);
    // console.log(
    //     `${events.length} have been emitted by the  between blocks ${startBlock} & ${endBlock}`
    // );

    const parsedEvents = [];
    for (let i = 0; i < events.length; i++) {
        const parsedEvent = {
            groupId: events[i].args.groupId.toString(),
            index: events[i].args.index.toString(),
            identityCommitment: events[i].args.identityCommitment.toString(),
            merkleTreeRoot: events[i].args.merkleTreeRoot.toString()
        };
        parsedEvents.push(parsedEvent);
    }
    return parsedEvents;
};

const getMemberUpdatedEvent = async (contract, startBlock, endBlock) => {
    const filter = contract.filters.MemberUpdated();
    // console.log("\nQuerying the MemberUpdated events...");
    let events = await contract.queryFilter(filter, startBlock, endBlock);
    // console.log(
    //     `${events.length} have been emitted by the  between blocks ${startBlock} & ${endBlock}`
    // );

    const parsedEvents = [];
    for (let i = 0; i < events.length; i++) {
        const parsedEvent = {
            groupId: events[i].args.groupId.toString(),
            index: events[i].args.index.toString(),
            identityCommitment: events[i].args.identityCommitment.toString(),
            newIdentityCommitment: events[i].args.newIdentityCommitment.toString(),
            merkleTreeRoot: events[i].args.merkleTreeRoot.toString()
        };
        parsedEvents.push(parsedEvent);
    }
    return parsedEvents;
};

const getMemberRemovedEvent = async (contract, startBlock, endBlock) => {
    const filter = contract.filters.MemberRemoved();
    // console.log("\nQuerying the MemberRemoved events...");
    let events = await contract.queryFilter(filter, startBlock, endBlock);
    // console.log(
    //     `${events.length} have been emitted by the  between blocks ${startBlock} & ${endBlock}`
    // );

    const parsedEvents = [];
    for (let i = 0; i < events.length; i++) {
        const parsedEvent = {
            groupId: events[i].args.groupId.toString(),
            index: events[i].args.index.toString(),
            identityCommitment: events[i].args.identityCommitment.toString(),
            merkleTreeRoot: events[i].args.merkleTreeRoot.toString()
        };
        parsedEvents.push(parsedEvent);
    }
    return parsedEvents;
};


// for voting
const getPollCreatedEvent = async (contract, startBlock, endBlock) => {
    const filter = contract.filters.PollCreated();
    // console.log("\nQuerying the PollCreated events...");
    let events = await contract.queryFilter(filter, startBlock, endBlock);
    // console.log(
    //     `${events.length} have been emitted by the  between blocks ${startBlock} & ${endBlock}`
    // );

    const parsedEvents = [];
    for (let i = 0; i < events.length; i++) {
        const parsedEvent = {
            pollId: events[i].args.pollId.toString(),
            coordinator: events[i].args.coordinator.toString(),
        };
        parsedEvents.push(parsedEvent);
    }
    return parsedEvents;
};

const getPollStartedEvent = async (contract, startBlock, endBlock) => {
    const filter = contract.filters.PollStarted();
    // console.log("\nQuerying the PollStarted events...");
    let events = await contract.queryFilter(filter, startBlock, endBlock);
    // console.log(
    //     `${events.length} have been emitted by the  between blocks ${startBlock} & ${endBlock}`
    // );

    const parsedEvents = [];
    for (let i = 0; i < events.length; i++) {
        const parsedEvent = {
            pollId: events[i].args.pollId.toString(),
            coordinator: events[i].args.coordinator.toString(),
            encryptionKey: events[i].args.encryptionKey.toString()
        };
        parsedEvents.push(parsedEvent);
    }
    return parsedEvents;
};


const getVoteAddedEvent = async (contract, startBlock, endBlock) => {
    const filter = contract.filters.VoteAdded();
    // console.log("\nQuerying the VoteAdded events...");
    let events = await contract.queryFilter(filter, startBlock, endBlock);
    // console.log(
    //     `${events.length} have been emitted by the  between blocks ${startBlock} & ${endBlock}`
    // );

    const parsedEvents = [];
    for (let i = 0; i < events.length; i++) {
        const parsedEvent = {
            pollId: events[i].args.pollId.toString(),
            vote: events[i].args.vote.toString(),
        };
        parsedEvents.push(parsedEvent);
    }
    return parsedEvents;
};


const getPollEndedEvent = async (contract, startBlock, endBlock) => {
    const filter = contract.filters.PollEnded();
    // console.log("\nQuerying the PollEnded events...");
    let events = await contract.queryFilter(filter, startBlock, endBlock);
    // console.log(
    //     `${events.length} have been emitted by the  between blocks ${startBlock} & ${endBlock}`
    // );

    const parsedEvents = [];
    for (let i = 0; i < events.length; i++) {
        const parsedEvent = {
            pollId: events[i].args.pollId.toString(),
            coordinator: events[i].args.coordinator.toString(),
            decryptionKey: events[i].args.decryptionKey.toString(),
        };
        parsedEvents.push(parsedEvent);
    }
    return parsedEvents;
};


// 1. wait for star's address to fill in
// 2. find provider url -> not really sure
function getContract(chainName) {
    let provider;
    let contract;

    if (chainName === "ThunderCore") {
        provider = new ethers.providers.WebSocketProvider("wss://mainnet-ws.thundercore.com");

    } else if (chainName === "ThunderCore Testnet") {  // chain 1 deployed -> on going -> good
        // console.log(" +++++ In ThunderCore Testnet +++++ ");
        provider = new ethers.providers.WebSocketProvider("wss://testnet-ws.thundercore.com");

    } else if (chainName === "Linea Testnet") {
        provider = new ethers.providers.JsonRpcProvider("https://rpc.goerli.linea.build/");

    } else if (chainName === "Gnosis") {
        provider = new ethers.providers.JsonRpcProvider("https://rpc.gnosischain.com/");

    } else if (chainName === "Chiado Testnet") {  // chain 2 deployed -> on going
        // console.log(" +++++ In Chiado Testnet +++++ ");
        provider = new ethers.providers.JsonRpcProvider("https://rpc.chiadochain.net");
    }

    contract = new ethers.Contract(address, ABI, provider);
    return { contract, startBlock: blockMap[chainName].startBlock, provider }
}

// Get the block number
const getBlockNumber = async (provider) => {
    const blockNumber = await provider.getBlockNumber()
    // console.log(blockNumber)
    return blockNumber
}



const getEvents = async (chainName, eventName) => {

    const { contract, startBlock, provider } = getContract(chainName);
    // console.log("contract: ", contract);

    const endBlock = await getBlockNumber(provider);
    console.log("startBlock: ", startBlock);
    console.log("endBlock: ", endBlock);

    let info;
    // for group
    if (eventName === "GroupCreated") {
        info = await getGroupCreatedEvent(contract, startBlock, endBlock);
    } else if (eventName === "MemberAdded") {
        info = await getMemberAddedEvent(contract, startBlock, endBlock);
    } else if (eventName === "MemberUpdated") {
        info = await getMemberUpdatedEvent(contract, startBlock, endBlock);
    } else if (eventName === "MemberRemoved") {
        info = await getMemberRemovedEvent(contract, startBlock, endBlock);

        // for Voting
    } else if (eventName === "PollCreated") {
        info = await getPollCreatedEvent(contract, startBlock, endBlock);
    } else if (eventName === "PollStarted") {
        info = await getPollStartedEvent(contract, startBlock, endBlock);
    } else if (eventName === "VoteAdded") {
        info = await getVoteAddedEvent(contract, startBlock, endBlock);
    } else if (eventName === "PollEnded") {
        info = await getPollEndedEvent(contract, startBlock, endBlock);
    }

    return info;
};


// yo will use the function like this
// let GroupCreatedInfo = await getEvents(8783292 - 100000, 8783292, "Goerli", "GroupCreated");
// console.log(GroupCreatedInfo)


// ask yo what kind of event he needs
// block change, parameter change
// (async () => {
//     info = await getEvents(104940549, 104937751, "ThunderCore Testnet", "PollCreated");
//     console.log(info)

//     // info = await getEvents(104926408, 104937751, "ThunderCore Testnet", "PollStarted");
//     // console.log(info)

//     // info = await getEvents(104926408, 104937751, "ThunderCore Testnet", "MemberAdded");
//     // console.log(info)

//     // info = await getEvents(130356778, 130357074, "Chiado Testnet", "GroupCreated");  // [sync]
//     // console.log(info)
// })();

export { getEvents };
