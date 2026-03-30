require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const connectDB = require('../src/config/db');
const app = require('../src/app');

// connectDB uses readyState check so it's safe to call on every cold start
module.exports = async (req, res) => {
  await connectDB();
  return app(req, res);
};
