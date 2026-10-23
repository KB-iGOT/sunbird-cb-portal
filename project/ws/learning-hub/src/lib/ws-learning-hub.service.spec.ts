import { TestBed } from '@angular/core/testing'

import { WsLearningHubService } from './ws-learning-hub.service'

describe('WsLearningHubService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    providers: [
      WsLearningHubService,
    ],
  }))

  it('should be created', () => {
    const service: WsLearningHubService = TestBed.inject(WsLearningHubService)
    expect(service).toBeTruthy()
  })
})
