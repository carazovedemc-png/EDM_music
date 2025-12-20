[file name]: script.js
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
let selectedSizes = [];

// Ключи для localStorage
const STORAGE_KEYS = {
    CART: 'edm_sneakers_cart',
    FAVORITES: 'edm_sneakers_favorites',
    USER: 'edm_sneakers_user',
    ADDRESS: 'edm_sneakers_address'
};

// КРОССОВКИ
const PRODUCTS_DATA = [
    {
        id: 1,
        name: "Nike Air Jordan 1 Retro High",
        description: "Культовые кроссовки Nike Air Jordan 1 Retro High в классической красно-черно-белой цветовой гамме. Высококачественная кожа, оригинальная подошва, идеально для коллекционеров и повседневной носки.",
        price: 24500,
        oldPrice: 29900,
        category: "sneakers",
        size: [40, 41, 42, 43, 44],
        brand: "Nike",
        rating: 4.9,
        reviews: 412,
        image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        badge: "hit",
        inStock: true,
        popular: true,
        specs: ["Высокое голенище", "Кожаный верх", "Воздушная подошва", "Оригинал"]
    },
    {
        id: 2,
        name: "Adidas Yeezy Boost 350 V2",
        description: "Adidas Yeezy Boost 350 V2 в цвете 'Zebra' - ультрамодные кроссовки с технологией Boost для максимального комфорта. Primeknit верх обеспечивает идеальную посадку.",
        price: 32000,
        oldPrice: 0,
        category: "sneakers",
        size: [39, 40, 41, 42, 43, 44],
        brand: "Adidas",
        rating: 4.8,
        reviews: 389,
        image: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        badge: "new",
        inStock: true,
        popular: true,
        specs: ["Primeknit верх", "Технология Boost", "Стиль Zebra", "Оригинал"]
    },
    {
        id: 3,
        name: "New Balance 550",
        description: "New Balance 550 - ретро-баскетбольные кроссовки, вернувшиеся в моду. Классический дизайн, кожаный верх и комфортная амортизация. Идеальный выбор для городского стиля.",
        price: 12500,
        oldPrice: 14900,
        category: "basketball",
        size: [40, 41, 42, 43, 44, 45],
        brand: "New Balance",
        rating: 4.7,
        reviews: 267,
        image: "https://images.unsplash.com/photo-1605348532760-6753d2c43329?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        badge: "sale",
        inStock: true,
        popular: true,
        specs: ["Кожаный верх", "Баскетбольный стиль", "Ретро дизайн", "Комфорт"]
    },
    {
        id: 4,
        name: "Nike Dunk Low 'Panda'",
        description: "Nike Dunk Low в классическом черно-белом цвете 'Panda'. Универсальные кроссовки, которые подходят к любому образу. Качественная кожа и культовый силуэт.",
        price: 18900,
        oldPrice: 21900,
        category: "sneakers",
        size: [38, 39, 40, 41, 42, 43],
        brand: "Nike",
        rating: 4.9,
        reviews: 512,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        badge: "hit",
        inStock: true,
        popular: true,
        specs: ["Низкое голенище", "Кожаный верх", "Черно-белый", "Универсальные"]
    },
    {
        id: 5,
        name: "Adidas Ultraboost 22",
        description: "Adidas Ultraboost 22 - лучшие беговые кроссовки с технологией Boost. Максимальная амортизация и возврат энергии для эффективных тренировок.",
        price: 15900,
        oldPrice: 0,
        category: "running",
        size: [40, 41, 42, 43, 44, 45],
        brand: "Adidas",
        rating: 4.8,
        reviews: 421,
        image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        badge: null,
        inStock: true,
        popular: true,
        specs: ["Технология Boost", "Беговые", "Primeknit верх", "Энерго возврат"]
    },
    {
        id: 6,
        name: "Converse Chuck Taylor All Star",
        description: "Легендарные Converse Chuck Taylor All Star в классическом черном цвете. Канвасовый верх, резиновая подошва. Икона уличной моды на все времена.",
        price: 5900,
        oldPrice: 6900,
        category: "sneakers",
        size: [39, 40, 41, 42, 43, 44],
        brand: "Converse",
        rating: 4.6,
        reviews: 892,
        image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        badge: "sale",
        inStock: true,
        popular: false,
        specs: ["Канвасовый верх", "Классика", "Резиновая подошва", "Унисекс"]
    },
    {
        id: 7,
        name: "Air Jordan 4 Retro 'Military Black'",
        description: "Air Jordan 4 Retro в цвете 'Military Black' - лимитированная серия. Премиум материалы, уникальный дизайн и культовый силуэт для истинных коллекционеров.",
        price: 42000,
        oldPrice: 0,
        category: "limited",
        size: [41, 42, 43, 44],
        brand: "Nike",
        rating: 4.9,
        reviews: 187,
        image: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        badge: "new",
        inStock: true,
        popular: true,
        specs: ["Лимитированная серия", "Премиум кожа", "Уникальный дизайн", "Коллекционные"]
    },
    {
        id: 8,
        name: "Nike Air Force 1 '07",
        description: "Культовые Nike Air Force 1 в белом цвете. Самые популярные кроссовки в истории, которые остаются актуальными уже несколько десятилетий.",
        price: 12900,
        oldPrice: 14900,
        category: "sneakers",
        size: [38, 39, 40, 41, 42, 43, 44, 45],
        brand: "Nike",
        rating: 4.8,
        reviews: 1245,
        image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        badge: "hit",
        inStock: true,
        popular: true,
        specs: ["Кожаный верх", "Белый цвет", "Воздушная подошва", "Культовые"]
    },
    {
        id: 9,
        name: "Adidas Forum 84 Low",
        description: "Adidas Forum 84 Low - ретро-баскетбольные кроссовки с современными технологиями. Классический дизайн 80-х в современном исполнении.",
        price: 11500,
        oldPrice: 0,
        category: "basketball",
        size: [40, 41, 42, 43, 44],
        brand: "Adidas",
        rating: 4.5,
        reviews: 198,
        image: "https://images.unsplash.com/photo-1605348532760-6753d2c43329?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        badge: null,
        inStock: true,
        popular: true,
        specs: ["Ретро стиль", "Баскетбольные", "Кожаный верх", "Низкое голенище"]
    },
    {
        id: 10,
        name: "Nike Blazer Mid '77 Vintage",
        description: "Nike Blazer Mid '77 Vintage - винтажные кроссовки с историей. Толстая резиновая подошва, канвасовый верх и культовый силуэт 70-х годов.",
        price: 13900,
        oldPrice: 15900,
        category: "sneakers",
        size: [39, 40, 41, 42, 43],
        brand: "Nike",
        rating: 4.7,
        reviews: 312,
        image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        badge: "sale",
        inStock: true,
        popular: true,
        specs: ["Винтажный стиль", "Канвасовый верх", "Среднее голенище", "Ретро"]
    },
    {
        id: 11,
        name: "Puma Suede Classic",
        description: "Puma Suede Classic - икона хип-хоп культуры. Замшевый верх, классический силуэт и узнаваемый дизайн. Подлинная классика уличной моды.",
        price: 8900,
        oldPrice: 10900,
        category: "sneakers",
        size: [38, 39, 40, 41, 42, 43],
        brand: "Puma",
        rating: 4.6,
        reviews: 456,
        image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        badge: "sale",
        inStock: true,
        popular: false,
        specs: ["Замшевый верх", "Классика", "Низкое голенище", "Уличный стиль"]
    },
    {
        id: 12,
        name: "Nike Air Max 97",
        description: "Nike Air Max 97 с волнообразным дизайном и полной воздушной подошвой. Футуристичный вид и максимальный комфорт для повседневной носки.",
        price: 17900,
        oldPrice: 19900,
        category: "sneakers",
        size: [40, 41, 42, 43, 44, 45],
        brand: "Nike",
        rating: 4.8,
        reviews: 389,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        badge: "hit",
        inStock: true,
        popular: true,
        specs: ["Полная Air подошва", "Волнообразный дизайн", "Футуристичный", "Комфорт"]
    },
    {
        id: 13,
        name: "Reebok Classic Leather",
        description: "Reebok Classic Leather - минималистичные кроссовки из премиальной кожи. Чистый дизайн, универсальность и непревзойденный комфорт.",
        price: 9900,
        oldPrice: 0,
        category: "sneakers",
        size: [39, 40, 41, 42, 43],
        brand: "Reebok",
        rating: 4.5,
        reviews: 234,
        image: "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        badge: null,
        inStock: true,
        popular: false,
        specs: ["Кожаный верх", "Минимализм", "Универсальные", "Классика"]
    },
    {
        id: 14,
        name: "Nike Air Max 90",
        description: "Nike Air Max 90 - культовые кроссовки с видимой воздушной подошвой. Легендарный дизайн, проверенный временем комфорт и узнаваемый силуэт.",
        price: 14900,
        oldPrice: 16900,
        category: "sneakers",
        size: [38, 39, 40, 41, 42, 43, 44],
        brand: "Nike",
        rating: 4.8,
        reviews: 678,
        image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        badge: "sale",
        inStock: true,
        popular: true,
        specs: ["Видимая Air подошва", "Культовые", "Комфорт", "Узнаваемый дизайн"]
    },
    {
        id: 15,
        name: "Adidas Superstar",
        description: "Adidas Superstar с характерным мыском в виде ракушки. Икона уличной моды, которая остается актуальной уже более 50 лет.",
        price: 10900,
        oldPrice: 12900,
        category: "sneakers",
        size: [38, 39, 40, 41, 42, 43, 44],
        brand: "Adidas",
        rating: 4.7,
        reviews: 512,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        badge: "hit",
        inStock: true,
        popular: true,
        specs: ["Ракушечный мысок", "Кожаный верх", "Классика", "Универсальные"]
    },
    {
        id: 16,
        name: "Nike ZoomX Vaporfly Next% 2",
        description: "Nike ZoomX Vaporfly Next% 2 - революционные беговые кроссовки для марафонов. Технология ZoomX и углеродная пластина для максимальной эффективности.",
        price: 24900,
        oldPrice: 0,
        category: "running",
        size: [40, 41, 42, 43, 44],
        brand: "Nike",
        rating: 4.9,
        reviews: 289,
        image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        badge: "new",
        inStock: true,
        popular: true,
        specs: ["Технология ZoomX", "Углеродная пластина", "Марафонные", "Эффективность"]
    },
    {
        id: 17,
        name: "Jordan Why Not Zer0.5",
        description: "Jordan Why Not Zer0.5 - баскетбольные кроссовки Рассела Уэстбрука. Агрессивный дизайн, максимальная поддержка и передовые технологии для игры.",
        price: 18900,
        oldPrice: 21900,
        category: "basketball",
        size: [41, 42, 43, 44, 45],
        brand: "Jordan",
        rating: 4.7,
        reviews: 156,
        image: "https://images.unsplash.com/photo-1605348532760-6753d2c43329?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        badge: "sale",
        inStock: true,
        popular: true,
        specs: ["Баскетбольные", "Поддержка", "Технологичные", "Агрессивный дизайн"]
    },
    {
        id: 18,
        name: "EDM™ Limited Edition Pro",
        description: "Эксклюзивная лимитированная серия кроссовок от EDM™. Премиальные материалы, уникальный дизайн и передовые технологии. Только 500 пар по всему миру.",
        price: 55000,
        oldPrice: 0,
        category: "limited",
        size: [40, 41, 42, 43],
        brand: "EDM",
        rating: 5.0,
        reviews: 89,
        image: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
        badge: "new",
        inStock: true,
        popular: true,
        specs: ["Лимитированные", "Премиум материалы", "Уникальный дизайн", "Эксклюзив"]
    },
];

