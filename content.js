// Content script to interact with the active tab's storage
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    try {
        switch (request.action) {
            case 'getLocalStorage':
                const localStorageItems = {};
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    localStorageItems[key] = localStorage.getItem(key);
                }
                sendResponse({ success: true, data: localStorageItems });
                break;

            case 'getSessionStorage':
                const sessionStorageItems = {};
                for (let i = 0; i < sessionStorage.length; i++) {
                    const key = sessionStorage.key(i);
                    sessionStorageItems[key] = sessionStorage.getItem(key);
                }
                sendResponse({ success: true, data: sessionStorageItems });
                break;

            case 'removeLocalStorage':
                localStorage.removeItem(request.key);
                sendResponse({ success: true });
                break;

            case 'removeSessionStorage':
                sessionStorage.removeItem(request.key);
                sendResponse({ success: true });
                break;

            case 'clearLocalStorage':
                localStorage.clear();
                sendResponse({ success: true });
                break;

            case 'clearSessionStorage':
                sessionStorage.clear();
                sendResponse({ success: true });
                break;

            default:
                sendResponse({ success: false, error: 'Unknown action' });
        }
    } catch (error) {
        sendResponse({ success: false, error: error.message });
    }
    return true; // Keep the message channel open for async response
});
