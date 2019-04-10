'use strict'

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('Users', 'recoveryPhrase', {
      type: Sequelize.STRING(512),
      allowNull: false,
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('Users', 'recoveryPhrase', {
      type: Sequelize.STRING(),
      allowNull: false,
    })
  },
}
