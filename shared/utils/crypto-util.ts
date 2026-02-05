import CryptoJS from 'crypto-js'

const ENCRYPTION_KEY =
  process.env.ENCRYPTION_SECRET || 'default-secret-key-for-dev'

export const CryptoUtil = {
  encrypt(text: string): string {
    return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString()
  },

  decrypt(encryptedText: string): string {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY)
      const originalText = bytes.toString(CryptoJS.enc.Utf8)
      return originalText || encryptedText
    } catch {
      return encryptedText
    }
  },
}
