// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ И КОНСТАНТЫ =====
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
let isLoggedIn = false;
let userProfile = null;
let transactions = [];

// Конфигурация баннеров (легко редактировать)
let bannerConfig = {
    banners: [
        {
            id: 1,
            title: "Эксклюзивные ароматы",
            text: "Только оригинальная парфюмерия с гарантией качества",
            type: "gradient", // "gradient" или "image"
            gradient: "exclusive", // "exclusive" или "contacts"
            imageUrl: "", // URL изображения, если type="image"
            link: "", // Ссылка при клике (оставить пустым для отключения)
            enabled: true // true/false для включения/отключения
        },
        {
            id: 2,
            title: "Заказы оформляем в лс",
            text: "@Ayder505<br>Telegram channel:<br><a href='https://t.me/Aa_Atelier' target='_blank'>https://t.me/Aa_Atelier</a>",
            type: "gradient",
            gradient: "contacts",
            imageUrl: "",
            link: "",
            enabled: true
        },
        {
            id: 3,
            title: "",
            text: "",
            type: "image",
            gradient: "",
            imageUrl: "https://sun9-63.userapi.com/s/v1/ig2/08QQmfcwGorKcFQPSAocILkdLdmUYKOf8yB_z_WOYANV6PhJns32WPqbEtbp1_H3YRwE8AV6Tx2_IaxcaCxnTe2w.jpg?quality=95&as=32x15,48x22,72x34,108x50,160x75,240x112,360x168,480x224,540x252,640x299,720x336,1080x504,1280x597,1440x672,1732x808&from=bu&u=0t0jjC50h5nlaHCgJuh891ec4TKp5fN3Nf59Wz0IFRU&cs=640x0",
            link: "https://t.me/EDM_TM",
            enabled: true
        }
    ],
    switchInterval: 10000 // Интервал переключения в миллисекундах
};

// Ключи для localStorage
const STORAGE_KEYS = {
    CART: 'aura_atelier_cart',
    FAVORITES: 'aura_atelier_favorites',
    ADDRESS: 'aura_atelier_address',
    PROFILE: 'aura_atelier_profile',
    TRANSACTIONS: 'aura_atelier_transactions',
    AUTH: 'aura_atelier_auth',
    USERS: 'aura_atelier_users'
};

    // КАРТОЧКИ ТОВАРОВ
