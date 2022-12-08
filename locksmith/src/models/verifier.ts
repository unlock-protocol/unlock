import { Table, Column, Model } from 'sequelize-typescript'

interface VerifierAttributes {
  address: string
  lockAddress: string
  lockManager: string
  network: number
}

@Table({ tableName: 'Verifiers', timestamps: true })
export class Verifier extends Model<VerifierAttributes> {
  @Column
  address!: string

  @Column
  lockAddress!: string

  @Column
  lockManager!: string

  @Column
  network!: number
}