// ===== ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ =====
document.addEventListener('DOMContentLoaded', function() {
    initApp();
    loadData();
    renderProducts();
    updateCartCount();
    setupFilterPopup();
    initEventListeners();
    loadAddress();
    setupSizeFilters();
});

function initApp() {
    // Инициализация Telegram WebApp
    if (tg.initDataUnsafe?.user) {
        user = {
            id: tg.initDataUnsafe.user.id,
            username: tg.initDataUnsafe.user.username || `user_${tg.initDataUnsafe.user.id}`,
            firstName: tg.initDataUnsafe.user.first_name,
            lastName: tg.initDataUnsafe.user.last_name
        };
        
        tg.expand();
        tg.setHeaderColor('#0a0a0a');
        tg.setBackgroundColor('#0a0a0a');
    } else {
        // Режим демо (вне Telegram)
        user = {
            id: 1,
            username: 'demo_user',
            firstName: 'Демо',
            lastName: 'Пользователь'
        };
    }
    
    // Сохраняем пользователя в localStorage
    saveToStorage(STORAGE_KEYS.USER, user);
}

// ===== LOCALSTORAGE ФУНКЦИИ =====
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
    // Загружаем товары
    allProducts = PRODUCTS_DATA;
    filteredProducts = [...allProducts];
    
    // Загружаем корзину из localStorage
    cart = loadFromStorage(STORAGE_KEYS.CART, []);
    
    // Загружаем избранное из localStorage
    favorites = loadFromStorage(STORAGE_KEYS.FAVORITES, []);
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

