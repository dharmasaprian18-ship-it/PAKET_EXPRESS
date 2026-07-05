const { DataTypes } = require('sequelize');

/**
 * @model ShipmentItem
 * @description ShipmentItem model untuk detail item dalam pengiriman
 */
module.exports = (sequelize) => {
  const ShipmentItem = sequelize.define('ShipmentItem', {
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
    itemName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    itemType: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    weight: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      comment: 'Weight in kg',
    },
    length: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Length in cm',
    },
    width: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Width in cm',
    },
    height: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Height in cm',
    },
    value: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
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
    tableName: 'shipment_items',
  });

  return ShipmentItem;
};
