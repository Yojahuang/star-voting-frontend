// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as snarkjs from '../assets/snarkjs.js'
import { BigNumber } from '@ethersproject/bignumber'
import { Hexable, zeroPad } from '@ethersproject/bytes'
import { Group } from '@semaphore-protocol/group'
import { Identity } from '@semaphore-protocol/identity'
import {
    FullProof,
    SnarkArtifacts,
    SnarkJSProof,
    Proof,
} from '@semaphore-protocol/proof'
import { BytesLike, keccak256 } from 'ethers/lib/utils'
import { MerkleProof } from '@zk-kit/incremental-merkle-tree'

function packProof(originalProof: SnarkJSProof): Proof {
    return [
        originalProof.pi_a[0],
        originalProof.pi_a[1],
        originalProof.pi_b[0][1],
        originalProof.pi_b[0][0],
        originalProof.pi_b[1][1],
        originalProof.pi_b[1][0],
        originalProof.pi_c[0],
        originalProof.pi_c[1],
    ]
}

function hashBytes(message: BytesLike): bigint {
    return BigInt(keccak256(message)) >> BigInt(8)
}

function hash(message: BytesLike | Hexable | number | bigint): bigint {
    message = BigNumber.from(message).toTwos(256).toHexString()
    message = zeroPad(message, 32)

    return BigInt(keccak256(message)) >> BigInt(8)
}

export async function generateProof(
    { trapdoor, nullifier, commitment }: Identity,
    groupOrMerkleProof: Group | MerkleProof,
    externalNullifier: BytesLike | Hexable | number | bigint,
    signal: BytesLike,
    snarkArtifacts?: SnarkArtifacts
): Promise<FullProof> {
    let merkleProof: MerkleProof

    if ('depth' in groupOrMerkleProof) {
        const index = groupOrMerkleProof.indexOf(commitment)

        if (index === -1) {
            throw new Error('The identity is not part of the group')
        }

        merkleProof = groupOrMerkleProof.generateMerkleProof(index)
    } else {
        merkleProof = groupOrMerkleProof
    }

    if (!snarkArtifacts) {
        snarkArtifacts = {
            wasmFilePath: `https://www.trusted-setup-pse.org/semaphore/${merkleProof.siblings.length}/semaphore.wasm`,
            zkeyFilePath: `https://www.trusted-setup-pse.org/semaphore/${merkleProof.siblings.length}/semaphore.zkey`,
        }
    }

    const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        {
            identityTrapdoor: trapdoor,
            identityNullifier: nullifier,
            treePathIndices: merkleProof.pathIndices,
            treeSiblings: merkleProof.siblings,
            externalNullifier: hash(externalNullifier),
            signalHash: hashBytes(signal),
        },
        snarkArtifacts.wasmFilePath,
        snarkArtifacts.zkeyFilePath
    )

    return {
        merkleTreeRoot: publicSignals[0],
        nullifierHash: publicSignals[1],
        signal: BigNumber.from(signal).toString(),
        externalNullifier: BigNumber.from(externalNullifier).toString(),
        proof: packProof(proof),
    }
}