// ===== ФИЛЬТРЫ РАЗМЕРОВ =====
function setupSizeFilters() {
    const sizeButtons = document.querySelectorAll('.size-btn');
    sizeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const size = parseInt(this.dataset.size);
            this.classList.toggle('active');
            
            if (this.classList.contains('active')) {
                if (!selectedSizes.includes(size)) {
                    selectedSizes.push(size);
                }
            } else {
                const index = selectedSizes.indexOf(size);
                if (index > -1) {
                    selectedSizes.splice(index, 1);
                }
            }
        });
    });
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
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <i class="fas fa-search" style="font-size: 3rem; color: var(--color-text-muted); margin-bottom: 20px;"></i>
                <h3 style="margin-bottom: 10px; color: var(--color-text);">Кроссовки не найдены</h3>
                <p style="color: var(--color-text-secondary); margin-bottom: 20px;">Попробуйте изменить параметры поиска или фильтры</p>
                <button class="btn-filter-reset" onclick="resetFilters()" style="margin: 0 auto;">СБРОСИТЬ ФИЛЬТРЫ</button>
            </div>
        `;
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
            badgeHtml = '<span class="badge-new">НОВИНКА</span>';
        } else if (product.badge === 'sale') {
            badgeHtml = '<span class="badge-sale">СКИДКА</span>';
        } else if (product.badge === 'hit') {
            badgeHtml = '<span class="badge-hit">ХИТ</span>';
        }
        
        const discountPercent = product.oldPrice > 0 
            ? Math.round((1 - product.price / product.oldPrice) * 100)
            : 0;
        
        const sizesText = product.size.slice(0, 3).join(', ') + (product.size.length > 3 ? '...' : '');
        
        card.innerHTML = `
            <div class="product-badges">
                ${badgeHtml}
            </div>
            <img src="${product.image}" alt="${product.name}" class="product-image">
            
            <div class="product-prices-top">
                <span class="price-current">${product.price.toLocaleString()} ₽</span>
                ${product.oldPrice > 0 ? `
                    <div class="price-old-wrapper">
                        <span class="price-old">${product.oldPrice.toLocaleString()} ₽</span>
                        <span class="discount-percent">-${discountPercent}%</span>
                    </div>
                ` : ''}
            </div>
            
            <h3 class="product-title">${product.name}</h3>
            
            <div class="product-description-short">
                <i class="fas fa-ruler"></i> Размеры: ${sizesText}<br>
                <i class="fas fa-tag"></i> ${getBrandName(product.brand)}
            </div>
            
            <div class="product-rating-wb">
                <div class="rating-stars">
                    ${renderStars(product.rating)}
                </div>
                <span class="rating-value-wb">${product.rating}</span>
                <span class="reviews-count-wb">${product.reviews} оценок</span>
            </div>
            
            <div class="product-actions-wb">
                <button class="btn-cart-wb ${isInCart ? 'in-cart' : ''}" data-id="${product.id}">
                    ${isInCart ? '<i class="fas fa-check"></i>' : '<i class="fas fa-shopping-cart"></i>'}
                    <span>${isInCart ? 'В КОРЗИНЕ' : 'В КОРЗИНУ'}</span>
                </button>
                <button class="btn-fav-wb ${isInFavorites ? 'active' : ''}" data-id="${product.id}">
                    <i class="${isInFavorites ? 'fas' : 'far'} fa-heart"></i>
                </button>
            </div>
        `;
        
        grid.appendChild(card);
    });
    
    updatePagination();
    
    // Добавляем обработчики кликов на карточки
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', function(e) {
            if (!e.target.closest('.btn-cart-wb') && !e.target.closest('.btn-fav-wb')) {
                const productId = parseInt(this.dataset.id);
                const product = allProducts.find(p => p.id === productId);
                if (product) {
                    showProductDetailsModal(product);
                }
            }
        });
    });
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

// ===== ПАГИНАЦИЯ =====
function updatePagination() {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    const pageNumbers = document.getElementById('pageNumbers');
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
        pageBtn.className = `page-btn ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.dataset.page = i;
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
    if (mainContent) {
        mainContent.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// ===== КОРЗИНА =====
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
                <button class="btn-browse-angular" onclick="closeCartPopup()">ПЕРЕЙТИ К ПОКУПКАМ</button>
            </div>
        `;
        cartTotal.textContent = '0 ₽';
        cartFinal.textContent = '0 ₽';
        return;
    }
    
    cartItems.innerHTML = '';
    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'cart-item';
        itemElement.innerHTML = `
            <div class="cart-item-content">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <div class="cart-item-meta">
                        <span class="cart-item-size"><i class="fas fa-ruler"></i> Размер: ${item.selectedSize || item.size[0]}</span>
                        <span class="cart-item-brand"><i class="fas fa-tag"></i> ${getBrandName(item.brand)}</span>
                    </div>
                </div>
                <div class="cart-item-price">${item.price.toLocaleString()} ₽</div>
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
            </div>
        `;
        cartItems.appendChild(itemElement);
    });
    
    updateCartSummary();
    updateCheckoutButton();
}

function updateCartSummary() {
    const cartTotal = document.getElementById('cartTotal');
    const cartFinal = document.getElementById('cartFinal');
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = cart.reduce((sum, item) => {
        if (item.oldPrice > 0) {
            return sum + ((item.oldPrice - item.price) * item.quantity);
        }
        return sum;
    }, 0);
    const total = subtotal - discount;
    
    cartTotal.textContent = `${subtotal.toLocaleString()} ₽`;
    cartFinal.textContent = `${total.toLocaleString()} ₽`;
}

function updateQuantity(productId, delta, newValue = null) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    
    if (newValue !== null) {
        item.quantity = parseInt(newValue) || 1;
    } else {
        item.quantity += delta;
    }
    
    if (item.quantity < 1) item.quantity = 1;
    if (item.quantity > 10) item.quantity = 10;
    
    saveToStorage(STORAGE_KEYS.CART, cart);
    
    updateCartCount();
    updateCartPopup();
    renderProducts();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    
    saveToStorage(STORAGE_KEYS.CART, cart);
    
    updateCartCount();
    updateCartPopup();
    renderProducts();
    
    showNotification('Товар удален из корзины', 'info');
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

// ===== ИЗБРАННОЕ =====
function updateFavoritesPopup() {
    const favoritesItems = document.getElementById('favoritesItems');
    const favEmpty = document.getElementById('favEmpty');
    
    if (!favoritesItems || !favEmpty) return;
    
    if (favorites.length === 0) {
        favoritesItems.style.display = 'none';
        favEmpty.style.display = 'flex';
    } else {
        favoritesItems.style.display = 'block';
        favEmpty.style.display = 'none';
        
        favoritesItems.innerHTML = '';
        
        favorites.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'fav-item';
            itemElement.dataset.id = item.id;
            
            itemElement.innerHTML = `
                <div class="fav-item-content">
                    <img src="${item.image}" alt="${item.name}" class="fav-item-img">
                    <div class="fav-item-details">
                        <h4 class="fav-item-title">${item.name}</h4>
                        <div class="fav-item-price">${item.price.toLocaleString()} ₽</div>
                        <div class="fav-item-meta">
                            <span class="fav-item-size"><i class="fas fa-ruler"></i> Размеры: ${item.size.slice(0, 3).join(', ')}${item.size.length > 3 ? '...' : ''}</span>
                            <span class="fav-item-brand"><i class="fas fa-tag"></i> ${getBrandName(item.brand)}</span>
                        </div>
                    </div>
                    <button class="remove-from-fav" onclick="removeFromFavorites(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <button class="btn-add-to-cart-from-fav" onclick="toggleCart(${item.id})">
                    <i class="fas fa-shopping-cart"></i> В КОРЗИНУ
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

// ===== МОДАЛЬНОЕ ОКНО ТОВАРА =====
function showProductDetailsModal(product) {
    const existingModal = document.getElementById('productDetailsModal');
    const existingOverlay = document.querySelector('.product-modal-overlay');
    if (existingModal) existingModal.remove();
    if (existingOverlay) existingOverlay.remove();
    
    const modal = document.createElement('div');
    modal.className = 'product-details-modal';
    modal.id = 'productDetailsModal';
    
    const isInCart = cart.some(item => item.id === product.id);
    const isInFavorites = favorites.some(item => item.id === product.id);
    
    const discountPercent = product.oldPrice > 0 
        ? Math.round((1 - product.price / product.oldPrice) * 100)
        : 0;
    
    let badgeHtml = '';
    if (product.badge === 'new') {
        badgeHtml = '<span class="modal-badge modal-badge-new">НОВИНКА</span>';
    } else if (product.badge === 'sale') {
        badgeHtml = '<span class="modal-badge modal-badge-sale">СКИДКА</span>';
    } else if (product.badge === 'hit') {
        badgeHtml = '<span class="modal-badge modal-badge-hit">ХИТ</span>';
    }
    
    const specsHtml = product.specs ? 
        product.specs.map(spec => `<div class="spec-item">${spec}</div>`).join('') : 
        '';
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <button class="modal-close-btn" id="closeDetailsModalBtn">
                    <i class="fas fa-times"></i>
                </button>
                ${badgeHtml}
            </div>
            
            <div class="modal-body">
                <div class="product-image-section">
                    <img src="${product.image}" alt="${product.name}" class="modal-product-image">
                </div>
                
                <div class="product-info-section">
                    <h2 class="modal-product-title">${product.name}</h2>
                    
                    <div class="product-meta">
                        <span class="meta-category">
                            <i class="fas fa-tag"></i> ${getCategoryName(product.category)}
                        </span>
                        <span class="meta-size">
                            <i class="fas fa-ruler"></i> Размеры: ${product.size.join(', ')}
                        </span>
                        <span class="meta-stock ${product.inStock ? 'in-stock' : 'out-of-stock'}">
                            <i class="fas ${product.inStock ? 'fa-check-circle' : 'fa-times-circle'}"></i> 
                            ${product.inStock ? 'В НАЛИЧИИ' : 'НЕТ В НАЛИЧИИ'}
                        </span>
                    </div>
                    
                    <div class="product-rating-section">
                        <div class="modal-rating">
                            <div class="modal-stars">
                                ${renderStars(product.rating)}
                            </div>
                            <span class="modal-rating-value">${product.rating}</span>
                            <span class="modal-reviews">(${product.reviews} отзывов)</span>
                        </div>
                    </div>
                    
                    <div class="product-description">
                        <h3><i class="fas fa-info-circle"></i> ОПИСАНИЕ</h3>
                        <p>${product.description}</p>
                    </div>
                    
                    <div class="product-specs">
                        <h3><i class="fas fa-cogs"></i> ХАРАКТЕРИСТИКИ</h3>
                        <div class="specs-container">
                            ${specsHtml}
                        </div>
                    </div>
                    
                    <div class="product-pricing">
                        <div class="price-section">
                            <div class="current-price">${product.price.toLocaleString()} ₽</div>
                            ${product.oldPrice > 0 ? `
                                <div class="old-price-section">
                                    <span class="old-price">${product.oldPrice.toLocaleString()} ₽</span>
                                    <span class="discount-badge">-${discountPercent}%</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                    
                    <div class="product-actions-modal">
                        <button class="btn-add-to-cart ${isInCart ? 'in-cart' : ''}" data-id="${product.id}">
                            <i class="fas ${isInCart ? 'fa-check' : 'fa-shopping-cart'}"></i>
                            ${isInCart ? 'В КОРЗИНЕ' : 'ДОБАВИТЬ В КОРЗИНУ'}
                        </button>
                        <button class="btn-add-to-fav ${isInFavorites ? 'active' : ''}" data-id="${product.id}">
                            <i class="${isInFavorites ? 'fas' : 'far'} fa-heart"></i>
                        </button>
                    </div>
                    
                    <div class="product-features">
                        <div class="feature">
                            <i class="fas fa-shipping-fast"></i>
                            <span>Бесплатная доставка по России</span>
                        </div>
                        <div class="feature">
                            <i class="fas fa-shield-alt"></i>
                            <span>100% оригинальная продукция</span>
                        </div>
                        <div class="feature">
                            <i class="fas fa-award"></i>
                            <span>Гарантия подлинности</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    const overlay = document.createElement('div');
    overlay.className = 'product-modal-overlay';
    overlay.id = 'productModalOverlay';
    document.body.appendChild(overlay);
    
    setTimeout(() => {
        modal.classList.add('show');
        overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
    }, 10);
    
    setTimeout(() => {
        const closeBtn = document.getElementById('closeDetailsModalBtn');
        const overlayEl = document.getElementById('productModalOverlay');
        const cartBtn = modal.querySelector('.btn-add-to-cart');
        const favBtn = modal.querySelector('.btn-add-to-fav');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                closeProductDetailsModal();
            });
        }
        
        if (overlayEl) {
            overlayEl.addEventListener('click', function(e) {
                e.stopPropagation();
                closeProductDetailsModal();
            });
        }
        
        if (cartBtn) {
            cartBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                const productId = parseInt(this.dataset.id);
                toggleCart(productId, e);
                
                setTimeout(() => {
                    const isNowInCart = cart.some(item => item.id === productId);
                    if (isNowInCart) {
                        this.innerHTML = '<i class="fas fa-check"></i> В КОРЗИНЕ';
                        this.classList.add('in-cart');
                    } else {
                        this.innerHTML = '<i class="fas fa-shopping-cart"></i> ДОБАВИТЬ В КОРЗИНУ';
                        this.classList.remove('in-cart');
                    }
                }, 100);
            });
        }
        
        if (favBtn) {
            favBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                const productId = parseInt(this.dataset.id);
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
        
        const escHandler = function(e) {
            if (e.key === 'Escape') {
                closeProductDetailsModal();
            }
        };
        document.addEventListener('keydown', escHandler);
        
        modal._escHandler = escHandler;
    }, 20);
}

function closeProductDetailsModal() {
    const modal = document.getElementById('productDetailsModal');
    const overlay = document.getElementById('productModalOverlay');
    
    if (modal) {
        modal.classList.remove('show');
        if (modal._escHandler) {
            document.removeEventListener('keydown', modal._escHandler);
        }
        
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 400);
    }
    
    if (overlay) {
        overlay.classList.remove('show');
        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        }, 400);
    }
    
    document.body.style.overflow = 'auto';
}

// ===== ФИЛЬТРЫ И ПОИСК =====
function filterProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const priceMin = parseInt(document.getElementById('filterPriceMin').value) || 0;
    const priceMax = parseInt(document.getElementById('filterPriceMax').value) || 100000;
    const sortBy = document.getElementById('sortBy').value;
    
    const selectedCategories = Array.from(document.querySelectorAll('.filter-category:checked'))
        .map(cb => cb.value);
    
    const selectedRating = document.querySelector('input[name="filterRating"]:checked');
    const minRating = selectedRating ? parseFloat(selectedRating.value) : 0;

    filteredProducts = allProducts.filter(product => {
        if (searchTerm && !product.name.toLowerCase().includes(searchTerm) && 
            !product.description.toLowerCase().includes(searchTerm) &&
            !product.brand.toLowerCase().includes(searchTerm)) {
            return false;
        }
        
        if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
            return false;
        }
        
        if (product.price < priceMin || product.price > priceMax) {
            return false;
        }
        
        if (selectedSizes.length > 0) {
            const hasSize = product.size.some(size => selectedSizes.includes(size));
            if (!hasSize) return false;
        }
        
        if (product.rating < minRating) {
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
    document.getElementById('filterPriceMin').value = '';
    document.getElementById('filterPriceMax').value = '';
    document.getElementById('sortBy').value = 'popular';
    
    document.querySelectorAll('.filter-category').forEach(cb => {
        cb.checked = true;
    });
    
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    selectedSizes = [];
    
    document.querySelector('input[name="filterRating"][value="0"]').checked = true;
    
    closeFilterPopup();
    
    filterProducts();
    
    showNotification('Фильтры сброшены', 'info');
}

function setupFilterPopup() {
    const filterContent = document.querySelector('.filter-content');
    if (!filterContent) return;
    
    filterContent.innerHTML = `
        <div class="filter-group">
            <h4><i class="fas fa-tag"></i> Категории</h4>
            <div class="checkbox-group">
                <label class="checkbox">
                    <input type="checkbox" class="filter-category" value="sneakers" checked>
                    <span class="checkmark"></span>
                    Кроссовки
                </label>
                <label class="checkbox">
                    <input type="checkbox" class="filter-category" value="limited" checked>
                    <span class="checkmark"></span>
                    Лимитированные
                </label>
                <label class="checkbox">
                    <input type="checkbox" class="filter-category" value="running" checked>
                    <span class="checkmark"></span>
                    Беговые
                </label>
                <label class="checkbox">
                    <input type="checkbox" class="filter-category" value="basketball" checked>
                    <span class="checkmark"></span>
                    Баскетбольные
                </label>
            </div>
        </div>
        
        <div class="filter-group">
            <h4><i class="fas fa-dollar-sign"></i> Цена, ₽</h4>
            <div class="price-range">
                <div class="range-inputs">
                    <input type="number" id="filterPriceMin" placeholder="0" min="0">
                    <span class="range-divider">-</span>
                    <input type="number" id="filterPriceMax" placeholder="100000" min="0">
                </div>
                <div class="range-slider">
                    <input type="range" id="filterPriceRange" min="0" max="100000" value="50000">
                </div>
            </div>
        </div>
        
        <div class="filter-group">
            <h4><i class="fas fa-ruler"></i> Размеры</h4>
            <div class="size-filters">
                <div class="size-buttons">
                    <button class="size-btn" data-size="38">38</button>
                    <button class="size-btn" data-size="39">39</button>
                    <button class="size-btn" data-size="40">40</button>
                    <button class="size-btn" data-size="41">41</button>
                    <button class="size-btn" data-size="42">42</button>
                    <button class="size-btn" data-size="43">43</button>
                    <button class="size-btn" data-size="44">44</button>
                    <button class="size-btn" data-size="45">45</button>
                </div>
            </div>
        </div>
        
        <div class="filter-group">
            <h4><i class="fas fa-star"></i> Рейтинг</h4>
            <div class="rating-filter">
                <label class="star-rating">
                    <input type="radio" name="filterRating" value="0" checked>
                    <span class="stars">
                        <i class="far fa-star"></i>
                        <i class="far fa-star"></i>
                        <i class="far fa-star"></i>
                        <i class="far fa-star"></i>
                        <i class="far fa-star"></i>
                    </span>
                    <span class="rating-text">Любой</span>
                </label>
                <label class="star-rating">
                    <input type="radio" name="filterRating" value="4">
                    <span class="stars">
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="far fa-star"></i>
                    </span>
                    <span class="rating-text">4+</span>
                </label>
                <label class="star-rating">
                    <input type="radio" name="filterRating" value="4.5">
                    <span class="stars">
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star"></i>
                        <i class="fas fa-star-half-alt"></i>
                    </span>
                    <span class="rating-text">4.5+</span>
                </label>
            </div>
        </div>
        
        <div class="filter-buttons">
            <button class="btn-filter-apply" id="applyFilterBtn">
                <i class="fas fa-check"></i> ПРИМЕНИТЬ
            </button>
            <button class="btn-filter-reset" id="resetFilterBtn">
                <i class="fas fa-redo"></i> СБРОСИТЬ
            </button>
        </div>
    `;
    
    const priceRange = document.getElementById('filterPriceRange');
    const priceMinInput = document.getElementById('filterPriceMin');
    const priceMaxInput = document.getElementById('filterPriceMax');
    
    if (priceRange && priceMinInput && priceMaxInput) {
        priceRange.addEventListener('input', function() {
            const value = parseInt(this.value);
            priceMinInput.value = Math.max(0, value - 20000);
            priceMaxInput.value = Math.min(100000, value + 20000);
        });
        
        priceMinInput.addEventListener('change', function() {
            const min = parseInt(this.value) || 0;
            const max = parseInt(priceMaxInput.value) || 100000;
            priceRange.value = Math.floor((min + max) / 2);
        });
        
        priceMaxInput.addEventListener('change', function() {
            const min = parseInt(priceMinInput.value) || 0;
            const max = parseInt(this.value) || 100000;
            priceRange.value = Math.floor((min + max) / 2);
        });
    }
    
    // Настройка фильтров размеров
    const sizeButtons = document.querySelectorAll('.size-btn');
    sizeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const size = parseInt(this.dataset.size);
            this.classList.toggle('active');
            
            if (this.classList.contains('active')) {
                if (!selectedSizes.includes(size)) {
                    selectedSizes.push(size);
                }
            } else {
                const index = selectedSizes.indexOf(size);
                if (index > -1) {
                    selectedSizes.splice(index, 1);
                }
            }
        });
    });
    
    document.getElementById('applyFilterBtn')?.addEventListener('click', function() {
        filterProducts();
        closeFilterPopup();
        showNotification('Фильтры применены', 'success');
    });
    
    document.getElementById('resetFilterBtn')?.addEventListener('click', resetFilters);
}

// ===== УПРАВЛЕНИЕ ПОПАПАМИ =====
function openCartPopup() {
    document.getElementById('cartPopup').classList.add('show');
    document.getElementById('overlay').classList.add('show');
    document.body.style.overflow = 'hidden';
    updateCartPopup();
}

function closeCartPopup() {
    document.getElementById('cartPopup').classList.remove('show');
    document.getElementById('overlay').classList.remove('show');
    document.body.style.overflow = 'auto';
}

function openFavoritesPopup() {
    document.getElementById('favoritesPopup').classList.add('show');
    document.getElementById('overlay').classList.add('show');
    document.body.style.overflow = 'hidden';
    updateFavoritesPopup();
}

function closeFavoritesPopup() {
    document.getElementById('favoritesPopup').classList.remove('show');
    document.getElementById('overlay').classList.remove('show');
    document.body.style.overflow = 'auto';
}

function openFilterPopup() {
    document.getElementById('filterPopup').classList.add('show');
    document.getElementById('overlay').classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeFilterPopup() {
    document.getElementById('filterPopup').classList.remove('show');
    document.getElementById('overlay').classList.remove('show');
    document.body.style.overflow = 'auto';
}

// ===== УТИЛИТЫ =====
function getCategoryName(category) {
    const categories = {
        sneakers: 'Кроссовки',
        limited: 'Лимитированная серия',
        running: 'Беговые',
        basketball: 'Баскетбольные',
        affordable: 'Доступные'
    };
    return categories[category] || category;
}

function getBrandName(brand) {
    const brands = {
        'Nike': 'Nike',
        'Adidas': 'Adidas',
        'Jordan': 'Jordan',
        'New Balance': 'New Balance',
        'Converse': 'Converse',
        'Puma': 'Puma',
        'Reebok': 'Reebok',
        'EDM': 'EDM™'
    };
    return brands[brand] || brand;
}

function showNotification(message, type = 'info') {
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
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
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// ===== ОБРАБОТЧИКИ СОБЫТИЙ =====
function initEventListeners() {
    // Поиск
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                filterProducts();
            }
        });
        
        searchInput.addEventListener('input', function() {
            clearTimeout(this._timer);
            this._timer = setTimeout(() => {
                if (this.value.trim() === '') {
                    filteredProducts = [...allProducts];
                    currentPage = 1;
                    renderProducts();
                } else {
                    filterProducts();
                }
            }, 500);
        });
    }
    
    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            filterProducts();
        });
    }
    
    // Сортировка
    document.getElementById('sortBy')?.addEventListener('change', filterProducts);
    
    // Нижнее меню
    document.getElementById('navFavorites')?.addEventListener('click', function() {
        updateFavoritesPopup();
        openFavoritesPopup();
    });
    
    document.getElementById('navCart')?.addEventListener('click', openCartPopup);
    document.getElementById('navFilter')?.addEventListener('click', openFilterPopup);
    
    // Сохранение адреса
    document.getElementById('saveAddressBtn')?.addEventListener('click', function() {
        if (saveAddress()) {
            updateCheckoutButton();
        }
    });
    
    // Ввод адреса по Enter
    document.getElementById('deliveryAddress')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            if (saveAddress()) {
                updateCheckoutButton();
            }
        }
    });
    
    // Автосохранение адреса при изменении
    document.getElementById('deliveryAddress')?.addEventListener('input', function() {
        clearTimeout(this._timer);
        this._timer = setTimeout(() => {
            if (this.value.trim()) {
                deliveryAddress = this.value.trim();
                isAddressSaved = true;
                saveToStorage(STORAGE_KEYS.ADDRESS, deliveryAddress);
                updateAddressStatus();
                updateCheckoutButton();
            }
        }, 1000);
    });
    
    // Кнопка "Перейти в каталог" в пустом избранном
    document.getElementById('browseBtn')?.addEventListener('click', function() {
        closeFavoritesPopup();
        resetFilters();
    });
    
    // Закрытие попапов
    document.getElementById('closeCart')?.addEventListener('click', closeCartPopup);
    document.getElementById('closeFav')?.addEventListener('click', closeFavoritesPopup);
    document.getElementById('closeFilter')?.addEventListener('click', closeFilterPopup);
    
    // Оверлей для закрытия попапов
    document.getElementById('overlay')?.addEventListener('click', function() {
        closeCartPopup();
        closeFavoritesPopup();
        closeFilterPopup();
        closeProductDetailsModal();
    });
    
    // Оформление заказа
    document.getElementById('checkoutBtn')?.addEventListener('click', function() {
        if (cart.length === 0) {
            showNotification('Добавьте товары в корзину', 'info');
            return;
        }
        
        if (!isAddressSaved || !deliveryAddress) {
            showNotification('Сначала укажите адрес доставки', 'warning');
            
            this.classList.add('shake');
            setTimeout(() => this.classList.remove('shake'), 500);
            
            const addressInput = document.getElementById('deliveryAddress');
            if (addressInput) {
                addressInput.focus();
            }
            return;
        }
        
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const orderItems = cart.map(item => 
            `${item.name} (Размер: ${item.selectedSize || item.size[0]}) - ${item.quantity} × ${item.price.toLocaleString()}₽ = ${(item.price * item.quantity).toLocaleString()}₽`
        ).join('\n');
        
        const orderText = `
👟 **НОВЫЙ ЗАКАЗ В EDM™**

📦 **Товары:**
${orderItems}

🧾 **Итого:** ${total.toLocaleString()}₽
📍 **Адрес доставки:** ${deliveryAddress}
📅 **Дата:** ${new Date().toLocaleString('ru-RU')}

💬 **Связь:** @EDM_Sneakers
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
    });
    
    // Обработка кликов по кнопкам в карточках товаров
    document.addEventListener('click', function(event) {
        const target = event.target;
        
        const cartBtn = target.closest('.btn-cart-wb');
        if (cartBtn) {
            event.stopPropagation();
            event.preventDefault();
            const productId = parseInt(cartBtn.dataset.id);
            if (productId) {
                toggleCart(productId, event);
                
                setTimeout(() => {
                    const isNowInCart = cart.some(item => item.id === productId);
                    if (isNowInCart) {
                        cartBtn.innerHTML = '<i class="fas fa-check"></i><span>В КОРЗИНЕ</span>';
                        cartBtn.classList.add('in-cart');
                    } else {
                        cartBtn.innerHTML = '<i class="fas fa-shopping-cart"></i><span>В КОРЗИНУ</span>';
                        cartBtn.classList.remove('in-cart');
                    }
                }, 100);
            }
            return;
        }
        
        const favBtn = target.closest('.btn-fav-wb');
        if (favBtn) {
            event.stopPropagation();
            event.preventDefault();
            const productId = parseInt(favBtn.dataset.id);
            if (productId) {
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
    
    // Закрытие по клавише ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeCartPopup();
            closeFavoritesPopup();
            closeFilterPopup();
            closeProductDetailsModal();
        }
    });
}

// ===== ГЛОБАЛЬНЫЙ ЭКСПОРТ =====
window.edm = {
    user,
    allProducts,
    cart,
    favorites,
    filteredProducts,
    filterProducts,
    toggleCart,
    showProductDetailsModal,
    closeProductDetailsModal,
    resetFilters,
    openCartPopup,
    openFavoritesPopup,
    openFilterPopup,
    saveAddress
};

console.log('EDM™ Sneakers Shop приложение инициализировано');