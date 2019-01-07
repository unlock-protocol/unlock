'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Locks', {
      name: {
        type: Sequelize.STRING,
      },
      address: {
        allowNull: false,
        type: Sequelize.STRING,
        primaryKey: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      owner: {
        allowNull: false,
        type: Sequelize.STRING,
      },
    })
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Locks')
  },
}
