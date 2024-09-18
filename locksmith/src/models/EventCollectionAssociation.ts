import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from 'sequelize'
import { sequelize } from './sequelize'

export class EventCollectionAssociation extends Model<
  InferAttributes<EventCollectionAssociation>,
  InferCreationAttributes<EventCollectionAssociation>
> {
  declare id: CreationOptional<number>
  declare eventSlug: string
  declare collectionSlug: string
  declare isApproved: boolean
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

EventCollectionAssociation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    eventSlug: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    collectionSlug: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isApproved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  {
    sequelize,
    tableName: 'EventCollectionAssociations',
  }
)
