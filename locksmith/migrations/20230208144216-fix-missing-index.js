'use strict';

/**
 * This migration is a fix for the migration `CustomEmailContents` which did not initially include an index
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.addIndex('CustomEmailContents', {
        fields: ['lockAddress', 'network', 'template'],
        unique: true,
        name: 'lock_network_template_index',
      })
    }
    catch (error) {
      // Ignore if already exists
      if (error.message !== 'relation "lock_network_template_index" already exists') {
        throw error
      }
    }

  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeIndex('CustomEmailContents', 'lock_network_template_index')
  }
};
