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
    jugador1: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    jugador2: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    codi_partida: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    idGuanyador: {
      type: DataTypes.INTEGER,
    },
    acabada: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    tableName: 'partides',
    timestamps: false,
  });
};