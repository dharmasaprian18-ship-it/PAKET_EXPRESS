const { DataTypes } = require('sequelize');

/**
 * @model TrackingHistory
 * @description TrackingHistory model untuk history tracking pengiriman
 */
module.exports = (sequelize) => {
  const TrackingHistory = sequelize.define('TrackingHistory', {
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
    status: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    timestamp: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  }, {
    timestamps: false,
    tableName: 'tracking_histories',
  });

  return TrackingHistory;
};
