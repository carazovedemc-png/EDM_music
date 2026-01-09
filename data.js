// Конфигурация приложения School UFC
const APP_CONFIG = {
    // Логотип и название
    appName: "𝙀𝙁𝘾™",
    logoUrl: "https://via.placeholder.com/50/FF6B6B/FFFFFF?text=UFC",
    
    // Аккаунты для ставок (18+) и администратора
    adultAccounts: [
        {
            login: "EDM™",
            password: "4892edica492",
            firstName: "Администратор",
            lastName: "Системы",
            betsAllowed: true,
            isAdmin: true
        },
        {
            login: "ivanov",
            password: "pass123",
            firstName: "Иван",
            lastName: "Иванов",
            betsAllowed: true,
            isAdmin: false
        },
        {
            login: "petrov",
            password: "pass456",
            firstName: "Петр",
            lastName: "Петров",
            betsAllowed: true,
            isAdmin: false
        }
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
            videoUrl: "https://youtu.be/dQw4w9WgXcQ",
            description: "Захватывающий финальный бой сезона 2024",
            date: "10.11.2024"
        },
        {
            id: 2,
            title: "Полуфинал. Группа А - Сидоров vs Козлов",
            thumbnail: "https://images.unsplash.com/photo-1519861531473-920034658307?w=400&h=225&fit=crop",
            videoUrl: "https://youtu.be/dQw4w9WgXcQ",
            description: "Жесткий бой с неожиданной развязкой",
            date: "03.11.2024"
        }
    ],
    
    // Контракты (ссылки на изображения)
    contracts: {
        "EDM™": "https://via.placeholder.com/800x1131/FFFFFF/000000?text=АДМИН+КОНТРАКТ",
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
        }
    ]
};