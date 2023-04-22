import { Buffer } from 'buffer'
import * as eccryptoJS from 'eccrypto-js'

export async function encryptionMessage(message: string, pubKey: Buffer) {
    const msg = eccryptoJS.utf8ToBuffer(message)
    const encrypted = await eccryptoJS.encrypt(pubKey, msg)
    return encrypted
}

export async function decryptionMessage(encrypted: any, privKey: Buffer) {
    const decrypted = await eccryptoJS.decrypt(privKey, encrypted)
    return decrypted.toString()
}

export async function generateKeyPair() {
    return eccryptoJS.generateKeyPair()
}
