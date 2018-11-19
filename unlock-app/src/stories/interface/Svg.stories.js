import React from 'react'
import { storiesOf } from '@storybook/react'
import Svg from '../../components/interface/svg'

storiesOf('Svg', Svg)
  .add('About', () => {
    return <Svg.About />
  })
  .add('Code', () => {
    return <Svg.Code />
  })
  .add('Close', () => {
    return <Svg.Close />
  })
  .add('Copy', () => {
    return <Svg.Copy />
  })
  .add('Download', () => {
    return <Svg.Download />
  })
  .add('Edit', () => {
    return <Svg.Edit />
  })
  .add('Eth', () => {
    return <Svg.Eth />
  })
  .add('Etherscan', () => {
    return <Svg.Etherscan />
  })
  .add('EthSub', () => {
    return <Svg.EthSub />
  })
  .add('Export', () => {
    return <Svg.Export />
  })
  .add('Github', () => {
    return <Svg.Github />
  })
  .add('Lemniscate', () => {
    return <Svg.Lemniscate />
  })
  .add('LockClosed', () => {
    return <Svg.LockClosed />
  })
  .add('Jobs', () => {
    return <Svg.Jobs />
  })
  .add('Preview', () => {
    return <Svg.Preview />
  })
  .add('Unlock', () => {
    return <Svg.Unlock />
  })
  .add('Upload', () => {
    return <Svg.Upload />
  })
  .add('Withdraw', () => {
    return <Svg.Withdraw />
  })
