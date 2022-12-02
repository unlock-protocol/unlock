import { Optional } from 'sequelize'
import { Table, Column, Model } from 'sequelize-typescript'

interface ApplicationAttributes {
  id: number
  name: string
  key: string
  walletAddress: string
}

type ApplicationCreationAttributes = Optional<ApplicationAttributes, 'id'>

@Table({
  tableName: 'Applications',
  timestamps: true,
})
export class Application extends Model<
  ApplicationAttributes,
  ApplicationCreationAttributes
> {
  @Column({ primaryKey: true, autoIncrement: true })
  id!: number

  @Column
  name!: string

  @Column
  key!: string

  @Column
  walletAddress!: string
}
