import { Connect } from './sections/Connect'
import { Developer } from './sections/Developer'
import { Steps } from './sections/Steps'
import { Public } from './sections/Public'
import { Community } from './sections/Community'
import { Recipes } from './sections/Recipe'
import { Layout } from '../../layout/DefaultLayout'
import { CenteredColumn } from '../../layout/Columns'

export function Home() {
  return (
    <Layout>
      <div className="pt-16 pb-8">
        <CenteredColumn className="px-6 py-8 sm:py-16">
          <Connect />
        </CenteredColumn>
        <CenteredColumn className="px-6 py-16 sm:py-20">
          <Steps />
        </CenteredColumn>
        <CenteredColumn className="px-6 py-8 sm:py-20">
          <Developer />
        </CenteredColumn>
        <div className="py-4">
          <Recipes />
        </div>
        <CenteredColumn className="px-6 py-8 sm:py-16">
          <Public />
        </CenteredColumn>
        <CenteredColumn className="px-6 py-16">
          <Community />
        </CenteredColumn>
      </div>
    </Layout>
  )
}
