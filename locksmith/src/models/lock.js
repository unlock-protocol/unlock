'use strict'
module.exports = (sequelize, DataTypes) => {
  const Lock = sequelize.define(
    'Lock',
    {
      name: DataTypes.STRING,
      address: DataTypes.STRING,
      owner: DataTypes.STRING,
    },
    {}
  )
  Lock.associate = function() {
    // associations can be defined here
  }
  Lock.removeAttribute('id')

  return Lock
}
