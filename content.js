// FASHEON Try-on için buton HTML'i
const tryOnButtonHTML = `
  <div id="fasheon-tryon-button" class="fasheon-floating-button">
    <button class="try-on-button" type="button">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 4C10.6193 4 9.5 5.11929 9.5 6.5C9.5 7.88071 10.6193 9 12 9C13.3807 9 14.5 7.88071 14.5 6.5C14.5 5.11929 13.3807 4 12 4Z" fill="#FF6B6B"/>
        <path d="M8 11V19C8 19.5523 8.44772 20 9 20H15C15.5523 20 16 19.5523 16 19V11C16 10.4477 15.5523 10 15 10H9C8.44772 10 8 10.4477 8 11Z" fill="#4ECDC4"/>
      </svg>
      <span>Dene</span>
    </button>
  </div>
`;

// Ana ürün resmini bul
function findMainProductImage() {
    // Trendyol spesifik selektörler
    const possibleSelectors = [
        'img.product-image',
        'img.gallery-modal-content',
        'img[class*="product"]',
        'img[class*="detail"]',
        'img[src*="prod"]'
    ];

    // Her bir selektörü dene
    for (const selector of possibleSelectors) {
        const images = document.querySelectorAll(selector);
        for (const img of images) {
            if (img.complete && img.naturalWidth >= 300 && img.naturalHeight >= 300) {
                console.log('Ürün resmi bulundu:', img.src);
                return img;
            }
        }
    }

    console.warn('Ürün resmi bulunamadı');
    return null;
}

// Try-on işlemini başlat
function startTryOn(imageUrl) {
    showLoading();
    
    chrome.storage.local.set({ 
        selectedProduct: imageUrl,
        timestamp: Date.now()
    }).then(() => {
        chrome.runtime.sendMessage({
            action: 'openTryOn',
            imageUrl: imageUrl
        }).then(() => {
            hideLoading();
        }).catch(error => {
            console.error('Mesaj gönderme hatası:', error);
            showError('İşlem başlatılamadı');
            hideLoading();
        });
    }).catch(error => {
        console.error('Storage hatası:', error);
        showError('Veri kaydedilemedi');
        hideLoading();
    });
}

// Buton ekleme ve yönetme
function injectTryOnButton() {
    removeExistingButton();
    
    const container = document.createElement('div');
    container.innerHTML = tryOnButtonHTML;
    const button = container.firstElementChild;
    document.body.appendChild(button);

    const tryOnButton = button.querySelector('.try-on-button');
    tryOnButton.addEventListener('click', handleTryOnClick);
}

function handleTryOnClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const productImage = findMainProductImage();
    if (productImage) {
        startTryOn(productImage.src);
    } else {
        showError('Ürün resmi bulunamadı');
    }
}

function removeExistingButton() {
    const existingButton = document.getElementById('fasheon-tryon-button');
    if (existingButton) {
        existingButton.remove();
    }
}

// Yükleme ve hata mesajları
function showLoading() {
    const loader = document.createElement('div');
    loader.className = 'fasheon-loading';
    document.body.appendChild(loader);
}

function hideLoading() {
    const loader = document.querySelector('.fasheon-loading');
    if (loader) loader.remove();
}

function showError(message) {
    const error = document.createElement('div');
    error.className = 'fasheon-error';
    error.textContent = message;
    document.body.appendChild(error);
    
    setTimeout(() => {
        if (error.parentNode) {
            error.remove();
        }
    }, 3000);
}

// Mesajları dinle
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'tryOnImage') {
        if (request.imageUrl) {
            startTryOn(request.imageUrl);
        }
    }
    return true; // Asenkron yanıt için
});

// Sayfa yüklendiğinde başlat
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectTryOnButton);
} else {
    injectTryOnButton();
}

// Dinamik sayfa değişikliklerini izle
const observer = new MutationObserver(() => {
    if (!document.getElementById('fasheon-tryon-button')) {
        injectTryOnButton();
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});