export function showAddModal() {
    document.getElementById('add-modal')?.classList.add('active');
}

export function hideAddModal() {
    document.getElementById('add-modal')?.classList.remove('active');
    document.querySelectorAll('#add-modal input').forEach(i => i.value = '');
}

export function renderAccounts(accounts) {
    const container = document.getElementById('accounts');
    if (!container) return;
    container.innerHTML = accounts.map(account => `
        <div class="account-card" data-id="${account.id}">
            <div class="account-info">
                <span class="account-name">${account.name}</span>
                <span class="account-issuer">${account.issuer || 'Unknown'}</span>
            </div>
            <div class="code-section">
                <span class="current-code" data-code="${account.id}">${account.code || '------'}</span>
                <div class="aura-ring">
                    <svg viewBox="0 0 100 100">
                        <circle class="ring-bg" cx="50" cy="50" r="45" />
                        <circle class="ring-progress" cx="50" cy="50" r="45" />
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
        </div>
    `).join('');
}
