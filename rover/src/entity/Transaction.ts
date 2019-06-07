import { Entity, PrimaryColumn, Column } from 'typeorm'

@Entity()
export class Transaction {
  @PrimaryColumn({ unique: true })
  hash: string

  @Column({ nullable: true })
  blockHash: string

  @Column('integer')
  blockNumber: number

  @Column('integer')
  transactionIndex

  @Column('integer')
  confirmations: number

  @Column()
  from: string

  @Column({ nullable: true })
  to: string

  @Column()
  value: string

  @Column({ type: 'integer', nullable: true })
  nonce: number

  @Column({ type: 'text', nullable: true })
  data: string

  @Column()
  gasPrice: string

  @Column()
  gasLimit: string

  @Column()
  r: string

  @Column()
  s: string

  @Column('integer')
  v: number

  @Column({ nullable: true })
  creates: string

  @Column({ type: 'text', nullable: true })
  raw: string

  @Column('integer')
  networkId: number
}
