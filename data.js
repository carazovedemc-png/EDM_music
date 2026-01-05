// CYBER SCOUT - Intelligence Database
// This file contains sample data for the intelligence system
// In production, this would be a much larger database

window.CyberDatabase = {
    // База данных пользователей
    users: [
        {
            id: 1,
            username: "ivanov1985",
            email: "ivan.ivanov@gmail.com",
            phone: "+79161234567",
            fullName: "Ivan Ivanov",
            birthDate: "15.03.1985",
            address: "Moscow, Russia",
            vk: "id123456789",
            telegram: "@ivanov85",
            notes: "Active on social media"
        },
        {
            id: 2,
            username: "petrov_sergey",
            email: "s.petrov@mail.ru",
            phone: "+79269876543",
            fullName: "Sergey Petrov",
            birthDate: "22.07.1990",
            address: "Saint Petersburg, Russia",
            vk: "id987654321",
            telegram: "@spetrov",
            notes: "Software developer"
        },
        {
            id: 3,
            username: "sidorova_anna",
            email: "anna.sidorova@yandex.ru",
            phone: "+79031234567",
            fullName: "Anna Sidorova",
            birthDate: "10.11.1992",
            address: "Moscow, Russia",
            vk: "id456789123",
            telegram: "@asidorova",
            notes: "Marketing specialist"
        },
        {
            id: 4,
            username: "mikhailov_alex",
            email: "alex.m@hotmail.com",
            phone: "+79105556677",
            fullName: "Alexey Mikhailov",
            birthDate: "05.01.1988",
            address: "Novosibirsk, Russia",
            vk: "id789123456",
            telegram: "@amikhailov",
            notes: "Business owner"
        },
        {
            id: 5,
            username: "kuznetsova_olga",
            email: "olga.kuz@gmail.com",
            phone: "+79264443322",
            fullName: "Olga Kuznetsova",
            birthDate: "30.09.1995",
            address: "Kazan, Russia",
            vk: "id321654987",
            telegram: "@okuznetsova",
            notes: "Student"
        },
        {
            id: 6,
            username: "smirnov_dmitry",
            email: "dmitry.smirnov@mail.ru",
            phone: "+79091112233",
            fullName: "Dmitry Smirnov",
            birthDate: "18.12.1982",
            address: "Yekaterinburg, Russia",
            vk: "id654987321",
            telegram: "@dsmirnov",
            notes: "Engineer"
        },
        {
            id: 7,
            username: "popova_maria",
            email: "maria.popova@yandex.ru",
            phone: "+79183334455",
            fullName: "Maria Popova",
            birthDate: "25.06.1993",
            address: "Nizhny Novgorod, Russia",
            vk: "id147258369",
            telegram: "@mpopova",
            notes: "Doctor"
        },
        {
            id: 8,
            username: "volkov_andrey",
            email: "andrey.volkov@gmail.com",
            phone: "+79267778899",
            fullName: "Andrey Volkov",
            birthDate: "14.08.1987",
            address: "Moscow, Russia",
            vk: "id369258147",
            telegram: "@avolkov",
            notes: "IT manager"
        },
        {
            id: 9,
            username: "kozlov_nikolay",
            email: "n.kozlov@mail.ru",
            phone: "+79034445566",
            fullName: "Nikolay Kozlov",
            birthDate: "03.04.1979",
            address: "Saint Petersburg, Russia",
            vk: "id258147369",
            telegram: "@nkozlov",
            notes: "Teacher"
        },
        {
            id: 10,
            username: "novikova_elena",
            email: "elena.novikova@gmail.com",
            phone: "+79190001122",
            fullName: "Elena Novikova",
            birthDate: "19.02.1991",
            address: "Moscow, Russia",
            vk: "id852741963",
            telegram: "@enovikova",
            notes: "Designer"
        }
    ],
    
    // База данных утечек
    breaches: [
        {
            id: 1,
            email: "ivan.ivanov@gmail.com",
            phone: "+79161234567",
            source: "Collection #1",
            date: "2019-01-15",
            data: "password123, ivan1985"
        },
        {
            id: 2,
            email: "s.petrov@mail.ru",
            phone: "+79269876543",
            source: "AntiPublic",
            date: "2020-03-22",
            data: "sergey90, qwerty123"
        },
        {
            id: 3,
            email: "anna.sidorova@yandex.ru",
            phone: "+79031234567",
            source: "VK 2021",
            date: "2021-04-03",
            data: "anna1992, sidorova_a"
        },
        {
            id: 4,
            email: "alex.m@hotmail.com",
            phone: "+79105556677",
            source: "Facebook 2019",
            date: "2019-09-10",
            data: "alex1988, mikhailov"
        },
        {
            id: 5,
            email: "olga.kuz@gmail.com",
            phone: "+79264443322",
            source: "LinkedIn 2012",
            date: "2012-05-25",
            data: "olga95, kuznetsova"
        },
        {
            id: 6,
            email: "dmitry.smirnov@mail.ru",
            phone: "+79091112233",
            source: "Collection #2",
            date: "2019-02-18",
            data: "dima1982, smirnov_d"
        },
        {
            id: 7,
            email: "maria.popova@yandex.ru",
            phone: "+79183334455",
            source: "Adobe 2013",
            date: "2013-10-04",
            data: "maria1993, popova_m"
        },
        {
            id: 8,
            email: "andrey.volkov@gmail.com",
            phone: "+79267778899",
            source: "Twitter 2018",
            date: "2018-07-22",
            data: "andrey1987, volkov_a"
        },
        {
            id: 9,
            email: "n.kozlov@mail.ru",
            phone: "+79034445566",
            source: "MySpace 2016",
            date: "2016-12-01",
            data: "nikolay1979, kozlov_n"
        },
        {
            id: 10,
            email: "elena.novikova@gmail.com",
            phone: "+79190001122",
            source: "Dropbox 2012",
            date: "2012-08-30",
            data: "elena1991, novikova_e"
        }
    ],
    
    // База данных телефонов
    phones: [
        {
            number: "+79161234567",
            owner: "Ivan Ivanov",
            operator: "MTS",
            region: "Moscow",
            registrationDate: "2018-05-15"
        },
        {
            number: "+79269876543",
            owner: "Sergey Petrov",
            operator: "Beeline",
            region: "Saint Petersburg",
            registrationDate: "2019-03-22"
        },
        {
            number: "+79031234567",
            owner: "Anna Sidorova",
            operator: "Megafon",
            region: "Moscow",
            registrationDate: "2020-01-10"
        },
        {
            number: "+79105556677",
            owner: "Alexey Mikhailov",
            operator: "Tele2",
            region: "Novosibirsk",
            registrationDate: "2017-11-30"
        },
        {
            number: "+79264443322",
            owner: "Olga Kuznetsova",
            operator: "Yota",
            region: "Kazan",
            registrationDate: "2021-02-14"
        },
        {
            number: "+79091112233",
            owner: "Dmitry Smirnov",
            operator: "MTS",
            region: "Yekaterinburg",
            registrationDate: "2019-08-25"
        },
        {
            number: "+79183334455",
            owner: "Maria Popova",
            operator: "Beeline",
            region: "Nizhny Novgorod",
            registrationDate: "2020-06-18"
        },
        {
            number: "+79267778899",
            owner: "Andrey Volkov",
            operator: "Megafon",
            region: "Moscow",
            registrationDate: "2018-09-05"
        },
        {
            number: "+79034445566",
            owner: "Nikolay Kozlov",
            operator: "Tele2",
            region: "Saint Petersburg",
            registrationDate: "2019-12-12"
        },
        {
            number: "+79190001122",
            owner: "Elena Novikova",
            operator: "MTS",
            region: "Moscow",
            registrationDate: "2021-03-08"
        }
    ],
    
    // База данных IP адресов
    ips: [
        {
            ip: "192.168.1.100",
            owner: "Ivan Ivanov",
            provider: "Rostelecom",
            location: "Moscow",
            lastSeen: "2024-01-15 14:30:00"
        },
        {
            ip: "192.168.2.55",
            owner: "Sergey Petrov",
            provider: "ER-Telecom",
            location: "Saint Petersburg",
            lastSeen: "2024-01-15 10:15:00"
        },
        {
            ip: "10.0.0.123",
            owner: "Anna Sidorova",
            provider: "MGTS",
            location: "Moscow",
            lastSeen: "2024-01-14 22:45:00"
        },
        {
            ip: "172.16.0.88",
            owner: "Alexey Mikhailov",
            provider: "TTK",
            location: "Novosibirsk",
            lastSeen: "2024-01-15 09:20:00"
        }
    ],
    
    // База данных документов
    documents: [
        {
            id: 1,
            type: "Passport",
            number: "4512 123456",
            owner: "Ivan Ivanov",
            issueDate: "2015-05-20",
            scanUrl: "documents/ivanov_passport.pdf"
        },
        {
            id: 2,
            type: "Driver License",
            number: "77AA 123456",
            owner: "Sergey Petrov",
            issueDate: "2018-11-15",
            scanUrl: "documents/petrov_license.jpg"
        },
        {
            id: 3,
            type: "Utility Bill",
            number: "UT-2024-01-001",
            owner: "Anna Sidorova",
            issueDate: "2024-01-05",
            scanUrl: "documents/sidorova_bill.pdf"
        },
        {
            id: 4,
            type: "Bank Statement",
            number: "BS-2023-12-045",
            owner: "Alexey Mikhailov",
            issueDate: "2023-12-28",
            scanUrl: "documents/mikhailov_statement.pdf"
        }
    ],
    
    // Социальные связи
    connections: [
        {
            person1: "Ivan Ivanov",
            person2: "Sergey Petrov",
            relation: "Colleagues",
            strength: "High"
        },
        {
            person1: "Anna Sidorova",
            person2: "Maria Popova",
            relation: "Friends",
            strength: "Medium"
        },
        {
            person1: "Alexey Mikhailov",
            person2: "Dmitry Smirnov",
            relation: "Business partners",
            strength: "High"
        },
        {
            person1: "Olga Kuznetsova",
            person2: "Elena Novikova",
            relation: "University friends",
            strength: "Medium"
        }
    ],
    
    // Геолокационные данные
    locations: [
        {
            phone: "+79161234567",
            coordinates: "55.7558, 37.6173",
            city: "Moscow",
            lastUpdate: "2024-01-15 14:25:00"
        },
        {
            phone: "+79269876543",
            coordinates: "59.9343, 30.3351",
            city: "Saint Petersburg",
            lastUpdate: "2024-01-15 10:10:00"
        },
        {
            phone: "+79031234567",
            coordinates: "55.7558, 37.6173",
            city: "Moscow",
            lastUpdate: "2024-01-14 22:40:00"
        }
    ]
};

// Экспорт данных для использования в других модулях
console.log("CyberDatabase loaded successfully");
console.log(`Total records: ${CyberDatabase.users.length + CyberDatabase.breaches.length + CyberDatabase.phones.length}`);