'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.transaction(async (transaction) => {
      // Check for link objects missing 'name' key
      const missingNameLinks = await queryInterface.sequelize.query(
        `
        SELECT "slug" FROM "EventCollections"
        WHERE "links" IS NOT NULL
          AND NOT EXISTS (
            SELECT 1
            FROM jsonb_array_elements("links") AS link
            WHERE link ? 'name'
          )
        `,
        { type: Sequelize.QueryTypes.SELECT, transaction }
      )

      if (missingNameLinks.length > 0) {
        throw new Error(
          'Some EventCollections have links without a "name" key. Resolve before migrating.'
        )
      }

      // rename 'name' to 'type'
      await queryInterface.sequelize.query(
        `
        UPDATE "EventCollections"
        SET "links" = (
          SELECT jsonb_agg(
            jsonb_set(
              link - 'name', -- Remove the 'name' key
              '{type}',       -- Path to set the new key
              to_jsonb(link->'name')
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
      // Check for link objects missing 'type' key
      const missingTypeLinks = await queryInterface.sequelize.query(
        `
        SELECT "slug" FROM "EventCollections"
        WHERE "links" IS NOT NULL
          AND NOT EXISTS (
            SELECT 1
            FROM jsonb_array_elements("links") AS link
            WHERE link ? 'type'
          )
        `,
        { type: Sequelize.QueryTypes.SELECT, transaction }
      )

      if (missingTypeLinks.length > 0) {
        throw new Error(
          'Some EventCollections have links without a "type" key. Resolve before reverting migration.'
        )
      }

      // rename 'type' back to 'name'
      await queryInterface.sequelize.query(
        `
        UPDATE "EventCollections"
        SET "links" = (
          SELECT jsonb_agg(
            jsonb_set(
              link - 'type', -- Remove the 'type' key
              '{name}',       -- Path to set the original key
              to_jsonb(link->'type')
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
