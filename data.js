// Конфигурация приложения EDM™ UFC
const APP_CONFIG = {
    // Основные настройки
    appName: "EDM™ UFC",
    logoUrl: "https://via.placeholder.com/50/FF6B6B/FFFFFF?text=UFC",
    
    // Ссылка на пользовательское соглашение
    agreementUrl: "https://telegra.ph/POLZOVATELSKOE-SOGLASHENIE-po-ispolzovaniyu-programm-11-06",
    
    // Пользователи с доступом к ставкам (18+)
    // Здесь указываем Telegram ID пользователей
    betsAllowedUsers: [
        123456789, // Пример ID
        987654321  // Пример ID
    ],
    
    // Контракты бойцов
    // Ключ: Telegram ID, значение: URL контракта
    contracts: {
        // Пример:
        // 123456789: "https://example.com/contract1.jpg",
        // 987654321: "https://example.com/contract2.jpg"
    },
    
    // Бои бойцов
    // Ключ: Telegram ID, значение: массив боев
    userFights: {
        // Пример:
        // 123456789: [
        //     {
        //         id: 1,
        //         opponent: "Иван Иванов",
        //         date: "15.12.2024",
        //         time: "18:00",
        //         place: "Школьный спортзал №1",
        //         reward: 5000,
        //         status: "upcoming" // upcoming, completed, cancelled
        //     }
        // ]
    },
    
    // Баннеры
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
    
    // Предстоящие бои (для всех)
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
            fighters: ["Михаил Петров", "Сергей Иванов"],
            date: "20.12.2024",
            time: "19:00",
            place: "Школьный спортзал №2",
            ticketPrice: 350
        }
    ]
};