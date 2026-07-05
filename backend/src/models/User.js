const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');

/**
 * @model User
 * @description User model untuk customer, courier, dan admin
 */
module.exports = (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    fullName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Full name is required' },
      },
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: {
        msg: 'Email already exists',
      },
      validate: {
        isEmail: { msg: 'Invalid email format' },
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: {
          args: [6, 255],
          msg: 'Password must be at least 6 characters',
        },
      },
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM('customer', 'courier', 'admin'),
      defaultValue: 'customer',
      allowNull: false,
    },
    profilePicture: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    lastLogin: {
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
    tableName: 'users',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  });

  /**
   * @method comparePassword
   * @description Compare password with hashed password
   */
  User.prototype.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
  };

  /**
   * @method toJSON
   * @description Remove sensitive data when converting to JSON
   */
  User.prototype.toJSON = function () {
    const { password, ...data } = this.get();
    return data;
  };

  return User;
};
