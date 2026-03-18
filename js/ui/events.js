import { saveAccount, getAccounts, deleteAccount as removeAccount } from '../utils/storage.js';
import { generateCode } from '../core/timer.js';

export async function handleAddAccount() {
    const name = document.getElementById('account-name')?.value;
    const secret = document.getElementById('account-secret')?.value.trim().replace(/\s/g, '');
    const issuer = document.getElementById('account-issuer')?.value;

    if (!name || !secret) {
        alert('Name and Secret are required');
        return;
    }

    try {
        await generateCode(secret);
    } catch {
        alert('Invalid secret key');
        return;
    }

    const account = {
        id: crypto.randomUUID(),
        name,
        secret,
        issuer: issuer || 'Unknown',
        createdAt: Date.now()
    };

    saveAccount(account);
    window.location.reload();
}

export async function handleDeleteAccount(id) {
    if (confirm('Delete this account?')) {
        removeAccount(id);
        window.location.reload();
    }
}

export async function handleCopyCode(id) {
    const account = getAccounts().find(a => a.id === id);
    if (account) {
        const code = await generateCode(account.secret);
        await navigator.clipboard.writeText(code);
        const btn = document.querySelector(`[data-copy="${id}"]`);
        if (btn) {
            btn.classList.add('copied');
            const span = btn.querySelector('span');
            const originalText = span.textContent;
            span.textContent = 'Copied!';
            setTimeout(() => {
                btn.classList.remove('copied');
                span.textContent = originalText;
            }, 1500);
        }
    }
}
