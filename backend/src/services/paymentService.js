const midtransClient = require('midtrans-client');
const { v4: uuidv4 } = require('uuid');
const db = require('../models');

/**
 * @service paymentService
 * @description Payment processing service dengan Midtrans
 * @kriteria KRITERIA 5 - Payment Gateway Integration
 */

const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_ENV === 'production',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

/**
 * @function createPaymentLink
 * @description Create payment link using Midtrans Snap
 * @param {object} transaction - Transaction object
 * @param {object} customer - Customer/user object
 * @returns {object} Payment link and redirect URL
 */
const createPaymentLink = async (transaction, customer) => {
  try {
    const parameter = {
      transaction_details: {
        order_id: transaction.id,
        gross_amount: Math.round(transaction.amount),
      },
      customer_details: {
        first_name: customer.fullName,
        email: customer.email,
        phone: customer.phoneNumber || '0',
      },
      item_details: [
        {
          id: `SHIPMENT-${transaction.shipmentId}`,
          price: Math.round(transaction.amount),
          quantity: 1,
          name: `Paket Express Shipment`,
        },
      ],
    };

    const response = await snap.createTransaction(parameter);

    return {
      transactionId: response.transaction_id,
      token: response.token,
      redirectUrl: response.redirect_url,
      status: response.transaction_status,
    };
  } catch (error) {
    console.error('❌ Midtrans Payment Error:', error);
    throw new Error(`Payment creation failed: ${error.message}`);
  }
};

/**
 * @function verifyPayment
 * @description Verify payment status from Midtrans
 * @param {string} transactionId - Midtrans transaction ID
 * @returns {object} Payment status
 */
const verifyPayment = async (transactionId) => {
  try {
    const core = new midtransClient.CoreApi({
      isProduction: process.env.MIDTRANS_ENV === 'production',
      serverKey: process.env.MIDTRANS_SERVER_KEY,
    });

    const response = await core.transaction.status(transactionId);

    return {
      transactionId: response.transaction_id,
      status: response.transaction_status,
      paymentType: response.payment_type,
      amount: response.gross_amount,
      timestamp: response.transaction_time,
    };
  } catch (error) {
    console.error('❌ Midtrans Verification Error:', error);
    throw new Error(`Payment verification failed: ${error.message}`);
  }
};

/**
 * @function handlePaymentNotification
 * @description Handle payment notification from Midtrans webhook
 * @param {object} notification - Midtrans webhook notification
 * @returns {object} Updated transaction
 */
const handlePaymentNotification = async (notification) => {
  try {
    const transaction = await db.Transaction.findByPk(notification.order_id);

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    const statusMap = {
      capture: 'success',
      settlement: 'success',
      pending: 'processing',
      deny: 'failed',
      cancel: 'failed',
      expire: 'failed',
      refund: 'refunded',
    };

    const transactionStatus = statusMap[notification.transaction_status] || 'pending';

    // Update transaction
    await transaction.update({
      status: transactionStatus,
      transactionId: notification.transaction_id,
      paidAt: transactionStatus === 'success' ? new Date() : null,
    });

    // Update shipment if payment successful
    if (transactionStatus === 'success') {
      const shipment = await db.Shipment.findByPk(transaction.shipmentId);
      await shipment.update({ status: 'confirmed' });

      // Add tracking history
      await db.TrackingHistory.create({
        shipmentId: shipment.id,
        status: 'confirmed',
        description: 'Payment confirmed, shipment ready for pickup',
      });
    }

    return transaction;
  } catch (error) {
    console.error('❌ Payment Notification Error:', error);
    throw error;
  }
};

/**
 * @function refundPayment
 * @description Refund payment through Midtrans
 * @param {string} transactionId - Midtrans transaction ID
 * @param {number} amount - Refund amount
 * @returns {object} Refund status
 */
const refundPayment = async (transactionId, amount) => {
  try {
    const core = new midtransClient.CoreApi({
      isProduction: process.env.MIDTRANS_ENV === 'production',
      serverKey: process.env.MIDTRANS_SERVER_KEY,
    });

    const response = await core.transaction.refund(transactionId, {
      amount: Math.round(amount),
    });

    return {
      refundId: response.refund_key,
      status: response.refund_status,
      amount: response.refund_amount,
    };
  } catch (error) {
    console.error('❌ Refund Error:', error);
    throw new Error(`Refund failed: ${error.message}`);
  }
};

module.exports = {
  createPaymentLink,
  verifyPayment,
  handlePaymentNotification,
  refundPayment,
};
