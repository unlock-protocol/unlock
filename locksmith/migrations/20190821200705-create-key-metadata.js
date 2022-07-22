'use strict'
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable(
      'KeyMetadata',
      {
        id: {
          allowNull: false,
          type: Sequelize.STRING,
        },
        address: {
          allowNull: false,
          type: Sequelize.STRING,
        },
        data: {
          type: Sequelize.JSON,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      },
      {
        uniqueKeys: {
          id_unique: {
            fields: ['id'],
          },
        },
      }
    )
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('KeyMetadata')
  },
}
