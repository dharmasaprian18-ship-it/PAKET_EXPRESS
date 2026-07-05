require('dotenv').config();
const midtransClient = require('midtrans-client');

/**
 * @config payment
 * @description Midtrans payment gateway configuration
 * @kriteria KRITERIA 5 - Payment Gateway Integration
 */

const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_ENV === 'production',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

const core = new midtransClient.CoreApi({
  isProduction: process.env.MIDTRANS_ENV === 'production',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

module.exports = {
  snap,
  core,
};
