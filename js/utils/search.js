let fuse = null;

export function initSearch(accounts) {
    fuse = new Fuse(accounts, {
        keys: ['name', 'issuer'],
        threshold: 0.3,
        includeScore: true
    });
}

export function searchAccounts(query) {
    if (!fuse || !query.trim()) {
        return null;
    }
    const results = fuse.search(query);
    return results.map(r => r.item);
}

export function updateSearchIndex(accounts) {
    fuse = new Fuse(accounts, {
        keys: ['name', 'issuer'],
        threshold: 0.3,
        includeScore: true
    });
}
