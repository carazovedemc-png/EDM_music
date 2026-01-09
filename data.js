// Конфигурация приложения School UFC
const APP_CONFIG = {
    // Логотип и название
    appName: "𝙀𝙁𝘾™",
    logoUrl: "https://via.placeholder.com/50/FF6B6B/FFFFFF?text=UFC", // Замените на свой логотип
    
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
        },
        {
            login: "petrov",
            password: "pass456",
            firstName: "Петр",
            lastName: "Петров",
            betsAllowed: true
        }
        // Добавляйте новые аккаунты здесь
    ],
    
    // Баннеры (реклама/бои)
    banners: [
        {
            id: 1,
            imageUrl: "https://images.unsplash.com/photo-1546716425-71f33c8d6c3e?w=800&h=400&fit=crop",
            link: "#fight1",
            active: true
        },
        {
            id: 2,
            imageUrl: "https://images.unsplash.com/photo-1517344884509-a0c97ec11bcc?w=800&h=400&fit=crop",
            link: "#tournament",
            active: true
        },
        {
            id: 3,
            imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop",
            link: "#tickets",
            active: true
        }
    ],
    
    // Видео боев
    fightVideos: [
        {
            id: 1,
            title: "Финал турнира 2024 - Иванов vs Петров",
            thumbnail: "https://images.unsplash.com/photo-1547036967-23d11aaca258?w=400&h=225&fit=crop",
            videoUrl: "https://youtu.be/example1",
            description: "Захватывающий финальный бой сезона 2024. Технический нокаут в 3 раунде.",
            date: "10.11.2024"
        },
        {
            id: 2,
            title: "Полуфинал. Группа А - Сидоров vs Козлов",
            thumbnail: "https://images.unsplash.com/photo-1519861531473-920034658307?w=400&h=225&fit=crop",
            videoUrl: "https://youtu.be/example2",
            description: "Жесткий бой с неожиданной развязкой. Судьи присудили победу раздельным решением.",
            date: "03.11.2024"
        },
        {
            id: 3,
            title: "Четвертьфинал. Бой вечера",
            thumbnail: "https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?w=400&h=225&fit=crop",
            videoUrl: "https://youtu.be/example3",
            description: "Невероятный бой с 5-ю нокдаунами. Претендент на лучший бой года.",
            date: "27.10.2024"
        }
    ],
    
    // Контракты (ссылки на изображения)
    contracts: {
        "admin": "https://via.placeholder.com/800x1131/FFFFFF/000000?text=Контракт+Администратора",
        "ivanov": "https://via.placeholder.com/800x1131/FFFFFF/000000?text=Контракт+Иванова",
        "petrov": "https://via.placeholder.com/800x1131/FFFFFF/000000?text=Контракт+Петрова"
    },
    
    // Предстоящие бои
    upcomingFights: [
        {
            id: 1,
            fighters: ["Алексей Сидоров", "Дмитрий Козлов"],
            date: "15.12.2024",
            time: "18:00",
            place: "Школьный спортзал №1",
            ticketPrice: 300
        },
        {
            id: 2,
            fighters: ["Максим Орлов", "Артем Волков"],
            date: "22.12.2024",
            time: "19:30",
            place: "Школьный спортзал №2",
            ticketPrice: 250
        },
        {
            id: 3,
            fighters: ["Кирилл Новиков", "Егор Морозов"],
            date: "29.12.2024",
            time: "17:00",
            place: "Главный спортзал",
            ticketPrice: 350
        }
    ]
};