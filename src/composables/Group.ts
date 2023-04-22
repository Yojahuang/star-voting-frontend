import { getEvents, chainName } from '@/composables/plaw.js'


export function checkParameter(value: any, name: string, type: string) {
    if (typeof value !== type) {
        throw new TypeError(`Parameter '${name}' is not ${type === "object" ? "an" : "a"} ${type}`)
    }
}

export async function getGroupMembers(chainName: chainName, groupId: string): Promise<string[]> {
    checkParameter(groupId, "groupId", "string")

    const groupCreatedEvent: any = await getEvents(chainName, "GroupCreated")
    console.log(groupCreatedEvent)
    if (!groupCreatedEvent) {
        throw new Error(`Group '${groupId}' not found`)
    }

    const zeroValue = groupCreatedEvent.zeroValue.toString()
    const memberRemovedEvents: any = await getEvents(
        chainName,
        "MemberRemoved"
    )

    // filter groupId
    const memberRemovedEventsFiltered = memberRemovedEvents.filter((event: any) => event.groupId === groupId)

    const memberUpdatedEvents: any = await getEvents(
        chainName,
        "MemberUpdated",
    )
    const groupUpdates = new Map<string, [number, string]>()

    for (const { blockNumber, index, newIdentityCommitment } of memberUpdatedEvents) {
        groupUpdates.set(index.toString(), [blockNumber, newIdentityCommitment.toString()])
    }

    for (const { blockNumber, index } of memberRemovedEventsFiltered) {
        const groupUpdate = groupUpdates.get(index.toString())

        if (!groupUpdate || (groupUpdate && groupUpdate[0] < blockNumber)) {
            groupUpdates.set(index.toString(), [blockNumber, zeroValue])
        }
    }

    const memberAddedEvents: any = await getEvents(chainName, "MemberAdded")
    const memberAddedEventsFiltered = memberAddedEvents.filter((event: any) => event.groupId === groupId)
    const members: string[] = []

    for (const { index, identityCommitment } of memberAddedEventsFiltered) {
        const groupUpdate = groupUpdates.get(index.toString())
        const member = groupUpdate ? groupUpdate[1].toString() : identityCommitment.toString()
        members.push(member)
    }

    console.log(members)

    return members
}