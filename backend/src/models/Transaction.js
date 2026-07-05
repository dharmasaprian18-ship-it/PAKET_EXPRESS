const { DataTypes } = require('sequelize');

/**
 * @model Transaction
 * @description Transaction model untuk pembayaran
 */
module.exports = (sequelize) => {
  const Transaction = sequelize.define('Transaction', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    shipmentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'shipments',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    transactionId: {
      type: DataTypes.STRING(100),
      allowNull: true,
      comment: 'External payment provider transaction ID',
    },
    amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    paymentMethod: {
      type: DataTypes.ENUM('bank_transfer', 'credit_card', 'e_wallet', 'cash'),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'processing', 'success', 'failed', 'refunded'),
      defaultValue: 'pending',
      allowNull: false,
    },
    paymentProof: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    timestamps: true,
    tableName: 'transactions',
  });

  return Transaction;
};