const PRODUCTS_DATA = [
    {
        id: 1,
        name: "Aris 222 VIP Bleck",
        description: "Представленный на изображении товар — это Aris 222 VIP Black, концентрированное парфюмерное масло духи без спирта. Верхние ноты: Абсент, анис и фенхель. Средняя нота: Лаванда. Базовые ноты: Черная ваниль и мускус.",
        price: 350,
        oldPrice: 0,
        category: "premium",
        volume: 6,
        rating: 4.8,
        reviews: 124,
        image: "https://sun9-80.userapi.com/s/v1/ig2/POV_jt4v0MEj7d-4gdkRYIFYTBL-hvXmDLOjJKlY-RqeOgcO1NxWHXAss7UBTzkvI8rdLMEdpqZwJeARBqh7iyc3.jpg?quality=95&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720,1080x1080,1280x1280,1440x1440,2560x2560&from=bu&u=tt6otIk9Wzym_IH9u6oWb4gDXhDWpPwiNQ5muEOgTHo&cs=240x0",
        badge: "hit",
        inStock: true,
        popular: true,
        notes: ["лаванда", "чёрная ваниль", "мускус"]
    },
    {
        id: 2,
        name: "Dalal",
        description: "Dalal — масляные духи бренда Al Rehab из ОАЭ. Относятся к семейству сладких, древесных и гурманских ароматов. Благодаря масляной консистенции духи имеют хорошую стойкость и экономичны в расходе. Запах держится до 12 часов! Аромат:  Верхние ноты: апельсин. Ноты сердца: карамель, ваниль. Базовые ноты: сандаловое дерево.Композиция напоминает о карамельном чизкейке и ванильном мороженом с апельсиновым джемом",
        price: 350,
        oldPrice: 0,
        category: "premium",
        volume: 6,
        rating: 4.9,
        reviews: 100,
        image: "https://sun9-41.userapi.com/s/v1/ig2/vkEyo2KDCGJhawzJ2PSYbdY9h4EOrh30HrjwefVSCbYOSqJPoXruX0WobRyxKbRBw8BvdlL8sejPGZ4p-RrVjUOO.jpg?quality=95&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720,1080x1080,1280x1280,1440x1440,2560x2560&from=bu&u=m0AEgal8BacMT-TAXZva7xEf1ZAAdIa_7ZvmQJYgIsY&cs=360x0",
        badge: "hit",
        inStock: true,
        popular: true,
        notes: ["апельсин", "карамель", "ваниль", "сандаловое дерево"]
    },
    {
        id: 3,
        name: "Black Opium",
        description: "Это - женские духи из группы восточные гурманские. Композиция глубокая, насыщенная, сладкая и притягательная. Верхние ноты: груша, розовый перец и цветок апельсина. Средние ноты: кофе, жасмин, горький миндаль и лакричник. Базовые ноты: ваниль, пачули, кедр и кашемировое дерево.",
        price: 350,
        oldPrice: 0,
        category: "affordable",
        volume: 6,
        rating: 4.6,
        reviews: 100,
        image: "https://sun9-43.userapi.com/s/v1/ig2/7OuPKSCxdwp7oHCuEccqLkHkK_-ovx6ks842VjcS4nIExZ1VGhdLfUhSz-ueglS4PgI_fh29HEvPqFLzNlKj3tej.jpg?quality=95&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720,1080x1080,1280x1280,1440x1440,2560x2560&from=bu&u=DTS3NJnjcShlWzwIHzZ9tgVLIOKUx8JWVEEhGsoYZH0&cs=640x0",
        badge: "null",
        inStock: true,
        popular: false,
        notes: ["кофе", "жасмин", "ваниль", "кедр", "горький миндаль"]
    },
    {
        id: 4,
        name: "Creed Aventus For Her",
        description: "Limited Edition Creed Aventus For Her - женский аромат. Это фруктово шипровая парфюмерная вода с нотами зеленого яблока, лимона, бергамота, розы, сандала и мускуса",
        price: 350,
        oldPrice: 0,
        category: "premium",
        volume: 6,
        rating: 4.9,
        reviews: 167,
        image: "https://sun9-79.userapi.com/s/v1/ig2/XOkgSK57rv_tI2P2NE_TQ_5nKYuTRM_AUJfT2YQ53g0-5lW9ETR7FbZ4yRYeNTHIuBcNPhP4lKiON3Nwe1sMTy0S.jpg?quality=95&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720,1080x1080,1280x1280,1440x1440,2560x2560&from=bu&u=L5LPBfopJzZuCDe9YN9SywE0Br_mxxQTJfwhp4lDlAI&cs=360x0",
        badge: "hit",
        inStock: true,
        popular: true,
        notes: ["бергамот", "мускус", "роза", "лимон", "сандал", "зелёное яблоко"]
    },
    {
        id: 5,
        name: "Kirki Aksa",
        description: "Концентрированное эфирное масло Kirki Aksa - это унисекс парфюм с фруктово шипровым ароматом. Верхние ноты - Маракуйя персик, малина, лист черной смородины, груша, песок. Средние ноты - Ландыш. Базовые ноты - Гелиотроп, сандал, ваниль, пачули, мускус.",
        price: 350,
        oldPrice: 0,
        category: "premium",
        volume: 6,
        rating: 4.7,
        reviews: 187,
        image: "https://sun9-84.userapi.com/s/v1/ig2/LDMpV1ihJnWYPte5wGmG-BxwBsBptbz7QSARpRMRdZt-fpO0wy_4ZPiEPS0oWkLxjFPzRm1wdDYeA2n88xh7Fegn.jpg?quality=95&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720,1080x1080,1280x1280,1440x1440,2560x2560&from=bu&u=QhV-dEoaJC83x6egk46Ej6FZETeNOMWtoQnFpIMrEII&cs=360x0",
        badge: "null",
        inStock: true,
        popular: true,
        notes: ["маракуйя", "персик", "ваниль"]
    },
    {
        id: 6,
        name: "Black Opium",
        description: "Это масляные духи с феромонами Black Opium — это женская парфюмерная вода",
        price: 350,
        oldPrice: 0,
        category: "affordable",
        volume: 6,
        rating: 4.5,
        reviews: 92,
        image: "https://sun9-37.userapi.com/s/v1/ig2/sE51AVESqed4uV7s0G1BwL6YiNvoyG81xw3TEiygep-FuH_44Vl82QuVDfVZteIIdCAa1NAXQ2A-fQDnoOtisjq4.jpg?quality=95&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720,1080x1080,1280x1280,1440x1440,2560x2560&from=bu&u=RXKCzPLanm6VtxbnzBnP-I3Ki7th8SeNxFq2aFmrLDE&cs=360x0",
        badge: null,
        inStock: true,
        popular: false,
        notes: ["жасмин", "груша", "кофе"]
    },
    {
        id: 7,
        name: "YARAN Voux",
        description: "YARAN Voux от Aris Perfumes — это концентрированное парфюмерное масло (CPO). Это унисекс-аромат, который относится к восточным или гурманским коллекциям, схожим с другими ароматами от брендов, таких как Paris Corner.",
        price: 350,
        oldPrice: 0,
        category: "premium",
        volume: 6,
        rating: 4.8,
        reviews: 143,
        image: "https://sun9-18.userapi.com/s/v1/ig2/JPe8xzc_vL633B2Y0VenFoeipK_joP7GR9FZZ565Z7XEuh8CeoYJxM7GmBFilsfBbropmaZze7L5RJ5ISim-VNa8.jpg?quality=95&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720,1080x1080,1280x1280,1440x1440,2560x2560&from=bu&u=DwhSt-8w64gm4QVZgK4wKRnie5o2V4HtkWzexyWhaos&cs=360x0",
        badge: "null",
        inStock: true,
        popular: true,
        notes: ["ваниль", "сандал", "мускус"]
    },
    {
        id: 8,
        name: "Al Rayan G&D Limperatrice",
        description: "Al Rayan G&D Limperatrice — это концентрированное масляное парфюмерное масло аттар. Композиция аромата включает следующие ноты: Верхние ноты: Розовый перец, ревень, киви. Средние ноты сердце: Арбуз, цикламен, жасмин. Базовые ноты: Мускус, сандал, лимонное китайское дерево. Описание Аромат описывается как яркий, игривый и энергичный, с доминирующими аккордами сочных тропических фруктов и свежестью. Он подходит для дневного ношения, особенно в весенне-летний период.",
        price: 350,
        oldPrice: 0,
        category: "affordable",
        volume: 6,
        rating: 4.6,
        reviews: 56,
        image: "https://sun9-32.userapi.com/s/v1/ig2/u7kV68pjiyC_Ep97GMc8IEBXIH5cX50pFb6q5MNe7wnyULSvSD4-xUH6qRePG96lG1aWbOChxMLH_QshKz3HP9Uj.jpg?quality=95&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720,1080x1080,1280x1280,1440x1440,2560x2560&from=bu&u=lf3dVx7r5RsUdRttLycIgRe0gYshLVfBPnVAmBYt9_0&cs=360x0",
        badge: "new",
        inStock: true,
        popular: true,
        notes: ["ревень", "киви", "арбуз", "мускус"]
    },
    {
        id: 9,
        name: "Al-Rayan Kilian By In The City",
        description: "Представленный на изображении товар - это масляные духи Al-Rayan Kilian By In The City Верхние ноты - Бергамот, гватемальский кардамон и розовый перец. Ноты сердца - Абрикос, карамелизованная слива, турецкая роза и ладан. Базовые ноты: Кедр, индонезийский пачули.",
        price: 350,
        oldPrice: 0,
        category: "affordable",
        volume: 6,
        rating: 4.4,
        reviews: 234,
        image: "https://sun9-6.userapi.com/s/v1/ig2/j3IQyd0QOc9sOzrhRtrqAih-tEG7x5xPiZMfCVxsQyVlb3HjvwSl6OAQK_7QVoRurh9X7w1zX0dEDG12-77JCtQs.jpg?quality=95&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720,1080x1080,1280x1280,1440x1440,2560x2560&from=bu&u=ytxGprY0FWbTGBoY3EXaC9oX0EfZcJY43B7M6hNMe5g&cs=360x0",
        badge: "null",
        inStock: true,
        popular: true,
        notes: ["кедр", "абрикос", "розовый перец"]
    },
    {
        id: 10,
        name: "Lacoste green",
        description: "Это — фужерный, цитрусовый аромат для мужчин. стойкое звучание аромата благодаря натуральным маслам и отсутствию спирта; шлейф благодаря тяжёлым молекулам, который раскрывается неторопливо под воздействием тепла кожи и перемены окружающей среды; изменчивость аромата: в тёплом помещении или на жаркой летней улице духи звучат сильнее, раскрываясь под воздействием температуры. Верхние ноты: грейпфрут, дыня, ноты бергамота. Ноты сердца: лимонная вербена, лаванда, тмин. Базовые ноты: берёза, инжир.",
        price: 350,
        oldPrice: 0,
        category: "premium",
        volume: 6,
        rating: 4.9,
        reviews: 189,
        image: "https://sun9-78.userapi.com/s/v1/ig2/NjbkM41fqN_ElkBHjJWyzjAoGorjvfDBd881IiagMDgy853FarvwWKOFlIK8N_cXQH2xd0lgrKkQb3tIMWLVpBHo.jpg?quality=95&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720,1080x1080,1280x1280,1440x1440,2560x2560&from=bu&u=VPX8vTYi-reFtDkiHwd1GmDpWymqCFgG4vqjSKpfa4Y&cs=640x0",
        badge: "hit",
        inStock: true,
        popular: true,
        notes: ["дыня", "береза", "инжир"]
    },
    {
        id: 11,
        name: "Black Afgano",
        description: "Изображенный на фото товар — это масляные духи с феромонами объемом  6 мл под названием Black Afgano, выпущенные под маркой Pheromon Limited Edition. Описание продукта: Масляные духи с феромонами унисекс. Аромат: Это парфюмерное масло вдохновлено известным оригинальным ароматом Nasomatto Black Afgano, который отличается густым, дымным, древесным и плотным звучанием с нотами  смолы, кофе, табака и ладана",
        price: 350,
        oldPrice: 0,
        category: "affordable",
        volume: 6,
        rating: 4.5,
        reviews: 78,
        image: "https://sun9-4.userapi.com/s/v1/ig2/XtGtcV14S3upSGqy5SMaZwgHF1oUkavESD9-FDqy08tU3pzNmPw9VN9tMjRx0nVdPIpeM-FfdeutQbG-9o5R8qHR.jpg?quality=95&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720,1080x1080,1280x1280,1440x1440,2560x2560&from=bu&u=4GI8IGXu6hM54RSYQlvBZjdBhjxuFYbLoDgmtTTHXZM&cs=240x0",
        badge: null,
        inStock: true,
        popular: false,
        notes: ["табак", "смола", "кофе"]
    },
    {
        id: 12,
        name: "Lost cherry Tom ford",
        description: "Детали продукта Оригинальный аромат: Lost Cherry от Tom Ford - это люксовая восточно-цветочная парфюмерная вода Eau de Parfum для мужчин и женщин, выпущенная в 2018 году. Продукт на изображении, является масляными духами, вдохновленными оригинальным ароматом, часто с добавлением синтетических феромонов.",
        price: 350,
        oldPrice: 0,
        category: "premium",
        volume: 6,
        rating: 4.8,
        reviews: 312,
        image: "https://sun9-38.userapi.com/s/v1/ig2/uPgqjLUFPMlBHeNEe9CCZYzn1wappYDHmT_cDn8aldq8HidoeXPwyOAX5OHL1YJ1s94WORcWvEZY9hZPwfHFJSZV.jpg?quality=95&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720,1080x1080,1280x1280,1440x1440,2560x2560&from=bu&u=o2THPZ5FizJ22_R1Sr3J0c12VSXfXGC4rYgfpYfpR1c&cs=240x0",
        badge: "hit",
        inStock: true,
        popular: true,
        notes: [".", ".", "."]
    },
    {
        id: 13,
        name: "LACOSTE ESSENTIAL",
        description: "Lacoste essential pheromon Limited Edition — это масляные духи с феромонами. Тип аромата: Древесный, фужерный",
        price: 350,
        oldPrice: 0,
        category: "affordable",
        volume: 6,
        rating: 4.5,
        reviews: 137,
        image: "https://sun9-22.userapi.com/s/v1/ig2/q2Pv9a9helePHmcz5NOLAfWetXLXxiksBtqbkvLyhqcIH3WDHiF0WcdYKakuhqtM_5FKe7_qO_DXn2BSWh07-CtR.jpg?quality=95&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720,1080x1080,1280x1280,1440x1440,2560x2560&from=bu&u=vWg79uv0PR6vMntoQuUoyKEJJtWacOOeOXpjH-juSrw&cs=240x0",
        badge: null,
        inStock: true,
        popular: false,
        notes: ["фужерный", "древестный"]
    },
    {
        id: 14,
        name: "Allur Home Sport",
        description: "Парфюм на изображении — это Pheromon Limited Edition Allur Home Sport, который представляет собой версию с феромонами, вдохновленную известным ароматом Chanel Allure Homme Sport. Аромат: Мужской, относится к группе древесных пряных ароматов. Композиция сочетает цитрусовые, морские и древесные ноты.",
        price: 350,
        oldPrice: 0,
        category: "affordable",
        volume: 6,
        rating: 4.4,
        reviews: 146,
        image: "https://sun9-3.userapi.com/s/v1/ig2/SPsgBvzNMm9FCG0YhncWZd7GwB075inz1ZySBRggHyw8GU51Yw96PUJq27KzHFV7DRUHMixSIG6qzfHo_jOOZeKk.jpg?quality=95&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720,1080x1080,1280x1280,1440x1440,2560x2560&from=bu&u=g54CooC5RUFBToh3mgEDVpcyjM5ZOBuPHTAxQSTK4_g&cs=240x0",
        badge: null,
        inStock: true,
        popular: false,
        notes: ["нота1", "нота", "нота3"]
    },
    {
        id: 15,
        name: "Acqua Di Gio Giorgio Armani",
        description: "Pheromon Limited Edition Acqua Di Gio Giorgio Armani — это версия туалетной воды Acqua Di Gio, представленная в формате масляных духов с феромонами. Ноты: Композиция включает морские ноты, розмарин, жасмин, кедр и пачули.",
        price: 350,
        oldPrice: 0,
        category: "affordable",
        volume: 6,
        rating: 4.7,
        reviews: 155,
        image: "https://sun9-66.userapi.com/s/v1/ig2/sUV2Bm7T9gnxiIqW9DeH4hUXCVNMM4X9xK5wGFKb3ULdjzYum2NsCq7MnCwZi_M76c_dZOsIml1i8tKRn0m9siRM.jpg?quality=95&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720,1080x1080,1280x1280,1440x1440,2560x2560&from=bu&u=FOrDOsjR7X_6WNiekSjoAHlQU__DAfnKBnvSaCF4bzw&cs=240x0",
        badge: null,
        inStock: true,
        popular: false,
        notes: ["кедр", "жасмин", "пачули"]
    },
    {
        id: 16,
        name: "Sospiro Erba Pura",
        description: "Представленный товар — это масляные духи с феромонами Sospiro Erba Pura Limited Edition. Аромат: Композиция описывается как свежая, с нотами апельсина, лимона и бергамота в верхних нотах, фруктовым сердцем и базой из амбры, белого мускуса и мадагаскарской ванили.",
        price: 350,
        oldPrice: 0,
        category: "affordable",
        volume: 6,
        rating: 4.6,
        reviews: 212,
        image: "https://sun9-49.userapi.com/s/v1/ig2/HlvVp54Fl1yUYEQrIdMsqsbhrFZjmkzV7Kc3WHJiFUW8SLzG8ptT3CHHRYgCyPp1t3SsCtIjqmnFt1DohZTPoqzf.jpg?quality=95&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720,1080x1080,1280x1280,1440x1440,2560x2560&from=bu&u=iSxrvU5lePOWtaEQ2vUPQra_jXzu-0msPIKa2wzHVRw&cs=360x0",
        badge: null,
        inStock: true,
        popular: false,
        notes: ["лимон", "белый мускус", "бергамот"]
    },
    {
        id: 17,
        name: "Aamal Perfume Kirkèy",
        description: "Aamal Perfume Kirkèy — выразительный и устойчивый аромат в стильном серебристом  флаконе объёмом 10 мл. Композиция раскрывается яркими верхними акцентами, продолжает с насыщенным сердцем, а в базе остаётся тёплая, благородная древесно-амбровая подложка.",
        price: 600,
        oldPrice: 0,
        category: "premium",
        volume: 10,
        rating: 4.9,
        reviews: 812,
        image: "https://sun9-88.userapi.com/s/v1/ig2/rTw-cKmVkkw3lCPa5uzf-XhDLQXVxkC97Wp14jqjC--1nMdE5qDAK82u9q-yoYe3j7e_0Wshx9EGY-JSE1FVBkzV.jpg?quality=95&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720,1080x1080,1280x1280,1440x1440,2560x2560&from=bu&u=cB1Hj3xqPdYrsJuEGjMwZ8cjtK3h4jxlBiJBYwKJwmE&cs=360x0",
        badge: "new",
        inStock: true,
        popular: true,
        notes: ["дерево", "амбра", "сердце"]
    },   
    {
        id: 18,
        name: "DolceGabbana L'IMPÉRATRICE 3",
        description: "DolceGabbana L'IMPÉRATRICE 3 - изящный и игривый фруктово-цветочный парфюм в концентрации Eau de Parfum. Аромат раскрывается сочными акцентами цитрусовых и зелёных фруктов, плавно переходит в сердце из нежных цветочных нот и завершает композицию лёгкой мускусно-древесной базой. Подчёркивает женственность и хорошее настроение, отлично подойдёт для дневных выходов, свиданий и в качестве подарка. Рекомендации по использованию и уходу: Наносите на чистую кожу на запястья и шею. Храните в прохладном, сухом месте вдали от прямых солнечных лучей.",
        price: 800,
        oldPrice: 0,
        category: "premium",
        volume: 25,
        rating: 4.9,
        reviews: 832,
        image: "https://sun9-69.userapi.com/s/v1/ig2/gA5hz2p9kPwvAerpx6g5Eg19OK0Gqu9Tcc92rXgZ1eJP7LT4CgdYwojrELgx8tFUq1mexghkxK9GCZVT_ZPwfvn4.jpg?quality=95&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720,1080x1080,1280x1280,1440x1440,2560x2560&from=bu&u=qhXA7Smf8X5x0aDKtq2k_QGxp0csE1vR3Qo8nQu3HKo&cs=360x0",
        badge: "new",
        inStock: true,
        popular: true,
        notes: ["цитрусы", "зелёные фрукты", "древесно-мускусный"]
    },
    {
        id: 19,
        name: "Narcotiq Aksa Esans",
        description: "Авто духи Narcotiq Aksa Esans — это идеальное решение для тех, кто хочет добавить уникальный аромат в свой автомобиль Особенности Narcotiq Aksa Esans: Уникальный аромат: Сочетание свежести и теплоты, которое создаст атмосферу уюта и комфорта в вашем автомобиле. Почему стоит выбрать Narcotiq Aksa Esans? Эти авто духи идеально подходят для любых автомобилей и станут отличным подарком для друзей и близких. Создайте уникальную атмосферу в своем автомобиле с Narcotiq Aksa Esans! Не упустите возможность сделать ваши поездки более приятными! Заказывайте уже сегодня! Эти духи созданы с использованием высококачественных ингредиентов, что обеспечивает стойкость и насыщенность аромата.",
        price: 350,
        oldPrice: 0,
        category: "new",
        volume: 6,
        rating: 4.9,
        reviews: 152,
        image: "https://sun9-21.userapi.com/s/v1/ig2/3APuudW8_9XaoVk5ejtsGuhqnMUEvnAwTe_2PPc2d2JqW5p0kFY-JiA39U11ooLnSje7xtPr0es-r2KjmLkPwI8E.jpg?quality=95&as=32x32,48x48,72x72,108x108,160x160,240x240,360x360,480x480,540x540,640x640,720x720,1080x1080,1280x1280,1440x1440,2560x2560&from=bu&u=XI58JvJb2axcWb8x7spZ00qQmoorfkkdf53Oosgg6t4&cs=360x0",
        badge: "new",
        inStock: true,
        popular: true,
    },
    {
        id: 20,

// ===== ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM загружен, инициализируем приложение...');
    
    // Инициализация авторизации
    initAuth();
    
    // Затем остальные компоненты
    loadData();
    setupBanners();
    renderProducts();
    updateCartCount();
    setupFilterPopup();
    initEventListeners();
    loadAddress();
    
    console.log('Приложение инициализировано. Авторизация:', isLoggedIn ? 'Да' : 'Нет');
});

