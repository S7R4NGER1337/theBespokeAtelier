/**
 * Seed script – run once with: npm run seed
 * Creates default admin user, barbers, and services.
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

if (process.env.NODE_ENV === 'production') {
  console.error('ERROR: seed script must not run in production. Aborting.');
  process.exit(1);
}

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Barber = require('../models/Barber');
const Service = require('../models/Service');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Admin user
  const existing = await User.findOne({ email: 'admin@bespokeatelier.com' });
  if (!existing) {
    await User.create({
      name: 'Admin',
      email: 'admin@bespokeatelier.com',
      password: 'Admin1234!',
      role: 'admin',
    });
    console.log('Admin user created  →  admin@bespokeatelier.com / Admin1234!');
  }

  // Barbers
  const barbers = [
    { name: 'Viktor S.', title: 'Master Barber', tier: 'master', tierSurcharge: 1500, bio: 'Over 15 years of precision cutting and traditional straight-razor shaving.', order: 1 },
    { name: 'Martin K.', title: 'Senior Stylist', tier: 'senior', tierSurcharge: 500, bio: 'Specialist in modern scissor techniques and textured finishes.', order: 2 },
    { name: 'Daniel T.', title: 'Senior Stylist', tier: 'senior', tierSurcharge: 500, bio: 'Expert in beard sculpting and classic barbershop services.', order: 3 },
    { name: 'Alexander D.', title: 'Barber', tier: 'junior', tierSurcharge: 0, bio: 'Dedicated to clean lines and contemporary styles.', order: 4 },
  ];

  for (const b of barbers) {
    await Barber.findOneAndUpdate({ name: b.name }, b, { upsert: true });
  }
  console.log(`${barbers.length} barbers seeded`);

  // Services  (prices in pence/stotinki ×100)
  const services = [
    {
      name: 'Classic Haircut',
      category: 'haircut',
      description: 'Precision cut tailored to your style with a hot towel finish.',
      duration: 45,
      pricing: { junior: 3000, senior: 4500, master: 6000 },
      order: 1,
    },
    {
      name: 'Clipper Cut',
      category: 'haircut',
      description: 'Clean, sharp clipper cut for the modern gentleman.',
      duration: 30,
      pricing: { junior: 2000, senior: 3000, master: 4000 },
      order: 2,
    },
    {
      name: 'Atelier VIP Experience',
      category: 'haircut',
      description: 'Full grooming ritual – cut, scalp treatment, styling, and hot towel.',
      duration: 90,
      pricing: { junior: 6500, senior: 8500, master: 11000 },
      order: 3,
    },
    {
      name: 'Straight Razor Shave',
      category: 'beard',
      description: 'Traditional hot-lather straight-razor shave with skin treatment.',
      duration: 60,
      pricing: { junior: 2500, senior: 3500, master: 4500 },
      order: 4,
    },
    {
      name: 'Line Up & Contour',
      category: 'beard',
      description: 'Sharp beard shaping and edge definition.',
      duration: 30,
      pricing: { junior: 1500, senior: 2000, master: 3000 },
      order: 5,
    },
    {
      name: 'Black Mask',
      category: 'facial',
      description: 'Deep-cleansing charcoal mask for clear, refined skin.',
      duration: 40,
      pricing: { junior: 2000, senior: 2500, master: 3500 },
      order: 6,
    },
    {
      name: 'Hydrating Therapy',
      category: 'facial',
      description: 'Intensive moisture treatment leaving skin balanced and healthy.',
      duration: 50,
      pricing: { junior: 3000, senior: 4000, master: 5500 },
      order: 7,
    },
  ];

  for (const s of services) {
    await Service.findOneAndUpdate({ name: s.name }, s, { upsert: true });
  }
  console.log(`${services.length} services seeded`);

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
