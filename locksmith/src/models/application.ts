import { Table, Column, Model } from 'sequelize-typescript'

@Table({
  tableName: 'Applications',
  timestamps: true,
})
export class Application extends Model<Application> {
  @Column({ primaryKey: true, autoIncrement: true })
  id!: number

  @Column
  name!: string

  @Column
  key!: string

  @Column
  walletAddress!: string
}