// ===== СИСТЕМА АВТОРИЗАЦИИ =====
let authUser = null;

function generateUserId() {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 9; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function initAuth() {
    // Загружаем сохраненную сессию
    const savedAuth = loadFromStorage(STORAGE_KEYS.AUTH);
    if (savedAuth && savedAuth.userId && savedAuth.username) {
        authUser = savedAuth;
        isLoggedIn = true;
        updateProfileUI();
    }
    
    // Инициализируем базу пользователей (для демо)
    if (!loadFromStorage(STORAGE_KEYS.USERS)) {
        saveToStorage(STORAGE_KEYS.USERS, {
            'demo': {
                password: 'demo123',
                userId: generateUserId(),
                username: 'demo',
                firstName: 'Демо',
                lastName: 'Пользователь',
                created: new Date().toISOString()
            }
        });
    }
}

function login(username, password) {
    const users = loadFromStorage(STORAGE_KEYS.USERS, {});
    
    if (!users[username]) {
        // Создаем нового пользователя
        const userId = generateUserId();
        users[username] = {
            password: password,
            userId: userId,
            username: username,
            firstName: username,
            lastName: '',
            created: new Date().toISOString()
        };
        saveToStorage(STORAGE_KEYS.USERS, users);
    } else if (users[username].password !== password) {
        return { success: false, message: 'Неверный пароль' };
    }
    
    // Сохраняем сессию
    authUser = {
        userId: users[username].userId,
        username: username,
        firstName: users[username].firstName,
        lastName: users[username].lastName
    };
    
    saveToStorage(STORAGE_KEYS.AUTH, authUser);
    isLoggedIn = true;
    
    // Обновляем профиль
    userProfile = {
        id: authUser.userId,
        username: authUser.username,
        firstName: authUser.firstName,
        lastName: authUser.lastName || '',
        authDate: Date.now()
    };
    
    updateProfileUI();
    updateCheckoutButton(); // Обновляем кнопку оформления заказа
    
    return { success: true };
}

function logout() {
    authUser = null;
    isLoggedIn = false;
    userProfile = null;
    saveToStorage(STORAGE_KEYS.AUTH, null);
    updateProfileUI();
    updateCheckoutButton(); // Обновляем кнопку оформления заказа
    showNotification('Вы вышли из аккаунта', 'info');
    closeAuthModal();
    closeProfilePopup();
}

// ===== МОДАЛЬНОЕ ОКНО АВТОРИЗАЦИИ =====
function openAuthModal() {
    const modal = document.getElementById('authModal');
    const overlay = document.getElementById('overlay');
    
    if (modal && overlay) {
        modal.classList.add('show');
        overlay.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Фокус на поле ввода
        setTimeout(() => {
            const usernameInput = document.getElementById('authUsername');
            if (usernameInput) usernameInput.focus();
        }, 100);
    }
}

function closeAuthModal() {
    const modal = document.getElementById('authModal');
    const overlay = document.getElementById('overlay');
    
    if (modal) modal.classList.remove('show');
    if (overlay) overlay.classList.remove('show');
    document.body.style.overflow = 'auto';
}

function handleLogin() {
    const username = document.getElementById('authUsername').value.trim();
    const password = document.getElementById('authPassword').value;
    
    if (!username || !password) {
        showNotification('Заполните все поля', 'warning');
        return;
    }
    
    const result = login(username, password);
    
    if (result.success) {
        showNotification('Вы успешно вошли!', 'success');
        closeAuthModal();
        closeProfilePopup();
    } else {
        showNotification(result.message, 'error');
    }
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
    
    // Загружаем транзакции из localStorage
    transactions = loadFromStorage(STORAGE_KEYS.TRANSACTIONS, []);
    
    // Сортируем по новизне (по умолчанию)
    filteredProducts.sort((a, b) => b.id - a.id);
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

// ===== ФУНКЦИИ ПРОФИЛЯ =====
function updateProfileUI() {
    const userInfo = document.getElementById('userInfo');
    const loginBtn = document.getElementById('profileLoginBtn');
    const loginBtnText = document.getElementById('loginBtnText');
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutContainer = document.getElementById('logoutContainer');
    const userName = document.getElementById('userName');
    const userId = document.getElementById('userId');
    const loginBtnContainer = document.getElementById('loginBtnContainer');
    
    if (isLoggedIn && authUser) {
        // Показываем информацию пользователя
        if (userInfo) userInfo.style.display = 'flex';
        if (userName) userName.textContent = authUser.firstName || authUser.username;
        if (userId) userId.textContent = `ID: ${authUser.userId}`;
        
        // Обновляем кнопку входа
        if (loginBtn && loginBtnContainer) {
            loginBtn.innerHTML = `<i class="fas fa-user-circle"></i><span>${authUser.firstName || authUser.username}</span>`;
            loginBtn.classList.add('logged-in');
            loginBtnContainer.style.display = 'block';
        }
        if (loginBtnText) loginBtnText.textContent = authUser.firstName || authUser.username;
        
        // Показываем контейнер с кнопкой выхода
        if (logoutContainer) logoutContainer.style.display = 'block';
        
    } else {
        // Скрываем информацию пользователя
        if (userInfo) userInfo.style.display = 'none';
        
        // Обновляем кнопку входа
        if (loginBtn && loginBtnContainer) {
            loginBtn.innerHTML = '<i class="fas fa-user"></i><span>Войти</span>';
            loginBtn.classList.remove('logged-in');
            loginBtnContainer.style.display = 'block';
        }
        if (loginBtnText) loginBtnText.textContent = 'Войти';
        
        // Скрываем контейнер с кнопкой выхода
        if (logoutContainer) logoutContainer.style.display = 'none';
    }
}

function addTransaction(orderData) {
    const transaction = {
        id: Date.now(),
        date: new Date().toLocaleString('ru-RU'),
        items: orderData.items,
        total: orderData.total,
        address: orderData.deliveryAddress,
        status: 'completed'
    };
    
    transactions.unshift(transaction); // Добавляем в начало
    saveToStorage(STORAGE_KEYS.TRANSACTIONS, transactions);
    updateTransactionsUI();
}

function updateTransactionsUI() {
    const transactionsList = document.getElementById('transactionsList');
    if (!transactionsList) return;
    
    // Удаляем старую кнопку очистки, если она есть
    const oldClearBtn = document.getElementById('clearTransactionsBtn');
    if (oldClearBtn) oldClearBtn.remove();
    
    if (transactions.length === 0) {
        transactionsList.innerHTML = `
            <div class="empty-transactions">
                <i class="fas fa-receipt"></i>
                <p>У вас пока нет транзакций</p>
            </div>
        `;
        return;
    }
    
    transactionsList.innerHTML = '';
    
    transactions.forEach(transaction => {
        const itemsText = transaction.items.map(item => 
            `${item.name} × ${item.quantity}`
        ).join(', ');
        
        const transactionElement = document.createElement('div');
        transactionElement.className = 'transaction-item';
        transactionElement.innerHTML = `
            <div class="transaction-header">
                <div class="transaction-date">${transaction.date}</div>
                <div class="transaction-amount">${transaction.total.toLocaleString()} ₽</div>
            </div>
            <div class="transaction-items">${itemsText}</div>
            <div class="transaction-status completed">Завершено</div>
        `;
        
        transactionsList.appendChild(transactionElement);
    });
    
    // Добавляем кнопку очистки
    addClearTransactionsButton();
}

function addClearTransactionsButton() {
    // Удаляем старую кнопку очистки, если она есть
    const oldClearBtn = document.getElementById('clearTransactionsBtn');
    if (oldClearBtn) oldClearBtn.remove();
    
    if (transactions.length === 0) return;
    
    // Создаем кнопку
    const clearBtn = document.createElement('button');
    clearBtn.id = 'clearTransactionsBtn';
    clearBtn.className = 'clear-transactions-btn';
    clearBtn.innerHTML = '<i class="fas fa-trash"></i>';
    clearBtn.title = 'Очистить историю транзакций';
    
    // Добавляем обработчик
    clearBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        
        if (confirm('Вы уверены, что хотите очистить всю историю транзакций?')) {
            transactions = [];
            saveToStorage(STORAGE_KEYS.TRANSACTIONS, transactions);
            updateTransactionsUI();
            showNotification('История транзакций очищена', 'info');
        }
    });
    
    // Добавляем кнопку в список транзакций, а не в весь попап
    const transactionsList = document.getElementById('transactionsList');
    if (transactionsList) {
        transactionsList.appendChild(clearBtn);
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
function setupBanners() {
    const bannerContainer = document.getElementById('bannerContainer');
    if (!bannerContainer) return;
    
    // Очищаем контейнер
    bannerContainer.innerHTML = '';
    
    // Фильтруем включенные баннеры
    const enabledBanners = bannerConfig.banners.filter(b => b.enabled);
    
    if (enabledBanners.length === 0) {
        bannerContainer.style.display = 'none';
        return;
    }
    
    enabledBanners.forEach((banner, index) => {
        const slide = document.createElement('div');
        slide.className = `banner-slide ${banner.type === 'image' ? 'image-banner' : banner.gradient} ${index === 0 ? 'active' : ''}`;
        slide.dataset.bannerId = banner.id;
        
        // Устанавливаем изображение если тип image
        if (banner.type === 'image' && banner.imageUrl) {
            slide.style.backgroundImage = `url('${banner.imageUrl}')`;
            slide.style.backgroundSize = 'cover';
            slide.style.backgroundPosition = 'center center';
            slide.style.backgroundRepeat = 'no-repeat';
            
            // Для баннера с картинкой НЕ добавляем banner-content вообще
            // Только картинка и ссылка
        } else {
            // Для градиентных баннеров добавляем текст
            if (banner.title || banner.text) {
                const bannerContent = document.createElement('div');
                bannerContent.className = 'banner-content';
                
                if (banner.title && banner.title.trim() !== '') {
                    const h1 = document.createElement('h1');
                    h1.textContent = banner.title;
                    bannerContent.appendChild(h1);
                }
                
                if (banner.text && banner.text.trim() !== '') {
                    const p = document.createElement('p');
                    p.innerHTML = banner.text;
                    bannerContent.appendChild(p);
                }
                
                slide.appendChild(bannerContent);
            }
        }
        
        // Добавляем ссылку если указана - КАЖДЫЙ БАННЕР СО СВОЕЙ ССЫЛКОЙ
        if (banner.link && banner.link.trim() !== '') {
            const link = document.createElement('a');
            link.className = 'banner-link';
            link.href = banner.link;
            link.dataset.bannerId = banner.id;
            
            // Настройка для открытия ссылок
            if (banner.link.startsWith('http')) {
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
            }
            
            // Ссылка не должна быть видна вообще
            link.style.opacity = '0';
            link.style.display = 'block';
            link.style.width = '100%';
            link.style.height = '100%';
            link.style.position = 'absolute';
            link.style.top = '0';
            link.style.left = '0';
            link.style.zIndex = '3';
            
            slide.appendChild(link);
        }
        
        bannerContainer.appendChild(slide);
    });
    
    // Автопереключение баннеров
    if (enabledBanners.length > 1) {
        let currentBannerIndex = 0;
        setInterval(() => {
            const slides = bannerContainer.querySelectorAll('.banner-slide');
            if (slides.length <= 1) return;
            
            slides[currentBannerIndex].classList.remove('active');
            currentBannerIndex = (currentBannerIndex + 1) % slides.length;
            slides[currentBannerIndex].classList.add('active');
        }, bannerConfig.switchInterval);
    }
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
                <h3 style="margin-bottom: 10px; color: var(--color-text);">Товары не найдены</h3>
                <p style="color: var(--color-text-secondary); margin-bottom: 20px;">Попробуйте изменить параметры поиска или фильтры</p>
                <button class="btn-filter-reset" onclick="resetFilters()" style="margin: 0 auto;">Сбросить фильтры</button>
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
            badgeHtml = '<span class="badge-new">Новинка</span>';
        } else if (product.badge === 'sale') {
            badgeHtml = '<span class="badge-sale">Скидка</span>';
        } else if (product.badge === 'hit') {
            badgeHtml = '<span class="badge-hit">Хит</span>';
        }
        
        const discountPercent = product.oldPrice > 0 
            ? Math.round((1 - product.price / product.oldPrice) * 100)
            : 0;
        
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
            
            <div class="product-description-short">${product.description.substring(0, 60)}${product.description.length > 60 ? '...' : ''}</div>
            
            <div class="product-rating-wb">
                <div class="rating-stars">
                    ${renderStars(product.rating, true)}
                </div>
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

function renderStars(rating, showOneStar = false) {
    if (showOneStar) {
        if (rating >= 4.5) {
            return '<i class="fas fa-star"></i>';
        } else if (rating >= 3.5) {
            return '<i class="fas fa-star-half-alt"></i>';
        } else {
            return '<i class="far fa-star"></i>';
        }
    }
    
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
        // Удаляем из выбранных, если был выбран
        const selectedIndex = selectedCartItems.indexOf(productId);
        if (selectedIndex !== -1) {
            selectedCartItems.splice(selectedIndex, 1);
        }
        showNotification(`${product.name} удален из корзины`, 'info');
    } else {
        cart.push({
            ...product,
            quantity: 1,
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
                <button class="btn-browse-glass" onclick="closeCartPopup()">Перейти к покупкам</button>
            </div>
        `;
        cartTotal.textContent = '0 ₽';
        cartFinal.textContent = '0 ₽';
        return;
    }
    
    // Добавляем контролы выбора
    cartItems.innerHTML = `
        <div class="cart-selection-controls">
            <div class="select-all-container">
                <div class="select-all-checkbox ${selectedCartItems.length === cart.length && cart.length > 0 ? 'checked' : ''}" id="selectAllCheckbox">
                    <i class="fas fa-check"></i>
                </div>
                <span class="select-all-label" id="selectAllLabel">Выбрать всё</span>
            </div>
            <span class="selected-count" id="selectedCount">Выбрано: ${selectedCartItems.length}</span>
        </div>
    `;
    
    // Добавляем обработчик для "Выбрать всё"
    document.getElementById('selectAllCheckbox').addEventListener('click', toggleSelectAll);
    document.getElementById('selectAllLabel').addEventListener('click', toggleSelectAll);
    
    // Отрисовываем товары
    cart.forEach(item => {
        const isSelected = selectedCartItems.includes(item.id);
        const itemElement = document.createElement('div');
        itemElement.className = `cart-item ${isSelected ? 'selected' : ''}`;
        itemElement.dataset.id = item.id;
        
        itemElement.innerHTML = `
            <div class="cart-item-checkbox">
                <div class="checkmark ${isSelected ? 'checked' : ''}">
                    <i class="fas fa-check"></i>
                </div>
            </div>
            <div class="cart-item-content">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-details">
                    <h4 class="cart-item-title">${item.name}</h4>
                    <div class="cart-item-price">${item.price.toLocaleString()} ₽</div>
                </div>
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
        
        // Добавляем обработчик для чекбокса
        const checkbox = itemElement.querySelector('.cart-item-checkbox');
        if (checkbox) {
            checkbox.addEventListener('click', function(e) {
                e.stopPropagation();
                toggleCartItemSelection(item.id);
            });
        }
    });
    
    updateCartSummary();
    updateCheckoutButton();
}

function toggleCartItemSelection(productId) {
    const index = selectedCartItems.indexOf(productId);
    
    if (index === -1) {
        // Добавляем
        selectedCartItems.push(productId);
    } else {
        // Удаляем
        selectedCartItems.splice(index, 1);
    }
    
    // Обновляем UI
    const itemElement = document.querySelector(`.cart-item[data-id="${productId}"]`);
    if (itemElement) {
        const checkmark = itemElement.querySelector('.checkmark');
        if (selectedCartItems.includes(productId)) {
            itemElement.classList.add('selected');
            if (checkmark) checkmark.classList.add('checked');
        } else {
            itemElement.classList.remove('selected');
            if (checkmark) checkmark.classList.remove('checked');
        }
    }
    
    // Обновляем счетчик
    updateSelectedCount();
    updateSelectAllState();
    updateCheckoutButton();
    updateCartSummary();
}

function toggleSelectAll() {
    const allSelected = selectedCartItems.length === cart.length && cart.length > 0;
    
    if (allSelected) {
        // Снимаем выделение со всех
        selectedCartItems = [];
    } else {
        // Выбираем все
        selectedCartItems = cart.map(item => item.id);
    }
    
    // Обновляем UI
    document.querySelectorAll('.cart-item').forEach(item => {
        const productId = parseInt(item.dataset.id);
        const checkmark = item.querySelector('.checkmark');
        
        if (selectedCartItems.includes(productId)) {
            item.classList.add('selected');
            if (checkmark) checkmark.classList.add('checked');
        } else {
            item.classList.remove('selected');
            if (checkmark) checkmark.classList.remove('checked');
        }
    });
    
    updateSelectedCount();
    updateSelectAllState();
    updateCheckoutButton();
    updateCartSummary();
}

function updateSelectedCount() {
    const selectedCountElement = document.getElementById('selectedCount');
    if (selectedCountElement) {
        selectedCountElement.textContent = `Выбрано: ${selectedCartItems.length}`;
    }
}

function updateSelectAllState() {
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    if (selectAllCheckbox) {
        const allSelected = selectedCartItems.length === cart.length && cart.length > 0;
        selectAllCheckbox.classList.toggle('checked', allSelected);
    }
}

function updateCartSummary() {
    const cartTotal = document.getElementById('cartTotal');
    const cartFinal = document.getElementById('cartFinal');
    
    // Считаем только выбранные товары
    const selectedItems = cart.filter(item => selectedCartItems.includes(item.id));
    const subtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = selectedItems.reduce((sum, item) => {
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
    
    // Удаляем из выбранных
    const selectedIndex = selectedCartItems.indexOf(productId);
    if (selectedIndex !== -1) {
        selectedCartItems.splice(selectedIndex, 1);
    }
    
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
    const hasSelectedItems = selectedCartItems.length > 0;
    
    // Если пользователь не авторизован
    if (!isLoggedIn) {
        checkoutBtn.disabled = false; // Кнопка активна
        checkoutBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Войти для заказа';
        checkoutBtn.style.opacity = '1';
        checkoutBtn.style.cursor = 'pointer';
        checkoutBtn.title = 'Войдите в аккаунт для оформления заказа';
        return;
    }
    
    // Если пользователь авторизован, проверяем остальные условия
    if (!isAddressSaved || !deliveryAddress) {
        checkoutBtn.disabled = true;
        checkoutBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Оформить заказ';
        checkoutBtn.style.opacity = '0.5';
        checkoutBtn.style.cursor = 'not-allowed';
        checkoutBtn.title = 'Укажите адрес доставки';
    } else if (!hasItems) {
        checkoutBtn.disabled = true;
        checkoutBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Оформить заказа';
        checkoutBtn.style.opacity = '0.5';
        checkoutBtn.style.cursor = 'not-allowed';
        checkoutBtn.title = 'Добавьте товары в корзину';
    } else if (!hasSelectedItems) {
        checkoutBtn.disabled = true;
        checkoutBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Оформить заказ';
        checkoutBtn.style.opacity = '0.5';
        checkoutBtn.style.cursor = 'not-allowed';
        checkoutBtn.title = 'Выберите товары для заказа';
    } else {
        checkoutBtn.disabled = false;
        checkoutBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Оформить заказ';
        checkoutBtn.style.opacity = '1';
        checkoutBtn.style.cursor = 'pointer';
        checkoutBtn.title = 'Оформить заказ выбранных товаров';
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
                            <span class="fav-item-volume">${item.volume} мл</span>
                            <span class="fav-item-category">${getCategoryName(item.category)}</span>
                        </div>
                    </div>
                    <button class="remove-from-fav" onclick="removeFromFavorites(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <button class="btn-add-to-cart-from-fav" onclick="toggleCart(${item.id})">
                    <i class="fas fa-shopping-cart"></i> В корзину
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
        badgeHtml = '<span class="modal-badge modal-badge-new">Новинка</span>';
    } else if (product.badge === 'sale') {
        badgeHtml = '<span class="modal-badge modal-badge-sale">Скидка</span>';
    } else if (product.badge === 'hit') {
        badgeHtml = '<span class="modal-badge modal-badge-hit">Хит</span>';
    }
    
    const notesHtml = product.notes ? 
        product.notes.map(note => `<span class="note-tag">${note}</span>`).join('') : 
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
                        <span class="meta-volume">
                            <i class="fas fa-weight"></i> ${product.volume} мл
                        </span>
                        <span class="meta-gender">
                            <i class="fas fa-${getGenderIcon(product.gender)}"></i> ${getGenderName(product.gender)}
                        </span>
                        <span class="meta-stock ${product.inStock ? 'in-stock' : 'out-of-stock'}">
                            <i class="fas ${product.inStock ? 'fa-check-circle' : 'fa-times-circle'}"></i> 
                            ${product.inStock ? 'В наличии' : 'Нет в наличии'}
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
                        <h3><i class="fas fa-info-circle"></i> Описание</h3>
                        <p>${product.description}</p>
                    </div>
                    
                    <div class="product-notes">
                        <h3><i class="fas fa-wind"></i> Ноты аромата</h3>
                        <div class="notes-container">
                            ${notesHtml}
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
                            ${isInCart ? 'В корзине' : 'Добавить в корзину'}
                        </button>
                        <button class="btn-add-to-fav ${isInFavorites ? 'active' : ''}" data-id="${product.id}">
                            <i class="${isInFavorites ? 'fas' : 'far'} fa-heart"></i>
                        </button>
                    </div>
                    
                    <div class="product-features">
                        <div class="feature">
                            <i class="fas fa-shipping-fast"></i>
                            <span>Бесплатная доставка по Симферополю</span>
                        </div>
                        <div class="feature">
                            <i class="fas fa-shield-alt"></i>
                            <span>100% оригинальная продукция</span>
                        </div>
                        <div class="feature">
                            <i class="fas fa-award"></i>
                            <span>Гарантия качества</span>
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
                        this.innerHTML = '<i class="fas fa-check"></i> В корзине';
                        this.classList.add('in-cart');
                    } else {
                        this.innerHTML = '<i class="fas fa-shopping-cart"></i> Добавить в корзину';
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

// ===== ОБРАБОТКА ЗАКАЗОВ =====
function processOrder() {
    // Проверяем, авторизован ли пользователь
    if (!isLoggedIn) {
        showNotification('Для заказа духов нужно войти в аккаунт в приложении', 'warning');
        
        // Закрываем корзину и открываем профиль
        setTimeout(() => {
            closeCartPopup();
            setTimeout(() => {
                openProfilePopup();
            }, 300);
        }, 1000);
        
        return;
    }
    
    if (cart.length === 0) {
        showNotification('Добавьте товары в корзину', 'info');
        return;
    }
    
    if (!isAddressSaved || !deliveryAddress) {
        showNotification('Сначала укажите адрес доставки', 'warning');
        
        const addressInput = document.getElementById('deliveryAddress');
        if (addressInput) {
            addressInput.focus();
        }
        return;
    }
    
    // Проверяем, что выбраны товары
    if (selectedCartItems.length === 0) {
        showNotification('Выберите товары для заказа', 'warning');
        return;
    }
    
    // Фильтруем только выбранные товары
    const selectedItems = cart.filter(item => selectedCartItems.includes(item.id));
    const total = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Формируем текст заказа
    const orderItems = selectedItems.map(item => 
        `${item.name} - ${item.quantity} × ${item.price.toLocaleString()}₽ = ${(item.price * item.quantity).toLocaleString()}₽`
    ).join('\n');
    
    const orderText = `
📨 **Новый заказ в Aura Atelier**

📦 **Товары (${selectedItems.length}):**
${orderItems}

🧾 **Итого:** ${total.toLocaleString()}₽
📍 **Адрес доставки:** ${deliveryAddress}
📅 **Дата:** ${new Date().toLocaleString('ru-RU')}
👤 **Покупатель:** ${authUser ? authUser.firstName || authUser.username : 'Неавторизованный пользователь'}

💬 **Связь:** @Ayder505
    `.trim();
    
    // Отправляем в Telegram через ссылку
    const telegramUrl = `https://t.me/Ayder505?text=${encodeURIComponent(orderText)}`;
    window.open(telegramUrl, '_blank');
    showNotification(`Заказ на ${total.toLocaleString()}₽ отправлен менеджеру`, 'success');
    
    // Сохраняем транзакцию
    addTransaction({
        items: selectedItems,
        total: total,
        deliveryAddress: deliveryAddress
    });
    
    // Удаляем только выбранные товары из корзины
    cart = cart.filter(item => !selectedCartItems.includes(item.id));
    selectedCartItems = [];
    saveToStorage(STORAGE_KEYS.CART, cart);
    updateCartCount();
    updateCartPopup();
    renderProducts();
    
    closeCartPopup();
}

// ===== ФИЛЬТРЫ И ПОИСК =====
function filterProducts() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const priceMin = parseInt(document.getElementById('filterPriceMin').value) || 350;
    const priceMax = parseInt(document.getElementById('filterPriceMax').value) || 50000;
    const sortBy = document.getElementById('sortBy').value;
    
    const selectedCategories = Array.from(document.querySelectorAll('.filter-category:checked'))
        .map(cb => cb.value);
    
    const selectedGenders = Array.from(document.querySelectorAll('.filter-gender:checked'))
        .map(cb => cb.value);
    
    const selectedVolumes = Array.from(document.querySelectorAll('.filter-volume:checked'))
        .map(cb => parseInt(cb.value));
    
    const rating47Checked = document.getElementById('filterRating47')?.checked || false;
    const originalChecked = document.getElementById('filterOriginal')?.checked || false;
    const saleChecked = document.getElementById('filterSale')?.checked || false;
    const cashbackChecked = document.getElementById('filterCashback')?.checked || false;

    filteredProducts = allProducts.filter(product => {
        if (searchTerm && !product.name.toLowerCase().includes(searchTerm) && 
            !product.description.toLowerCase().includes(searchTerm)) {
            return false;
        }
        
        if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
            return false;
        }
        
        if (selectedGenders.length > 0 && !selectedGenders.includes(product.gender)) {
            return false;
        }
        
        if (product.price < priceMin || product.price > priceMax) {
            return false;
        }
        
        if (selectedVolumes.length > 0 && !selectedVolumes.includes(product.volume)) {
            return false;
        }
        
        // Фильтр по рейтингу 4.7
        if (rating47Checked && product.rating < 4.7) {
            return false;
        }
        
        // Фильтр "Оригинальный товар" (пока пропускаем все)
        // if (originalChecked && !product.isOriginal) { ... }
        
        // Фильтр "Распродажа" - скрываем все товары
        if (saleChecked) {
            return false;
        }
        
        // Фильтр "Кэшбэк" - скрываем все товары
        if (cashbackChecked) {
            return false;
        }
        
        return true;
    });
    
    // Сортировка
    if (sortBy === 'popular') {
        filteredProducts.sort((a, b) => b.id - a.id); // Новые первыми
    } else {
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
            default:
                filteredProducts.sort((a, b) => b.id - a.id);
                break;
        }
    }
    
    currentPage = 1;
    renderProducts();
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('filterPriceMin').value = '350';
    document.getElementById('filterPriceMax').value = '';
    document.getElementById('sortBy').value = 'popular';
    
    document.querySelectorAll('.filter-category').forEach(cb => {
        cb.checked = true;
    });
    
    document.querySelectorAll('.filter-gender').forEach(cb => {
        cb.checked = true;
    });
    
    document.querySelectorAll('.filter-volume').forEach(cb => {
        cb.checked = false;
    });
    
    document.getElementById('filterRating47').checked = false;
    document.getElementById('filterOriginal').checked = false;
    document.getElementById('filterSale').checked = false;
    document.getElementById('filterCashback').checked = false;
    
    closeFilterPopup();
    
    filterProducts();
    
    showNotification('Фильтры сброшены', 'info');
}

function setupFilterPopup() {
    const filterContent = document.querySelector('.filter-content');
    if (!filterContent) return;
    
    filterContent.innerHTML = `
        <div class="filter-group">
            <h4>Категории</h4>
            <div class="checkbox-group">
                <label class="checkbox">
                    <input type="checkbox" class="filter-category" value="premium" checked>
                    <span class="checkmark"></span>
                    Премиум
                </label>
                <label class="checkbox">
                    <input type="checkbox" class="filter-category" value="affordable" checked>
                    <span class="checkmark"></span>
                    Доступные
                </label>
                <label class="checkbox">
                    <input type="checkbox" class="filter-category" value="new" checked>
                    <span class="checkmark"></span>
                    Новинки
                </label>
                <label class="checkbox">
                    <input type="checkbox" class="filter-category" value="auto" checked>
                    <span class="checkmark"></span>
                    Авто-духи
                </label>
            </div>
        </div>
        
        <div class="filter-group">
            <h4>Пол</h4>
            <div class="checkbox-group">
                <label class="checkbox">
                    <input type="checkbox" class="filter-gender" value="male" checked>
                    <span class="checkmark"></span>
                    Мужские
                </label>
                <label class="checkbox">
                    <input type="checkbox" class="filter-gender" value="female" checked>
                    <span class="checkmark"></span>
                    Женские
                </label>
                <label class="checkbox">
                    <input type="checkbox" class="filter-gender" value="unisex" checked>
                    <span class="checkmark"></span>
                    Унисекс
                </label>
            </div>
        </div>
        
        <div class="filter-group">
            <h4>Цена</h4>
            <div class="price-range">
                <div class="range-inputs">
                    <input type="number" id="filterPriceMin" placeholder="350" min="350" value="350">
                    <span class="range-divider">-</span>
                    <input type="number" id="filterPriceMax" placeholder="50000" min="350">
                </div>
            </div>
        </div>
        
        <div class="filter-group">
            <h4>Объем, мл</h4>
            <div class="checkbox-group">
                <label class="checkbox">
                    <input type="checkbox" class="filter-volume" value="6">
                    <span class="checkmark"></span>
                    6 мл
                </label>
                <label class="checkbox">
                    <input type="checkbox" class="filter-volume" value="10">
                    <span class="checkmark"></span>
                    10 мл
                </label>
                <label class="checkbox">
                    <input type="checkbox" class="filter-volume" value="25">
                    <span class="checkmark"></span>
                    25 мл
                </label>
            </div>
        </div>
        
        <div class="filter-group">
            <h4>Дополнительные фильтры</h4>
            <div class="checkbox-group">
                <label class="checkbox checkbox-with-icon">
                    <input type="checkbox" id="filterRating47" class="filter-rating47">
                    <span class="checkmark"></span>
                    <i class="fas fa-star" style="color: #FFAA00;"></i> С рейтингом от 4.7
                </label>
                <label class="checkbox checkbox-with-icon">
                    <input type="checkbox" id="filterOriginal" class="filter-original">
                    <span class="checkmark"></span>
                    <i class="fas fa-shield-alt"></i> Оригинальный товар
                </label>
                <label class="checkbox checkbox-with-icon">
                    <input type="checkbox" id="filterSale" class="filter-sale">
                    <span class="checkmark"></span>
                    <i class="fas fa-fire"></i> Распродажа
                </label>
                <label class="checkbox checkbox-with-icon">
                    <input type="checkbox" id="filterCashback" class="filter-cashback">
                    <span class="checkmark"></span>
                    <i class="fas fa-money-bill-wave"></i> Кэшбэк
                </label>
            </div>
        </div>
        
        <div class="filter-buttons">
            <button class="btn-filter-apply" id="applyFilterBtn">
                <i class="fas fa-check"></i> Применить
            </button>
            <button class="btn-filter-reset" id="resetFilterBtn">
                <i class="fas fa-redo"></i> Сбросить
            </button>
        </div>
    `;
    
    const priceMinInput = document.getElementById('filterPriceMin');
    const priceMaxInput = document.getElementById('filterPriceMax');
    
    if (priceMinInput && priceMaxInput) {
        priceMinInput.addEventListener('change', function() {
            const min = parseInt(this.value) || 350;
            if (min < 350) {
                this.value = 350;
            }
        });
    }
    
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

function openProfilePopup() {
    document.getElementById('profilePopup').classList.add('show');
    document.getElementById('overlay').classList.add('show');
    document.body.style.overflow = 'hidden';
    updateProfileUI();
}

function closeProfilePopup() {
    document.getElementById('profilePopup').classList.remove('show');
    document.getElementById('overlay').classList.remove('show');
    document.body.style.overflow = 'auto';
}

function openTransactionsPopup() {
    document.getElementById('transactionsPopup').classList.add('show');
    document.getElementById('overlay').classList.add('show');
    document.body.style.overflow = 'hidden';
    updateTransactionsUI();
    
    // Добавляем кнопку очистки
    setTimeout(() => {
        addClearTransactionsButton();
    }, 100);
}

function closeTransactionsPopup() {
    document.getElementById('transactionsPopup').classList.remove('show');
    document.getElementById('overlay').classList.remove('show');
    document.body.style.overflow = 'auto';
}

// ===== УТИЛИТЫ =====
function getCategoryName(category) {
    const categories = {
        premium: 'Премиум коллекция',
        affordable: 'Доступные духи',
        new: 'Новинки',
        auto: 'Авто-духи'
    };
    return categories[category] || category;
}

function getGenderName(gender) {
    const genders = {
        male: 'Мужские',
        female: 'Женские',
        unisex: 'Унисекс'
    };
    return genders[gender] || gender || 'Не указано';
}

function getGenderIcon(gender) {
    const icons = {
        male: 'mars',
        female: 'venus',
        unisex: 'transgender'
    };
    return icons[gender] || 'question';
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
                    filteredProducts.sort((a, b) => b.id - a.id);
                    currentPage = 1;
                    renderProducts();
                }
            }, 300);
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
    document.getElementById('navProfile')?.addEventListener('click', openProfilePopup);
    
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
    document.getElementById('profileCloseBtn')?.addEventListener('click', closeProfilePopup);
    document.getElementById('closeTransactions')?.addEventListener('click', closeTransactionsPopup);
    
    // Оверлей для закрытия попапов
    document.getElementById('overlay')?.addEventListener('click', function() {
        closeCartPopup();
        closeFavoritesPopup();
        closeFilterPopup();
        closeProductDetailsModal();
        closeProfilePopup();
        closeTransactionsPopup();
        closeAuthModal();
    });
    
    // Обработчики для профиля
    document.getElementById('profileLoginBtn')?.addEventListener('click', function() {
        if (!isLoggedIn) {
            openAuthModal();
        } else {
            openProfilePopup();
        }
    });
    
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
    
    document.getElementById('transactionsBtn')?.addEventListener('click', function() {
        if (isLoggedIn) {
            closeProfilePopup();
            setTimeout(() => {
                openTransactionsPopup();
            }, 300);
        } else {
            showNotification('Сначала войдите в аккаунт', 'warning');
        }
    });
    
    document.getElementById('referralBtn')?.addEventListener('click', function() {
        showNotification('Реферальная программа временно недоступна', 'info');
    });
    
    // Оформление заказа
    document.getElementById('checkoutBtn')?.addEventListener('click', function(e) {
        // Если пользователь не авторизован, перенаправляем в профиль
        if (!isLoggedIn) {
            e.preventDefault();
            e.stopPropagation();
            showNotification('Для заказа духов нужно войти в аккаунт в приложении', 'warning');
            
            // Закрываем корзину и открываем профиль
            closeCartPopup();
            setTimeout(() => {
                openProfilePopup();
            }, 300);
            
            return;
        }
        
        // Если авторизован, обрабатываем заказ
        processOrder();
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
                        cartBtn.innerHTML = '<i class="fas fa-check"></i><span>В корзине</span>';
                        cartBtn.classList.add('in-cart');
                    } else {
                        cartBtn.innerHTML = '<i class="fas fa-shopping-cart"></i><span>В корзину</span>';
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
    
    // Вход по Enter в модалке авторизации
    document.getElementById('authUsername')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            document.getElementById('authPassword').focus();
        }
    });
    
    document.getElementById('authPassword')?.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleLogin();
        }
    });
    
    // Закрытие по клавише ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeCartPopup();
            closeFavoritesPopup();
            closeFilterPopup();
            closeProductDetailsModal();
            closeProfilePopup();
            closeTransactionsPopup();
            closeAuthModal();
        }
    });
}

// ===== ГЛОБАЛЬНЫЙ ЭКСПОРТ =====
window.app = {
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
    openProfilePopup,
    closeProfilePopup,
    saveAddress,
    bannerConfig,
    setupBanners,
    login: handleLogin,
    logout,
    isLoggedIn,
    authUser
};

console.log('Aura Atelier приложение инициализировано');