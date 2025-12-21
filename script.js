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
let selectedSizes = [];
let selectedCategories = [];
let selectedBrands = [];
let maxPrice = 35000;

const STORAGE_KEYS = {
    CART: 'edm_football_cart',
    FAVORITES: 'edm_football_favorites',
    USER: 'edm_football_user',
    ADDRESS: 'edm_football_address'
};

const PRODUCTS_DATA = [
    {
        id: 1,
        name: "Nike Mercurial Superfly 9 Elite FG",
        description: "Элитные футбольные бутсы для натурального газона с технологией Flyknit и углеродной пластиной. Максимальная скорость и контроль.",
        price: 29900,
        oldPrice: 34900,
        category: "fg",
        size: [40, 40.5, 41, 42, 42.5, 43, 44, 45],
        brand: "nike",
        rating: 4.9,
        reviews: 156,
        image: "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        badge: "new",
        inStock: true,
        popular: true,
        features: ["Flyknit верх", "Углеродная пластина", "FG шипы", "Элитный уровень"]
    },
    {
        id: 2,
        name: "Adidas Predator Accuracy.1 FG",
        description: "Бутсы для контроля мяча с технологией Demonskin и зонами контроля. Идеально для плеймейкеров.",
        price: 27900,
        oldPrice: 0,
        category: "fg",
        size: [39, 40, 41, 42, 43, 44],
        brand: "adidas",
        rating: 4.8,
        reviews: 128,
        image: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        badge: "hit",
        inStock: true,
        popular: true,
        features: ["Demonskin технология", "FG шипы", "Контроль мяча", "Primeknit верх"]
    },
    {
        id: 3,
        name: "Puma Future Ultimate MG",
        description: "Универсальные бутсы для мультигрунта с адаптивной системой шнуровки и технологией FUZIONFIT+.",
        price: 18900,
        oldPrice: 22900,
        category: "mg",
        size: [38, 39, 40, 41, 42, 43, 44],
        brand: "puma",
        rating: 4.7,
        reviews: 89,
        image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        badge: "sale",
        inStock: true,
        popular: true,
        features: ["FUZIONFIT+", "MG шипы", "Адаптивная шнуровка", "Универсальные"]
    },
    {
        id: 4,
        name: "Mizuno Morelia Neo III Beta MIJ",
        description: "Ручной работы в Японии. Премиальная кенгуру, невероятная посадка и комфорт для натурального газона.",
        price: 34900,
        oldPrice: 0,
        category: "fg",
        size: [40, 41, 42, 43, 44],
        brand: "mizuno",
        rating: 4.9,
        reviews: 67,
        image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        badge: "new",
        inStock: true,
        popular: false,
        features: ["Кожа кенгуру", "MIJ (Япония)", "FG шипы", "Ручная работа"]
    },
    {
        id: 5,
        name: "Nike Tiempo Legend 9 Elite AG",
        description: "Элитные бутсы для искусственного газона с кожей KangaLite и технологией Flyknit для комфорта и контроля.",
        price: 25900,
        oldPrice: 29900,
        category: "ag",
        size: [39, 40, 41, 42, 43, 44, 45],
        brand: "nike",
        rating: 4.8,
        reviews: 142,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        badge: "hit",
        inStock: true,
        popular: true,
        features: ["KangaLite кожа", "AG шипы", "Flyknit воротник", "Элитный уровень"]
    },
    {
        id: 6,
        name: "Adidas X Speedportal.1 TF",
        description: "Бутсы для зала с технологией Carbitex и зонами ускорения. Максимальная скорость на твердых покрытиях.",
        price: 16900,
        oldPrice: 19900,
        category: "tf",
        size: [38, 39, 40, 41, 42, 43],
        brand: "adidas",
        rating: 4.6,
        reviews: 94,
        image: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        badge: "sale",
        inStock: true,
        popular: true,
        features: ["Carbitex технология", "TF шипы", "Для зала", "Скорость"]
    },
    {
        id: 7,
        name: "Nike Phantom GX Elite FG",
        description: "Инновационные бутсы для креатива и неожиданных решений. Технология Gripknit для улучшенного контроля.",
        price: 28900,
        oldPrice: 0,
        category: "fg",
        size: [40, 41, 42, 43, 44],
        brand: "nike",
        rating: 4.7,
        reviews: 113,
        image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        badge: "new",
        inStock: true,
        popular: true,
        features: ["Gripknit технология", "FG шипы", "Креативный контроль", "Элитный уровень"]
    },
    {
        id: 8,
        name: "Puma King Platinum MG",
        description: "Премиальные бутсы для мультигрунта с кожей кенгуру и классическим дизайном для тотального контроля.",
        price: 22900,
        oldPrice: 26900,
        category: "mg",
        size: [39, 40, 41, 42, 43, 44],
        brand: "puma",
        rating: 4.8,
        reviews: 78,
        image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        badge: "hit",
        inStock: true,
        popular: false,
        features: ["Кожа кенгуру", "MG шипы", "Классический дизайн", "Контроль"]
    },
    {
        id: 9,
        name: "Adidas Copa Pure.1 FG",
        description: "Чистый контроль на натуральном газоне. Кожа кенгуру и минималистичный дизайн для пуристов.",
        price: 24900,
        oldPrice: 0,
        category: "fg",
        size: [39, 40, 41, 42, 43, 44],
        brand: "adidas",
        rating: 4.8,
        reviews: 87,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        badge: null,
        inStock: true,
        popular: true,
        features: ["Кожа кенгуру", "FG шипы", "Минимализм", "Контроль"]
    },
    {
        id: 10,
        name: "Nike Mercurial Vapor 15 Elite AG-Pro",
        description: "Профессиональные бутсы для искусственного газона с улучшенной амортизацией и сцеплением.",
        price: 27900,
        oldPrice: 31900,
        category: "ag",
        size: [40, 41, 42, 43, 44, 45],
        brand: "nike",
        rating: 4.9,
        reviews: 134,
        image: "https://images.unsplash.com/photo-1609921212029-bb5a28e60960?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        badge: "sale",
        inStock: true,
        popular: true,
        features: ["AG-Pro шипы", "Flyknit верх", "Профессиональный уровень", "Скорость"]
    },
    {
        id: 11,
        name: "Mizuno Rebula Cup Elite MG",
        description: "Элитные бутсы для мультигрунта с технологией 3D Control Panel для превосходного контроля мяча.",
        price: 26900,
        oldPrice: 0,
        category: "mg",
        size: [40, 41, 42, 43, 44],
        brand: "mizuno",
        rating: 4.7,
        reviews: 56,
        image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        badge: "new",
        inStock: true,
        popular: false,
        features: ["3D Control Panel", "MG шипы", "Кожа кенгуру", "Элитный уровень"]
    },
    {
        id: 12,
        name: "Puma Ultra Ultimate TF",
        description: "Ультралегкие бутсы для зала с технологией MATRYXEVO и углеродной пластиной для взрывного старта.",
        price: 19900,
        oldPrice: 23900,
        category: "tf",
        size: [38, 39, 40, 41, 42, 43, 44],
        brand: "puma",
        rating: 4.8,
        reviews: 102,
        image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        badge: "hit",
        inStock: true,
        popular: true,
        features: ["MATRYXEVO технология", "TF шипы", "Ультралегкие", "Скорость"]
    },
    {
        id: 13,
        name: "Adidas Predator Edge.1 AG",
        description: "Инновационные бутсы для искусственного газона с технологией Demonskin 2.0 для максимального контроля.",
        price: 25900,
        oldPrice: 28900,
        category: "ag",
        size: [39, 40, 41, 42, 43, 44, 45],
        brand: "adidas",
        rating: 4.7,
        reviews: 121,
        image: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        badge: "sale",
        inStock: true,
        popular: true,
        features: ["Demonskin 2.0", "AG шипы", "Контроль мяча", "Primeknit верх"]
    },
    {
        id: 14,
        name: "Nike Tiempo Legend 9 Academy TF",
        description: "Бутсы для зала начального уровня с кожей KangaLite и классическим дизайном для комфортной игры.",
        price: 12900,
        oldPrice: 15900,
        category: "tf",
        size: [38, 39, 40, 41, 42, 43, 44, 45],
        brand: "nike",
        rating: 4.5,
        reviews: 167,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        badge: "sale",
        inStock: true,
        popular: true,
        features: ["KangaLite кожа", "TF шипы", "Начальный уровень", "Комфорт"]
    },
    {
        id: 15,
        name: "Adidas Copa Sense.1 FG",
        description: "Бутсы с сенсорным контролем мяча. Технология Foam Pods для улучшенного ощущения мяча.",
        price: 23900,
        oldPrice: 27900,
        category: "fg",
        size: [40, 41, 42, 43, 44],
        brand: "adidas",
        rating: 4.6,
        reviews: 93,
        image: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        badge: "sale",
        inStock: true,
        popular: false,
        features: ["Foam Pods", "FG шипы", "Сенсорный контроль", "Кожа кенгуру"]
    },
    {
        id: 16,
        name: "Nike Phantom GT2 Elite FG",
        description: "Элитные бутсы с технологией Generative Texture для непредсказуемых движений и креативной игры.",
        price: 26900,
        oldPrice: 30900,
        category: "fg",
        size: [40, 41, 42, 43, 44, 45],
        brand: "nike",
        rating: 4.8,
        reviews: 108,
        image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        badge: "sale",
        inStock: true,
        popular: true,
        features: ["Generative Texture", "FG шипы", "Креативная игра", "Элитный уровень"]
    },
    {
        id: 17,
        name: "Mizuno Morelia Neo III Beta AG",
        description: "Японские бутсы ручной работы для искусственного газона. Невероятное качество и комфорт.",
        price: 32900,
        oldPrice: 0,
        category: "ag",
        size: [40, 41, 42, 43, 44],
        brand: "mizuno",
        rating: 4.9,
        reviews: 45,
        image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        badge: "new",
        inStock: true,
        popular: false,
        features: ["Ручная работа", "AG шипы", "MIJ (Япония)", "Кожа кенгуру"]
    },
    {
        id: 18,
        name: "Puma Future Z 1.4 FG/AG",
        description: "Гибридные бутсы для натурального и искусственного газона. Адаптивная система FUZIONFIT.",
        price: 21900,
        oldPrice: 25900,
        category: "fg",
        size: [39, 40, 41, 42, 43, 44],
        brand: "puma",
        rating: 4.7,
        reviews: 134,
        image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
        badge: "hit",
        inStock: true,
        popular: true,
        features: ["FUZIONFIT", "FG/AG шипы", "Гибридные", "Адаптивные"]
    }
];

