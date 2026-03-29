const Barber = require('../models/Barber');

// GET /api/barbers  (public)
exports.getBarbers = async (req, res, next) => {
  try {
    const filter = { isActive: true };
    const barbers = await Barber.find(filter).sort({ order: 1, createdAt: 1 });
    res.json({ success: true, data: barbers });
  } catch (err) {
    next(err);
  }
};

// GET /api/barbers/:id  (public)
exports.getBarber = async (req, res, next) => {
  try {
    const barber = await Barber.findById(req.params.id);
    if (!barber || !barber.isActive) {
      return res.status(404).json({ success: false, message: 'Barber not found' });
    }
    res.json({ success: true, data: barber });
  } catch (err) {
    next(err);
  }
};

// POST /api/barbers  (admin)
exports.createBarber = async (req, res, next) => {
  try {
    const barber = await Barber.create(req.body);
    res.status(201).json({ success: true, data: barber });
  } catch (err) {
    next(err);
  }
};

// PUT /api/barbers/:id  (admin)
exports.updateBarber = async (req, res, next) => {
  try {
    const barber = await Barber.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!barber) {
      return res.status(404).json({ success: false, message: 'Barber not found' });
    }
    res.json({ success: true, data: barber });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/barbers/:id  (admin – soft delete)
exports.deleteBarber = async (req, res, next) => {
  try {
    const barber = await Barber.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!barber) {
      return res.status(404).json({ success: false, message: 'Barber not found' });
    }
    res.json({ success: true, message: 'Barber deactivated' });
  } catch (err) {
    next(err);
  }
};
