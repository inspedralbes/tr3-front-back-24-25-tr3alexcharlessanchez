const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('partida', {
    idPartida: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    data: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    duracio: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    jugador1: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    jugador2: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    idGuanyador: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    idPersonatgeGuanyador: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    idPersonatgePerdedor: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  }, {
    tableName: 'partides',
    timestamps: false,
  });
};