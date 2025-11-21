import { PrismaClient } from '@prisma/client';

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
];

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing reports
  await prisma.photo.deleteMany();
  await prisma.report.deleteMany();

  console.log('🗑️  Cleared existing data');

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
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
