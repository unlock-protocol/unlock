'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // The case style is different because rate limiter package we use has a bug which assume the table name is in lower case
    await queryInterface.createTable('ratelimiter', {
      key: {
        type: Sequelize.STRING,
        primaryKey: true,
      },
      points: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      expire: {
        type: Sequelize.BIGINT,
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ratelimiter')
  },
}
