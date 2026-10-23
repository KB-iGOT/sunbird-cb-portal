import { autoMock } from 'src/testing/auto-mock'

import { DraggableHelperDirective } from './draggable-helper.directive'

describe('DraggableHelperDirective', () => {
  it('should create an instance', () => {
    const directive = new DraggableHelperDirective(autoMock(), autoMock(), autoMock(), autoMock())
    expect(directive).toBeTruthy()
  })
})
