'use strict';
module.exports = (sequelize, DataTypes) => {
  const Lock = sequelize.define('Lock', {
    name: DataTypes.STRING,
    address: DataTypes.STRING
  }, {});
  Lock.associate = function(models) {
    // associations can be defined here
  };
  return Lock;
};