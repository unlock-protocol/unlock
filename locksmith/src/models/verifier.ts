import { Table, Column, Model } from 'sequelize-typescript'

@Table({ tableName: 'Verifiers', timestamps: true })
export class Verifier extends Model<Verifier> {
  @Column
  verifierAddress!: string

  @Column
  userAddress!: string

  @Column
  lockManager!: string

  @Column
  network!: number
}
