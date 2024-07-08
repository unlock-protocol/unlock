'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('NextAuthAccount', {
      id: {
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      userId: {
        type: Sequelize.UUID,
        references: { model: 'NextAuthUser', key: 'id' },
        onDelete: 'CASCADE',
      },
      // This fileld is not used in the codebase, but it is required by the NextAuth
      UserId: {
        type: Sequelize.UUID,
      },
      type: {
        type: Sequelize.STRING,
      },
      provider: {
        type: Sequelize.STRING,
      },
      providerType: {
        type: Sequelize.STRING,
      },
      providerId: {
        type: Sequelize.STRING,
      },
      providerAccountId: {
        type: Sequelize.STRING,
      },
      refresh_token: {
        type: Sequelize.STRING,
      },
      access_token: {
        type: Sequelize.STRING,
      },
      token_type: {
        type: Sequelize.STRING,
      },
      scope: {
        type: Sequelize.STRING,
      },
      id_token: {
        type: Sequelize.TEXT,
      },
      expires_at: {
        type: Sequelize.INTEGER,
      },
      accessTokenExpires: {
        type: Sequelize.DATE,
      },
      session_state: {
        type: Sequelize.STRING,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Account')
  },
}
