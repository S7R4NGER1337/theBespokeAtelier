const Client = require('../models/Client');

// GET /api/clients  (admin)
exports.getClients = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }
    if (req.query.vip === 'true') filter.isVip = true;

    const [clients, total] = await Promise.all([
      Client.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Client.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: clients,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/clients/:id  (admin)
exports.getClient = async (req, res, next) => {
  try {
    const client = await Client.findById(req.params.id).populate('appointments');
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }
    res.json({ success: true, data: client });
  } catch (err) {
    next(err);
  }
};

// POST /api/clients  (public – created during booking)
exports.createClient = async (req, res, next) => {
  try {
    // Upsert by phone to avoid duplicates
    const client = await Client.findOneAndUpdate(
      { phone: req.body.phone },
      { $setOnInsert: req.body },
      { upsert: true, new: true, runValidators: true }
    );
    res.status(201).json({ success: true, data: client });
  } catch (err) {
    next(err);
  }
};

// PUT /api/clients/:id  (admin)
exports.updateClient = async (req, res, next) => {
  try {
    const client = await Client.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found' });
    }
    res.json({ success: true, data: client });
  } catch (err) {
    next(err);
  }
};
