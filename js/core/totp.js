function base32ToBytes(base32) {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    base32 = base32.toUpperCase().replace(/[\s=]/g, '');
    const bits = base32.split('').map(c => {
        const v = alphabet.indexOf(c);
        if (v === -1) throw new Error('Invalid Base32 character');
        return v.toString(2).padStart(5, '0');
    }).join('');
    const bytes = [];
    for (let i = 0; i + 8 <= bits.length; i += 8) {
        bytes.push(parseInt(bits.substr(i, 8), 2));
    }
    return new Uint8Array(bytes);
}

function intToBytes(num) {
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    view.setUint32(4, num, false);
    return new Uint8Array(buffer);
}

async function hmacSha1(key, message) {
    const cryptoKey = await crypto.subtle.importKey(
        'raw',
        key,
        { name: 'HMAC', hash: 'SHA-1' },
        false,
        ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, message);
    return new Uint8Array(signature);
}

async function generateHOTP(secret, counter) {
    const key = base32ToBytes(secret);
    const counterBytes = intToBytes(counter);
    const hash = await hmacSha1(key, counterBytes);
    const offset = hash[hash.length - 1] & 0x0f;
    const code = (
        ((hash[offset] & 0x7f) << 24) |
        ((hash[offset + 1] & 0xff) << 16) |
        ((hash[offset + 2] & 0xff) << 8) |
        (hash[offset + 3] & 0xff)
    ) % 1000000;
    return code.toString().padStart(6, '0');
}

export async function generateTOTP(secret, options = {}) {
    const { period = 30, digits = 6 } = options;
    const timeStep = Math.floor(Date.now() / 1000 / period);
    return generateHOTP(secret, timeStep);
}

export async function generateNextTOTP(secret, period = 30) {
    const timeStep = Math.floor(Date.now() / 1000 / period) + 1;
    return generateHOTP(secret, timeStep);
}

export function getTimeRemaining(period = 30) {
    const now = Math.floor(Date.now() / 1000);
    return period - (now % period);
}

export function getProgress(period = 30) {
    const remaining = getTimeRemaining(period);
    return (remaining / period) * 100;
}
