import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

const EVENT_TITLES = [
    "React Summit 2024", "AI Revolution Conference", "Vue.js Nation", "Node.js World",
    "Python PyCon", "GoLang GopherCon", "RustConf", "DevOps Days", "Cloud Native Summit",
    "Cyber Security Expo", "Blockchain Week", "Game Developers Conference", "Design Matters",
    "Product Management Festival", "Startup Grind Global", "TechCrunch Disrupt", "Web Summit",
    "Google I/O Extended", "AWS re:Invent Recap", "Microsoft Build Local"
]

const LOCATIONS = [
    "San Francisco, CA", "New York, NY", "London, UK", "Berlin, Germany", "Tokyo, Japan",
    "Austin, TX", "Seattle, WA", "Toronto, Canada", "Singapore", "Sydney, Australia"
]

async function main() {
    console.log('Start seeding ...')

    // 1. Create Admin
    const adminPassword = await bcrypt.hash('password123', 10)
    const admin = await prisma.user.upsert({
        where: { email: 'admin@example.com' },
        update: {},
        create: {
            email: 'admin@example.com',
            password: adminPassword,
            fullName: 'Super Admin',
            isAdmin: true,
        },
    })
    console.log(`Created admin: ${admin.email}`)

    // 2. Create Regular Users (50 users)
    const userPassword = await bcrypt.hash('password123', 10)
    const users = []
    for (let i = 1; i <= 50; i++) {
        const user = await prisma.user.upsert({
            where: { email: `user${i}@example.com` },
            update: {},
            create: {
                email: `user${i}@example.com`,
                password: userPassword,
                fullName: `User ${i}`,
                isAdmin: false,
            },
        })
        users.push(user)
    }
    console.log(`Created ${users.length} regular users`)

    // 3. Create Events (20+ events)
    const events = []
    for (let i = 0; i < EVENT_TITLES.length; i++) {
        const title = EVENT_TITLES[i]
        const location = LOCATIONS[i % LOCATIONS.length]
        // Random date within next 6 months
        const date = new Date()
        date.setDate(date.getDate() + Math.floor(Math.random() * 180))

        const event = await prisma.event.create({
            data: {
                title,
                description: `Join us for ${title}, the premier event for enthusiasts and professionals. Experience cutting-edge talks, workshops, and networking opportunities in ${location}.`,
                date,
                location,
                capacity: 100 + Math.floor(Math.random() * 900), // 100-1000 capacity
                price: 49.99 + Math.floor(Math.random() * 450), // 50-500 price
                createdBy: admin.id,
            }
        })
        events.push(event)

        // Create a redeem code for each event
        await prisma.redeemCode.create({
            data: {
                code: `${title.split(' ')[0].toUpperCase()}${date.getFullYear()}`,
                eventId: event.id,
                createdBy: admin.id
            }
        })
    }
    console.log(`Created ${events.length} events`)

    // 4. Create Tickets (Simulate sales)
    let ticketCount = 0
    for (const event of events) {
        // Determine how many tickets to sell for this event (random 0 to 80% capacity)
        const ticketsToSell = Math.floor(Math.random() * (event.capacity * 0.8))

        for (let k = 0; k < ticketsToSell; k++) {
            // Pick a random user
            const randomUser = users[Math.floor(Math.random() * users.length)]

            await prisma.ticket.create({
                data: {
                    eventId: event.id,
                    userId: randomUser.id,
                    qrCode: `mock_qr_${event.id}_${randomUser.id}_${k}`, // Mock QR data
                    status: Math.random() > 0.9 ? 'used' : 'active', // 10% used tickets
                }
            })
            ticketCount++
        }
    }
    console.log(`Created ${ticketCount} tickets across all events`)

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
