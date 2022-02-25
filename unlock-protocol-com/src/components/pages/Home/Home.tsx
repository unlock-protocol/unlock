import { Connect } from './sections/Connect'
import { Developer } from './sections/Developer'
import { Steps } from './sections/Steps'
import { Public } from './sections/Public'
import { Community } from './sections/Community'
import { GetStarted } from './sections/GetStarted'
import dynamic from 'next/dynamic'

const Recipes = dynamic(() => import('./sections/Recipes'))

export function Home() {
  return (
    <main>
      <Connect />
      <Steps />
      <Developer />
      <Recipes />
      <GetStarted />
      <Public />
      <Community />
    </main>
  )
}
