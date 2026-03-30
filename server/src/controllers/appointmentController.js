const Appointment = require('../models/Appointment');
const Client = require('../models/Client');
const Service = require('../models/Service');
const Barber = require('../models/Barber');

// GET /api/appointments  (admin)
exports.getAppointments = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.date) {
      const [y, m, d] = req.query.date.split('-').map(Number);
      const start = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
      const end = new Date(Date.UTC(y, m - 1, d, 23, 59, 59, 999));
      filter.date = { $gte: start, $lte: end };
    }
    if (req.query.barber) filter.barber = req.query.barber;
    if (req.query.status) filter.status = req.query.status;

    const [appointments, total] = await Promise.all([
      Appointment.find(filter)
        .populate('client', 'name phone isVip')
        .populate('barber', 'name tier')
        .populate('service', 'name duration')
        .sort({ date: 1, timeSlot: 1 })
        .skip(skip)
        .limit(limit),
      Appointment.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: appointments,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/appointments/available-slots  (public)
exports.getAvailableSlots = async (req, res, next) => {
  try {
    const { barberId, date } = req.query;
    if (!barberId || !date) {
      return res.status(400).json({ success: false, message: 'barberId and date required' });
    }

    const [y, m, dv] = date.split('-').map(Number);
    const start = new Date(Date.UTC(y, m - 1, dv, 0, 0, 0, 0));
    const end = new Date(Date.UTC(y, m - 1, dv, 23, 59, 59, 999));

    const booked = await Appointment.find({
      barber: barberId,
      date: { $gte: start, $lte: end },
      status: { $nin: ['cancelled', 'no_show'] },
    }).select('timeSlot').populate('service', 'duration');

    // Block the booked slot AND every 30-min slot that falls within its service duration.
    // e.g. haircut (45 min) at 09:00 → blocks 09:00 and 09:30 (barber free at 09:45).
    const blockedMinutes = new Set();
    for (const a of booked) {
      const [hh, mm] = a.timeSlot.split(':').map(Number);
      const startMin = hh * 60 + mm;
      const duration = a.service?.duration ?? 30;
      for (let t = startMin; t < startMin + duration; t += 30) {
        blockedMinutes.add(t);
      }
    }

    // Generate slots 09:00–18:30 every 30 minutes
    const allSlots = [];
    for (let h = 9; h < 19; h++) {
      allSlots.push(`${String(h).padStart(2, '0')}:00`);
      if (h <= 18) allSlots.push(`${String(h).padStart(2, '0')}:30`);
    }

    const available = allSlots.filter((s) => {
      const [hh, mm] = s.split(':').map(Number);
      return !blockedMinutes.has(hh * 60 + mm);
    });
    res.json({ success: true, data: available });
  } catch (err) {
    next(err);
  }
};

// GET /api/appointments/:id  (admin)
exports.getAppointment = async (req, res, next) => {
  try {
    const appt = await Appointment.findById(req.params.id)
      .populate('client')
      .populate('barber')
      .populate('service');
    if (!appt) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    res.json({ success: true, data: appt });
  } catch (err) {
    next(err);
  }
};

// POST /api/appointments  (public booking)
exports.createAppointment = async (req, res, next) => {
  try {
    const { clientName, clientPhone, barberId, serviceId, date, timeSlot, notes } = req.body;

    // Verify barber and service exist
    const [barber, service] = await Promise.all([
      Barber.findById(barberId),
      Service.findById(serviceId),
    ]);

    if (!barber || !barber.isActive) {
      return res.status(404).json({ success: false, message: 'Barber not found' });
    }
    if (!service || !service.isActive) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    // Upsert client
    const client = await Client.findOneAndUpdate(
      { phone: clientPhone },
      { $setOnInsert: { name: clientName, phone: clientPhone } },
      { upsert: true, new: true }
    );

    // Calculate price: service tier price
    const price = service.pricing[barber.tier];

    const appt = await Appointment.create({
      client: client._id,
      barber: barberId,
      service: serviceId,
      date: new Date(date),
      timeSlot,
      price,
      notes,
    });

    const populated = await appt.populate([
      { path: 'client', select: 'name phone' },
      { path: 'barber', select: 'name tier' },
      { path: 'service', select: 'name duration' },
    ]);

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    // Duplicate booking
    if (err.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'This time slot is already booked',
      });
    }
    next(err);
  }
};

// PATCH /api/appointments/:id/status  (admin)
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, cancelReason } = req.body;
    const update = { status };
    if (status === 'cancelled') {
      update.cancelledAt = new Date();
      update.cancelReason = cancelReason;
    }

    const appt = await Appointment.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    })
      .populate('client', 'name phone')
      .populate('barber', 'name tier')
      .populate('service', 'name');

    if (!appt) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    res.json({ success: true, data: appt });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/appointments/:id  (admin)
exports.deleteAppointment = async (req, res, next) => {
  try {
    const appt = await Appointment.findByIdAndDelete(req.params.id);
    if (!appt) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }
    res.json({ success: true, message: 'Appointment deleted' });
  } catch (err) {
    next(err);
  }
};

// GET /api/appointments/stats  (admin)
exports.getStats = async (req, res, next) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());

    const [todayCount, todayRevenue, weekNewClients, vipCount] = await Promise.all([
      Appointment.countDocuments({
        date: { $gte: startOfDay, $lte: endOfDay },
        status: { $nin: ['cancelled', 'no_show'] },
      }),
      Appointment.aggregate([
        {
          $match: {
            date: { $gte: startOfDay, $lte: endOfDay },
            status: { $in: ['confirmed', 'completed', 'in_progress'] },
          },
        },
        { $group: { _id: null, total: { $sum: '$price' } } },
      ]),
      Client.countDocuments({ createdAt: { $gte: startOfWeek } }),
      Client.countDocuments({ isVip: true }),
    ]);

    res.json({
      success: true,
      data: {
        todayBookings: todayCount,
        todayRevenue: todayRevenue[0]?.total || 0,
        weekNewClients,
        vipClients: vipCount,
      },
    });
  } catch (err) {
    next(err);
  }
};
