import { EventYouTubeComponent } from './event-you-tube.component'
import * as videoJsUtil from '../../../../../../../../../library/ws-widget/collection/src/lib/_services/videojs-util'

// Mock dependencies
jest.mock('@angular/router')
jest.mock('./../../services/events.service')
jest.mock('@sunbird-cb/utils-v2')
jest.mock('moment', () => {
  const mockMoment = (date: any) => ({
    valueOf: () => typeof date === 'string' ? new Date(date).getTime() : date.getTime()
  })
  mockMoment.mockReturnValue = jest.fn()
  return mockMoment
})
jest.mock('../../../../../../../../../library/ws-widget/collection/src/lib/_services/videojs-util', () => ({
  fireRealTimeProgressFunction: jest.fn(),
  saveContinueLearningFunction: jest.fn(),
  telemetryEventDispatcherFunction: jest.fn(),
  youtubeInitializer: jest.fn().mockReturnValue({ dispose: jest.fn() })
}))

describe('EventYouTubeComponent', () => {
  let component: EventYouTubeComponent
  let activatedRouteMock: any
  let eventServiceMock: any
  let configSvcMock: any
  let elementRefMock: any

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()

    // Setup mocks
    activatedRouteMock = {
      snapshot: {
        data: {
          content: {
            data: {
              identifier: 'test-event-id',
              startDate: '2025-03-18',
              startTime: '10:00+0000',
              endDate: '2025-03-18',
              endTime: '12:00+0000',
              duration: 120,
              batches: [{ batchId: 'test-batch-id' }]
            }
          },
          pageData: {
            data: {
              fireUpdate: 200
            }
          }
        },
        params: {
          videoId: 'test-video-id'
        }
      },
      params: {
        subscribe: jest.fn().mockImplementation(callback => {
          callback({ videoId: 'test-video-id' })
          return { unsubscribe: jest.fn() }
        })
      },
      queryParams: {
        subscribe: jest.fn().mockImplementation(callback => {
          callback({ isEnrolled: true })
          return { unsubscribe: jest.fn() }
        })
      }
    }

    eventServiceMock = {
      eventStateRead: jest.fn().mockReturnValue({
        subscribe: jest.fn().mockImplementation(callback => {
          callback({
            result: {
              events: [{
                progressdetails: JSON.stringify({ stateMetaData: 30 }),
                status: 1
              }]
            }
          })
          return { unsubscribe: jest.fn() }
        })
      }),
      saveEventProgressUpdate: jest.fn().mockReturnValue({
        subscribe: jest.fn().mockImplementation(callback => {
          callback({ success: true })
          return { unsubscribe: jest.fn() }
        })
      })
    }

    configSvcMock = {
      userProfile: {
        userId: 'test-user-id'
      }
    }

    elementRefMock = {
      nativeElement: document.createElement('div')
    }

    // Create component instance
    component = new EventYouTubeComponent(
      activatedRouteMock,
      eventServiceMock,
      configSvcMock
    )
    component.youtubeTag = elementRefMock
    component.eventData = activatedRouteMock.snapshot.data.content.data
    component.videoId = 'test-video-id'
  })

  describe('eventStateRead', () => {
    it('should initialize player with empty string if no state data', () => {
      eventServiceMock.eventStateRead.mockReturnValue({
        subscribe: jest.fn().mockImplementation(callback => {
          callback({
            result: {
              events: []
            }
          })
          return { unsubscribe: jest.fn() }
        })
      })

      const spyInitializePlayer = jest.spyOn(component, 'initializePlayer')
      component.eventStateRead()

      expect(spyInitializePlayer).toHaveBeenCalledWith('')
    })
  })

  describe('initializePlayer', () => {
    it('should initialize the YouTube player', () => {
      const youtubeInitializerSpy = jest.spyOn(videoJsUtil, 'youtubeInitializer')

      component.initializePlayer(30)

      expect(youtubeInitializerSpy).toHaveBeenCalled()
      expect(component.dispose).toBeTruthy()
    })

    it('should handle player ended event', () => {
      // Setup
      const youtubeInitializerSpy = jest.spyOn(videoJsUtil, 'youtubeInitializer')
      component.initializePlayer(30)

      // Extract the dispatcher function that was passed
      const dispatcherFn = youtubeInitializerSpy.mock.calls[0][2]

      // Setup spy
      const saveProgressUpdateSpy = jest.spyOn(component, 'saveProgressUpdate')
      component.currentEvent = true

      // Trigger ended event
      dispatcherFn({
        data: {
          playerStatus: 'ENDED',
          passThroughData: { timeSpent: 180 }
        }
      })

      expect(saveProgressUpdateSpy).toHaveBeenCalled()
    })
  })

  describe('getBatchId', () => {
    it('should return batchId from eventData batches', () => {
      component.eventData = {
        batches: [{ batchId: 'test-batch-id' }]
      }

      const result = component.getBatchId()

      expect(result).toBe('test-batch-id')
    })

    it('should handle string batches by parsing JSON', () => {
      component.eventData = {
        batches: JSON.stringify([{ batchId: 'test-batch-id' }])
      }

      const result = component.getBatchId()

      expect(result).toBe('test-batch-id')
    })

    it('should return empty string if no batches found', () => {
      component.eventData = {
        batches: []
      }

      const result = component.getBatchId()

      expect(result).toBe('')
    })
  })

  describe('customDateFormat', () => {
    it('should format date and time correctly', () => {
      const result = component.customDateFormat('2025-03-18', '10:00+0000')

      expect(result).toBe('2025-03-18 10:00')
    })
  })

  describe('saveProgressUpdate', () => {
    it('should call saveEventProgressUpdate with correct parameters for normal update', () => {
      // Setup
      component.eventData = {
        identifier: 'test-event-id',
        duration: 120,
        batches: [{ batchId: 'test-batch-id' }]
      }
      component.resumeEventStatus = 1

      // Act
      component.saveProgressUpdate(60, 3600, '2025-03-18 10:30:00+0000', true)

      // Assert
      expect(eventServiceMock.saveEventProgressUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          request: expect.objectContaining({
            userId: 'test-user-id',
            events: expect.arrayContaining([
              expect.objectContaining({
                eventId: 'test-event-id',
                status: 2,
                completionPercentage: 100
              })
            ])
          })
        })
      )
      expect(component.rateToFire).toBe(180) // should update rateToFire when completion > 50%
    })

    it('should not call saveEventProgressUpdate if resumeEventStatus is 2', () => {
      // Setup
      component.eventData = {
        identifier: 'test-event-id',
        duration: 120,
        batches: [{ batchId: 'test-batch-id' }]
      }
      component.resumeEventStatus = 2

      // Act
      component.saveProgressUpdate(60, 3600, '2025-03-18 10:30:00+0000')

      // Assert
      expect(eventServiceMock.saveEventProgressUpdate).not.toHaveBeenCalled()
    })

    it('should calculate completionPercentage correctly for normal update', () => {
      // Setup
      component.eventData = {
        identifier: 'test-event-id',
        duration: 120,
        batches: [{ batchId: 'test-batch-id' }]
      }
      component.resumeEventStatus = 1

      // Create spy to capture the request
      const saveSpy = jest.spyOn(eventServiceMock, 'saveEventProgressUpdate')

      // Act - normal update
      component.saveProgressUpdate(60, 3600, '2025-03-18 10:30:00+0000', true)

      // Assert - completionPercentage should be 100%
      const requestArg: any = saveSpy.mock.calls[0][0]
      expect(requestArg.request.events[0].completionPercentage).toBe(100)
    })

    it('should calculate completionPercentage correctly for time-based update', () => {
      // Setup
      component.eventData = {
        identifier: 'test-event-id',
        duration: 120, // 120 minutes
        batches: [{ batchId: 'test-batch-id' }]
      }
      component.resumeEventStatus = 1

      // Create spy to capture the request
      const saveSpy = jest.spyOn(eventServiceMock, 'saveEventProgressUpdate')

      // Act - time-based update (30 minutes watched of 120 minute video)
      component.saveProgressUpdate(60, 1800, '2025-03-18 10:30:00+0000', false)

      // Assert - completionPercentage should be 25%
      const requestArg: any = saveSpy.mock.calls[0][0]
      expect(requestArg.request.events[0].completionPercentage).toBe(25)
    })
  })

  describe('ngOnDestroy', () => {
    it('should clean up resources', () => {
      // Setup
      const disposeSpy = jest.fn()
      component.dispose = disposeSpy
      component.player = { dispose: jest.fn() } as any
      component.intervalStarted = true

      // Act
      component.ngOnDestroy()

      // Assert
      expect(disposeSpy).toHaveBeenCalled()
      expect(component.intervalStarted).toBe(false)
    })

    it('should handle missing player and dispose', () => {
      component.dispose = null
      component.player = null

      expect(() => component.ngOnDestroy()).not.toThrow()
    })

    it('should dispose player if exists', () => {
      const playerDisposeSpy = jest.fn()
      component.player = { dispose: playerDisposeSpy } as any
      component.dispose = null

      component.ngOnDestroy()

      expect(playerDisposeSpy).toHaveBeenCalled()
    })
  })

  describe('ngOnInit', () => {
    it('should initialize component with event data', () => {
      component.ngOnInit()

      expect(component.eventData).toBeDefined()
      expect(component.eventData.identifier).toBe('test-event-id')
    })

    it('should set rateToFire from pageConfigData.fireUpdate', () => {
      activatedRouteMock.snapshot.data.pageData = {
        data: {
          fireUpdate: 300
        }
      }

      component = new EventYouTubeComponent(
        activatedRouteMock,
        eventServiceMock,
        configSvcMock
      )

      component.ngOnInit()

      expect(component.rateToFire).toBe(300)
    })

    it('should set rateToFire from getRateToFire when fireUpdateConfig exists', () => {
      activatedRouteMock.snapshot.data.pageData = {
        data: {
          fireUpdateConfig: { video: 250 }
        }
      }

      eventServiceMock.getRateToFire = jest.fn().mockReturnValue(250)

      component = new EventYouTubeComponent(
        activatedRouteMock,
        eventServiceMock,
        configSvcMock
      )
      component.eventData = { resourceType: 'video' }

      component.ngOnInit()

      expect(eventServiceMock.getRateToFire).toHaveBeenCalled()
      expect(component.rateToFire).toBe(250)
    })

    it('should subscribe to route params', () => {
      component.ngOnInit()

      expect(activatedRouteMock.params.subscribe).toHaveBeenCalled()
      expect(component.videoId).toBe('test-video-id')
    })

    it('should subscribe to query params', () => {
      component.ngOnInit()

      expect(activatedRouteMock.queryParams.subscribe).toHaveBeenCalled()
      expect(component.isEnrolled).toBe(true)
    })

    it('should set currentEvent to true when current time is after start time', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)

      activatedRouteMock.snapshot.data.content.data.startDate = pastDate.toISOString().split('T')[0]
      activatedRouteMock.snapshot.data.content.data.startTime = '10:00+0000'

      component = new EventYouTubeComponent(
        activatedRouteMock,
        eventServiceMock,
        configSvcMock
      )

      component.ngOnInit()

      expect(component.currentEvent).toBe(true)
    })

    it('should set currentEvent to false when current time is before start time', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)

      activatedRouteMock.snapshot.data.content.data.startDate = futureDate.toISOString().split('T')[0]
      activatedRouteMock.snapshot.data.content.data.startTime = '10:00+0000'

      component = new EventYouTubeComponent(
        activatedRouteMock,
        eventServiceMock,
        configSvcMock
      )

      component.ngOnInit()

      expect(component.currentEvent).toBe(false)
    })

    it('should call eventStateRead', () => {
      const spy = jest.spyOn(component, 'eventStateRead')

      component.ngOnInit()

      expect(spy).toHaveBeenCalled()
    })

    it('should handle missing pageConfigData', () => {
      activatedRouteMock.snapshot.data.pageData = null

      component = new EventYouTubeComponent(
        activatedRouteMock,
        eventServiceMock,
        configSvcMock
      )

      component.ngOnInit()

      expect(component.pageConfigData).toEqual({})
    })
  })

  describe('ngAfterViewInit', () => {
    it('should execute without errors', () => {
      expect(() => component.ngAfterViewInit()).not.toThrow()
    })
  })

  describe('eventStateRead', () => {
    it('should initialize player with empty string if no state data', () => {
      eventServiceMock.eventStateRead.mockReturnValue({
        subscribe: jest.fn().mockImplementation(callback => {
          callback({
            result: {
              events: []
            }
          })
          return { unsubscribe: jest.fn() }
        })
      })

      const spyInitializePlayer = jest.spyOn(component, 'initializePlayer')
      component.eventStateRead()

      expect(spyInitializePlayer).toHaveBeenCalledWith('')
    })

    it('should initialize player with resume position from state data', () => {
      eventServiceMock.eventStateRead.mockReturnValue({
        subscribe: jest.fn().mockImplementation(callback => {
          callback({
            result: {
              events: [{
                progressdetails: JSON.stringify({ stateMetaData: 0 }),
                status: 1
              }]
            }
          })
          return { unsubscribe: jest.fn() }
        })
      })

      const spyInitializePlayer = jest.spyOn(component, 'initializePlayer')
      component.eventStateRead()

      expect(spyInitializePlayer).toHaveBeenCalledWith(0)
    })

    it('should update progress when resumeFrom exceeds rateToFire and status is not 2', () => {
      component.rateToFire = 100
      component.currentEvent = true

      eventServiceMock.eventStateRead.mockReturnValue({
        subscribe: jest.fn().mockImplementation(callback => {
          callback({
            result: {
              events: [{
                progressdetails: JSON.stringify({ stateMetaData: 200 }),
                status: 1
              }]
            }
          })
          return { unsubscribe: jest.fn() }
        })
      })

      const spyUpdateProgress = jest.spyOn(component, 'updateProgress')
      component.eventStateRead()

      expect(spyUpdateProgress).toHaveBeenCalled()
      expect(component.resumeEventStatus).toBe(2)
    })

    it('should not update progress when status is already 2', () => {
      component.rateToFire = 100

      eventServiceMock.eventStateRead.mockReturnValue({
        subscribe: jest.fn().mockImplementation(callback => {
          callback({
            result: {
              events: [{
                progressdetails: JSON.stringify({ stateMetaData: 200 }),
                status: 2
              }]
            }
          })
          return { unsubscribe: jest.fn() }
        })
      })

      const spyUpdateProgress = jest.spyOn(component, 'updateProgress')
      component.eventStateRead()

      expect(spyUpdateProgress).not.toHaveBeenCalled()
    })

    it('should reset resumeFrom to 0 when event is not current and not enrolled', () => {
      component.currentEvent = false
      component.isEnrolled = false

      eventServiceMock.eventStateRead.mockReturnValue({
        subscribe: jest.fn().mockImplementation(callback => {
          callback({
            result: {
              events: [{
                progressdetails: JSON.stringify({ stateMetaData: 100 }),
                status: 1
              }]
            }
          })
          return { unsubscribe: jest.fn() }
        })
      })

      const spyInitializePlayer = jest.spyOn(component, 'initializePlayer')
      component.eventStateRead()

      expect(spyInitializePlayer).toHaveBeenCalledWith(0)
    })

    it('should handle missing stateMetaData', () => {
      eventServiceMock.eventStateRead.mockReturnValue({
        subscribe: jest.fn().mockImplementation(callback => {
          callback({
            result: {
              events: [{
                progressdetails: JSON.stringify({}),
                status: 1
              }]
            }
          })
          return { unsubscribe: jest.fn() }
        })
      })

      const spyInitializePlayer = jest.spyOn(component, 'initializePlayer')
      component.eventStateRead()

      expect(spyInitializePlayer).toHaveBeenCalledWith(0)
    })
  })

  describe('initializePlayer', () => {
    it('should initialize the YouTube player', () => {
      const youtubeInitializerSpy = jest.spyOn(videoJsUtil, 'youtubeInitializer')

      component.initializePlayer(30)

      expect(youtubeInitializerSpy).toHaveBeenCalled()
      expect(component.dispose).toBeTruthy()
    })

    it('should handle player ended event', () => {
      // Setup
      const youtubeInitializerSpy = jest.spyOn(videoJsUtil, 'youtubeInitializer')
      component.initializePlayer(30)

      // Extract the dispatcher function that was passed
      const dispatcherFn = youtubeInitializerSpy.mock.calls[0][2]

      // Setup spy
      const saveProgressUpdateSpy = jest.spyOn(component, 'saveProgressUpdate')
      component.currentEvent = true

      // Trigger ended event
      dispatcherFn({
        data: {
          playerStatus: 'ENDED',
          passThroughData: { timeSpent: 180 }
        }
      })

      expect(saveProgressUpdateSpy).toHaveBeenCalled()
    })

    it('should start interval when timeSpent is divisible by rateToFire', () => {
      const youtubeInitializerSpy = jest.spyOn(videoJsUtil, 'youtubeInitializer')
      component.rateToFire = 180
      component.eventData = {
        startDate: new Date().toISOString().split('T')[0],
        startTime: '00:00+0000'
      }

      component.initializePlayer(0)

      const dispatcherFn = youtubeInitializerSpy.mock.calls[0][2]
      const startIntervalSpy = jest.spyOn(component, 'startInterval')

      dispatcherFn({
        data: {
          passThroughData: { timeSpent: 180 }
        }
      })

      expect(startIntervalSpy).toHaveBeenCalled()
    })

    it('should handle saveContinueLearning callback', () => {
      const youtubeInitializerSpy = jest.spyOn(videoJsUtil, 'youtubeInitializer')
      component.currentEvent = true

      component.initializePlayer(0)

      const saveCLearningFn = youtubeInitializerSpy.mock.calls[0][3]
      const saveProgressUpdateSpy = jest.spyOn(component, 'saveProgressUpdate')

      const timestamp = new Date().toISOString()
      saveCLearningFn({
        data: JSON.stringify({ timestamp })
      })

      expect(saveProgressUpdateSpy).toHaveBeenCalled()
    })

    it('should initialize with resumeFrom as 0 when empty string provided', () => {
      const youtubeInitializerSpy = jest.spyOn(videoJsUtil, 'youtubeInitializer')

      component.initializePlayer('')

      expect(youtubeInitializerSpy).toHaveBeenCalled()
    })
  })

  describe('getBatchId', () => {
    it('should return batchId from eventData batches', () => {
      component.eventData = {
        batches: [{ batchId: 'test-batch-id' }]
      }

      const result = component.getBatchId()

      expect(result).toBe('test-batch-id')
    })

    it('should handle string batches by parsing JSON', () => {
      component.eventData = {
        batches: JSON.stringify([{ batchId: 'test-batch-id' }])
      }

      const result = component.getBatchId()

      expect(result).toBe('test-batch-id')
    })

    it('should return empty string if no batches found', () => {
      component.eventData = {
        batches: []
      }

      const result = component.getBatchId()

      expect(result).toBe('')
    })

    it('should return empty string if batches array has no batchId', () => {
      component.eventData = {
        batches: [{ somethingElse: 'value' }]
      }

      const result = component.getBatchId()

      expect(result).toBe('')
    })

    it('should handle null batches', () => {
      component.eventData = {
        batches: null
      }

      const result = component.getBatchId()

      expect(result).toBe('')
    })
  })

  describe('customDateFormat', () => {
    it('should format date and time correctly', () => {
      const result = component.customDateFormat('2025-03-18', '10:00+0000')

      expect(result).toBe('2025-03-18 10:00')
    })

    it('should handle different time formats', () => {
      const result = component.customDateFormat('2025-03-18', '14:30+0530')

      expect(result).toBe('2025-03-18 14:30')
    })

    it('should handle midnight time', () => {
      const result = component.customDateFormat('2025-03-18', '00:00+0000')

      expect(result).toBe('2025-03-18 00:00')
    })
  })

  describe('startInterval', () => {
    it('should call saveProgressUpdate with normalUpdate true', () => {
      const saveProgressUpdateSpy = jest.spyOn(component, 'saveProgressUpdate')

      component.startInterval(180, '2025-03-18 10:30:00+0000')

      expect(saveProgressUpdateSpy).toHaveBeenCalledWith(
        component.eventData.duration,
        180,
        '2025-03-18 10:30:00+0000',
        true
      )
    })
  })

  describe('saveProgressUpdate', () => {
    it('should call saveEventProgressUpdate with correct parameters for normal update', () => {
      // Setup
      component.eventData = {
        identifier: 'test-event-id',
        duration: 120,
        batches: [{ batchId: 'test-batch-id' }]
      }
      component.resumeEventStatus = 1

      // Act
      component.saveProgressUpdate(60, 3600, '2025-03-18 10:30:00+0000', true)

      // Assert
      expect(eventServiceMock.saveEventProgressUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          request: expect.objectContaining({
            userId: 'test-user-id',
            events: expect.arrayContaining([
              expect.objectContaining({
                eventId: 'test-event-id',
                status: 2,
                completionPercentage: 100
              })
            ])
          })
        })
      )
      expect(component.rateToFire).toBe(180) // should update rateToFire when completion > 50%
    })

    it('should not call saveEventProgressUpdate if resumeEventStatus is 2', () => {
      // Setup
      component.eventData = {
        identifier: 'test-event-id',
        duration: 120,
        batches: [{ batchId: 'test-batch-id' }]
      }
      component.resumeEventStatus = 2

      // Act
      component.saveProgressUpdate(60, 3600, '2025-03-18 10:30:00+0000')

      // Assert
      expect(eventServiceMock.saveEventProgressUpdate).not.toHaveBeenCalled()
    })

    it('should calculate completionPercentage correctly for normal update', () => {
      // Setup
      component.eventData = {
        identifier: 'test-event-id',
        duration: 120,
        batches: [{ batchId: 'test-batch-id' }]
      }
      component.resumeEventStatus = 1

      // Create spy to capture the request
      const saveSpy = jest.spyOn(eventServiceMock, 'saveEventProgressUpdate')

      // Act - normal update
      component.saveProgressUpdate(60, 3600, '2025-03-18 10:30:00+0000', true)

      // Assert - completionPercentage should be 100%
      const requestArg: any = saveSpy.mock.calls[0][0]
      expect(requestArg.request.events[0].completionPercentage).toBe(100)
    })

    it('should calculate completionPercentage correctly for time-based update', () => {
      // Setup
      component.eventData = {
        identifier: 'test-event-id',
        duration: 120, // 120 minutes
        batches: [{ batchId: 'test-batch-id' }]
      }
      component.resumeEventStatus = 1

      // Create spy to capture the request
      const saveSpy = jest.spyOn(eventServiceMock, 'saveEventProgressUpdate')

      // Act - time-based update (30 minutes watched of 120 minute video)
      component.saveProgressUpdate(60, 1800, '2025-03-18 10:30:00+0000', false)

      // Assert - completionPercentage should be 25%
      const requestArg: any = saveSpy.mock.calls[0][0]
      expect(requestArg.request.events[0].completionPercentage).toBe(25)
    })

    it('should set status to 1 when completion is less than 50%', () => {
      component.eventData = {
        identifier: 'test-event-id',
        duration: 120,
        batches: [{ batchId: 'test-batch-id' }]
      }
      component.resumeEventStatus = 0

      const saveSpy = jest.spyOn(eventServiceMock, 'saveEventProgressUpdate')

      component.saveProgressUpdate(60, 1800, '2025-03-18 10:30:00+0000', false)

      const requestArg: any = saveSpy.mock.calls[0][0]
      expect(requestArg.request.events[0].status).toBe(1)
    })

    it('should set status to 2 when completion is greater than 50%', () => {
      component.eventData = {
        identifier: 'test-event-id',
        duration: 120,
        batches: [{ batchId: 'test-batch-id' }]
      }
      component.resumeEventStatus = 0

      const saveSpy = jest.spyOn(eventServiceMock, 'saveEventProgressUpdate')

      component.saveProgressUpdate(60, 4000, '2025-03-18 10:30:00+0000', false)

      const requestArg: any = saveSpy.mock.calls[0][0]
      expect(requestArg.request.events[0].status).toBe(2)
    })

    it('should update resumeEventStatus to 2 after successful save with >50% completion', (done) => {
      component.eventData = {
        identifier: 'test-event-id',
        duration: 120,
        batches: [{ batchId: 'test-batch-id' }]
      }
      component.resumeEventStatus = 0

      eventServiceMock.saveEventProgressUpdate.mockReturnValue({
        subscribe: jest.fn().mockImplementation(callback => {
          callback({ success: true })
          expect(component.resumeEventStatus).toBe(2)
          done()
          return { unsubscribe: jest.fn() }
        })
      })

      component.saveProgressUpdate(60, 4000, '2025-03-18 10:30:00+0000', false)
    })

    it('should handle missing userId gracefully', () => {
      configSvcMock.userProfile = null
      component.eventData = {
        identifier: 'test-event-id',
        duration: 120,
        batches: [{ batchId: 'test-batch-id' }]
      }
      component.resumeEventStatus = 0

      const saveSpy = jest.spyOn(eventServiceMock, 'saveEventProgressUpdate')

      component.saveProgressUpdate(60, 1800, '2025-03-18 10:30:00+0000', false)

      const requestArg: any = saveSpy.mock.calls[0][0]
      expect(requestArg.request.userId).toBe('')
    })

    it('should handle zero timeSpent', () => {
      component.eventData = {
        identifier: 'test-event-id',
        duration: 120,
        batches: [{ batchId: 'test-batch-id' }]
      }
      component.resumeEventStatus = 0

      const saveSpy = jest.spyOn(eventServiceMock, 'saveEventProgressUpdate')

      component.saveProgressUpdate(60, 0, '2025-03-18 10:30:00+0000', false)

      const requestArg: any = saveSpy.mock.calls[0][0]
      expect(requestArg.request.events[0].completionPercentage).toBe(0)
    })

    it('should not call saveEventProgressUpdate if eventData is missing', () => {
      component.eventData = null

      component.saveProgressUpdate(60, 1800, '2025-03-18 10:30:00+0000', false)

      expect(eventServiceMock.saveEventProgressUpdate).not.toHaveBeenCalled()
    })
  })

  describe('updateProgress', () => {
    it('should call saveEventProgressUpdate with 100% completion', () => {
      component.eventData = {
        identifier: 'test-event-id',
        duration: 120,
        batches: [{ batchId: 'test-batch-id' }]
      }

      const saveSpy = jest.spyOn(eventServiceMock, 'saveEventProgressUpdate')

      component.updateProgress(60, 3600, '2025-03-18 10:30:00+0000', true)

      const requestArg: any = saveSpy.mock.calls[0][0]
      expect(requestArg.request.events[0].completionPercentage).toBe(100)
      expect(requestArg.request.events[0].status).toBe(2)
    })

    it('should set resumeEventStatus to 2 after successful update', (done) => {
      component.eventData = {
        identifier: 'test-event-id',
        duration: 120,
        batches: [{ batchId: 'test-batch-id' }]
      }
      component.resumeEventStatus = 1

      eventServiceMock.saveEventProgressUpdate.mockReturnValue({
        subscribe: jest.fn().mockImplementation(callback => {
          callback({ success: true })
          expect(component.resumeEventStatus).toBe(2)
          done()
          return { unsubscribe: jest.fn() }
        })
      })

      component.updateProgress(60, 3600, '2025-03-18 10:30:00+0000', true)
    })

    it('should handle missing userId', () => {
      configSvcMock.userProfile = null
      component.eventData = {
        identifier: 'test-event-id',
        duration: 120,
        batches: [{ batchId: 'test-batch-id' }]
      }

      const saveSpy = jest.spyOn(eventServiceMock, 'saveEventProgressUpdate')

      component.updateProgress(60, 3600, '2025-03-18 10:30:00+0000', true)

      const requestArg: any = saveSpy.mock.calls[0][0]
      expect(requestArg.request.userId).toBe('')
    })

    it('should not call saveEventProgressUpdate if eventData is missing', () => {
      component.eventData = null

      component.updateProgress(60, 3600, '2025-03-18 10:30:00+0000', true)

      expect(eventServiceMock.saveEventProgressUpdate).not.toHaveBeenCalled()
    })
  })

  describe('Component Initialization', () => {
    it('should create component instance', () => {
      expect(component).toBeDefined()
      expect(component instanceof EventYouTubeComponent).toBe(true)
    })

    it('should initialize with default values', () => {
      const newComponent = new EventYouTubeComponent(
        activatedRouteMock,
        eventServiceMock,
        configSvcMock
      )

      expect(newComponent.currentEvent).toBe(false)
      expect(newComponent.intervalStarted).toBe(false)
      expect(newComponent.resumeEventStatus).toBe(0)
      expect(newComponent.rateToFire).toBe(180)
      expect(newComponent.player).toBeNull()
      expect(newComponent.dispose).toBeNull()
    })
  })
})
