import { ethers } from "ethers";
import ABI from "@/assets/StarVoting.json"
const address = "0xAC3d9886750b7Ac602E0900aAb13F597910F4700";

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
function getContract(chain_name) {

    let provider;
    let contract;

    if (chain_name === "ThunderCore") {
        provider = new ethers.providers.WebSocketProvider("wss://mainnet-ws.thundercore.com");

    } else if (chain_name === "ThunderCore Testnet") {  // chain 1 deployed -> on going -> good
        console.log(" +++++ In ThunderCore Testnet +++++ ");
        provider = new ethers.providers.WebSocketProvider("wss://testnet-ws.thundercore.com");

    } else if (chain_name === "Linea Testnet") {
        provider = new ethers.providers.JsonRpcProvider("https://rpc.goerli.linea.build/");

    } else if (chain_name === "Gnosis") {
        provider = new ethers.providers.JsonRpcProvider("https://rpc.gnosischain.com/");

    } else if (chain_name === "Chiado Testnet") {  // chain 2 deployed -> on going
        console.log(" +++++ In Chiado Testnet +++++ ");
        provider = new ethers.providers.JsonRpcProvider("https://rpc.chiadochain.net");
    }

    contract = new ethers.Contract(address, ABI, provider);
    return contract;
}


const getEvents = async (start_block, end_block, chain_name, event_name) => {

    const contract = getContract(chain_name);
    // console.log("contract: ", contract);

    let info;
    // for group
    if (event_name === "GroupCreated") {
        info = await getGroupCreatedEvent(contract, start_block, end_block);
    } else if (event_name === "MemberAdded") {
        info = await getMemberAddedEvent(contract, start_block, end_block);
    } else if (event_name === "MemberUpdated") {
        info = await getMemberUpdatedEvent(contract, start_block, end_block);
    } else if (event_name === "MemberRemoved") {
        info = await getMemberRemovedEvent(contract, start_block, end_block);

        // for Voting
    } else if (event_name === "PollCreated") {
        info = await getPollCreatedEvent(contract, start_block, end_block);
    } else if (event_name === "PollStarted") {
        info = await getPollStartedEvent(contract, start_block, end_block);
    } else if (event_name === "VoteAdded") {
        info = await getVoteAddedEvent(contract, start_block, end_block);
    } else if (event_name === "PollEnded") {
        info = await getPollEndedEvent(contract, start_block, end_block);
    }

    return info;
};


// yo will use the function like this
// let GroupCreatedInfo = await getEvents(8783292 - 100000, 8783292, "Goerli", "GroupCreated");
// console.log(GroupCreatedInfo)


// ask yo what kind of event he needs
// block change, parameter change
// (async () => {
//     info = await getEvents(104926408, 104937751, "ThunderCore Testnet", "PollCreated");
//     console.log(info)

//     info = await getEvents(104926408, 104937751, "ThunderCore Testnet", "PollStarted");
//     console.log(info)

//     info = await getEvents(104926408, 104937751, "ThunderCore Testnet", "MemberAdded");
//     console.log(info)

//     // info = await getEvents(130356778, 130357074, "Chiado Testnet", "GroupCreated");  // [sync]
//     // console.log(info)
// })();

export { getEvents };
