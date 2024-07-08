import {
  DataTypes,
  Model,
  CreationOptional,
  InferAttributes,
  InferCreationAttributes,
} from 'sequelize'
import { UUID } from 'crypto'
import { sequelize } from './sequelize'

export class NextAuthAccount extends Model<
  InferAttributes<NextAuthAccount>,
  InferCreationAttributes<NextAuthAccount>
> {
  declare id: UUID
  declare userId: UUID
  declare UserId: UUID // This field is not used in the codebase, but it is required by NextAuth
  declare type: string
  declare provider: string
  declare providerType: string
  declare providerId: string
  declare providerAccountId: string
  declare refresh_token: string
  declare access_token: string
  declare token_type: string
  declare scope: string
  declare id_token: string
  declare expires_at: number
  declare accessTokenExpires: Date
  declare session_state: string
  declare createdAt: CreationOptional<Date>
  declare updatedAt: CreationOptional<Date>
}

NextAuthAccount.init(
  {
    id: {
      primaryKey: true,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
    },
    userId: {
      type: DataTypes.UUID,
      references: { model: 'NextAuthUser', key: 'id' },
      onDelete: 'CASCADE',
    },
    UserId: {
      type: DataTypes.UUID,
    },
    type: {
      type: DataTypes.STRING,
    },
    provider: {
      type: DataTypes.STRING,
    },
    providerType: {
      type: DataTypes.STRING,
    },
    providerId: {
      type: DataTypes.STRING,
    },
    providerAccountId: {
      type: DataTypes.STRING,
    },
    refresh_token: {
      type: DataTypes.STRING,
    },
    access_token: {
      type: DataTypes.STRING,
    },
    token_type: {
      type: DataTypes.STRING,
    },
    scope: {
      type: DataTypes.STRING,
    },
    id_token: {
      type: DataTypes.TEXT,
    },
    expires_at: {
      type: DataTypes.INTEGER,
    },
    accessTokenExpires: {
      type: DataTypes.DATE,
    },
    session_state: {
      type: DataTypes.STRING,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'NextAuthAccount',
    tableName: 'NextAuthAccount',
  }
)
