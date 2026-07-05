/**
 * @migration
 * @description Create initial database schema
 */

'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Create users table
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      fullName: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      phoneNumber: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      role: {
        type: Sequelize.ENUM('customer', 'courier', 'admin'),
        defaultValue: 'customer',
      },
      profilePicture: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      isVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      lastLogin: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // Create addresses table
    await queryInterface.createTable('addresses', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      label: {
        type: Sequelize.STRING(50),
        allowNull: false,
      },
      fullAddress: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      province: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      district: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      postalCode: {
        type: Sequelize.STRING(10),
        allowNull: false,
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true,
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true,
      },
      isDefault: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // Create shipments table
    await queryInterface.createTable('shipments', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      trackingNumber: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true,
      },
      senderId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      courierId: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'SET NULL',
      },
      pickupAddressId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'addresses', key: 'id' },
      },
      deliveryAddressId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'addresses', key: 'id' },
      },
      status: {
        type: Sequelize.ENUM('pending', 'confirmed', 'picked_up', 'in_transit', 'delivered', 'cancelled', 'returned'),
        defaultValue: 'pending',
      },
      totalWeight: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      shippingCost: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      insuranceCost: {
        type: Sequelize.DECIMAL(12, 2),
        defaultValue: 0,
      },
      totalCost: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      estimatedDelivery: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      actualDelivery: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      pickupTime: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // Create shipment_items table
    await queryInterface.createTable('shipment_items', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      shipmentId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'shipments', key: 'id' },
        onDelete: 'CASCADE',
      },
      itemName: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      itemType: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      quantity: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      weight: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      length: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      width: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      height: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      value: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // Create transactions table
    await queryInterface.createTable('transactions', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      shipmentId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'shipments', key: 'id' },
        onDelete: 'CASCADE',
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      transactionId: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false,
      },
      paymentMethod: {
        type: Sequelize.ENUM('bank_transfer', 'credit_card', 'e_wallet', 'cash'),
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM('pending', 'processing', 'success', 'failed', 'refunded'),
        defaultValue: 'pending',
      },
      paymentProof: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      paidAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // Create tracking_histories table
    await queryInterface.createTable('tracking_histories', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      shipmentId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'shipments', key: 'id' },
        onDelete: 'CASCADE',
      },
      status: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true,
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true,
      },
      location: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      timestamp: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });

    // Create indexes for performance
    await queryInterface.addIndex('users', ['email']);
    await queryInterface.addIndex('shipments', ['trackingNumber']);
    await queryInterface.addIndex('shipments', ['status']);
    await queryInterface.addIndex('shipments', ['senderId']);
    await queryInterface.addIndex('transactions', ['shipmentId']);
    await queryInterface.addIndex('tracking_histories', ['shipmentId']);
  },

  down: async (queryInterface, Sequelize) => {
    // Drop tables in reverse order
    await queryInterface.dropTable('tracking_histories');
    await queryInterface.dropTable('transactions');
    await queryInterface.dropTable('shipment_items');
    await queryInterface.dropTable('shipments');
    await queryInterface.dropTable('addresses');
    await queryInterface.dropTable('users');
  },
};
