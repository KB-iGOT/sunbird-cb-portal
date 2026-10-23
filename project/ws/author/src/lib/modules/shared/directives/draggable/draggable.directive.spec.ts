import { autoMock } from 'src/testing/auto-mock'

import { DraggableDirective } from './draggable.directive'

describe('DraggableDirective', () => {
  it('should create an instance', () => {
    const directive = new DraggableDirective(autoMock())
    expect(directive).toBeTruthy()
  })
})
