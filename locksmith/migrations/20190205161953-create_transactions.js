'use strict'

/*
 The Sequelize framework provides a number of convenience methods, part of which
 are automated timestamps. We are leveraging, this functionality in this migration.
 
 http://docs.sequelizejs.com/manual/tutorial/models-definition.html#timestamps
*/
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Transactions', {
      transactionHash: {
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
      sender: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      recipient: {
        allowNull: false,
        type: Sequelize.STRING,
      },
    })
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Transactions')
  },
}
