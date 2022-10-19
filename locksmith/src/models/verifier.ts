import { Table, Column, Model } from 'sequelize-typescript'

@Table({ tableName: 'Verifiers', timestamps: true, modelName: 'Verifier' })
export class Verifier extends Model<Verifier> {
  @Column
  address!: string

  @Column
  lockAddress!: string

  @Column
  lockManager!: string

  @Column
  network!: number
}
