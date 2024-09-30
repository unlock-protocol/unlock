'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Add foreign key for eventSlug referencing EventData.slug
    await queryInterface.addConstraint('EventCollectionAssociations', {
      fields: ['eventSlug'],
      type: 'foreign key',
      name: 'fk_EventCollectionAssociations_eventSlug',
      references: {
        table: 'EventData',
        field: 'slug',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    })

    // Add foreign key for collectionSlug referencing EventCollections.slug
    await queryInterface.addConstraint('EventCollectionAssociations', {
      fields: ['collectionSlug'],
      type: 'foreign key',
      name: 'fk_EventCollectionAssociations_collectionSlug',
      references: {
        table: 'EventCollections',
        field: 'slug',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    })
  },

  down: async (queryInterface, Sequelize) => {
    // Remove foreign key for eventSlug
    await queryInterface.removeConstraint(
      'EventCollectionAssociations',
      'fk_EventCollectionAssociations_eventSlug'
    )

    // Remove foreign key for collectionSlug
    await queryInterface.removeConstraint(
      'EventCollectionAssociations',
      'fk_EventCollectionAssociations_collectionSlug'
    )
  },
}
