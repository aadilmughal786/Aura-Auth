import { saveAccount, getAccounts, deleteAccount as removeAccount } from '../utils/storage.js';
import { generateCode } from '../core/timer.js';

let deleteAccountId = null;
let deleteTimer = null;

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

export function showDeleteModal(id) {
    const account = getAccounts().find(a => a.id === id);
    if (!account) return;

    deleteAccountId = id;
    document.getElementById('delete-account-name').textContent = account.name;
    const modal = document.getElementById('delete-modal');
    const deleteBtn = document.getElementById('confirm-delete');
    
    modal?.classList.add('active');
    deleteBtn.disabled = true;
    deleteBtn.textContent = 'Delete (10)';

    let countdown = 10;
    if (deleteTimer) clearInterval(deleteTimer);
    
    deleteTimer = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            deleteBtn.textContent = `Delete (${countdown})`;
        } else {
            clearInterval(deleteTimer);
            deleteTimer = null;
            deleteBtn.disabled = false;
            deleteBtn.textContent = 'Delete';
        }
    }, 1000);
}

export function hideDeleteModal() {
    const modal = document.getElementById('delete-modal');
    modal?.classList.remove('active');
    deleteAccountId = null;
    if (deleteTimer) {
        clearInterval(deleteTimer);
        deleteTimer = null;
    }
}

export function handleDeleteAccount(id) {
    showDeleteModal(id);
}

export function confirmDeleteAccount() {
    if (deleteAccountId) {
        removeAccount(deleteAccountId);
        hideDeleteModal();
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