// ===== ОСНОВНЫЕ ФУНКЦИИ =====

document.addEventListener('DOMContentLoaded', function() {
    initApp();
    loadData();
    renderProducts();
    updateCartCount();
    initEventListeners();
    loadAddress();
    updateProductsCount();
});

function initApp() {
    if (tg.initDataUnsafe?.user) {
        user = {
            id: tg.initDataUnsafe.user.id,
            username: tg.initDataUnsafe.user.username || `user_${tg.initDataUnsafe.user.id}`,
            firstName: tg.initDataUnsafe.user.first_name,
            lastName: tg.initDataUnsafe.user.last_name
        };
        
        if (tg.expand) tg.expand();
        if (tg.setHeaderColor) tg.setHeaderColor('#000000');
        if (tg.setBackgroundColor) tg.setBackgroundColor('#000000');
    } else {
        user = {
            id: 1,
            username: 'demo_user',
            firstName: 'Демо',
            lastName: 'Пользователь'
        };
    }
    
    saveToStorage(STORAGE_KEYS.USER, user);
}

function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error('Ошибка сохранения в localStorage:', e);
    }
}

function loadFromStorage(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
        console.error('Ошибка загрузки из localStorage:', e);
        return defaultValue;
    }
}

function loadData() {
    allProducts = PRODUCTS_DATA;
    filteredProducts = [...allProducts];
    cart = loadFromStorage(STORAGE_KEYS.CART, []);
    favorites = loadFromStorage(STORAGE_KEYS.FAVORITES, []);
    
    selectedCategories = ['fg', 'ag', 'mg', 'tf'];
    selectedBrands = ['nike', 'adidas', 'puma', 'mizuno'];
}

