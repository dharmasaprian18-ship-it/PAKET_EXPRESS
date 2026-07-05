const db = require('../models');

/**
 * @socket trackingSocket
 * @description Real-time tracking updates using Socket.io
 * @kriteria KRITERIA 6 - Real-Time Communication (Socket.io)
 */

const connectedUsers = new Map();
const trackingRooms = new Map();

/**
 * @function initializeTrackingSocket
 * @description Initialize Socket.io for real-time tracking
 * @param {object} io - Socket.io instance
 */
const initializeTrackingSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`✅ New socket connection: ${socket.id}`);

    /**
     * @event join_tracking
     * @description User joins tracking room for a shipment
     * @data {string} trackingNumber - Shipment tracking number
     * @data {string} userId - User ID
     */
    socket.on('join_tracking', (data) => {
      const { trackingNumber, userId } = data;
      const room = `tracking_${trackingNumber}`;

      socket.join(room);
      connectedUsers.set(socket.id, { userId, trackingNumber });
      trackingRooms.set(room, trackingRooms.get(room) || []).push(socket.id);

      console.log(`📍 User ${userId} joined tracking for ${trackingNumber}`);
      socket.emit('joined_tracking', {
        success: true,
        message: `Joined tracking room: ${trackingNumber}`,
      });
    });

    /**
     * @event location_update
     * @description Courier sends location update
     * @data {string} trackingNumber - Shipment tracking number
     * @data {number} latitude - Courier latitude
     * @data {number} longitude - Courier longitude
     * @data {string} status - Shipment status
     */
    socket.on('location_update', async (data) => {
      try {
        const { trackingNumber, latitude, longitude, status } = data;
        const room = `tracking_${trackingNumber}`;

        // Get shipment
        const shipment = await db.Shipment.findOne({
          where: { trackingNumber },
        });

        if (!shipment) {
          socket.emit('error', { message: 'Shipment not found' });
          return;
        }

        // Create tracking history
        const tracking = await db.TrackingHistory.create({
          shipmentId: shipment.id,
          latitude,
          longitude,
          status: status || shipment.status,
          description: `Courier location updated`,
          timestamp: new Date(),
        });

        // Update shipment status if provided
        if (status && status !== shipment.status) {
          await shipment.update({ status });
        }

        // Broadcast to all users watching this shipment
        io.to(room).emit('tracking_update', {
          trackingNumber,
          latitude,
          longitude,
          status: status || shipment.status,
          timestamp: new Date(),
          description: `Courier is at ${latitude}, ${longitude}`,
        });

        console.log(`📍 Location update for ${trackingNumber}: (${latitude}, ${longitude})`);
      } catch (error) {
        console.error('❌ Location update error:', error);
        socket.emit('error', { message: 'Failed to update location' });
      }
    });

    /**
     * @event status_update
     * @description Shipment status update
     * @data {string} trackingNumber - Shipment tracking number
     * @data {string} status - New status
     * @data {string} description - Status description
     */
    socket.on('status_update', async (data) => {
      try {
        const { trackingNumber, status, description } = data;
        const room = `tracking_${trackingNumber}`;

        const shipment = await db.Shipment.findOne({
          where: { trackingNumber },
        });

        if (!shipment) {
          socket.emit('error', { message: 'Shipment not found' });
          return;
        }

        // Update shipment status
        await shipment.update({ status });

        // Create tracking history
        await db.TrackingHistory.create({
          shipmentId: shipment.id,
          status,
          description: description || `Status changed to ${status}`,
        });

        // Broadcast to all users watching this shipment
        io.to(room).emit('tracking_update', {
          trackingNumber,
          status,
          description: description || `Status changed to ${status}`,
          timestamp: new Date(),
        });

        console.log(`📍 Status update for ${trackingNumber}: ${status}`);
      } catch (error) {
        console.error('❌ Status update error:', error);
        socket.emit('error', { message: 'Failed to update status' });
      }
    });

    /**
     * @event leave_tracking
     * @description User leaves tracking room
     * @data {string} trackingNumber - Shipment tracking number
     */
    socket.on('leave_tracking', (data) => {
      const { trackingNumber } = data;
      const room = `tracking_${trackingNumber}`;

      socket.leave(room);
      connectedUsers.delete(socket.id);

      if (trackingRooms.has(room)) {
        const users = trackingRooms.get(room);
        trackingRooms.set(room, users.filter(id => id !== socket.id));
      }

      console.log(`📍 User left tracking for ${trackingNumber}`);
      socket.emit('left_tracking', {
        success: true,
        message: `Left tracking room: ${trackingNumber}`,
      });
    });

    /**
     * @event disconnect
     * @description Handle user disconnect
     */
    socket.on('disconnect', () => {
      const userInfo = connectedUsers.get(socket.id);
      connectedUsers.delete(socket.id);

      if (userInfo) {
        const room = `tracking_${userInfo.trackingNumber}`;
        if (trackingRooms.has(room)) {
          const users = trackingRooms.get(room);
          trackingRooms.set(room, users.filter(id => id !== socket.id));
        }
      }

      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });
};

/**
 * @function broadcastTrackingUpdate
 * @description Broadcast tracking update to all connected clients
 * @param {object} io - Socket.io instance
 * @param {string} trackingNumber - Shipment tracking number
 * @param {object} data - Update data
 */
const broadcastTrackingUpdate = (io, trackingNumber, data) => {
  const room = `tracking_${trackingNumber}`;
  io.to(room).emit('tracking_update', data);
};

module.exports = {
  initializeTrackingSocket,
  broadcastTrackingUpdate,
  connectedUsers,
  trackingRooms,
};
