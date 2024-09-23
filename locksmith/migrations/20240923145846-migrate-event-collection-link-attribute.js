'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // Update each link object: rename 'name' to 'type'
      await queryInterface.sequelize.query(
        `
        UPDATE "EventCollections"
        SET "links" = (
          SELECT jsonb_agg(
            jsonb_set(
              link - 'name', -- Remove the 'name' key
              '{type}',       -- Path to set the new key
              to_jsonb(link->'name') -- Value for 'type' is the original 'name'
            )
          )
          FROM jsonb_array_elements("links") AS link
        )
        WHERE "links" IS NOT NULL
      `,
        { transaction }
      )
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // Revert each link object: rename 'type' back to 'name'
      await queryInterface.sequelize.query(
        `
        UPDATE "EventCollections"
        SET "links" = (
          SELECT jsonb_agg(
            jsonb_set(
              link - 'type', -- Remove the 'type' key
              '{name}',       -- Path to set the original key
              to_jsonb(link->'type') -- Value for 'name' is the original 'type'
            )
          )
          FROM jsonb_array_elements("links") AS link
        )
        WHERE "links" IS NOT NULL
      `,
        { transaction }
      )
    })
  },
}
