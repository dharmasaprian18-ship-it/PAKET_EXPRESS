const fs = require('fs');
const path = require('path');
const { sequelize, Sequelize } = require('../config/sequelize');

const db = {};

// Import all models
fs
  .readdirSync(__dirname)
  .filter((file) => file.endsWith('.js') && file !== 'index.js')
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize);
    db[model.name] = model;
  });

// Setup associations
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// User associations
db.User.hasMany(db.Address, { foreignKey: 'userId', as: 'addresses' });
db.User.hasMany(db.Shipment, { foreignKey: 'senderId', as: 'sentShipments' });
db.User.hasMany(db.Shipment, { foreignKey: 'courierId', as: 'courierShipments' });
db.User.hasMany(db.Transaction, { foreignKey: 'userId', as: 'transactions' });

// Address associations
db.Address.belongsTo(db.User, { foreignKey: 'userId' });
db.Address.hasMany(db.Shipment, { foreignKey: 'pickupAddressId', as: 'pickupShipments' });
db.Address.hasMany(db.Shipment, { foreignKey: 'deliveryAddressId', as: 'deliveryShipments' });

// Shipment associations
db.Shipment.belongsTo(db.User, { foreignKey: 'senderId', as: 'sender' });
db.Shipment.belongsTo(db.User, { foreignKey: 'courierId', as: 'courier' });
db.Shipment.belongsTo(db.Address, { foreignKey: 'pickupAddressId', as: 'pickupAddress' });
db.Shipment.belongsTo(db.Address, { foreignKey: 'deliveryAddressId', as: 'deliveryAddress' });
db.Shipment.hasMany(db.ShipmentItem, { foreignKey: 'shipmentId', as: 'items' });
db.Shipment.hasMany(db.TrackingHistory, { foreignKey: 'shipmentId', as: 'trackingHistory' });
db.Shipment.hasOne(db.Transaction, { foreignKey: 'shipmentId', as: 'transaction' });

// ShipmentItem associations
db.ShipmentItem.belongsTo(db.Shipment, { foreignKey: 'shipmentId' });

// Transaction associations
db.Transaction.belongsTo(db.Shipment, { foreignKey: 'shipmentId', as: 'shipment' });
db.Transaction.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

// TrackingHistory associations
db.TrackingHistory.belongsTo(db.Shipment, { foreignKey: 'shipmentId' });

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
