import { getEvents, chainName } from '@/composables/plaw.js'


export function checkParameter(value: any, name: string, type: string) {
    if (typeof value !== type) {
        throw new TypeError(`Parameter '${name}' is not ${type === "object" ? "an" : "a"} ${type}`)
    }
}

export async function getGroupMembers(chainName: chainName, groupId: string): Promise<string[]> {
    checkParameter(groupId, "groupId", "string")

    // Checking Group existence
    const groupCreatedEvent: any = await getEvents(chainName, "GroupCreated")
    const groupCreatedEventFiltered = groupCreatedEvent.filter((event: any) => event.groupId === groupId)[0]
    if (!groupCreatedEventFiltered) {
        throw new Error(`Group '${groupId}' not found`)
    }

    // ZeroValue of the merkle tree
    const zeroValue = groupCreatedEventFiltered.zeroValue.toString()

    const memberRemovedEvents: any = await getEvents(
        chainName,
        "MemberRemoved"
    )
    const memberRemovedEventsFiltered = memberRemovedEvents.reduce((acc: any, event: any) => {
        if (event.groupId === groupId) {
            acc.push({event})
        }
        return acc
    }, [])

    const memberUpdatedEvents: any = await getEvents(
        chainName,
        "MemberUpdated",
    )
    const memberUpdatedEventsFiltered = memberUpdatedEvents.reduce((acc: any, event: any) => {
        if (event.groupId === groupId) {
            acc.push({event})
        }
        return acc
    }, [])
    
    // Perform update and removals
    const groupUpdates = new Map<string, [number, string]>()
    if (memberUpdatedEventsFiltered && memberRemovedEventsFiltered) {
        
        for (const { blockNumber, index, newIdentityCommitment } of memberUpdatedEventsFiltered) {
            groupUpdates.set(index, [blockNumber, newIdentityCommitment])
        }

        for (const { blockNumber, index } of memberRemovedEventsFiltered) {
            const groupUpdate = groupUpdates.get(index)

            if (!groupUpdate || (groupUpdate && groupUpdate[0] < blockNumber)) {
                groupUpdates.set(index, [blockNumber, zeroValue])
            }
        }
    }

    const memberAddedEvents: any = await getEvents(chainName, "MemberAdded")
    const memberAddedEventsFiltered = memberAddedEvents.reduce((acc: any, event: any) => {
        if (event.groupId === groupId) {
            acc.push(event)
        }
        return acc
    }, [])

    const members: string[] = []
    for (const { index, identityCommitment } of memberAddedEventsFiltered) {
        const groupUpdate = groupUpdates.get(index)
        const member = groupUpdate ? groupUpdate[1] : identityCommitment
        members.push(member)
    }

    return members
}