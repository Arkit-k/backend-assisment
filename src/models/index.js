const { Sequelize } = require('sequelize');
const config = require('../config/database');

// Get environment configuration
const env = process.env.NODE_ENV || 'development';
const dbConfig = config[env];

// Create Sequelize instance
const sequelize = new Sequelize(dbConfig.url, {
  dialect: dbConfig.dialect,
  logging: dbConfig.logging,
  dialectOptions: dbConfig.dialectOptions
});

// Import models
const User = require('./user')(sequelize);
const File = require('./file')(sequelize);

// Define associations
User.hasMany(File, { foreignKey: 'userId' });
File.belongsTo(User, { foreignKey: 'userId' });

// Export models and Sequelize instance
module.exports = {
  sequelize,
  User,
  File
};