function loadAddress() {
    const savedAddress = loadFromStorage(STORAGE_KEYS.ADDRESS, '');
    if (savedAddress) {
        deliveryAddress = savedAddress;
        isAddressSaved = true;
        const addressInput = document.getElementById('deliveryAddress');
        if (addressInput) {
            addressInput.value = deliveryAddress;
        }
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

function updateProductsCount() {
    const countElement = document.getElementById('productsCount');
    if (countElement) {
        countElement.textContent = `${filteredProducts.length} моделей`;
    }
}

function renderStars(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) {
            stars += '<i class="fas fa-star"></i>';
        } else if (i === fullStars && hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    
    return stars;
}

function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    
    grid.innerHTML = '';
    
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const productsToShow = filteredProducts.slice(startIndex, endIndex);
    
    if (productsToShow.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-search" style="font-size: 3rem; color: var(--color-gray); margin-bottom: 20px;"></i>
                <h3 style="margin-bottom: 10px; color: var(--color-white);">Бутсы не найдены</h3>
                <p style="color: var(--color-gray-light); margin-bottom: 20px;">Попробуйте изменить параметры поиска или фильтры</p>
                <button class="btn-secondary" onclick="resetFilters()" style="margin: 0 auto;">
                    СБРОСИТЬ ФИЛЬТРЫ
                </button>
            </div>
        `;
        updatePagination();
        updateProductsCount();
        return;
    }
    
    productsToShow.forEach(product => {
        const isInCart = cart.some(item => item.id === product.id);
        const isInFavorites = favorites.some(item => item.id === product.id);
        
        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.id = product.id;
        
        let badgeHtml = '';
        if (product.badge === 'new') {
            badgeHtml = '<span class="product-badge new">НОВИНКА</span>';
        } else if (product.badge === 'sale') {
            badgeHtml = '<span class="product-badge sale">СКИДКА</span>';
        } else if (product.badge === 'hit') {
            badgeHtml = '<span class="product-badge hit">ХИТ</span>';
        }
        
        const discountPercent = product.oldPrice > 0 
            ? Math.round((1 - product.price / product.oldPrice) * 100)
            : 0;
        
        const typeName = getTypeName(product.category);
        const brandName = getBrandName(product.brand);
        
        card.innerHTML = `
            <div class="product-image-container">
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <div class="product-badges">
                    ${badgeHtml}
                </div>
            </div>
            
            <div class="product-info">
                <div class="product-brand">${brandName}</div>
                <h3 class="product-name">${product.name}</h3>
                
                <div class="product-meta">
                    <div class="product-type">
                        <i class="fas fa-running"></i>
                        <span>${typeName}</span>
                    </div>
                    <div class="product-rating">
                        ${renderStars(product.rating)} (${product.reviews})
                    </div>
                </div>
                
                <div class="product-price">
                    <span class="current-price">${product.price.toLocaleString()} ₽</span>
                    ${product.oldPrice > 0 ? `
                        <span class="old-price">${product.oldPrice.toLocaleString()} ₽</span>
                        ${discountPercent > 0 ? `<span class="discount">-${discountPercent}%</span>` : ''}
                    ` : ''}
                </div>
                
                <div class="product-actions">
                    <button class="btn-add-to-cart ${isInCart ? 'in-cart' : ''}" data-id="${product.id}">
                        ${isInCart ? '<i class="fas fa-check"></i> В КОРЗИНЕ' : '<i class="fas fa-shopping-bag"></i> В КОРЗИНУ'}
                    </button>
                    <button class="btn-favorite ${isInFavorites ? 'active' : ''}" data-id="${product.id}">
                        <i class="${isInFavorites ? 'fas' : 'far'} fa-heart"></i>
                    </button>
                </div>
            </div>
        `;
        
        grid.appendChild(card);
    });
    
    updatePagination();
    updateProductsCount();
    
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', function(e) {
            if (!e.target.closest('.btn-add-to-cart') && !e.target.closest('.btn-favorite')) {
                const productId = parseInt(this.dataset.id);
                const product = allProducts.find(p => p.id === productId);
                if (product) {
                    showProductModal(product);
                }
            }
        });
    });
}

function updatePagination() {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const pageNumbers = document.querySelector('.page-numbers');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    
    if (!pageNumbers || !prevBtn || !nextBtn) return;
    
    pageNumbers.innerHTML = '';
    
    let startPage = Math.max(1, currentPage - 1);
    let endPage = Math.min(totalPages, startPage + 2);
    
    if (endPage - startPage < 2) {
        startPage = Math.max(1, endPage - 2);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `page-number ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
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
    
    window.scrollTo({
        top: 500,
        behavior: 'smooth'
    });
}

function updateCartCount() {
    const headerCartCount = document.getElementById('headerCartCount');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (headerCartCount) {
        headerCartCount.textContent = totalItems;
        headerCartCount.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

function filterProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const sortBy = document.getElementById('sortBy').value;
    const priceSlider = document.getElementById('priceSlider');
    const currentPrice = priceSlider ? parseInt(priceSlider.value) : maxPrice;
    
    filteredProducts = allProducts.filter(product => {
        if (searchTerm && !product.name.toLowerCase().includes(searchTerm) && 
            !product.description.toLowerCase().includes(searchTerm) &&
            !getBrandName(product.brand).toLowerCase().includes(searchTerm)) {
            return false;
        }
        
        if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
            return false;
        }
        
        if (selectedBrands.length > 0 && !selectedBrands.includes(product.brand)) {
            return false;
        }
        
        if (selectedSizes.length > 0) {
            const hasSize = product.size.some(size => selectedSizes.includes(size));
            if (!hasSize) return false;
        }
        
        if (product.price > currentPrice) {
            return false;
        }
        
        return true;
    });
    
    switch(sortBy) {
        case 'new':
            filteredProducts.sort((a, b) => b.id - a.id);
            break;
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            filteredProducts.sort((a, b) => b.rating - a.rating);
            break;
        case 'popular':
        default:
            filteredProducts.sort((a, b) => {
                if (b.popular !== a.popular) {
                    return b.popular - a.popular;
                }
                if (b.rating !== a.rating) {
                    return b.rating - a.rating;
                }
                return b.reviews - a.reviews;
            });
            break;
    }
    
    currentPage = 1;
    renderProducts();
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('sortBy').value = 'popular';
    
    selectedCategories = ['fg', 'ag', 'mg', 'tf'];
    selectedBrands = ['nike', 'adidas', 'puma', 'mizuno'];
    selectedSizes = [];
    
    document.querySelectorAll('.filter-checkbox input').forEach(cb => {
        cb.checked = true;
    });
    
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    const priceSlider = document.getElementById('priceSlider');
    if (priceSlider) {
        priceSlider.value = maxPrice;
        updatePriceDisplay();
    }
    
    closeFilterPopup();
    
    filterProducts();
    
    showNotification('Фильтры сброшены', 'info');
}

function updatePriceDisplay() {
    const priceSlider = document.getElementById('priceSlider');
    const minPrice = document.getElementById('minPrice');
    const maxPriceDisplay = document.getElementById('maxPrice');
    
    if (priceSlider && minPrice && maxPriceDisplay) {
        maxPriceDisplay.textContent = parseInt(priceSlider.value).toLocaleString();
    }
}

function toggleCart(productId, event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    const existingItemIndex = cart.findIndex(item => item.id === productId);
    
    if (existingItemIndex !== -1) {
        cart.splice(existingItemIndex, 1);
        showNotification(`${product.name} удален из корзины`, 'info');
    } else {
        cart.push({
            ...product,
            quantity: 1,
            selectedSize: product.size[0],
            addedAt: new Date().toISOString()
        });
        showNotification(`${product.name} добавлен в корзину`, 'success');
    }
    
    saveToStorage(STORAGE_KEYS.CART, cart);
    
    updateCartCount();
    updateCartPopup();
    renderProducts();
}

function updateCartPopup() {
    const cartItems = document.getElementById('cartItems');
    const cartEmpty = document.getElementById('cartEmpty');
    const cartSubtotal = document.getElementById('cartSubtotal');
    const cartTotal = document.getElementById('cartTotal');
    
    if (!cartItems || !cartEmpty) return;
    
    if (cart.length === 0) {
        cartItems.style.display = 'none';
        cartEmpty.style.display = 'block';
        cartSubtotal.textContent = '0 ₽';
        cartTotal.textContent = '0 ₽';
        return;
    }
    
    cartItems.style.display = 'flex';
    cartEmpty.style.display = 'none';
    cartItems.innerHTML = '';
    
    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-info">
                <h4 class="cart-item-name">${item.name}</h4>
                <div class="cart-item-meta">
                    <span>${getTypeName(item.category)} • Размер: ${item.selectedSize || item.size[0]}</span>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-control">
                        <button class="quantity-btn minus" onclick="updateQuantity(${item.id}, -1)">-</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="10">
                        <button class="quantity-btn plus" onclick="updateQuantity(${item.id}, 1)">+</button>
                    </div>
                    <button class="remove-item" onclick="removeFromCart(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="cart-item-price">${(item.price * item.quantity).toLocaleString()} ₽</div>
        `;
        cartItems.appendChild(itemElement);
    });
    
    updateCartSummary();
    updateCheckoutButton();
}

function updateCartSummary() {
    const cartSubtotal = document.getElementById('cartSubtotal');
    const cartTotal = document.getElementById('cartTotal');
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    cartSubtotal.textContent = `${subtotal.toLocaleString()} ₽`;
    cartTotal.textContent = `${subtotal.toLocaleString()} ₽`;
}

function updateQuantity(productId, delta) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    
    item.quantity += delta;
    
    if (item.quantity < 1) item.quantity = 1;
    if (item.quantity > 10) item.quantity = 10;
    
    saveToStorage(STORAGE_KEYS.CART, cart);
    
    updateCartCount();
    updateCartPopup();
    renderProducts();
}

function removeFromCart(productId) {
    const product = cart.find(item => item.id === productId);
    cart = cart.filter(item => item.id !== productId);
    
    saveToStorage(STORAGE_KEYS.CART, cart);
    
    updateCartCount();
    updateCartPopup();
    renderProducts();
    
    if (product) {
        showNotification(`${product.name} удален из корзины`, 'info');
    }
}

function updateCheckoutButton() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (!checkoutBtn) return;
    
    const hasItems = cart.length > 0;
    
    if (!isAddressSaved || !deliveryAddress) {
        checkoutBtn.disabled = true;
        checkoutBtn.style.opacity = '0.5';
        checkoutBtn.style.cursor = 'not-allowed';
    } else if (!hasItems) {
        checkoutBtn.disabled = true;
        checkoutBtn.style.opacity = '0.5';
        checkoutBtn.style.cursor = 'not-allowed';
    } else {
        checkoutBtn.disabled = false;
        checkoutBtn.style.opacity = '1';
        checkoutBtn.style.cursor = 'pointer';
    }
}

function toggleFavorite(productId, event) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    
    const existingIndex = favorites.findIndex(item => item.id === productId);
    
    if (existingIndex !== -1) {
        favorites.splice(existingIndex, 1);
        showNotification(`${product.name} удален из избранного`, 'info');
    } else {
        favorites.push({
            ...product,
            addedAt: new Date().toISOString()
        });
        showNotification(`${product.name} добавлен в избранное`, 'success');
    }
    
    saveToStorage(STORAGE_KEYS.FAVORITES, favorites);
    
    updateFavoritesPopup();
    renderProducts();
}

function updateFavoritesPopup() {
    const favoritesItems = document.getElementById('favoritesItems');
    const favEmpty = document.getElementById('favEmpty');
    
    if (!favoritesItems || !favEmpty) return;
    
    if (favorites.length === 0) {
        favoritesItems.style.display = 'none';
        favEmpty.style.display = 'block';
    } else {
        favoritesItems.style.display = 'flex';
        favEmpty.style.display = 'none';
        
        favoritesItems.innerHTML = '';
        
        favorites.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'fav-item';
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="fav-item-image">
                <div class="fav-item-info">
                    <h4 class="fav-item-name">${item.name}</h4>
                    <div class="fav-item-price">${item.price.toLocaleString()} ₽</div>
                </div>
                <button class="fav-item-remove" onclick="removeFromFavorites(${item.id})">
                    <i class="fas fa-times"></i>
                </button>
            `;
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
        updateFavoritesPopup();
        renderProducts();
    }
}

function showProductModal(product) {
    const existingModal = document.getElementById('productModal');
    const existingOverlay = document.getElementById('productModalOverlay');
    
    if (existingModal) existingModal.remove();
    if (existingOverlay) existingOverlay.remove();
    
    const isInCart = cart.some(item => item.id === product.id);
    const isInFavorites = favorites.some(item => item.id === product.id);
    
    const discountPercent = product.oldPrice > 0 
        ? Math.round((1 - product.price / product.oldPrice) * 100)
        : 0;
    
    let badgeHtml = '';
    if (product.badge === 'new') {
        badgeHtml = '<span class="product-badge new">НОВИНКА</span>';
    } else if (product.badge === 'sale') {
        badgeHtml = '<span class="product-badge sale">СКИДКА</span>';
    } else if (product.badge === 'hit') {
        badgeHtml = '<span class="product-badge hit">ХИТ</span>';
    }
    
    const modal = document.createElement('div');
    modal.className = 'product-modal';
    modal.id = 'productModal';
    
    modal.innerHTML = `
        <div class="modal-header">
            <button class="modal-close" onclick="closeProductModal()">
                <i class="fas fa-times"></i>
            </button>
            ${badgeHtml}
        </div>
        
        <div class="modal-body">
            <div class="modal-image-section">
                <img src="${product.image}" alt="${product.name}" class="modal-product-image">
            </div>
            
            <div class="modal-info-section">
                <h2 class="modal-product-title">${product.name}</h2>
                
                <div class="modal-product-meta">
                    <span class="modal-brand">${getBrandName(product.brand)}</span>
                    <span class="modal-type">${getTypeName(product.category)}</span>
                    <span class="modal-rating">
                        ${renderStars(product.rating)} (${product.reviews} отзывов)
                    </span>
                </div>
                
                <div class="modal-description">
                    <h3><i class="fas fa-info-circle"></i> ОПИСАНИЕ</h3>
                    <p>${product.description}</p>
                </div>
                
                <div class="modal-specs">
                    <h3><i class="fas fa-cogs"></i> ХАРАКТЕРИСТИКИ</h3>
                    <div class="specs-grid">
                        ${product.features.map(feature => `
                            <div class="spec-item">${feature}</div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="modal-sizes">
                    <h3><i class="fas fa-ruler"></i> ДОСТУПНЫЕ РАЗМЕРЫ</h3>
                    <div class="sizes-grid">
                        ${product.size.map(size => `
                            <button class="size-option" data-size="${size}">${size}</button>
                        `).join('')}
                    </div>
                </div>
                
                <div class="modal-pricing">
                    <div class="modal-price-current">${product.price.toLocaleString()} ₽</div>
                    ${product.oldPrice > 0 ? `
                        <div class="modal-price-old">
                            <span>${product.oldPrice.toLocaleString()} ₽</span>
                            <span class="modal-discount">-${discountPercent}%</span>
                        </div>
                    ` : ''}
                </div>
                
                <div class="modal-actions">
                    <button class="btn-add-to-cart-modal ${isInCart ? 'in-cart' : ''}" data-id="${product.id}">
                        <i class="fas ${isInCart ? 'fa-check' : 'fa-shopping-bag'}"></i>
                        ${isInCart ? 'В КОРЗИНЕ' : 'ДОБАВИТЬ В КОРЗИНУ'}
                    </button>
                    <button class="btn-favorite-modal ${isInFavorites ? 'active' : ''}" data-id="${product.id}">
                        <i class="${isInFavorites ? 'fas' : 'far'} fa-heart"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'productModalOverlay';
    overlay.onclick = closeProductModal;
    document.body.appendChild(overlay);
    
    setTimeout(() => {
        modal.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }, 10);
    
    setTimeout(() => {
        const cartBtn = modal.querySelector('.btn-add-to-cart-modal');
        const favBtn = modal.querySelector('.btn-favorite-modal');
        
        if (cartBtn) {
            cartBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const productId = parseInt(this.dataset.id);
                toggleCart(productId, e);
                
                setTimeout(() => {
                    const isNowInCart = cart.some(item => item.id === productId);
                    if (isNowInCart) {
                        this.innerHTML = '<i class="fas fa-check"></i> В КОРЗИНЕ';
                        this.classList.add('in-cart');
                    } else {
                        this.innerHTML = '<i class="fas fa-shopping-bag"></i> ДОБАВИТЬ В КОРЗИНУ';
                        this.classList.remove('in-cart');
                    }
                }, 100);
            });
        }
        
        if (favBtn) {
            favBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                const productId = parseInt(this.dataset.id);
                toggleFavorite(productId, e);
                
                setTimeout(() => {
                    const isNowInFav = favorites.some(item => item.id === productId);
                    if (isNowInFav) {
                        this.innerHTML = '<i class="fas fa-heart"></i>';
                        this.classList.add('active');
                    } else {
                        this.innerHTML = '<i class="far fa-heart"></i>';
                        this.classList.remove('active');
                    }
                }, 100);
            });
        }
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeProductModal();
            }
        });
    }, 20);
}

