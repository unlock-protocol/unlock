import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize'
import { sequelize } from './sequelize'
import { EventData } from './Event'

export class EventCollection extends Model<
  InferAttributes<EventCollection>,
  InferCreationAttributes<EventCollection>
> {
  declare slug: string
  declare title: string
  declare description: string
  declare coverImage: CreationOptional<string>
  declare banner: CreationOptional<string>
  declare links: CreationOptional<object>
  declare managerAddresses: string[]
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
  declare events?: EventData[]

  // getter to return an empty array if events are undefined
  getEvents() {
    return this.events || []
  }
}

EventCollection.init(
  {
    slug: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    coverImage: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    banner: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    links: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    managerAddresses: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'EventCollections',
  }
)
