const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function seed() {
  try {
    console.log('--- SEEDING PRODUCTION DATA (MongoDB) ---');

    const hotelId = '69d5fef477e0d929750efaf1';
    
    // 1. Create/Update Hotel
    const hotel = await prisma.hotel.upsert({
      where: { id: hotelId },
      update: {
        name: 'WebBill Production',
        slug: 'webbill-prod',
      },
      create: {
        id: hotelId,
        name: 'WebBill Production',
        slug: 'webbill-prod',
        subscriptionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      }
    });
    console.log('Hotel created/updated:', hotel.name);

    // 2. Create Admin User
    const adminEmail = 'admin@webbill.com';
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        password: hashedPassword,
        role: 'ADMIN',
        hotelId: hotelId,
      },
      create: {
        email: adminEmail,
        name: 'System Admin',
        password: hashedPassword,
        role: 'ADMIN',
        hotelId: hotelId,
      }
    });
    console.log('Admin user created/updated:', admin.email);

    // 3. Create Basic Tables
    for (let i = 1; i <= 10; i++) {
        const tableNum = `T${i}`;
        await prisma.table.create({
            data: {
                number: tableNum,
                capacity: 4,
                hotelId: hotelId
            }
        }).catch(() => {}); // Ignore if already exists (create doesn't have upsert easily for non-unique)
    }
    console.log('Tables initialized');

    // 4. Create Menu Categories & Items
    const category = await prisma.menuCategory.create({
        data: {
            name: 'Starters',
            hotelId: hotelId
        }
    }).catch(async () => {
        return await prisma.menuCategory.findFirst({ where: { name: 'Starters', hotelId } });
    });

    if (category) {
        const items = [
            { name: 'Paneer Tikka', price: 250, description: 'Classic grilled cottage cheese' },
            { name: 'Crispy Corn', price: 180, description: 'Golden fried sweet corn' },
            { name: 'Tomato Soup', price: 120, description: 'Fresh warm tomato basil soup' },
        ];

        for (const item of items) {
           await prisma.menuItem.create({
               data: {
                   ...item,
                   categoryId: category.id,
                   hotelId: hotelId,
                   isAvailable: true
               }
           }).catch(() => {});
        }
        console.log('Menu items initialized');
    }

    console.log('--- SEEDING COMPLETE ---');
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
