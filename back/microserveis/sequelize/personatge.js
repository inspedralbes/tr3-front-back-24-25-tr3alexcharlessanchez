const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('personatge', {
    idPersonatge: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nom: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    velocitat: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    forcaExplosions: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    bombesSimultanies: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'personatges',
    timestamps: false,
  });
};