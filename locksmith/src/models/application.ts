import { Table, Column, Model } from 'sequelize-typescript'

@Table({
  tableName: 'Applications',
  timestamps: true,
})
export class Application extends Model<Application> {
  @Column({ primaryKey: true })
  id!: string

  @Column
  name!: string

  @Column
  secret!: string

  @Column
  revoked?: boolean

  @Column
  description?: string

  @Column
  walletAddress!: string
}
