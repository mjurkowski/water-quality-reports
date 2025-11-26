import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const sampleReports = [
  {
    types: ['brown_water', 'bad_smell'],
    description: 'Brunatna woda z kranu od rana. Nieprzyjemny zapach.',
    latitude: 52.2297,
    longitude: 21.0122,
    city: 'Warszawa',
    voivodeship: 'mazowieckie',
    address: 'ul. Marszałkowska 1, Warszawa',
    reportedAt: new Date('2024-11-15T08:30:00Z'),
  },
  {
    types: ['sediment'],
    description: 'Widoczne osady w wodzie po odkręceniu kranu.',
    latitude: 50.0647,
    longitude: 19.9450,
    city: 'Kraków',
    voivodeship: 'małopolskie',
    address: 'ul. Floriańska 10, Kraków',
    reportedAt: new Date('2024-11-16T12:00:00Z'),
  },
  {
    types: ['pressure'],
    description: 'Bardzo niskie ciśnienie wody, ledwo leci.',
    latitude: 51.7592,
    longitude: 19.4560,
    city: 'Łódź',
    voivodeship: 'łódzkie',
    address: 'ul. Piotrkowska 50, Łódź',
    reportedAt: new Date('2024-11-17T14:15:00Z'),
  },
  {
    types: ['no_water'],
    description: 'Brak wody od 3 godzin.',
    latitude: 51.1079,
    longitude: 17.0385,
    city: 'Wrocław',
    voivodeship: 'dolnośląskie',
    address: 'ul. Świdnicka 15, Wrocław',
    reportedAt: new Date('2024-11-18T09:00:00Z'),
  },
  {
    types: ['brown_water'],
    description: 'Woda koloru herbaty od wczoraj.',
    latitude: 54.3520,
    longitude: 18.6466,
    city: 'Gdańsk',
    voivodeship: 'pomorskie',
    address: 'ul. Długa 20, Gdańsk',
    reportedAt: new Date('2024-11-18T16:45:00Z'),
  },
  {
    types: ['bad_smell', 'sediment'],
    description: 'Woda śmierdzi i ma osad.',
    latitude: 53.1325,
    longitude: 23.1688,
    city: 'Białystok',
    voivodeship: 'podlaskie',
    address: 'ul. Lipowa 5, Białystok',
    reportedAt: new Date('2024-11-19T07:30:00Z'),
  },
  {
    types: ['other'],
    description: 'Dziwny metaliczny smak wody.',
    latitude: 52.4064,
    longitude: 16.9252,
    city: 'Poznań',
    voivodeship: 'wielkopolskie',
    address: 'ul. Święty Marcin 30, Poznań',
    reportedAt: new Date('2024-11-19T11:00:00Z'),
  },
  {
    types: ['brown_water', 'sediment'],
    description: 'Brunatna woda z osadami po awarii wodociągu.',
    latitude: 50.2649,
    longitude: 19.0238,
    city: 'Katowice',
    voivodeship: 'śląskie',
    address: 'ul. 3 Maja 10, Katowice',
    reportedAt: new Date('2024-11-19T13:20:00Z'),
  },
  {
    types: ['pressure'],
    description: 'Słaby strumień wody, nie da się umyć naczyń.',
    latitude: 51.2465,
    longitude: 22.5684,
    city: 'Lublin',
    voivodeship: 'lubelskie',
    address: 'ul. Krakowskie Przedmieście 20, Lublin',
    reportedAt: new Date('2024-11-19T15:45:00Z'),
  },
  {
    types: ['bad_smell'],
    description: 'Woda cuchnąca chlorem, nie nadaje się do picia.',
    latitude: 50.0413,
    longitude: 21.9991,
    city: 'Rzeszów',
    voivodeship: 'podkarpackie',
    address: 'ul. 3 Maja 15, Rzeszów',
    reportedAt: new Date('2024-11-19T17:00:00Z'),
  },
  // Additional reports in Warszawa for clustering
  {
    types: ['sediment'],
    description: 'Osad w wodzie, widoczne cząsteczki.',
    latitude: 52.2320,
    longitude: 21.0142,
    city: 'Warszawa',
    voivodeship: 'mazowieckie',
    address: 'ul. Nowy Świat 10, Warszawa',
    reportedAt: new Date('2024-11-20T08:00:00Z'),
  },
  {
    types: ['brown_water'],
    description: 'Rano leci brunatna woda.',
    latitude: 52.2280,
    longitude: 21.0100,
    city: 'Warszawa',
    voivodeship: 'mazowieckie',
    address: 'ul. Królewska 5, Warszawa',
    reportedAt: new Date('2024-11-20T09:15:00Z'),
  },
  {
    types: ['pressure'],
    description: 'Słabe ciśnienie wody.',
    latitude: 52.2310,
    longitude: 21.0130,
    city: 'Warszawa',
    voivodeship: 'mazowieckie',
    address: 'ul. Świętokrzyska 15, Warszawa',
    reportedAt: new Date('2024-11-20T10:30:00Z'),
  },
  // Additional reports in Kraków for clustering
  {
    types: ['brown_water', 'sediment'],
    description: 'Brunatna woda z osadami po awarii.',
    latitude: 50.0620,
    longitude: 19.9470,
    city: 'Kraków',
    voivodeship: 'małopolskie',
    address: 'ul. Grodzka 5, Kraków',
    reportedAt: new Date('2024-11-20T11:00:00Z'),
  },
  {
    types: ['bad_smell'],
    description: 'Nieprzyjemny zapach wody z kranu.',
    latitude: 50.0660,
    longitude: 19.9430,
    city: 'Kraków',
    voivodeship: 'małopolskie',
    address: 'ul. Karmelicka 20, Kraków',
    reportedAt: new Date('2024-11-20T12:30:00Z'),
  },
  {
    types: ['sediment'],
    description: 'Cząsteczki pływające w wodzie.',
    latitude: 50.0635,
    longitude: 19.9465,
    city: 'Kraków',
    voivodeship: 'małopolskie',
    address: 'ul. Szewska 12, Kraków',
    reportedAt: new Date('2024-11-20T14:00:00Z'),
  },
  // Additional reports in Gdańsk for clustering
  {
    types: ['sediment', 'bad_smell'],
    description: 'Osad i dziwny zapach wody.',
    latitude: 54.3530,
    longitude: 18.6480,
    city: 'Gdańsk',
    voivodeship: 'pomorskie',
    address: 'ul. Piwna 10, Gdańsk',
    reportedAt: new Date('2024-11-20T15:00:00Z'),
  },
  {
    types: ['brown_water'],
    description: 'Woda zbrunatniała po awarii sieci.',
    latitude: 54.3510,
    longitude: 18.6450,
    city: 'Gdańsk',
    voivodeship: 'pomorskie',
    address: 'ul. Mariacka 5, Gdańsk',
    reportedAt: new Date('2024-11-20T16:15:00Z'),
  },
  {
    types: ['pressure'],
    description: 'Bardzo niskie ciśnienie, ledwo ścieka.',
    latitude: 54.3540,
    longitude: 18.6470,
    city: 'Gdańsk',
    voivodeship: 'pomorskie',
    address: 'ul. Chlebnicka 8, Gdańsk',
    reportedAt: new Date('2024-11-20T17:30:00Z'),
  },
  // Additional reports in Poznań for clustering
  {
    types: ['brown_water'],
    description: 'Brunatna woda rano.',
    latitude: 52.4080,
    longitude: 16.9270,
    city: 'Poznań',
    voivodeship: 'wielkopolskie',
    address: 'ul. Półwiejska 15, Poznań',
    reportedAt: new Date('2024-11-21T08:30:00Z'),
  },
  {
    types: ['sediment'],
    description: 'Osad w wodzie pitnej.',
    latitude: 52.4050,
    longitude: 16.9240,
    city: 'Poznań',
    voivodeship: 'wielkopolskie',
    address: 'ul. Ratajczaka 25, Poznań',
    reportedAt: new Date('2024-11-21T10:00:00Z'),
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing reports
  await prisma.photo.deleteMany();
  await prisma.report.deleteMany();
  await prisma.adminUser.deleteMany();

  console.log('🗑️  Cleared existing data');

  // Create default admin user
  const passwordHash = await bcrypt.hash('admin123', 10);
  const admin = await prisma.adminUser.create({
    data: {
      email: 'admin@example.com',
      passwordHash,
      name: 'Admin User',
      role: 'admin',
      isActive: true,
    },
  });
  console.log(`✅ Created admin user: ${admin.email} (password: admin123)`);

  // Create sample reports
  for (const reportData of sampleReports) {
    const report = await prisma.report.create({
      data: {
        ...reportData,
        deleteToken: null, // No delete token for seed data
      },
    });
    console.log(`✅ Created report: ${report.city} - ${report.types.join(', ')}`);
  }

  console.log('✨ Database seeded successfully!');
  console.log(`📊 Created ${sampleReports.length} sample reports`);
  console.log(`👤 Created 1 admin user`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
