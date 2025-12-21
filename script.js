// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ И КОНСТАНТЫ =====
const tg = window.Telegram?.WebApp || {};
let user = null;
let allProducts = [];
let cart = [];
let favorites = [];
let filteredProducts = [];
let currentPage = 1;
const productsPerPage = 8;
let deliveryAddress = '';
let isAddressSaved = false;
let selectedCartItems = [];
let filterState = {
    categories: [],
    genders: [],
    brands: [],
    volumes: [],
    notes: [],
    rating47: false,
    original: false,
    sale: false,
    cashback: false
};

// Ключи для localStorage
const STORAGE_KEYS = {
    CART: 'aura_atelier_cart',
    FAVORITES: 'aura_atelier_favorites',
    USER: 'aura_atelier_user',
    ADDRESS: 'aura_atelier_address',
    FILTERS: 'aura_atelier_filters'
};

// БАННЕРЫ (легко редактируются)
const BANNERS_DATA = [
    {
        id: 1,
        type: 'exclusive',
        title: 'Эксклюзивные ароматы',
        description: 'Только оригинальная парфюмерия с гарантией качества',
        image: null, // URL картинки (если null - используется градиент)
        gradient: true,
        link: null
    },
    {
        id: 2,
        type: 'contacts',
        title: 'Заказы оформляем в лс',
        description: '',
        contacts: [
            { label: 'Telegram', value: '@Ayder505' },
            { label: 'Telegram channel', value: 'https://t.me/Aa_Atelier' }
        ],
        image: null,
        gradient: true,
        link: 'https://t.me/Ayder505'
    }
];

// ТОВАРЫ (легко редактируются)
const PRODUCTS_DATA = [
    {
        id: 1,
        name: "Aris 222 VIP Bleck",
        description: "Мужские духи. Представленный на изображении товар — это Aris 222 VIP Black, концентрированное парфюмерное масло духи без спирта. Верхние ноты: Абсент, анис и фенхель. Средняя нота: Лаванда. Базовые ноты: Черная ваниль и мускус.",
        price: 350,
        oldPrice: 0,
        category: "premium",
        gender: "male",
        brand: "Aris",
        volume: 6,
        rating: 4.8,
        reviews: 124,
        image: "https://sun9-80.userapi.com/s/v1/ig2/POV_jt4v0MEj7d-4gdkRYIFYTBL-hvXmDLOjJKlY-RqeOgcO1NxWHXAss7UBTzkvI8rdLMEdpqZwJeARBqh7iyc3.jpg?quality=95&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720,1080x1080,1280x1280,1440x1440,2560x2560&from=bu&u=tt6otIk9Wzym_IH9u6oWb4gDXhDWpPwiNQ5muEOgTHo&cs=240x0",
        badge: "hit",
        inStock: true,
        popular: true,
        notes: ["лаванда", "чёрная ваниль", "мускус"],
        original: true,
        cashback: true
    },
    {
        id: 2,
        name: "Dalal",
        description: "Женские духи. Dalal — масляные духи бренда Al Rehab из ОАЭ. Относятся к семейству сладких, древесных и гурманских ароматов. Благодаря масляной консистенции духи имеют хорошую стойкость и экономичны в расходе. Запах держится до 12 часов! Аромат:  Верхние ноты: апельсин. Ноты сердца: карамель, ваниль. Базовые ноты: сандаловое дерево.Композиция напоминает о карамельном чизкейке и ванильном мороженом с апельсиновым джемом",
        price: 350,
        oldPrice: 0,
        category: "premium",
        gender: "female",
        brand: "Al Rehab",
        volume: 6,
        rating: 4.9,
        reviews: 100,
        image: "https://sun9-41.userapi.com/s/v1/ig2/vkEyo2KDCGJhawzJ2PSYbdY9h4EOrh30HrjwefVSCbYOSqJPoXruX0WobRyxKbRBw8BvdlL8sejPGZ4p-RrVjUOO.jpg?quality=95&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720,1080x1080,1280x1280,1440x1440,2560x2560&from=bu&u=m0AEgal8BacMT-TAXZva7xEf1ZAAdIa_7ZvmQJYgIsY&cs=360x0",
        badge: "hit",
        inStock: true,
        popular: true,
        notes: ["апельсин", "карамель", "ваниль", "сандаловое дерево"],
        original: true,
        cashback: true
    },
    // ... (остальные товары из вашего списка, с полями gender и brand)
    {
        id: 18,
        name: "DolceGabbana L'IMPÉRATRICE 3",
        description: "Женские духи. DolceGabbana L'IMPÉRATRICE 3 - изящный и игривый фруктово-цветочный парфюм. Аромат раскрывается сочными акцентами цитрусовых и зелёных фруктов, плавно переходит в сердце из нежных цветочных нот.",
        price: 800,
        oldPrice: 0,
        category: "premium",
        gender: "female",
        brand: "Dolce & Gabbana",
        volume: 25,
        rating: 4.9,
        reviews: 832,
        image: "https://sun9-69.userapi.com/s/v1/ig2/gA5hz2p9kPwvAerpx6g5Eg19OK0Gqu9Tcc92rXgZ1eJP7LT4CgdYwojrELgx8tFUq1mexghkxK9GCZVT_ZPwfvn4.jpg?quality=95&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720,1080x1080,1280x1280,1440x1440,2560x2560&from=bu&u=qhXA7Smf8X5x0aDKtq2k_QGxp0csE1vR3Qo8nQu3HKo&cs=360x0",
        badge: "new",
        inStock: true,
        popular: true,
        notes: ["цитрусы", "зелёные фрукты", "древесно-мускусный"],
        original: true,
        cashback: true,
        sale: true
    },
];
// ... (и так далее для всех 18 товаров)
// ===== ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ =====
document.addEventListener('DOMContentLoaded', function() {
    initApp();
    loadData();
    renderBanners();
    renderProducts();
    updateCartCount();
    setupFilterPopup();
    initEventListeners();
    loadAddress();
    loadFilterState();
});

function initApp() {
    if (tg.initDataUnsafe?.user) {
        user = {
            id: tg.initDataUnsafe.user.id,
            username: tg.initDataUnsafe.user.username || `user_${tg.initDataUnsafe.user.id}`,
            firstName: tg.initDataUnsafe.user.first_name,
            lastName: tg.initDataUnsafe.user.last_name
        };
        tg.expand();
        tg.setHeaderColor('#0F0F1E');
        tg.setBackgroundColor('#0F0F1E');
    } else {
        user = { id: 1, username: 'demo_user', firstName: 'Демо', lastName: 'Пользователь' };
    }
    saveToStorage(STORAGE_KEYS.USER, user);
}

