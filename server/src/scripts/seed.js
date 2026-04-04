/**
 * Seed script – run once with: npm run seed
 * Creates default admin user, barbers, services, clients, and appointments.
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
const Client = require('../models/Client');
const Appointment = require('../models/Appointment');

// Returns a Date at midnight UTC for a day offset from today
function dayUTC(offset) {
  const d = new Date();
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate() + offset));
}

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // ── Admin user ─────────────────────────────────────────────────────────────
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

  // ── Barbers ────────────────────────────────────────────────────────────────
  const barberDefs = [
    { name: 'Viktor S.', title: 'Master Barber',   tier: 'master', tierSurcharge: 1500, bio: 'Over 15 years of precision cutting and traditional straight-razor shaving.',  order: 1 },
    { name: 'Martin K.', title: 'Senior Stylist',  tier: 'senior', tierSurcharge: 500,  bio: 'Specialist in modern scissor techniques and textured finishes.',               order: 2 },
    { name: 'Daniel T.', title: 'Senior Stylist',  tier: 'senior', tierSurcharge: 500,  bio: 'Expert in beard sculpting and classic barbershop services.',                   order: 3 },
    { name: 'Alexander D.', title: 'Barber',       tier: 'junior', tierSurcharge: 0,    bio: 'Dedicated to clean lines and contemporary styles.',                            order: 4 },
  ];

  for (const b of barberDefs) {
    await Barber.findOneAndUpdate({ name: b.name }, b, { upsert: true, new: true });
  }
  console.log(`${barberDefs.length} barbers seeded`);

  // ── Services ───────────────────────────────────────────────────────────────
  const serviceDefs = [
    { name: 'Classic Haircut',        category: 'haircut', description: 'Precision cut tailored to your style with a hot towel finish.',             duration: 45, pricing: { junior: 3000, senior: 4500, master: 6000  }, order: 1 },
    { name: 'Clipper Cut',            category: 'haircut', description: 'Clean, sharp clipper cut for the modern gentleman.',                        duration: 30, pricing: { junior: 2000, senior: 3000, master: 4000  }, order: 2 },
    { name: 'Atelier VIP Experience', category: 'haircut', description: 'Full grooming ritual – cut, scalp treatment, styling, and hot towel.',      duration: 90, pricing: { junior: 6500, senior: 8500, master: 11000 }, order: 3 },
    { name: 'Straight Razor Shave',   category: 'beard',   description: 'Traditional hot-lather straight-razor shave with skin treatment.',          duration: 60, pricing: { junior: 2500, senior: 3500, master: 4500  }, order: 4 },
    { name: 'Line Up & Contour',      category: 'beard',   description: 'Sharp beard shaping and edge definition.',                                  duration: 30, pricing: { junior: 1500, senior: 2000, master: 3000  }, order: 5 },
    { name: 'Black Mask',             category: 'facial',  description: 'Deep-cleansing charcoal mask for clear, refined skin.',                     duration: 40, pricing: { junior: 2000, senior: 2500, master: 3500  }, order: 6 },
    { name: 'Hydrating Therapy',      category: 'facial',  description: 'Intensive moisture treatment leaving skin balanced and healthy.',            duration: 50, pricing: { junior: 3000, senior: 4000, master: 5500  }, order: 7 },
  ];

  for (const s of serviceDefs) {
    await Service.findOneAndUpdate({ name: s.name }, s, { upsert: true, new: true });
  }
  console.log(`${serviceDefs.length} services seeded`);

  // ── Clients ────────────────────────────────────────────────────────────────
  // All names and phone numbers are entirely fictional.
  const clientDefs = [
    { name: 'Alexei Vranev',    phone: '+44 7700 900001', isVip: true,  notes: 'Prefers Viktor. Always tips generously.' },
    { name: 'James Holbrook',   phone: '+44 7700 900002', isVip: false, notes: 'Clipper cut, grade 2 on sides.' },
    { name: 'Marcus Ellery',    phone: '+44 7700 900003', isVip: true,  notes: 'VIP client. Monthly Atelier package.' },
    { name: 'Owen Draper',      phone: '+44 7700 900004', isVip: false, notes: '' },
    { name: 'Theo Wyndham',     phone: '+44 7700 900005', isVip: false, notes: 'Sensitive skin – avoid alcohol products.' },
    { name: 'Felix Calloway',   phone: '+44 7700 900006', isVip: false, notes: '' },
    { name: 'Ronan Ashford',    phone: '+44 7700 900007', isVip: true,  notes: 'Beard specialist required. Prefers Daniel.' },
    { name: 'Hugo Stirling',    phone: '+44 7700 900008', isVip: false, notes: '' },
    { name: 'Sebastian Crane',  phone: '+44 7700 900009', isVip: false, notes: 'First visit – referred by Alexei Vranev.' },
    { name: 'Caspian Merrow',   phone: '+44 7700 900010', isVip: false, notes: '' },
    { name: 'Edmund Fawley',    phone: '+44 7700 900011', isVip: true,  notes: 'Corporate account – invoiced monthly.' },
    { name: 'Dorian Halcourt',  phone: '+44 7700 900012', isVip: false, notes: 'Scalp treatment after every cut.' },
  ];

  const clientMap = {};
  for (const c of clientDefs) {
    const doc = await Client.findOneAndUpdate(
      { phone: c.phone },
      c,
      { upsert: true, new: true }
    );
    clientMap[c.name] = doc._id;
  }
  console.log(`${clientDefs.length} clients seeded`);

  // ── Appointments ───────────────────────────────────────────────────────────
  // Fetch DB IDs for barbers and services
  const barberMap = {};
  for (const b of await Barber.find()) barberMap[b.name] = b;

  const serviceMap = {};
  for (const s of await Service.find()) serviceMap[s.name] = s;

  const B = barberMap;
  const S = serviceMap;

  // Helper to build appointment payload
  const appt = (clientName, barberName, serviceName, dayOffset, time, status = 'confirmed', notes = '') => {
    const barber  = B[barberName];
    const service = S[serviceName];
    const price   = service.pricing[barber.tier];
    return {
      client:   clientMap[clientName],
      barber:   barber._id,
      service:  service._id,
      date:     dayUTC(dayOffset),
      timeSlot: time,
      status,
      price,
      notes,
    };
  };

  const appointments = [
    // ── Past – completed ──────────────────────────────────────────────────────
    appt('Alexei Vranev',    'Viktor S.',    'Classic Haircut',        -14, '09:00', 'completed'),
    appt('Marcus Ellery',    'Viktor S.',    'Atelier VIP Experience', -14, '10:30', 'completed', 'Requested extra scalp massage.'),
    appt('James Holbrook',   'Alexander D.', 'Clipper Cut',            -14, '11:00', 'completed'),
    appt('Theo Wyndham',     'Martin K.',    'Classic Haircut',        -13, '09:30', 'completed'),
    appt('Ronan Ashford',    'Daniel T.',    'Straight Razor Shave',   -13, '10:00', 'completed'),
    appt('Felix Calloway',   'Alexander D.', 'Line Up & Contour',      -13, '14:00', 'completed'),
    appt('Hugo Stirling',    'Martin K.',    'Black Mask',             -12, '11:00', 'completed'),
    appt('Edmund Fawley',    'Viktor S.',    'Classic Haircut',        -12, '09:00', 'completed'),
    appt('Dorian Halcourt',  'Daniel T.',    'Classic Haircut',        -11, '10:00', 'completed', 'Applied scalp serum after cut.'),
    appt('Owen Draper',      'Alexander D.', 'Clipper Cut',            -11, '15:30', 'completed'),
    appt('Caspian Merrow',   'Martin K.',    'Hydrating Therapy',      -10, '13:00', 'completed'),
    appt('Sebastian Crane',  'Viktor S.',    'Classic Haircut',        -10, '10:00', 'completed', 'First visit. Requested low fade.'),
    appt('Alexei Vranev',    'Viktor S.',    'Straight Razor Shave',    -7, '09:00', 'completed'),
    appt('James Holbrook',   'Daniel T.',    'Line Up & Contour',       -7, '11:30', 'completed'),
    appt('Marcus Ellery',    'Viktor S.',    'Classic Haircut',         -5, '09:30', 'completed'),

    // ── Past – no-show / cancelled ────────────────────────────────────────────
    appt('Felix Calloway',   'Martin K.',    'Classic Haircut',         -6, '10:00', 'no_show'),
    appt('Hugo Stirling',    'Alexander D.', 'Clipper Cut',             -4, '14:30', 'cancelled'),

    // ── Upcoming ──────────────────────────────────────────────────────────────
    appt('Theo Wyndham',     'Martin K.',    'Classic Haircut',          1, '09:30', 'confirmed'),
    appt('Ronan Ashford',    'Daniel T.',    'Straight Razor Shave',     1, '10:30', 'confirmed'),
    appt('Dorian Halcourt',  'Viktor S.',    'Classic Haircut',          1, '11:00', 'confirmed'),
    appt('Owen Draper',      'Alexander D.', 'Clipper Cut',              2, '09:00', 'confirmed'),
    appt('Edmund Fawley',    'Viktor S.',    'Atelier VIP Experience',   2, '10:00', 'confirmed', 'Corporate booking – invoice required.'),
    appt('Caspian Merrow',   'Daniel T.',    'Black Mask',               2, '13:00', 'pending'),
    appt('Alexei Vranev',    'Viktor S.',    'Classic Haircut',          3, '09:00', 'confirmed'),
    appt('Sebastian Crane',  'Martin K.',    'Clipper Cut',              3, '10:30', 'pending'),
    appt('James Holbrook',   'Alexander D.', 'Line Up & Contour',        3, '14:00', 'confirmed'),
    appt('Marcus Ellery',    'Viktor S.',    'Atelier VIP Experience',   5, '09:00', 'confirmed', 'Monthly VIP appointment.'),
    appt('Hugo Stirling',    'Daniel T.',    'Classic Haircut',          5, '11:00', 'pending'),
    appt('Felix Calloway',   'Martin K.',    'Hydrating Therapy',        7, '13:30', 'confirmed'),
    appt('Ronan Ashford',    'Daniel T.',    'Straight Razor Shave',     7, '10:00', 'confirmed'),
    appt('Dorian Halcourt',  'Viktor S.',    'Classic Haircut',         10, '09:30', 'pending'),
  ];

  let created = 0;
  let skipped = 0;
  for (const a of appointments) {
    try {
      await Appointment.findOneAndUpdate(
        { barber: a.barber, date: a.date, timeSlot: a.timeSlot },
        a,
        { upsert: true, new: true }
      );
      created++;
    } catch (err) {
      // Unique index violation – slot already exists
      console.warn(`  Skipped duplicate: ${a.timeSlot} on ${a.date.toISOString().slice(0, 10)}`);
      skipped++;
    }
  }
  console.log(`${created} appointments seeded${skipped ? `, ${skipped} skipped (duplicates)` : ''}`);

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
