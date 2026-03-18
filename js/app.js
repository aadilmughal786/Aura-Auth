import { startPulse, stopPulse, onPulseUpdate } from './core/timer.js';
import { getAccounts, saveAccount, deleteAccount } from './utils/storage.js';
import { renderAccounts, showAddModal, hideAddModal } from './ui/render.js';
import { handleAddAccount, handleDeleteAccount, handleCopyCode, hideDeleteModal, confirmDeleteAccount } from './ui/events.js';
import { initSearch, searchAccounts, updateSearchIndex } from './utils/search.js';

const state = {
    accounts: [],
    filteredAccounts: [],
    isSearching: false,
    selectedId: null
};

function render(state) {
    const container = document.getElementById('accounts');
    if (container) {
        container.innerHTML = '';
        
        let accountsToRender;
        if (state.isSearching && state.filteredAccounts.length === 0) {
            container.innerHTML = '<p class="no-results">No accounts found</p>';
            return;
        } else if (state.isSearching) {
            accountsToRender = state.filteredAccounts;
        } else {
            accountsToRender = state.accounts;
        }
        
        accountsToRender.forEach(account => {
            const el = createAccountElement(account);
            container.appendChild(el);
        });
    }
}

function createAccountElement(account) {
    const div = document.createElement('div');
    div.className = 'account-card';
    div.dataset.id = account.id;
    div.innerHTML = `
        <div class="account-info">
            <span class="account-name">${account.name}</span>
            <span class="account-issuer">${account.issuer || 'Unknown'}</span>
        </div>
        <div class="code-section">
            <span class="current-code" data-code="${account.id}">${account.code || '------'}</span>
            <div class="aura-ring">
                <svg viewBox="0 0 100 100">
                    <circle class="ring-bg" cx="50" cy="50" r="45" />
                    <circle class="ring-progress" cx="50" cy="50" r="45" 
                        style="stroke-dashoffset: ${283 - (account.progress || 100) * 2.83}" />
                </svg>
                <span class="countdown" data-countdown="${account.id}">${account.remaining || 30}</span>
            </div>
        </div>
        <div class="bottom-section">
            <div class="next-preview">
                <span class="next-code-label">Next</span>
                <span class="next-code" data-next="${account.id}">${account.nextCode || '------'}</span>
            </div>
            <div class="actions">
                <button class="qr-btn" data-qr="${account.id}" title="Show QR code">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="7" height="7"></rect>
                        <rect x="14" y="3" width="7" height="7"></rect>
                        <rect x="3" y="14" width="7" height="7"></rect>
                        <rect x="14" y="14" width="7" height="7"></rect>
                    </svg>
                </button>
                <button class="copy-btn" data-copy="${account.id}" title="Copy code">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    <span>Copy</span>
                </button>
                <button class="delete-btn" data-delete="${account.id}" title="Delete account">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        </div>
    `;
    return div;
}

function updateUI({ accounts, remaining, progress }) {
    accounts.forEach(({ id, code, nextCode }) => {
        const codeEl = document.querySelector(`[data-code="${id}"]`);
        const nextCodeEl = document.querySelector(`[data-next="${id}"]`);
        const countdownEl = document.querySelector(`[data-countdown="${id}"]`);
        const progressEl = document.querySelector(`[data-id="${id}"] .ring-progress`);
        
        if (codeEl) codeEl.textContent = code;
        if (nextCodeEl) nextCodeEl.textContent = nextCode;
        if (countdownEl) countdownEl.textContent = remaining;
        if (progressEl) {
            progressEl.style.strokeDashoffset = 283 - progress * 2.83;
        }
    });
}

function handleSearch(query) {
    if (!query.trim()) {
        state.isSearching = false;
        state.filteredAccounts = [];
        render(state);
        return;
    }
    state.isSearching = true;
    state.filteredAccounts = searchAccounts(query);
    render(state);
}

function showQRCode(accountId) {
    const account = state.accounts.find(a => a.id === accountId);
    if (!account) return;

    const modal = document.getElementById('qr-modal');
    const container = document.getElementById('qr-code-container');
    container.innerHTML = '';

    const uri = `otpauth://totp/${encodeURIComponent(account.issuer || 'Unknown')}:${encodeURIComponent(account.name)}?secret=${account.secret}&issuer=${encodeURIComponent(account.issuer || 'Unknown')}`;

    new QRCode(container, {
        text: uri,
        width: 200,
        height: 200,
        colorDark: '#f8fafc',
        colorLight: '#12121a',
        correctLevel: QRCode.CorrectLevel.H
    });

    modal?.classList.add('active');
}

function hideQRModal() {
    document.getElementById('qr-modal')?.classList.remove('active');
}

function init() {
    state.accounts = getAccounts().map(a => ({ ...a, code: '------', remaining: 30, progress: 100 }));
    initSearch(getAccounts());
    render(state);

    document.getElementById('search-input')?.addEventListener('input', (e) => {
        handleSearch(e.target.value);
    });

    document.getElementById('add-btn')?.addEventListener('click', showAddModal);
    document.getElementById('cancel-add')?.addEventListener('click', hideAddModal);
    document.getElementById('save-account')?.addEventListener('click', () => {
        const newAccount = handleAddAccount();
        if (newAccount) {
            updateSearchIndex(getAccounts());
        }
    });
    document.getElementById('accounts')?.addEventListener('click', (e) => {
        if (e.target.closest('.delete-btn')) {
            const id = e.target.closest('.delete-btn')?.dataset.delete;
            if (id) handleDeleteAccount(id);
        }
        if (e.target.closest('.copy-btn')) {
            const id = e.target.closest('.copy-btn')?.dataset.copy;
            if (id) handleCopyCode(id);
        }
        if (e.target.closest('.qr-btn')) {
            const id = e.target.closest('.qr-btn')?.dataset.qr;
            if (id) showQRCode(id);
        }
        if (e.target.closest('.current-code')) {
            const id = e.target.closest('.account-card')?.dataset.id;
            if (id) handleCopyCode(id);
        }
    });

    document.getElementById('cancel-delete')?.addEventListener('click', hideDeleteModal);
    document.getElementById('confirm-delete')?.addEventListener('click', () => {
        confirmDeleteAccount();
        updateSearchIndex(getAccounts());
    });

    document.getElementById('delete-modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'delete-modal') hideDeleteModal();
    });

    document.getElementById('close-qr')?.addEventListener('click', hideQRModal);
    document.getElementById('qr-modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'qr-modal') hideQRModal();
    });

    startPulse();
    onPulseUpdate(updateUI);
}

document.addEventListener('DOMContentLoaded', init);