// ===== LOCALSTORAGE ФУНКЦИИ =====
function saveToStorage(key, data) {
    try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) { console.error('Ошибка сохранения в localStorage:', e); }
}
function loadFromStorage(key, defaultValue = null) {
    try { const data = localStorage.getItem(key); return data ? JSON.parse(data) : defaultValue; } catch (e) { console.error('Ошибка загрузки из localStorage:', e); return defaultValue; }
}
function loadData() {
    allProducts = PRODUCTS_DATA;
    filteredProducts = [...allProducts];
    cart = loadFromStorage(STORAGE_KEYS.CART, []);
    favorites = loadFromStorage(STORAGE_KEYS.FAVORITES, []);
    selectedCartItems = cart.map(item => item.id);
}
function saveFilterState() { saveToStorage(STORAGE_KEYS.FILTERS, filterState); }
function loadFilterState() {
    const savedState = loadFromStorage(STORAGE_KEYS.FILTERS);
    if (savedState) filterState = savedState;
}
function loadAddress() {
    const savedAddress = loadFromStorage(STORAGE_KEYS.ADDRESS, '');
    if (savedAddress) {
        deliveryAddress = savedAddress;
        isAddressSaved = true;
        const addressInput = document.getElementById('deliveryAddress');
        if (addressInput) addressInput.value = deliveryAddress;
        updateAddressStatus();
        updateCheckoutButton();
    }
}
function saveAddress() {
    const addressInput = document.getElementById('deliveryAddress');
    if (addressInput) {
        deliveryAddress = addressInput.value.trim();
        if (deliveryAddress) {
            isAddressSaved = true;
            saveToStorage(STORAGE_KEYS.ADDRESS, deliveryAddress);
            updateAddressStatus();
            updateCheckoutButton();
            showNotification('Адрес сохранен', 'success');
            return true;
        } else {
            showNotification('Введите адрес доставки', 'warning');
            return false;
        }
    }
    return false;
}
function updateAddressStatus() {
    const addressStatus = document.getElementById('addressStatus');
    if (addressStatus) {
        if (isAddressSaved && deliveryAddress) {
            addressStatus.innerHTML = `<i class="fas fa-check-circle" style="color: var(--color-success);"></i> Адрес сохранен: ${deliveryAddress.substring(0, 30)}${deliveryAddress.length > 30 ? '...' : ''}`;
        } else {
            addressStatus.innerHTML = '<i class="fas fa-exclamation-circle" style="color: var(--color-warning);"></i> Адрес не указан';
        }
    }
}

// ===== БАННЕРЫ =====
function renderBanners() {
    const bannerContainer = document.getElementById('bannerContainer');
    if (!bannerContainer || BANNERS_DATA.length === 0) return;
    bannerContainer.innerHTML = '';
    if (BANNERS_DATA.length === 1) {
        const bannerElement = createBannerElement(BANNERS_DATA[0]);
        bannerElement.classList.add('active');
        bannerContainer.appendChild(bannerElement);
        return;
    }
    BANNERS_DATA.forEach((banner, index) => {
        const bannerElement = createBannerElement(banner);
        if (index === 0) bannerElement.classList.add('active');
        bannerContainer.appendChild(bannerElement);
    });
    let currentBannerIndex = 0;
    function switchBanner() {
        const allBanners = bannerContainer.querySelectorAll('.banner-slide');
        allBanners[currentBannerIndex].classList.remove('active');
        currentBannerIndex = (currentBannerIndex + 1) % BANNERS_DATA.length;
        allBanners[currentBannerIndex].classList.add('active');
    }
    setInterval(switchBanner, 10000);
}
function createBannerElement(banner) {
    const bannerElement = document.createElement('div');
    bannerElement.className = `banner-slide ${banner.type}`;
    bannerElement.dataset.id = banner.id;
    if (banner.image) {
        bannerElement.style.background = `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('${banner.image}') center/cover`;
    } else if (banner.gradient) {
        if (banner.type === 'exclusive') bannerElement.classList.add('exclusive');
        else if (banner.type === 'contacts') bannerElement.classList.add('contacts');
        else bannerElement.style.background = 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))';
    }
    let contentHtml = '';
    if (banner.type === 'contacts' && banner.contacts) {
        const contactsHtml = banner.contacts.map(contact => {
            if (contact.label === 'Telegram channel') return `<br><a href="${contact.value}" target="_blank">${contact.value}</a>`;
            return `<br><strong>${contact.value}</strong>`;
        }).join('');
        contentHtml = `<h1>${banner.title}</h1><div class="banner-contacts">${contactsHtml}</div>`;
    } else {
        contentHtml = `<h1>${banner.title}</h1><p>${banner.description}</p>`;
    }
    bannerElement.innerHTML = `<div class="banner-content">${contentHtml}</div>`;
    if (banner.link) {
        bannerElement.style.cursor = 'pointer';
        bannerElement.addEventListener('click', function() { window.open(banner.link, '_blank'); });
    }
    return bannerElement;
}

