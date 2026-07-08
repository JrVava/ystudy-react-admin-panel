import CryptoJS from "crypto-js";

// Uses VITE_CRYPTO_SECRET_KEY from .env or fallback
const keyStr = import.meta.env.VITE_CRYPTO_SECRET_KEY;
if (!keyStr) {
  throw new Error("Critical Configuration Error: VITE_CRYPTO_SECRET_KEY is undefined in environment variables.");
}
const SECRET_KEY = CryptoJS.enc.Hex.parse(keyStr);
const IV = CryptoJS.lib.WordArray.create(new Uint8Array(16) as any); // 16 bytes of 0s

export const decrypt = (encryptedDataBase64: string) => {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedDataBase64, SECRET_KEY, {
            iv: IV,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
        });
        const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
        return JSON.parse(decryptedString);
    } catch (e) {
        console.error("Decryption failed", e);
        throw new Error("Decryption failed");
    }
};

export const encrypt = (data: any) => {
    const json = JSON.stringify(data);
    const encrypted = CryptoJS.AES.encrypt(json, SECRET_KEY, {
        iv: IV,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    return encrypted.toString();
};
