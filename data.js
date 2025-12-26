// data.js - Центр управления контентом

const appData = {
    // Основные настройки
    config: {
        appName: "EDM™",
        logoUrl: "https://via.placeholder.com/150/000000/FFFFFF/?text=EDM", // Сюда вставь ссылку на свой логотип
        mainBackground: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop", // Ссылка на общий фон (одна большая картинка)
        heroTitle: "Веб-разработка будущего",
        heroSubtitle: "Мы создаем Mini Apps, которые продают",
        currency: "₽"
    },

    // Логотипы языков программирования для анимации на главном экране
    techStack: [
        "HTML", "CSS", "JS", "React", "Vue", "Node", "Python", "PHP", "Swift", "Kotlin", "SQL", "Git"
    ],

    // Секция 2: Портфолио (3 карточки)
    portfolio: [
        {
            id: 1,
            title: "Crypto Wallet App",
            image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?q=80&w=500&auto=format&fit=crop",
            shortDesc: "Крипто-кошелек в Telegram",
            fullDesc: "Полнофункциональный крипто-кошелек, встроенный прямо в Telegram. Поддержка TON, USDT, BTC. Безопасные транзакции, стейкинг и обмен валют внутри приложения. Реализован на React + Node.js."
        },
        {
            id: 2,
            title: "Food Delivery Bot",
            image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=500&auto=format&fit=crop",
            shortDesc: "Сервис доставки еды",
            fullDesc: "Удобное приложение для заказа еды из ресторанов. Корзина, выбор добавок, интеграция с картами для курьеров и платежная система. Админ-панель для ресторатора."
        },
        {
            id: 3,
            title: "Booking System",
            image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=500&auto=format&fit=crop",
            shortDesc: "Система бронирования отелей",
            fullDesc: "Система бронирования номеров в отелях Крыма. Календарь занятости, фильтры по удобствам, отзывы и рейтинг. Интеграция с CRM системой отеля."
        }
    ],

    // Секция 3: Услуги и цены
    services: [
        {
            title: "Landing Page",
            image: "https://images.unsplash.com/photo-1467232004584-a241de8bcf7d?q=80&w=500&auto=format&fit=crop",
            description: "Одностраничный продающий сайт. Адаптив, анимация, форма заявки.",
            priceStart: 15000
        },
        {
            title: "Telegram Mini App",
            image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=500&auto=format&fit=crop",
            description: "Полноценное веб-приложение внутри Telegram. Любая сложность.",
            priceStart: 45000
        },
        {
            title: "Интернет-магазин",
            image: "https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?q=80&w=500&auto=format&fit=crop",
            description: "Каталог, корзина, оплата, личный кабинет пользователя.",
            priceStart: 60000
        },
        {
            title: "Корпоративный портал",
            image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=500&auto=format&fit=crop",
            description: "Сайт для бизнеса с блогом, новостями и админ-панелью.",
            priceStart: 35000
        }
    ]
};