// ===== РЕНДЕРИНГ ТОВАРОВ =====
function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsToShow = filteredProducts.slice(startIndex, endIndex);
    if (productsToShow.length === 0) {
        grid.innerHTML = `<div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
            <i class="fas fa-search" style="font-size: 3rem; color: var(--color-text-muted); margin-bottom: 20px;"></i>
            <h3 style="margin-bottom: 10px; color: var(--color-text);">Товары не найдены</h3>
            <p style="color: var(--color-text-secondary); margin-bottom: 20px;">Попробуйте изменить параметры поиска или фильтры</p>
            <button class="btn-filter-reset" onclick="resetFilters()" style="margin: 0 auto;">Сбросить фильтры</button>
        </div>`;
        return;
    }
    productsToShow.forEach(product => {
        const isInCart = cart.some(item => item.id === product.id);
        const isInFavorites = favorites.some(item => item.id === product.id);
        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.id = product.id;
        let badgeHtml = '';
        if (product.badge === 'new') badgeHtml = '<span class="badge-new">Новинка</span>';
        else if (product.badge === 'sale') badgeHtml = '<span class="badge-sale">Скидка</span>';
        else if (product.badge === 'hit') badgeHtml = '<span class="badge-hit">Хит</span>';
        const discountPercent = product.oldPrice > 0 ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
        let genderIcon = ''; let genderColor = '';
        if (product.gender === 'male') { genderIcon = 'mars'; genderColor = 'var(--color-primary-light)'; }
        else if (product.gender === 'female') { genderIcon = 'venus'; genderColor = 'var(--color-accent)'; }
        else { genderIcon = 'transgender'; genderColor = 'var(--color-secondary)'; }
        card.innerHTML = `
            <div class="product-badges">${badgeHtml}
                <span style="font-size: 0.7rem; color: ${genderColor}; margin-top: 4px;">
                    <i class="fas fa-${genderIcon}"></i> ${product.gender === 'male' ? 'Мужские' : product.gender === 'female' ? 'Женские' : 'Унисекс'}
                </span>
            </div>
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-prices-top">
                <span class="price-current">${product.price.toLocaleString()} ₽</span>
                ${product.oldPrice > 0 ? `
                    <div class="price-old-wrapper">
                        <span class="price-old">${product.oldPrice.toLocaleString()} ₽</span>
                        <span class="discount-percent">-${discountPercent}%</span>
                    </div>` : ''}
            </div>
            <h3 class="product-title">${product.name}</h3>
            <div class="product-description-short">${product.description.substring(0, 60)}${product.description.length > 60 ? '...' : ''}</div>
            <div class="product-rating-wb">
                <div class="rating-stars">${renderStars(product.rating, true)}</div>
                <span class="rating-value-wb">${product.rating}</span>
                <span class="reviews-count-wb">${product.reviews} оценок</span>
            </div>
            <div class="product-actions-wb">
                <button class="btn-cart-wb ${isInCart ? 'in-cart' : ''}" data-id="${product.id}">
                    ${isInCart ? '<i class="fas fa-check"></i>' : '<i class="fas fa-shopping-cart"></i>'}
                    <span>${isInCart ? 'В корзине' : 'В корзину'}</span>
                </button>
                <button class="btn-fav-wb ${isInFavorites ? 'active' : ''}" data-id="${product.id}">
                    <i class="${isInFavorites ? 'fas' : 'far'} fa-heart"></i>
                </button>
            </div>`;
        grid.appendChild(card);
    });
    updatePagination();
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', function(e) {
            if (!e.target.closest('.btn-cart-wb') && !e.target.closest('.btn-fav-wb')) {
                const productId = parseInt(this.dataset.id);
                const product = allProducts.find(p => p.id === productId);
                if (product) showProductDetailsModal(product);
            }
        });
    });
}
function renderStars(rating, showOneStar = false) {
    if (showOneStar) {
        if (rating >= 4.7) return '<i class="fas fa-star"></i>';
        else if (rating >= 4.0) return '<i class="fas fa-star-half-alt"></i>';
        else return '<i class="far fa-star"></i>';
    }
    let stars = ''; const fullStars = Math.floor(rating); const hasHalfStar = rating % 1 >= 0.5;
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) stars += '<i class="fas fa-star"></i>';
        else if (i === fullStars && hasHalfStar) stars += '<i class="fas fa-star-half-alt"></i>';
        else stars += '<i class="far fa-star"></i>';
    }
    return stars;
}

