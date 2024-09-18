'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('EventCollectionAssociations', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      eventSlug: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'EventData',
          key: 'slug',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      collectionSlug: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: 'EventCollections',
          key: 'slug',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      isApproved: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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

    // unique index to prevent duplicate associations
    await queryInterface.addIndex(
      'EventCollectionAssociations',
      ['eventSlug', 'collectionSlug'],
      {
        unique: true,
        name: 'unique_event_collection_association',
      }
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('EventCollectionAssociations')
  },
}
