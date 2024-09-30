import { EventData } from './Event'
import { EventCollection } from './EventCollection'
import { EventCollectionAssociation } from './EventCollectionAssociation'

// EventData associations
EventData.belongsToMany(EventCollection, {
  through: EventCollectionAssociation,
  as: 'collections',
  foreignKey: 'eventSlug',
  otherKey: 'collectionSlug',
  sourceKey: 'slug',
  targetKey: 'slug',
})

// EventCollection associations
EventCollection.belongsToMany(EventData, {
  through: EventCollectionAssociation,
  as: 'events',
  foreignKey: 'collectionSlug',
  otherKey: 'eventSlug',
  sourceKey: 'slug',
  targetKey: 'slug',
})
