import React from 'react'
import { shallow } from 'enzyme'

import { Home } from '../../pages/index'
import { Jobs } from '../../pages/jobs'
import { About } from '../../pages/about'
import { Dashboard } from '../../pages/dashboard'
import { Demo } from '../../pages/demo'

describe('Pages', () => {
  describe('Home', () => {
    it('should render title correctly', () => {
      const config = {
        env: 'prod',
      }
      const homepage = shallow(<Home config={config} />)
      expect(homepage.find('title').text()).toBe('Unlock: The Web\'s new business model')
    })
  })
  describe('Jobs', () => {
    it('should render title correctly', () => {
      const jobspage = shallow(<Jobs />)
      expect(jobspage.find('title').text()).toBe('Work at Unlock | Unlock: The Web\'s new business model')
    })
  })
  describe('About', () => {
    it('should render title correctly', () => {
      const aboutpage = shallow(<About />)
      expect(aboutpage.find('title').text()).toBe('About | Unlock: The Web\'s new business model')
    })
  })
  describe('Dashboard', () => {
    it('should render title correctly', () => {
      const account = {
        address: '0xabc',
        privateKey: 'deadbeef',
      }
      const dashboardpage = shallow(<Dashboard account={account} network={null} transactions={{}} locks={{}} />)
      expect(dashboardpage.find('title').text()).toBe('Dashboard | Unlock: The Web\'s new business model')
    })
  })
  describe('Demo', () => {
    it('should render title correctly', () => {
      const demopage = shallow(<Demo locks={{}} lockAddress={''} />)
      expect(demopage.find('title').text()).toBe('Demo | Unlock: The Web\'s new business model')
    })
  })
})
