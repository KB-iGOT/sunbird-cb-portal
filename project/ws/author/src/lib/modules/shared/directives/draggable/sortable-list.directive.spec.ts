import { autoMock } from 'src/testing/auto-mock'

import { SortableListDirective } from './sortable-list.directive'

describe('SortableListDirective', () => {
  it('should create an instance', () => {
    const directive = new SortableListDirective(autoMock(), autoMock(), autoMock())
    expect(directive).toBeTruthy()
  })
})