// ===== ПАГИНАЦИЯ =====
function updatePagination() {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const pageNumbers = document.getElementById('pageNumbers');
    const prevBtn = document.getElementById('prevPage'); const nextBtn = document.getElementById('nextPage');
    if (!pageNumbers || !prevBtn || !nextBtn) return;
    pageNumbers.innerHTML = '';
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, startPage + 2);
    if (endPage - startPage < 2) startPage = Math.max(1, endPage - 2);
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i; pageBtn.dataset.page = i;
        pageBtn.addEventListener('click', () => goToPage(i));
        pageNumbers.appendChild(pageBtn);
    }
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages || totalPages === 0;
    prevBtn.onclick = () => goToPage(currentPage - 1);
    nextBtn.onclick = () => goToPage(currentPage + 1);
}
function goToPage(page) {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderProducts();
    const mainContent = document.querySelector('.main-content');
    if (mainContent) mainContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ===== КОРЗИНА =====
function toggleCart(productId, event) {
    if (event) { event.stopPropagation(); event.preventDefault(); }
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    const existingItemIndex = cart.findIndex(item => item.id === productId);
    if (existingItemIndex !== -1) {
        cart.splice(existingItemIndex, 1);
        const selectedIndex = selectedCartItems.indexOf(productId);
        if (selectedIndex !== -1) selectedCartItems.splice(selectedIndex, 1);
        showNotification(`${product.name} удален из корзины`, 'info');
    } else {
        cart.push({ ...product, quantity: 1, addedAt: new Date().toISOString() });
        selectedCartItems.push(productId);
        showNotification(`${product.name} добавлен в корзину`, 'success');
    }
    saveToStorage(STORAGE_KEYS.CART, cart);
    updateCartCount(); updateCartPopup(); renderProducts(); updateSelectedCount();
}
function updateCartCount() {
    const bottomCartCount = document.getElementById('bottomCartCount');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (bottomCartCount) {
        bottomCartCount.textContent = totalItems;
        bottomCartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}
function updateCartPopup() {
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    const cartFinal = document.getElementById('cartFinal');
    if (!cartItems || !cartTotal || !cartFinal) return;
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart" style="text-align: center; padding: 40px 20px;">
                <i class="fas fa-shopping-cart" style="font-size: 3rem; color: var(--color-text-muted); margin-bottom: 20px; opacity: 0.3;"></i>
                <p style="color: var(--color-text-secondary); margin-bottom: 20px;">Ваша корзина пуста</p>
                <button class="btn-browse-glass" onclick="closeCartPopup()">Перейти к покупкам</button>
            </div>`;
        cartTotal.textContent = '0 ₽'; cartFinal.textContent = '0 ₽';
        updateSelectedCount(); return;
    }
    cartItems.innerHTML = '';
    cart.forEach(item => {
        const isSelected = selectedCartItems.includes(item.id);
        const itemElement = document.createElement('div');
        itemElement.className = `cart-item ${isSelected ? 'selected' : ''}`;
        itemElement.dataset.id = item.id;
        itemElement.innerHTML = `
            <div class="cart-item-select ${isSelected ? 'selected' : ''}" onclick="toggleCartItemSelection(${item.id})">
                <i class="fas fa-check"></i>
            </div>
            <div class="cart-item-content">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <div class="cart-item-meta">
                        <span class="cart-item-volume">${item.volume} мл</span>
                        <span class="cart-item-category">${getCategoryName(item.category)}</span>
                        <span class="cart-item-gender">${getGenderName(item.gender)}</span>
                    </div>
                </div>
                <div class="cart-item-price">${(item.price * item.quantity).toLocaleString()} ₽</div>
            </div>
            <div class="cart-item-controls">
                <div class="quantity-controls">
                    <button class="quantity-btn minus" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="10" onchange="updateQuantity(${item.id}, 0, this.value)">
                    <button class="quantity-btn plus" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
                <button class="remove-item-btn" onclick="removeFromCart(${item.id})" title="Удалить">
                    <i class="fas fa-trash"></i>
                </button>
            </div>`;
        cartItems.appendChild(itemElement);
    });
    updateCartSummary(); updateCheckoutButton(); updateSelectedCount();
}
function toggleCartItemSelection(productId) {
    const index = selectedCartItems.indexOf(productId);
    if (index === -1) selectedCartItems.push(productId);
    else selectedCartItems.splice(index, 1);
    updateCartPopup(); updateSelectedCount(); updateSelectAllCheckbox();
}
function toggleSelectAll() {
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    if (!selectAllCheckbox) return;
    const isCurrentlyChecked = selectAllCheckbox.classList.contains('checked');
    if (isCurrentlyChecked) {
        selectedCartItems = [];
        selectAllCheckbox.classList.remove('checked');
    } else {
        selectedCartItems = cart.map(item => item.id);
        selectAllCheckbox.classList.add('checked');
    }
    updateCartPopup(); updateSelectedCount();
}
function updateSelectAllCheckbox() {
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    if (!selectAllCheckbox) return;
    if (cart.length === 0) { selectAllCheckbox.classList.remove('checked'); return; }
    const allSelected = cart.every(item => selectedCartItems.includes(item.id));
    if (allSelected) selectAllCheckbox.classList.add('checked');
    else selectAllCheckbox.classList.remove('checked');
}
function updateSelectedCount() {
    const selectedCountElement = document.getElementById('selectedCount');
    if (selectedCountElement) selectedCountElement.textContent = `Выбрано: ${selectedCartItems.length}`;
}
function updateCartSummary() {
    const cartTotal = document.getElementById('cartTotal');
    const cartFinal = document.getElementById('cartFinal');
    const selectedItems = cart.filter(item => selectedCartItems.includes(item.id));
    const subtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = selectedItems.reduce((sum, item) => item.oldPrice > 0 ? sum + ((item.oldPrice - item.price) * item.quantity) : sum, 0);
    const total = subtotal - discount;
    cartTotal.textContent = `${subtotal.toLocaleString()} ₽`;
    cartFinal.textContent = `${total.toLocaleString()} ₽`;
}
function updateQuantity(productId, delta, newValue = null) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    if (newValue !== null) item.quantity = parseInt(newValue) || 1;
    else item.quantity += delta;
    if (item.quantity < 1) item.quantity = 1;
    if (item.quantity > 10) item.quantity = 10;
    saveToStorage(STORAGE_KEYS.CART, cart);
    updateCartCount(); updateCartPopup(); renderProducts();
}
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    const selectedIndex = selectedCartItems.indexOf(productId);
    if (selectedIndex !== -1) selectedCartItems.splice(selectedIndex, 1);
    saveToStorage(STORAGE_KEYS.CART, cart);
    updateCartCount(); updateCartPopup(); renderProducts();
    showNotification('Товар удален из корзины', 'info');
}
function updateCheckoutButton() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (!checkoutBtn) return;
    const hasItems = cart.length > 0;
    const hasSelectedItems = selectedCartItems.length > 0;
    if (!isAddressSaved || !deliveryAddress) {
        checkoutBtn.disabled = true; checkoutBtn.style.opacity = '0.5'; checkoutBtn.style.cursor = 'not-allowed'; checkoutBtn.title = 'Укажите адрес доставки';
    } else if (!hasItems) {
        checkoutBtn.disabled = true; checkoutBtn.style.opacity = '0.5'; checkoutBtn.style.cursor = 'not-allowed'; checkoutBtn.title = 'Добавьте товары в корзину';
    } else if (!hasSelectedItems) {
        checkoutBtn.disabled = true; checkoutBtn.style.opacity = '0.5'; checkoutBtn.style.cursor = 'not-allowed'; checkoutBtn.title = 'Выберите товары для заказа';
    } else {
        checkoutBtn.disabled = false; checkoutBtn.style.opacity = '1'; checkoutBtn.style.cursor = 'pointer'; checkoutBtn.title = 'Оформить заказ';
    }
}

// ===== ИЗБРАННОЕ =====
function updateFavoritesPopup() {
    const favoritesItems = document.getElementById('favoritesItems');
    const favEmpty = document.getElementById('favEmpty');
    if (!favoritesItems || !favEmpty) return;
    if (favorites.length === 0) {
        favoritesItems.style.display = 'none'; favEmpty.style.display = 'flex';
    } else {
        favoritesItems.style.display = 'block'; favEmpty.style.display = 'none';
        favoritesItems.innerHTML = '';
        favorites.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'fav-item'; itemElement.dataset.id = item.id;
            itemElement.innerHTML = `
                <div class="fav-item-content">
                    <img src="${item.image}" alt="${item.name}" class="fav-item-img">
                    <div class="fav-item-details">
                        <h4 class="fav-item-title">${item.name}</h4>
                        <div class="fav-item-price">${item.price.toLocaleString()} ₽</div>
                        <div class="fav-item-meta">
                            <span class="fav-item-volume">${item.volume} мл</span>
                            <span class="fav-item-category">${getCategoryName(item.category)}</span>
                            <span class="fav-item-gender">${getGenderName(item.gender)}</span>
                        </div>
                    </div>
                    <button class="remove-from-fav" onclick="removeFromFavorites(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <button class="btn-add-to-cart-from-fav" onclick="toggleCart(${item.id})">
                    <i class="fas fa-shopping-cart"></i> В корзину
                </button>`;
            favoritesItems.appendChild(itemElement);
        });
    }
}
function removeFromFavorites(productId) {
    const index = favorites.findIndex(item => item.id === productId);
    if (index !== -1) {
        const product = favorites[index];
        favorites.splice(index, 1);
        saveToStorage(STORAGE_KEYS.FAVORITES, favorites);
        showNotification(`${product.name} удален из избранного`, 'info');
        updateFavoritesPopup(); renderProducts();
    }
}

// ===== МОДАЛЬНОЕ ОКНО ТОВАРА =====
function showProductDetailsModal(product) {
    const existingModal = document.getElementById('productDetailsModal');
    const existingOverlay = document.querySelector('.product-modal-overlay');
    if (existingModal) existingModal.remove(); if (existingOverlay) existingOverlay.remove();
    const modal = document.createElement('div');
    modal.className = 'product-details-modal'; modal.id = 'productDetailsModal';
    const isInCart = cart.some(item => item.id === product.id);
    const isInFavorites = favorites.some(item => item.id === product.id);
    const discountPercent = product.oldPrice > 0 ? Math.round((1 - product.price / product.oldPrice) * 100) : 0;
    let badgeHtml = '';
    if (product.badge === 'new') badgeHtml = '<span class="modal-badge modal-badge-new">Новинка</span>';
    else if (product.badge === 'sale') badgeHtml = '<span class="modal-badge modal-badge-sale">Скидка</span>';
    else if (product.badge === 'hit') badgeHtml = '<span class="modal-badge modal-badge-hit">Хит</span>';
    const notesHtml = product.notes ? product.notes.map(note => `<span class="note-tag">${note}</span>`).join('') : '';
    const genderName = getGenderName(product.gender); const genderClass = product.gender;
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <button class="modal-close-btn" id="closeDetailsModalBtn"><i class="fas fa-times"></i></button>${badgeHtml}
            </div>
            <div class="modal-body">
                <div class="product-image-section"><img src="${product.image}" alt="${product.name}" class="modal-product-image"></div>
                <div class="product-info-section">
                    <h2 class="modal-product-title">${product.name}</h2>
                    <div class="product-meta">
                        <span class="meta-gender ${genderClass}">
                            <i class="fas fa-${product.gender === 'male' ? 'mars' : product.gender === 'female' ? 'venus' : 'transgender'}"></i> ${genderName}
                        </span>
                        <span class="meta-category"><i class="fas fa-tag"></i> ${getCategoryName(product.category)}</span>
                        <span class="meta-volume"><i class="fas fa-weight"></i> ${product.volume} мл</span>
                        <span class="meta-stock ${product.inStock ? 'in-stock' : 'out-of-stock'}">
                            <i class="fas ${product.inStock ? 'fa-check-circle' : 'fa-times-circle'}"></i> ${product.inStock ? 'В наличии' : 'Нет в наличии'}
                        </span>
                    </div>
                    <div class="product-rating-section">
                        <div class="modal-rating">
                            <div class="modal-stars">${renderStars(product.rating)}</div>
                            <span class="modal-rating-value">${product.rating}</span>
                            <span class="modal-reviews">(${product.reviews} отзывов)</span>
                        </div>
                    </div>
                    <div class="product-description">
                        <h3><i class="fas fa-info-circle"></i> Описание</h3>
                        <p>${product.description}</p>
                    </div>
                    <div class="product-notes">
                        <h3><i class="fas fa-wind"></i> Ноты аромата</h3>
                        <div class="notes-container">${notesHtml}</div>
                    </div>
                    <div class="product-pricing">
                        <div class="price-section">
                            <div class="current-price">${product.price.toLocaleString()} ₽</div>
                            ${product.oldPrice > 0 ? `
                                <div class="old-price-section">
                                    <span class="old-price">${product.oldPrice.toLocaleString()} ₽</span>
                                    <span class="discount-badge">-${discountPercent}%</span>
                                </div>` : ''}
                        </div>
                    </div>
                    <div class="product-actions-modal">
                        <button class="btn-add-to-cart ${isInCart ? 'in-cart' : ''}" data-id="${product.id}">
                            <i class="fas ${isInCart ? 'fa-check' : 'fa-shopping-cart'}"></i>${isInCart ? 'В корзине' : 'Добавить в корзину'}
                        </button>
                        <button class="btn-add-to-fav ${isInFavorites ? 'active' : ''}" data-id="${product.id}">
                            <i class="${isInFavorites ? 'fas' : 'far'} fa-heart"></i>
                        </button>
                    </div>
                    <div class="product-features">
                        <div class="feature"><i class="fas fa-shipping-fast"></i><span>Бесплатная доставка по Симферополю</span></div>
                        <div class="feature"><i class="fas fa-shield-alt"></i><span>${product.original ? '100% оригинальная продукция' : 'Качественная реплика'}</span></div>
                        <div class="feature"><i class="fas fa-award"></i><span>Гарантия качества</span></div>
                        ${product.cashback ? `<div class="feature"><i class="fas fa-coins"></i><span>Кэшбэк 5% на следующий заказ</span></div>` : ''}
                    </div>
                </div>
            </div>
        </div>`;
    document.body.appendChild(modal);
    const overlay = document.createElement('div');
    overlay.className = 'product-modal-overlay'; overlay.id = 'productModalOverlay';
    document.body.appendChild(overlay);
    setTimeout(() => { modal.classList.add('show'); overlay.classList.add('show'); document.body.style.overflow = 'hidden'; }, 10);
    setTimeout(() => {
        const closeBtn = document.getElementById('closeDetailsModalBtn');
        const overlayEl = document.getElementById('productModalOverlay');
        const cartBtn = modal.querySelector('.btn-add-to-cart');
        const favBtn = modal.querySelector('.btn-add-to-fav');
        if (closeBtn) closeBtn.addEventListener('click', function(e) { e.stopPropagation(); closeProductDetailsModal(); });
        if (overlayEl) overlayEl.addEventListener('click', function(e) { e.stopPropagation(); closeProductDetailsModal(); });
        if (cartBtn) cartBtn.addEventListener('click', function(e) {
            e.stopPropagation(); e.preventDefault(); const productId = parseInt(this.dataset.id);
            toggleCart(productId, e);
            setTimeout(() => {
                const isNowInCart = cart.some(item => item.id === productId);
                if (isNowInCart) { this.innerHTML = '<i class="fas fa-check"></i> В корзине'; this.classList.add('in-cart'); }
                else { this.innerHTML = '<i class="fas fa-shopping-cart"></i> Добавить в корзину'; this.classList.remove('in-cart'); }
            }, 100);
        });
        if (favBtn) favBtn.addEventListener('click', function(e) {
            e.stopPropagation(); e.preventDefault(); const productId = parseInt(this.dataset.id);
            const product = allProducts.find(p => p.id === productId); if (!product) return;
            const existingIndex = favorites.findIndex(item => item.id === productId);
            if (existingIndex !== -1) {
                favorites.splice(existingIndex, 1); showNotification(`${product.name} удален из избранного`, 'info');
            } else {
                favorites.push({ ...product, addedAt: new Date().toISOString() }); showNotification(`${product.name} добавлен в избранное`, 'success');
            }
            saveToStorage(STORAGE_KEYS.FAVORITES, favorites);
            setTimeout(() => {
                const isNowInFav = favorites.some(item => item.id === productId);
                if (isNowInFav) { this.innerHTML = '<i class="fas fa-heart"></i>'; this.classList.add('active'); }
                else { this.innerHTML = '<i class="far fa-heart"></i>'; this.classList.remove('active'); }
            }, 100);
        });
        const escHandler = function(e) { if (e.key === 'Escape') closeProductDetailsModal(); };
        document.addEventListener('keydown', escHandler); modal._escHandler = escHandler;
    }, 20);
}
function closeProductDetailsModal() {
    const modal = document.getElementById('productDetailsModal');
    const overlay = document.getElementById('productModalOverlay');
    if (modal) { modal.classList.remove('show'); if (modal._escHandler) document.removeEventListener('keydown', modal._escHandler);
        setTimeout(() => { if (modal.parentNode) modal.parentNode.removeChild(modal); }, 400); }
    if (overlay) { overlay.classList.remove('show'); setTimeout(() => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 400); }
    document.body.style.overflow = 'auto';
}

// ===== ФИЛЬТРЫ =====
function setupFilterPopup() {
    const filterContent = document.getElementById('filterContent');
    if (!filterContent) return;
    const categories = [...new Set(allProducts.map(p => p.category))];
    const genders = [...new Set(allProducts.map(p => p.gender))];
    const brands = [...new Set(allProducts.map(p => p.brand))];
    const volumes = [...new Set(allProducts.map(p => p.volume))];
    const allNotes = [];
    allProducts.forEach(product => {
        if (product.notes) {
            product.notes.forEach(note => {
                if (note && note !== '.' && !allNotes.includes(note)) allNotes.push(note);
            });
        }
    });
    filterContent.innerHTML = `
        <div class="filter-group">
            <div class="filter-group-title" onclick="toggleFilterSubgroup('category')">
                <h4>Категории</h4><i class="fas fa-chevron-down"></i>
            </div>
            <div class="filter-subgroup" id="filter-category">
                ${categories.map(cat => `
                    <label class="filter-checkbox">
                        <input type="checkbox" class="filter-option" data-type="category" value="${cat}" ${filterState.categories.includes(cat) ? 'checked' : ''}>
                        <div class="checkbox-wrapper"><span class="checkmark"><i class="fas fa-check"></i></span><span>${getCategoryName(cat)}</span></div>
                    </label>`).join('')}
            </div>
        </div>
        <div class="filter-group">
            <div class="filter-group-title" onclick="toggleFilterSubgroup('gender')">
                <h4>Пол</h4><i class="fas fa-chevron-down"></i>
            </div>
            <div class="filter-subgroup" id="filter-gender">
                ${genders.map(gender => `
                    <label class="filter-checkbox">
                        <input type="checkbox" class="filter-option" data-type="gender" value="${gender}" ${filterState.genders.includes(gender) ? 'checked' : ''}>
                        <div class="checkbox-wrapper"><span class="checkmark"><i class="fas fa-check"></i></span><span>${getGenderName(gender)}</span></div>
                    </label>`).join('')}
            </div>
        </div>
        <div class="filter-group">
            <div class="filter-group-title" onclick="toggleFilterSubgroup('brand')">
                <h4>Бренд</h4><i class="fas fa-chevron-down"></i>
            </div>
            <div class="filter-subgroup" id="filter-brand">
                ${brands.map(brand => `
                    <label class="filter-checkbox">
                        <input type="checkbox" class="filter-option" data-type="brand" value="${brand}" ${filterState.brands.includes(brand) ? 'checked' : ''}>
                        <div class="checkbox-wrapper"><span class="checkmark"><i class="fas fa-check"></i></span><span>${brand}</span></div>
                    </label>`).join('')}
            </div>
        </div>
        <div class="filter-group">
            <div class="filter-group-title" onclick="toggleFilterSubgroup('composition')">
                <h4>Состав</h4><i class="fas fa-chevron-down"></i>
            </div>
            <div class="filter-subgroup" id="filter-composition">
                <h5 style="margin-bottom: 10px; color: var(--color-text-secondary);">Объем, мл:</h5>
                ${volumes.sort((a, b) => a - b).map(volume => `
                    <label class="filter-checkbox">
                        <input type="checkbox" class="filter-option" data-type="volume" value="${volume}" ${filterState.volumes.includes(volume) ? 'checked' : ''}>
                        <div class="checkbox-wrapper"><span class="checkmark"><i class="fas fa-check"></i></span><span>${volume} мл</span></div>
                    </label>`).join('')}
                ${allNotes.length > 0 ? `
                    <h5 style="margin: 15px 0 10px; color: var(--color-text-secondary);">Ноты аромата:</h5>
                    ${allNotes.slice(0, 10).map(note => `
                        <label class="filter-checkbox">
                            <input type="checkbox" class="filter-option" data-type="note" value="${note}" ${filterState.notes.includes(note) ? 'checked' : ''}>
                            <div class="checkbox-wrapper"><span class="checkmark"><i class="fas fa-check"></i></span><span>${note}</span></div>
                        </label>`).join('')}` : ''}
            </div>
        </div>
        <div class="filter-single">
            <div class="filter-info"><span class="stars"><i class="fas fa-star"></i></span><span>С рейтингом от 4.7</span></div>
            <input type="checkbox" id="filterRating47" ${filterState.rating47 ? 'checked' : ''}>
            <label for="filterRating47" class="checkmark"><i class="fas fa-check"></i></label>
        </div>
        <div class="filter-single">
            <div class="filter-info"><i class="fas fa-shield-alt" style="color: var(--color-primary);"></i><span>Оригинальный товар</span></div>
            <input type="checkbox" id="filterOriginal" ${filterState.original ? 'checked' : ''}>
            <label for="filterOriginal" class="checkmark"><i class="fas fa-check"></i></label>
        </div>
        <div class="filter-single">
            <div class="filter-info"><i class="fas fa-tag" style="color: var(--color-sale);"></i><span>Распродажа</span></div>
            <input type="checkbox" id="filterSale" ${filterState.sale ? 'checked' : ''}>
            <label for="filterSale" class="checkmark"><i class="fas fa-check"></i></label>
        </div>
        <div class="filter-single">
            <div class="filter-info"><i class="fas fa-coins" style="color: var(--color-warning);"></i><span>Кэшбэк</span></div>
            <input type="checkbox" id="filterCashback" ${filterState.cashback ? 'checked' : ''}>
            <label for="filterCashback" class="checkmark"><i class="fas fa-check"></i></label>
        </div>`;
    document.querySelectorAll('.filter-option').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const type = this.dataset.type; const value = this.value;
            if (type === 'category') {
                if (this.checked) filterState.categories.push(value);
                else filterState.categories = filterState.categories.filter(cat => cat !== value);
            } else if (type === 'gender') {
                if (this.checked) filterState.genders.push(value);
                else filterState.genders = filterState.genders.filter(g => g !== value);
            } else if (type === 'brand') {
                if (this.checked) filterState.brands.push(value);
                else filterState.brands = filterState.brands.filter(b => b !== value);
            } else if (type === 'volume') {
                if (this.checked) filterState.volumes.push(parseInt(value));
                else filterState.volumes = filterState.volumes.filter(v => v !== parseInt(value));
            } else if (type === 'note') {
                if (this.checked) filterState.notes.push(value);
                else filterState.notes = filterState.notes.filter(n => n !== value);
            }
            saveFilterState(); filterProducts();
        });
    });
    document.getElementById('filterRating47')?.addEventListener('change', function() { filterState.rating47 = this.checked; saveFilterState(); filterProducts(); });
    document.getElementById('filterOriginal')?.addEventListener('change', function() { filterState.original = this.checked; saveFilterState(); filterProducts(); });
    document.getElementById('filterSale')?.addEventListener('change', function() { filterState.sale = this.checked; saveFilterState(); filterProducts(); });
    document.getElementById('filterCashback')?.addEventListener('change', function() { filterState.cashback = this.checked; saveFilterState(); filterProducts(); });
}
function toggleFilterSubgroup(type) {
    const subgroup = document.getElementById(`filter-${type}`);
    const title = document.querySelector(`[onclick="toggleFilterSubgroup('${type}')"]`);
    if (subgroup && title) { subgroup.classList.toggle('show'); title.classList.toggle('active'); }
}
function filterProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const sortBy = document.getElementById('sortBy').value;
    filteredProducts = allProducts.filter(product => {
        if (searchTerm && !product.name.toLowerCase().includes(searchTerm) && !product.description.toLowerCase().includes(searchTerm)) return false;
        if (filterState.categories.length > 0 && !filterState.categories.includes(product.category)) return false;
        if (filterState.genders.length > 0 && !filterState.genders.includes(product.gender)) return false;
        if (filterState.brands.length > 0 && !filterState.brands.includes(product.brand)) return false;
        if (filterState.volumes.length > 0 && !filterState.volumes.includes(product.volume)) return false;
        if (filterState.notes.length > 0) {
            const hasNote = filterState.notes.some(note => product.notes && product.notes.includes(note));
            if (!hasNote) return false;
        }
        if (filterState.rating47 && product.rating < 4.7) return false;
        if (filterState.original && !product.original) return false;
        if (filterState.sale && !product.sale) return false;
        if (filterState.cashback && !product.cashback) return false;
        return true;
    });
    switch(sortBy) {
        case 'new': filteredProducts.sort((a, b) => b.id - a.id); break;
        case 'price-low': filteredProducts.sort((a, b) => a.price - b.price); break;
        case 'price-high': filteredProducts.sort((a, b) => b.price - a.price); break;
        case 'rating': filteredProducts.sort((a, b) => b.rating - a.rating); break;
        case 'popular': default: filteredProducts.sort((a, b) => { if (b.rating !== a.rating) return b.rating - a.rating; return b.reviews - a.reviews; }); break;
    }
    currentPage = 1; renderProducts();
}
function resetFilters() {
    filterState = { categories: [], genders: [], brands: [], volumes: [], notes: [], rating47: false, original: false, sale: false, cashback: false };
    saveFilterState();
    document.querySelectorAll('.filter-option').forEach(checkbox => { checkbox.checked = false; });
    document.getElementById('filterRating47').checked = false;
    document.getElementById('filterOriginal').checked = false;
    document.getElementById('filterSale').checked = false;
    document.getElementById('filterCashback').checked = false;
    document.getElementById('searchInput').value = '';
    document.getElementById('sortBy').value = 'popular';
    closeFilterPopup(); filterProducts();
    showNotification('Фильтры сброшены', 'info');
}

