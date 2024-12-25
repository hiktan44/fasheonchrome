// Uzantı yüklendiğinde çalışacak
chrome.runtime.onInstalled.addListener(() => {
    // Sağ tık menüsünü oluştur
    chrome.contextMenus.create({
        id: 'tryOnProduct',
        title: 'Bu ürünü dene',
        contexts: ['image']
    });
});

// Sağ tık menüsüne tıklandığında
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'tryOnProduct') {
        chrome.tabs.sendMessage(tab.id, {
            action: 'tryOnImage',
            imageUrl: info.srcUrl
        });
    }
});

// Runtime mesajlarını dinle
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'openTryOn') {
        // Popup penceresini aç
        chrome.windows.create({
            url: 'index.html',
            type: 'popup',
            width: 800,
            height: 600
        }, (window) => {
            // Pencere oluşturulduktan sonra seçilen ürün bilgisini gönder
            if (window && window.tabs && window.tabs[0]) {
                chrome.tabs.sendMessage(window.tabs[0].id, {
                    action: 'setSelectedProduct',
                    imageUrl: request.imageUrl
                });
            }
            sendResponse({ success: true });
        });
        return true; // Asenkron yanıt için true döndür
    }
});