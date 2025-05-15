const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const File = sequelize.define('File', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    originalFilename: {
      type: DataTypes.STRING,
      allowNull: false
    },
    storagePath: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('uploaded', 'processing', 'processed', 'failed'),
      defaultValue: 'uploaded',
      allowNull: false
    },
    extractedData: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    uploadedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'files',
    timestamps: true
  });

  return File;
};