// ===== УПРАВЛЕНИЕ ПОПАПАМИ =====
function openCartPopup() { document.getElementById('cartPopup').classList.add('show'); document.getElementById('overlay').classList.add('show'); document.body.style.overflow = 'hidden'; updateCartPopup(); updateSelectAllCheckbox(); }
function closeCartPopup() { document.getElementById('cartPopup').classList.remove('show'); document.getElementById('overlay').classList.remove('show'); document.body.style.overflow = 'auto'; }
function openFavoritesPopup() { document.getElementById('favoritesPopup').classList.add('show'); document.getElementById('overlay').classList.add('show'); document.body.style.overflow = 'hidden'; updateFavoritesPopup(); }
function closeFavoritesPopup() { document.getElementById('favoritesPopup').classList.remove('show'); document.getElementById('overlay').classList.remove('show'); document.body.style.overflow = 'auto'; }
function openFilterPopup() { document.getElementById('filterPopup').classList.add('show'); document.getElementById('overlay').classList.add('show'); document.getElementById('filterResetBtn').style.display = 'flex'; document.body.style.overflow = 'hidden'; }
function closeFilterPopup() { document.getElementById('filterPopup').classList.remove('show'); document.getElementById('overlay').classList.remove('show'); document.getElementById('filterResetBtn').style.display = 'none'; document.body.style.overflow = 'auto'; }

