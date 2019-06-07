import { Entity, PrimaryColumn, Column } from 'typeorm'

@Entity()
export class Block {
  @PrimaryColumn({ unique: true })
  hash: string

  @Column()
  parentHash: string

  @Column()
  number: number

  @Column()
  timestamp: number

  @Column()
  nonce: string

  @Column('bigint')
  difficulty: number

  @Column()
  gasLimit: string

  @Column()
  gasUsed: string

  @Column()
  miner: string

  @Column()
  extraData: string
}
