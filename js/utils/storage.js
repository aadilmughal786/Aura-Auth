const STORAGE_KEY = 'aura_auth_vault';

export function getAccounts() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

export function saveAccount(account) {
    const accounts = getAccounts();
    const existing = accounts.findIndex(a => a.id === account.id);
    if (existing >= 0) {
        accounts[existing] = account;
    } else {
        accounts.push(account);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
    return account;
}

export function deleteAccount(id) {
    const accounts = getAccounts().filter(a => a.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

export function getAccount(id) {
    return getAccounts().find(a => a.id === id);
}

export function clearAllAccounts() {
    localStorage.removeItem(STORAGE_KEY);
}
