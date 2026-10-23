import { autoMock } from 'src/testing/auto-mock'

import { AnalyticsDirective } from './analytics.directive'

describe('AnalyticsDirective', () => {
  it('should create an instance', () => {
    const directive = new AnalyticsDirective(autoMock())
    expect(directive).toBeTruthy()
  })
})
