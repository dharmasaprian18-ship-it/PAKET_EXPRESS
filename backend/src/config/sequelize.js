const Sequelize = require('sequelize');
const config = require('./database');

const env = process.env.NODE_ENV || 'development';
const sequelizeConfig = config[env];

const sequelize = new Sequelize(
  sequelizeConfig.database,
  sequelizeConfig.username,
  sequelizeConfig.password,
  {
    host: sequelizeConfig.host,
    port: sequelizeConfig.port,
    dialect: sequelizeConfig.dialect,
    logging: sequelizeConfig.logging,
    pool: sequelizeConfig.pool,
    operatorsAliases: false,
  }
);

// Test connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection successful!');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
};

module.exports = {
  sequelize,
  Sequelize,
  testConnection,
};
