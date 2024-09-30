'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('EventCollections', {
      slug: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      banner: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      links: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      managerAddresses: {
        type: Sequelize.ARRAY(Sequelize.STRING),
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('EventCollections')
  },
}
