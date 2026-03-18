import { generateTOTP, generateNextTOTP, getProgress, getTimeRemaining } from './totp.js';
import { getAccounts, saveAccount } from '../utils/storage.js';

const listeners = new Set();
let animationId = null;
let currentPeriod = 30;

export function startPulse(period = 30) {
    currentPeriod = period;
    const tick = async () => {
        const progress = getProgress(currentPeriod);
        const remaining = getTimeRemaining(currentPeriod);
        const accounts = getAccounts();
        
        const updates = await Promise.all(
            accounts.map(async (account) => ({
                id: account.id,
                code: await generateTOTP(account.secret, { period: currentPeriod }),
                nextCode: await generateNextTOTP(account.secret, currentPeriod),
                remaining,
                progress
            }))
        );

        listeners.forEach(cb => cb({ accounts: updates, remaining, progress }));
        
        if (remaining <= 1) {
            currentPeriod = 30;
        }
        
        animationId = requestAnimationFrame(tick);
    };
    tick();
}

export function stopPulse() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
}

export function onPulseUpdate(callback) {
    listeners.add(callback);
    return () => listeners.delete(callback);
}

export async function generateCode(secret) {
    return generateTOTP(secret, { period: currentPeriod });
}

export async function generateNextCode(secret) {
    return generateNextTOTP(secret, currentPeriod);
}
