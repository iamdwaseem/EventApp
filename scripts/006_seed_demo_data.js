import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedDemoData() {
  try {
    console.log("Starting demo data seeding...")

    // Create admin user
    console.log("Creating admin user...")
    const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
      email: "admin@example.com",
      password: "Admin@123456",
      email_confirm: true,
      user_metadata: {
        full_name: "Admin User",
      },
    })

    if (adminError) throw adminError
    const adminId = adminData.user.id
    console.log("Admin user created:", adminId)

    // Create regular user
    console.log("Creating regular user...")
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: "user1@example.com",
      password: "User@123456",
      email_confirm: true,
      user_metadata: {
        full_name: "John Doe",
      },
    })

    if (userError) throw userError
    const userId = userData.user.id
    console.log("Regular user created:", userId)

    // Update admin profile to set is_admin = true
    console.log("Setting admin privileges...")
    const { error: adminUpdateError } = await supabase.from("profiles").update({ is_admin: true }).eq("id", adminId)

    if (adminUpdateError) throw adminUpdateError
    console.log("Admin privileges set")

    // Create demo events
    console.log("Creating demo events...")
    const events = [
      {
        title: "Tech Conference 2025",
        description: "Join us for the biggest tech conference of the year featuring keynotes from industry leaders.",
        date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        location: "San Francisco Convention Center",
        capacity: 500,
        price: 99.99,
        image_url: "/tech-conference.png",
        created_by: adminId,
      },
      {
        title: "Music Festival",
        description: "Experience live music from your favorite artists in an outdoor setting.",
        date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days from now
        location: "Central Park, New York",
        capacity: 1000,
        price: 149.99,
        image_url: "/vibrant-music-festival.png",
        created_by: adminId,
      },
      {
        title: "Web Development Workshop",
        description: "Learn modern web development techniques with hands-on projects.",
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
        location: "Online",
        capacity: 100,
        price: 49.99,
        image_url: "/web-development-concept.png",
        created_by: adminId,
      },
    ]

    const { data: eventsData, error: eventsError } = await supabase.from("events").insert(events).select()

    if (eventsError) throw eventsError
    console.log("Demo events created:", eventsData.length)

    // Create demo tickets for user1
    console.log("Creating demo tickets...")
    const tickets = eventsData.map((event) => ({
      event_id: event.id,
      user_id: userId,
      qr_code: `TICKET-${event.id.substring(0, 8)}-${userId.substring(0, 8)}`,
      status: "active",
    }))

    const { data: ticketsData, error: ticketsError } = await supabase.from("tickets").insert(tickets).select()

    if (ticketsError) throw ticketsError
    console.log("Demo tickets created:", ticketsData.length)

    // Create demo redeem codes
    console.log("Creating demo redeem codes...")
    const redeemCodes = eventsData.map((event, index) => ({
      code: `CODE-${event.id.substring(0, 8).toUpperCase()}`,
      event_id: event.id,
      ticket_id: ticketsData[index]?.id || null,
      is_used: index === 0, // Mark first one as used
      created_by: adminId,
      used_at: index === 0 ? new Date().toISOString() : null,
    }))

    const { data: codesData, error: codesError } = await supabase.from("redeem_codes").insert(redeemCodes).select()

    if (codesError) throw codesError
    console.log("Demo redeem codes created:", codesData.length)

    console.log("\n✅ Demo data seeding completed successfully!")
    console.log("\nTest Credentials:")
    console.log("Admin: admin@example.com / Admin@123456")
    console.log("User: user1@example.com / User@123456")
  } catch (error) {
    console.error("Error seeding demo data:", error)
    process.exit(1)
  }
}

seedDemoData()
