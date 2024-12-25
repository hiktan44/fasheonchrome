// Dil seçimi için olay dinleyicisi
document.getElementById('languageSelect').addEventListener('change', function(e) {
    const lang = e.target.value;
    document.documentElement.lang = lang;
    
    // Metin içeriklerini güncelle
    const translations = {
        tr: {
            login: 'Giriş Yap',
            warning: 'Bu eklenti genel bir fikir verir ve gerçekteki görünümü tam olarak yansıtmayabilir.'
        },
        en: {
            login: 'Login',
            warning: 'This extension provides a general idea and may not fully reflect the actual appearance.'
        }
    };

    // Metinleri güncelle
    const loginButton = document.querySelector('.login-button');
    const footer = document.querySelector('.footer');
    
    loginButton.textContent = translations[lang].login;
    footer.textContent = translations[lang].warning;

    // Dil tercihini kaydet
    chrome.storage.local.set({ 'language': lang });
});