'use strict'
module.exports = (sequelize, DataTypes) => {
  const Event = sequelize.define(
    'Event',
    {
      lockAddress: DataTypes.STRING,
      name: DataTypes.STRING,
      description: DataTypes.TEXT,
      location: DataTypes.STRING,
      date: DataTypes.DATE,
      logo: DataTypes.STRING,
    },
    {}
  )
  Event.associate = function() {
    // associations can be defined here
  }

  return Event
}
