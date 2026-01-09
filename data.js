// Конфигурация приложения School UFC
const APP_CONFIG = {
    // Логотип и название
    appName: "EDM™ UFC",
    logoUrl: "assets/logo.png",
    
    // Аккаунты для ставок (18+)
    adultAccounts: [
        {
            login: "admin",
            password: "admin123",
            firstName: "Администратор",
            lastName: "Системы",
            betsAllowed: true
        },
        {
            login: "ivanov",
            password: "pass123",
            firstName: "Иван",
            lastName: "Иванов",
            betsAllowed: true
        }
        // Добавляйте новые аккаунты здесь
    ],
    
    // Баннеры (реклама/бои)
    banners: [
        {
            id: 1,
            imageUrl: "https://via.placeholder.com/800x400/FF6B6B/FFFFFF?text=Бой+года:+Иванов+vs+Петров",
            link: "#fight1",
            active: true
        },
        {
            id: 2,
            imageUrl: "https://via.placeholder.com/800x400/4ECDC4/FFFFFF?text=Новый+турнир+15+декабря",
            link: "#tournament",
            active: true
        },
        {
            id: 3,
            imageUrl: "https://via.placeholder.com/800x400/45B7D1/FFFFFF?text=Купить+билеты+со+скидкой+20%",
            link: "#tickets",
            active: true
        }
    ],
    
    // Видео боев
    fightVideos: [
        {
            id: 1,
            title: "Финал турнира 2024",
            thumbnail: "https://via.placeholder.com/400x225/FF6B6B/FFFFFF?text=Финал",
            videoUrl: "https://youtu.be/example1",
            description: "Иванов vs Петров - финальный бой сезона",
            date: "10.11.2024"
        },
        {
            id: 2,
            title: "Полуфинал. Группа А",
            thumbnail: "https://via.placeholder.com/400x225/4ECDC4/FFFFFF?text=Полуфинал",
            videoUrl: "https://youtu.be/example2",
            description: "Сидоров vs Козлов - технический нокаут",
            date: "03.11.2024"
        }
    ],
    
    // Контракты (ссылки на изображения)
    contracts: {
        "ivanov": "https://via.placeholder.com/800x1131/FFFFFF/000000?text=Контракт+Иванова",
        "admin": "https://via.placeholder.com/800x1131/FFFFFF/000000?text=Контракт+Администратора"
    },
    
    // Предстоящие бои
    upcomingFights: [
        {
            id: 1,
            fighters: ["Алексей Сидоров", "Дмитрий Козлов"],
            date: "15.12.2024",
            time: "18:00",
            place: "Школьный спортзал",
            ticketPrice: 300
        }
    ]
};