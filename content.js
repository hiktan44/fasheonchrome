// Ana ürün resmini bul
function findMainProductImage() {
    const possibleSelectors = [
        'img.product-image',
        'img.gallery-modal-content',
        'img[class*="product"]',
        'img[class*="detail"]',
        'img[src*="prod"]',
        'img[id*="product"]',
        'img[alt*="product"]'
    ];

    for (const selector of possibleSelectors) {
        const images = document.querySelectorAll(selector);
        for (const img of images) {
            if (img.complete && img.naturalWidth >= 300 && img.naturalHeight >= 300) {
                return img;
            }
        }
    }

    // Sayfadaki tüm resimleri kontrol et
    const allImages = document.querySelectorAll('img');
    for (const img of allImages) {
        if (img.complete && img.naturalWidth >= 300 && img.naturalHeight >= 300) {
            return img;
        }
    }

    return null;
}

// Try-on işlemini başlat
function startTryOn(imageUrl) {
    showLoading();
    
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
}

// Try On butonunu oluştur ve ekle
function createTryOnButton(productImage) {
    const button = document.createElement('button');
    button.className = 'fasheon-try-on-button';
    button.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2a4 4 0 100 8 4 4 0 000-8z"></path>
            <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"></path>
            <path d="M22 21v-2a4 4 0 00-4-4h-2"></path>
        </svg>
        Dene
    `;

    const container = document.createElement('div');
    container.style.position = 'relative';
    productImage.parentNode.insertBefore(container, productImage);
    container.appendChild(productImage);
    container.appendChild(button);

    button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        startTryOn(productImage.src);
    });
}

// Buton ekleme ve yönetme
function injectTryOnButton() {
    removeExistingButton();
    
    const productImage = findMainProductImage();
    if (productImage) {
        createTryOnButton(productImage);
    }
}

function removeExistingButton() {
    const existingButton = document.querySelector('.fasheon-try-on-button');
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

// İlk yükleme ve sayfa değişikliklerini izle
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectTryOnButton);
} else {
    injectTryOnButton();
}

const observer = new MutationObserver(() => {
    if (!document.querySelector('.fasheon-try-on-button')) {
        injectTryOnButton();
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});