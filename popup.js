class StorageExplorer {
    constructor() {
        this.storageItems = [];
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.activeTabUrl = null;
        this.init();
    }

    async init() {
        this.attachEventListeners();
        await this.loadStorageData();
    }

    attachEventListeners() {
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.renderStorageItems();
        });

        document.getElementById('filterType').addEventListener('change', (e) => {
            this.currentFilter = e.target.value;
            this.renderStorageItems();
        });

        document.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', (e) => {
                document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.tab;
                document.getElementById('filterType').value = this.currentFilter;
                this.renderStorageItems();
            });
        });

        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadStorageData();
        });

        document.getElementById('exportBtn').addEventListener('click', () => {
            this.exportToJSON();
        });

        document.getElementById('clearBtn').addEventListener('click', () => {
            this.clearAllStorage();
        });
    }

    async getActiveTab() {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        return tab;
    }

    async executeInTab(tabId, func, args) {
        try {
            console.log('Executing script in tab', tabId, 'with args:', args);
            const results = await chrome.scripting.executeScript({
                target: { tabId: tabId },
                func: func,
                args: args
            });
            console.log('Script execution results:', results);
            return results[0].result;
        } catch (error) {
            console.error('Error executing in tab:', error);
            console.error('Error details:', JSON.stringify(error, null, 2));
            return null;
        }
    }

    async sendMessageToTab(tabId, action, data = {}) {
        try {
            const response = await chrome.tabs.sendMessage(tabId, { action, ...data });
            return response;
        } catch (error) {
            console.error('Error sending message to tab:', error);
            return null;
        }
    }

    async loadStorageData() {
        console.log('Starting loadStorageData...');
        this.storageItems = [];
        const tab = await this.getActiveTab();
        console.log('Active tab:', tab);
        if (!tab || !tab.url) {
            console.log('No active tab or url');
            this.renderStorageItems();
            return;
        }

        this.activeTabUrl = new URL(tab.url);
        console.log('Active tab URL:', this.activeTabUrl);

        // Load localStorage using content script
        console.log('Loading localStorage via content script...');
        const localStorageResponse = await this.sendMessageToTab(tab.id, 'getLocalStorage');
        console.log('localStorageResponse:', localStorageResponse);
        if (localStorageResponse && localStorageResponse.success) {
            const localStorageData = localStorageResponse.data;
            console.log('localStorageData:', localStorageData);
            Object.entries(localStorageData).forEach(([key, value]) => {
                this.storageItems.push({
                    key: key,
                    value: value,
                    type: 'localStorage',
                    size: this.calculateSize(key + value)
                });
            });
        }

        // Load sessionStorage using content script
        console.log('Loading sessionStorage via content script...');
        const sessionStorageResponse = await this.sendMessageToTab(tab.id, 'getSessionStorage');
        console.log('sessionStorageResponse:', sessionStorageResponse);
        if (sessionStorageResponse && sessionStorageResponse.success) {
            const sessionStorageData = sessionStorageResponse.data;
            console.log('sessionStorageData:', sessionStorageData);
            Object.entries(sessionStorageData).forEach(([key, value]) => {
                this.storageItems.push({
                    key: key,
                    value: value,
                    type: 'sessionStorage',
                    size: this.calculateSize(key + value)
                });
            });
        }

        // Load cookies only for the active tab's domain
        console.log('Loading cookies...');
        await this.loadCookies();

        console.log('Final storageItems:', this.storageItems);
        this.updateStats();
        this.renderStorageItems();
    }

    async loadCookies() {
        if (!this.activeTabUrl) return;
        try {
            const cookies = await chrome.cookies.getAll({
                domain: this.activeTabUrl.hostname
            });
            cookies.forEach(cookie => {
                const cookieString = this.formatCookie(cookie);
                this.storageItems.push({
                    key: cookie.name,
                    value: cookieString,
                    type: 'cookies',
                    size: this.calculateSize(cookie.name + cookieString),
                    cookie: cookie
                });
            });
        } catch (error) {
            console.error('Error loading cookies:', error);
        }
    }

    formatCookie(cookie) {
        const parts = [];
        parts.push(`domain=${cookie.domain}`);
        parts.push(`path=${cookie.path}`);
        if (cookie.secure) parts.push('secure');
        if (cookie.httpOnly) parts.push('httpOnly');
        parts.push(`expires=${new Date(cookie.expirationDate * 1000 || Date.now()).toISOString()}`);
        parts.push(`value=${cookie.value}`);
        return parts.join('; ');
    }

    calculateSize(str) {
        if (!str) return 0;
        return new Blob([str]).size;
    }

    formatSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    }

    updateStats() {
        const totalItems = this.storageItems.length;
        const totalSize = this.storageItems.reduce((sum, item) => sum + item.size, 0);

        document.getElementById('totalItems').textContent = totalItems;
        document.getElementById('totalSize').textContent = this.formatSize(totalSize);
    }

    renderStorageItems() {
        const container = document.getElementById('storageList');
        
        // Filter items
        let filteredItems = this.storageItems;

        // Apply type filter
        if (this.currentFilter !== 'all') {
            filteredItems = filteredItems.filter(item => item.type === this.currentFilter);
        }

        // Apply search filter
        if (this.searchQuery) {
            filteredItems = filteredItems.filter(item => 
                item.key.toLowerCase().includes(this.searchQuery) ||
                item.value.toLowerCase().includes(this.searchQuery)
            );
        }

        // Clear container
        container.innerHTML = '';

        // Show empty state if no items
        if (filteredItems.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <svg class="empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                        <line x1="12" y1="22.08" x2="12" y2="12"></line>
                    </svg>
                    <p>No storage items found</p>
                </div>
            `;
            return;
        }

        // Render items
        filteredItems.forEach(item => {
            const itemElement = this.createStorageItemElement(item);
            container.appendChild(itemElement);
        });
    }

    createStorageItemElement(item) {
        const div = document.createElement('div');
        div.className = 'storage-item';

        const displayValue = this.truncateValue(item.value, 200);
        const size = this.formatSize(item.size);

        div.innerHTML = `
            <div class="storage-item-header">
                <div class="storage-item-key">${this.escapeHtml(item.key)}</div>
                <div class="storage-item-meta">
                    <span class="storage-type-badge ${item.type}">${item.type}</span>
                    <span class="storage-item-size">${size}</span>
                </div>
            </div>
            <div class="storage-item-value">${this.escapeHtml(displayValue)}</div>
            <div class="storage-item-actions">
                <button class="item-action-btn copy" data-key="${this.escapeHtml(item.key)}" data-type="${item.type}">
                    Copy Value
                </button>
                <button class="item-action-btn delete" data-key="${this.escapeHtml(item.key)}" data-type="${item.type}">
                    Delete
                </button>
            </div>
        `;

        // Attach event listeners to buttons
        const copyBtn = div.querySelector('.copy');
        const deleteBtn = div.querySelector('.delete');

        copyBtn.addEventListener('click', () => this.copyValue(item));
        deleteBtn.addEventListener('click', () => this.deleteItem(item));

        return div;
    }

    truncateValue(value, maxLength) {
        if (value.length <= maxLength) return value;
        return value.substring(0, maxLength) + '...';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async copyValue(item) {
        try {
            await navigator.clipboard.writeText(item.value);
            this.showNotification('Value copied to clipboard!');
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            this.showNotification('Failed to copy value', 'error');
        }
    }

    async deleteItem(item) {
        if (!confirm(`Are you sure you want to delete "${item.key}"?`)) {
            return;
        }

        try {
            const tab = await this.getActiveTab();
            if (item.type === 'localStorage') {
                await this.sendMessageToTab(tab.id, 'removeLocalStorage', { key: item.key });
            } else if (item.type === 'sessionStorage') {
                await this.sendMessageToTab(tab.id, 'removeSessionStorage', { key: item.key });
            } else if (item.type === 'cookies' && item.cookie) {
                await chrome.cookies.remove({
                    url: this.getCookieUrl(item.cookie),
                    name: item.key
                });
            }

            this.storageItems = this.storageItems.filter(i => 
                !(i.key === item.key && i.type === item.type)
            );

            this.updateStats();
            this.renderStorageItems();
            this.showNotification('Item deleted successfully!');
        } catch (error) {
            console.error('Error deleting item:', error);
            this.showNotification('Failed to delete item', 'error');
        }
    }

    getCookieUrl(cookie) {
        const protocol = cookie.secure ? 'https://' : 'http://';
        const domain = cookie.domain.startsWith('.') ? cookie.domain.substring(1) : cookie.domain;
        return protocol + domain;
    }

    async clearAllStorage() {
        if (!confirm('Are you sure you want to clear ALL storage data? This action cannot be undone.')) {
            return;
        }

        if (!confirm('This will delete all localStorage, sessionStorage, and cookies for the current tab. Are you absolutely sure?')) {
            return;
        }

        try {
            const tab = await this.getActiveTab();
            await this.sendMessageToTab(tab.id, 'clearLocalStorage');
            await this.sendMessageToTab(tab.id, 'clearSessionStorage');

            const cookies = await chrome.cookies.getAll({
                domain: this.activeTabUrl.hostname
            });
            for (const cookie of cookies) {
                await chrome.cookies.remove({
                    url: this.getCookieUrl(cookie),
                    name: cookie.name
                });
            }

            await this.loadStorageData();
            this.showNotification('All storage cleared successfully!');
        } catch (error) {
            console.error('Error clearing storage:', error);
            this.showNotification('Failed to clear storage', 'error');
        }
    }

    exportToJSON() {
        const exportData = {
            timestamp: new Date().toISOString(),
            totalItems: this.storageItems.length,
            totalSize: this.storageItems.reduce((sum, item) => sum + item.size, 0),
            items: this.storageItems.map(item => ({
                key: item.key,
                value: item.value,
                type: item.type,
                size: item.size
            }))
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `storage-export-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Storage exported successfully!');
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'success' ? '#28a745' : '#dc3545'};
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 1000;
            animation: slideDown 0.3s ease-out;
        `;
        notification.textContent = message;

        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideDown 0.3s ease-out reverse';
            setTimeout(() => {
                document.body.removeChild(notification);
                document.head.removeChild(style);
            }, 300);
        }, 3000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new StorageExplorer();
});
