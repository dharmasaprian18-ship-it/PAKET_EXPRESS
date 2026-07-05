const { DataTypes } = require('sequelize');

/**
 * @model Shipment
 * @description Shipment model untuk pengiriman paket
 */
module.exports = (sequelize) => {
  const Shipment = sequelize.define('Shipment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    trackingNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    senderId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    courierId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    pickupAddressId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'addresses',
        key: 'id',
      },
    },
    deliveryAddressId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'addresses',
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM(
        'pending',
        'confirmed',
        'picked_up',
        'in_transit',
        'delivered',
        'cancelled',
        'returned'
      ),
      defaultValue: 'pending',
      allowNull: false,
    },
    totalWeight: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Weight in kg',
    },
    shippingCost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    insuranceCost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
      defaultValue: 0,
    },
    totalCost: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    estimatedDelivery: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    actualDelivery: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    pickupTime: {
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
    tableName: 'shipments',
  });

  return Shipment;
};