function closeProductModal() {
    const modal = document.getElementById('productModal');
    const overlay = document.getElementById('productModalOverlay');
    
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }
    
    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 300);
    }
    
    document.body.style.overflow = 'auto';
}

function getTypeName(type) {
    const types = {
        'fg': 'FG (Газон)',
        'ag': 'AG (Искусств.)',
        'mg': 'MG (Мульти)',
        'tf': 'TF (Зал)',
        'limited': 'Лимит'
    };
    return types[type] || type;
}

function getBrandName(brand) {
    const brands = {
        'nike': 'Nike',
        'adidas': 'Adidas',
        'puma': 'Puma',
        'mizuno': 'Mizuno'
    };
    return brands[brand] || brand;
}

function showNotification(message, type = 'info') {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'warning') icon = 'exclamation-circle';
    if (type === 'error') icon = 'times-circle';
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function initEventListeners() {
    document.getElementById('searchInput')?.addEventListener('input', function() {
        clearTimeout(this._timer);
        this._timer = setTimeout(() => {
            filterProducts();
        }, 500);
    });
    
    document.getElementById('searchInput')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            filterProducts();
        }
    });
    
    document.getElementById('sortBy')?.addEventListener('change', filterProducts);
    
    document.getElementById('filterBtn')?.addEventListener('click', openFilterPopup);
    document.getElementById('applyFilters')?.addEventListener('click', applyFilters);
    document.getElementById('resetFilters')?.addEventListener('click', resetFilters);
    
    document.getElementById('cartBtn')?.addEventListener('click', openCartPopup);
    document.getElementById('closeCart')?.addEventListener('click', closeCartPopup);
    document.getElementById('checkoutBtn')?.addEventListener('click', checkoutOrder);
    document.getElementById('continueShopping')?.addEventListener('click', closeCartPopup);
    
    document.getElementById('favoritesBtn')?.addEventListener('click', openFavoritesPopup);
    document.getElementById('closeFavorites')?.addEventListener('click', closeFavoritesPopup);
    document.getElementById('browseCatalog')?.addEventListener('click', closeFavoritesPopup);
    
    document.getElementById('navFavoritesBottom')?.addEventListener('click', openFavoritesPopup);
    
    document.getElementById('deliveryAddress')?.addEventListener('input', function() {
        clearTimeout(this._timer);
        this._timer = setTimeout(() => {
            if (this.value.trim()) {
                deliveryAddress = this.value.trim();
                isAddressSaved = true;
                saveToStorage(STORAGE_KEYS.ADDRESS, deliveryAddress);
                updateCheckoutButton();
            }
        }, 1000);
    });
    
    document.getElementById('deliveryAddress')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            saveAddress();
        }
    });
    
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.dataset.category;
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            if (category === 'all') {
                selectedCategories = ['fg', 'ag', 'mg', 'tf'];
            } else {
                selectedCategories = [category];
            }
            
            filterProducts();
        });
    });
    
    document.querySelectorAll('.filter-checkbox input').forEach(cb => {
        cb.addEventListener('change', function() {
            const name = this.name;
            const value = this.value;
            const isChecked = this.checked;
            
            if (name === 'type') {
                if (isChecked) {
                    if (!selectedCategories.includes(value)) {
                        selectedCategories.push(value);
                    }
                } else {
                    const index = selectedCategories.indexOf(value);
                    if (index > -1) {
                        selectedCategories.splice(index, 1);
                    }
                }
            } else if (name === 'brand') {
                if (isChecked) {
                    if (!selectedBrands.includes(value)) {
                        selectedBrands.push(value);
                    }
                } else {
                    const index = selectedBrands.indexOf(value);
                    if (index > -1) {
                        selectedBrands.splice(index, 1);
                    }
                }
            }
        });
    });
    
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const size = this.dataset.size;
            this.classList.toggle('active');
            
            if (this.classList.contains('active')) {
                if (!selectedSizes.includes(parseFloat(size))) {
                    selectedSizes.push(parseFloat(size));
                }
            } else {
                const index = selectedSizes.indexOf(parseFloat(size));
                if (index > -1) {
                    selectedSizes.splice(index, 1);
                }
            }
        });
    });
    
    document.getElementById('priceSlider')?.addEventListener('input', function() {
        updatePriceDisplay();
    });
    
    document.addEventListener('click', function(event) {
        const target = event.target;
        
        const cartBtn = target.closest('.btn-add-to-cart');
        if (cartBtn) {
            event.stopPropagation();
            const productId = parseInt(cartBtn.dataset.id);
            if (productId) {
                toggleCart(productId, event);
                
                setTimeout(() => {
                    const isNowInCart = cart.some(item => item.id === productId);
                    if (isNowInCart) {
                        cartBtn.innerHTML = '<i class="fas fa-check"></i> В КОРЗИНЕ';
                        cartBtn.classList.add('in-cart');
                    } else {
                        cartBtn.innerHTML = '<i class="fas fa-shopping-bag"></i> В КОРЗИНУ';
                        cartBtn.classList.remove('in-cart');
                    }
                }, 100);
            }
            return;
        }
        
        const favBtn = target.closest('.btn-favorite');
        if (favBtn) {
            event.stopPropagation();
            const productId = parseInt(favBtn.dataset.id);
            if (productId) {
                toggleFavorite(productId, event);
                
                setTimeout(() => {
                    const isNowInFav = favorites.some(item => item.id === productId);
                    if (isNowInFav) {
                        favBtn.innerHTML = '<i class="fas fa-heart"></i>';
                        favBtn.classList.add('active');
                    } else {
                        favBtn.innerHTML = '<i class="far fa-heart"></i>';
                        favBtn.classList.remove('active');
                    }
                }, 100);
            }
            return;
        }
    });
}