// ===== УТИЛИТЫ =====
function getCategoryName(category) {
    const categories = { arabian: 'Арабские духи', premium: 'Премиум коллекция', affordable: 'Доступные духи', new: 'Новинки', sale: 'Акции' };
    return categories[category] || category;
}
function getGenderName(gender) {
    const genders = { male: 'Мужские', female: 'Женские', unisex: 'Унисекс' };
    return genders[gender] || gender;
}
function showNotification(message, type = 'info') {
    document.querySelectorAll('.notification').forEach(n => n.remove());
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    let icon = 'info-circle'; if (type === 'success') icon = 'check-circle'; if (type === 'warning') icon = 'exclamation-circle'; if (type === 'error') icon = 'times-circle';
    notification.innerHTML = `<div class="notification-content"><i class="fas fa-${icon}"></i><span>${message}</span></div>`;
    document.body.appendChild(notification);
    setTimeout(() => { if (notification.parentNode) notification.parentNode.removeChild(notification); }, 3000);
}

// ===== ОБРАБОТЧИКИ СОБЫТИЙ =====
function initEventListeners() {
    const searchInput = document.getElementById('searchInput'); const searchBtn = document.getElementById('searchBtn');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) { if (e.key === 'Enter') filterProducts(); });
        searchInput.addEventListener('input', function() {
            clearTimeout(this._timer); this._timer = setTimeout(() => { if (this.value.trim() === '') filterProducts(); }, 500);
        });
    }
    if (searchBtn) searchBtn.addEventListener('click', filterProducts);
    document.getElementById('sortBy')?.addEventListener('change', filterProducts);
    document.getElementById('navFavorites')?.addEventListener('click', function() { updateFavoritesPopup(); openFavoritesPopup(); });
    document.getElementById('navCart')?.addEventListener('click', openCartPopup);
    document.getElementById('navFilter')?.addEventListener('click', openFilterPopup);
    document.getElementById('selectAllContainer')?.addEventListener('click', toggleSelectAll);
    document.getElementById('saveAddressBtn')?.addEventListener('click', function() { if (saveAddress()) updateCheckoutButton(); });
    document.getElementById('deliveryAddress')?.addEventListener('keypress', function(e) { if (e.key === 'Enter') { if (saveAddress()) updateCheckoutButton(); } });
    document.getElementById('deliveryAddress')?.addEventListener('input', function() {
        clearTimeout(this._timer); this._timer = setTimeout(() => {
            if (this.value.trim()) { deliveryAddress = this.value.trim(); isAddressSaved = true; saveToStorage(STORAGE_KEYS.ADDRESS, deliveryAddress); updateAddressStatus(); updateCheckoutButton(); }
        }, 1000);
    });
    document.getElementById('browseBtn')?.addEventListener('click', function() { closeFavoritesPopup(); resetFilters(); });
    document.getElementById('filterResetBtn')?.addEventListener('click', resetFilters);
    document.getElementById('closeCart')?.addEventListener('click', closeCartPopup);
    document.getElementById('closeFav')?.addEventListener('click', closeFavoritesPopup);
    document.getElementById('closeFilter')?.addEventListener('click', closeFilterPopup);
    document.getElementById('overlay')?.addEventListener('click', function() { closeCartPopup(); closeFavoritesPopup(); closeFilterPopup(); closeProductDetailsModal(); });
    document.getElementById('checkoutBtn')?.addEventListener('click', function() {
        if (cart.length === 0) { showNotification('Добавьте товары в корзину', 'info'); return; }
        if (selectedCartItems.length === 0) { showNotification('Выберите товары для заказа', 'warning'); this.classList.add('shake'); setTimeout(() => this.classList.remove('shake'), 500); return; }
        if (!isAddressSaved || !deliveryAddress) {
            showNotification('Сначала укажите адрес доставки', 'warning');
            this.classList.add('shake'); setTimeout(() => this.classList.remove('shake'), 500);
            const addressInput = document.getElementById('deliveryAddress'); if (addressInput) addressInput.focus(); return;
        }
        const selectedItems = cart.filter(item => selectedCartItems.includes(item.id));
        const total = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const orderItems = selectedItems.map(item => `${item.name} - ${item.quantity} × ${item.price.toLocaleString()}₽ = ${(item.price * item.quantity).toLocaleString()}₽`).join('\n');
        const orderText = `📨 **Новый заказ в Aura Atelier**\n\n📦 **Товары:**\n${orderItems}\n\n🧾 **Итого:** ${total.toLocaleString()}₽\n📍 **Адрес доставки:** ${deliveryAddress}\n📅 **Дата:** ${new Date().toLocaleString('ru-RU')}\n\n💬 **Связь:** @Ayder505`.trim();
        if (tg.sendData) {
            const orderData = { userId: user.id, username: user.username, items: selectedItems, total: total, deliveryAddress: deliveryAddress, timestamp: new Date().toISOString() };
            tg.sendData(JSON.stringify(orderData));
            tg.showAlert(`Заказ оформлен!\n\nСумма: ${total.toLocaleString()}₽\nТоваров: ${selectedItems.length}\nАдрес: ${deliveryAddress}\n\nС вами свяжется менеджер для подтверждения.`);
        } else {
            const telegramUrl = `https://t.me/Ayder505?text=${encodeURIComponent(orderText)}`; window.open(telegramUrl, '_blank');
            showNotification(`Заказ на ${total.toLocaleString()}₽ отправлен менеджеру`, 'success');
        }
        cart = cart.filter(item => !selectedCartItems.includes(item.id)); selectedCartItems = [];
        saveToStorage(STORAGE_KEYS.CART, cart); updateCartCount(); updateCartPopup(); renderProducts(); closeCartPopup();
    });
    document.addEventListener('click', function(event) {
        const target = event.target;
        const cartBtn = target.closest('.btn-cart-wb');
        if (cartBtn) {
            event.stopPropagation(); event.preventDefault(); const productId = parseInt(cartBtn.dataset.id);
            if (productId) { toggleCart(productId, event);
                setTimeout(() => {
                    const isNowInCart = cart.some(item => item.id === productId);
                    if (isNowInCart) { cartBtn.innerHTML = '<i class="fas fa-check"></i><span>В корзине</span>'; cartBtn.classList.add('in-cart'); }
                    else { cartBtn.innerHTML = '<i class="fas fa-shopping-cart"></i><span>В корзину</span>'; cartBtn.classList.remove('in-cart'); }
                }, 100);
            } return;
        }
        const favBtn = target.closest('.btn-fav-wb');
        if (favBtn) {
            event.stopPropagation(); event.preventDefault(); const productId = parseInt(favBtn.dataset.id);
            if (productId) {
                const product = allProducts.find(p => p.id === productId); if (!product) return;
                const existingIndex = favorites.findIndex(item => item.id === productId);
                if (existingIndex !== -1) { favorites.splice(existingIndex, 1); showNotification(`${product.name} удален из избранного`, 'info'); }
                else { favorites.push({ ...product, addedAt: new Date().toISOString() }); showNotification(`${product.name} добавлен в избранное`, 'success'); }
                saveToStorage(STORAGE_KEYS.FAVORITES, favorites);
                setTimeout(() => {
                    const isNowInFav = favorites.some(item => item.id === productId);
                    if (isNowInFav) { favBtn.innerHTML = '<i class="fas fa-heart"></i>'; favBtn.classList.add('active'); }
                    else { favBtn.innerHTML = '<i class="far fa-heart"></i>'; favBtn.classList.remove('active'); }
                }, 100);
            } return;
        }
    });
    document.addEventListener('keydown', function(e) { if (e.key === 'Escape') { closeCartPopup(); closeFavoritesPopup(); closeFilterPopup(); closeProductDetailsModal(); } });
}

// ===== ГЛОБАЛЬНЫЙ ЭКСПОРТ =====
window.app = { user, allProducts, cart, favorites, filteredProducts, filterProducts, toggleCart, showProductDetailsModal, closeProductDetailsModal, resetFilters, openCartPopup, openFavoritesPopup, openFilterPopup, saveAddress, toggleFilterSubgroup };
console.log('Aura Atelier приложение инициализировано');