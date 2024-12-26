let currentTab = null;

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'tryOnProduct',
        title: 'Bu ürünü dene',
        contexts: ['image']
    });
});

async function openTryOnWindow(imageUrl) {
    try {
        const window = await chrome.windows.create({
            url: 'index.html',
            type: 'popup',
            width: 800,
            height: 800
        });
        
        currentTab = window.tabs[0].id;

        // Sayfanın yüklenmesini bekle
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Resmi gönder
        await chrome.storage.local.set({ 'selectedProductImage': imageUrl });
    } catch (error) {
        console.error('Error:', error);
    }
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'tryOnProduct') {
        openTryOnWindow(info.srcUrl);
    }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'requestProductImage') {
        chrome.storage.local.get(['selectedProductImage'], function(result) {
            if (result.selectedProductImage) {
                sendResponse({ imageUrl: result.selectedProductImage });
                // Kullanıldıktan sonra temizle
                chrome.storage.local.remove(['selectedProductImage']);
            }
        });
        return true;
    }
    
    if (request.action === 'openTryOn') {
        openTryOnWindow(request.imageUrl);
        sendResponse({ success: true });
        return true;
    }
});