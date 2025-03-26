const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('jugador', {
    idUsuari: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    nom: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    hash: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    victories: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    derrotes: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    morts: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    kills: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  }, {
    tableName: 'jugadors',
    timestamps: false,
  });
};