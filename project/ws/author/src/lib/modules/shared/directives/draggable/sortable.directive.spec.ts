import { autoMock } from 'src/testing/auto-mock'

import { SortableDirective } from './sortable.directive'

describe('SortableDirective', () => {
  it('should create an instance', () => {
    const directive = new SortableDirective(autoMock())
    expect(directive).toBeTruthy()
  })
})