function openFilterPopup() {
    document.getElementById('filterPopup').classList.add('active');
    document.getElementById('filterOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeFilterPopup() {
    document.getElementById('filterPopup').classList.remove('active');
    document.getElementById('filterOverlay').classList.remove('active');
    document.body.style.overflow = 'auto';
}

function applyFilters() {
    filterProducts();
    closeFilterPopup();
    showNotification('Фильтры применены', 'success');
}

function openCartPopup() {
    document.getElementById('cartPopup').classList.add('active');
    document.getElementById('cartOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
    updateCartPopup();
}

function closeCartPopup() {
    document.getElementById('cartPopup').classList.remove('active');
    document.getElementById('cartOverlay').classList.remove('active');
    document.body.style.overflow = 'auto';
}

function openFavoritesPopup() {
    document.getElementById('favoritesPopup').classList.add('active');
    document.getElementById('favoritesOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
    updateFavoritesPopup();
}

function closeFavoritesPopup() {
    document.getElementById('favoritesPopup').classList.remove('active');
    document.getElementById('favoritesOverlay').classList.remove('active');
    document.body.style.overflow = 'auto';
}

function checkoutOrder() {
    if (cart.length === 0) {
        showNotification('Добавьте товары в корзину', 'info');
        return;
    }
    
    if (!isAddressSaved || !deliveryAddress) {
        showNotification('Сначала укажите адрес доставки', 'warning');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const orderItems = cart.map(item => 
        `${item.name} (${getTypeName(item.category)}, Размер: ${item.selectedSize || item.size[0]}) - ${item.quantity} × ${item.price.toLocaleString()}₽ = ${(item.price * item.quantity).toLocaleString()}₽`
    ).join('\n');
    
    const orderText = `
⚽ **НОВЫЙ ЗАКАЗ ФУТБОЛЬНЫХ БУТС**

👟 **Товары:**
${orderItems}

💰 **Итого:** ${total.toLocaleString()}₽
📍 **Адрес доставки:** ${deliveryAddress}
📅 **Дата:** ${new Date().toLocaleString('ru-RU')}

📞 **Связь:** @EDM_Sneakers
👤 **Покупатель:** ${user.firstName} ${user.lastName || ''}
    `.trim();
    
    if (tg.sendData) {
        const orderData = {
            userId: user.id,
            username: user.username,
            items: cart,
            total: total,
            deliveryAddress: deliveryAddress,
            timestamp: new Date().toISOString()
        };
        
        tg.sendData(JSON.stringify(orderData));
        tg.showAlert(`Заказ оформлен!\n\nСумма: ${total.toLocaleString()}₽\nТоваров: ${cart.length}\nАдрес: ${deliveryAddress}\n\nС вами свяжется менеджер для подтверждения.`);
    } else {
        const telegramUrl = `https://t.me/EDM_Sneakers?text=${encodeURIComponent(orderText)}`;
        window.open(telegramUrl, '_blank');
        showNotification(`Заказ на ${total.toLocaleString()}₽ отправлен менеджеру`, 'success');
    }
    
    cart = [];
    saveToStorage(STORAGE_KEYS.CART, cart);
    updateCartCount();
    updateCartPopup();
    renderProducts();
    
    closeCartPopup();
}

// CSS для уведомлений
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: var(--color-black);
        border: 1px solid var(--color-white);
        border-radius: var(--radius-md);
        padding: var(--space-sm) var(--space-md);
        color: var(--color-white);
        font-weight: 500;
        z-index: 10000;
        box-shadow: var(--shadow-lg);
        transform: translateX(100%);
        opacity: 0;
        transition: all 0.3s ease;
        max-width: 300px;
        display: flex;
        align-items: center;
        gap: var(--space-sm);
    }
    
    .notification.show {
        transform: translateX(0);
        opacity: 1;
    }
    
    .notification-success {
        border-color: var(--color-success);
        background-color: rgba(0, 214, 143, 0.1);
    }
    
    .notification-warning {
        border-color: var(--color-warning);
        background-color: rgba(255, 170, 0, 0.1);
    }
    
    .notification-error {
        border-color: var(--color-danger);
        background-color: rgba(255, 61, 113, 0.1);
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: var(--space-sm);
    }
`;

document.head.appendChild(notificationStyles);

console.log('EDM™ Football Boots Shop приложение инициализировано');