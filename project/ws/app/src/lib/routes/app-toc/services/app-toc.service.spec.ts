import { AppTocService } from './app-toc.service'
import { of, throwError, Subject } from 'rxjs'
import { NsContent } from '@sunbird-cb/collection/src/lib/_services/widget-content.model'
import { NsAppToc, NsCohorts } from '../models/app-toc.model'
import { NsContentConstants } from '@sunbird-cb/collection/src/public-api'

// Mock dependencies
const mockHttpClient = {
  get: jest.fn(),
  post: jest.fn()
}

const mockConfigurationsService = {
  userProfile: {
    country: 'India'
  },
  rootOrg: 'test-root-org',
  org: ['test-org']
}

const mockWidgetContentService = {
  getFirstChildInHierarchy: jest.fn(),
  fetchContent: jest.fn()
}

// Mock window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:4200/app/toc'
  },
  writable: true
})

describe('AppTocService', () => {
  let service: AppTocService

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks()

    // Create service instance
    service = new AppTocService(
      mockHttpClient as any,
      mockConfigurationsService as any,
      mockWidgetContentService as any
    )
  })

  afterEach(() => {
    // Clean up subscriptions
    if (service.resumeDataSubscription) {
      service.resumeDataSubscription.unsubscribe()
    }
  })

  describe('Constructor', () => {
    it('should initialize subjects and observables', () => {
      expect(service.analyticsReplaySubject).toBeInstanceOf(Subject)
      expect(service.batchReplaySubject).toBeInstanceOf(Subject)
      expect(service.setBatchDataSubject).toBeInstanceOf(Subject)
      expect(service.getSelectedBatch).toBeInstanceOf(Subject)
      expect(service.setWFDataSubject).toBeInstanceOf(Subject)
      expect(service.resumeData).toBeInstanceOf(Subject)
      expect(service.updateReviewsObservable).toBeDefined()
      expect(service.currentServerDate).toBeDefined()
      expect(service.contentLoader$).toBeDefined()
      expect(service.updatePageScroll).toBeDefined()
      expect(service.transcriptionData$).toBeDefined()
      expect(service.transriptionActiveLanguageDataObject$).toBeDefined()
      expect(service.changeTranscriptionLanguageEvent).toBeInstanceOf(Subject)
      expect(service.playTranscriptionVideo).toBeInstanceOf(Subject)
    })

    it('should subscribe to resumeData', () => {
      const mockResumeData: any = [{ contentId: 'test', progress: 50 }]
      service.resumeData.next(mockResumeData)
      expect(service.resumeDataSubscription).toBeDefined()
    })
  })

  describe('Getters and Setters', () => {
    it('should get and set subtitleOnBanners', () => {
      service.subtitleOnBanners = true
      expect(service.subtitleOnBanners).toBe(true)

      service.subtitleOnBanners = false
      expect(service.subtitleOnBanners).toBe(false)
    })

    it('should get and set showDescription', () => {
      service.showDescription = true
      expect(service.showDescription).toBe(true)

      service.showDescription = false
      expect(service.showDescription).toBe(false)
    })
  })

  describe('Subject Methods', () => {
    it('should update batch data', () => {
      const nextSpy = jest.spyOn(service.batchReplaySubject, 'next')
      service.updateBatchData()
      expect(nextSpy).toHaveBeenCalled()
    })

    it('should set batch data', () => {
      const mockBatchData = { result: { content: [] } } as NsContent.IBatchListResponse
      const nextSpy = jest.spyOn(service.setBatchDataSubject, 'next')
      service.setBatchData(mockBatchData)
      expect(nextSpy).toHaveBeenCalledWith(mockBatchData)
    })

    it('should set WF data', () => {
      const mockData = { test: 'data' }
      const nextSpy = jest.spyOn(service.setWFDataSubject, 'next')
      service.setWFData(mockData)
      expect(nextSpy).toHaveBeenCalledWith(mockData)
    })

    it('should update resume data', () => {
      const mockData = { contentId: 'test', progress: 75 }
      const nextSpy = jest.spyOn(service.resumeData, 'next')
      service.updateResumaData(mockData)
      expect(nextSpy).toHaveBeenCalledWith(mockData)
    })

    it('should change update reviews', () => {
      const nextSpy = jest.spyOn(service.updateReviews, 'next')
      service.changeUpdateReviews(true)
      expect(nextSpy).toHaveBeenCalledWith(true)
    })

    it('should get selected batch data', () => {
      const mockData = { batchId: 'test-batch' }
      const nextSpy = jest.spyOn(service.getSelectedBatch, 'next')
      service.getSelectedBatchData(mockData)
      expect(nextSpy).toHaveBeenCalledWith(mockData)
    })

    it('should change server date', () => {
      const mockDate = '2023-12-01'
      const nextSpy = jest.spyOn(service.serverDate, 'next')
      service.changeServerDate(mockDate)
      expect(nextSpy).toHaveBeenCalledWith(mockDate)
    })
  })

  describe('mapSessionCompletionPercentage', () => {
    const mockBatchData: any = {
      content: [{
        batchAttributes: {
          sessionDetails_v2: [
            { sessionId: 'session1' },
            { sessionId: 'session2' }
          ]
        }
      }]
    }

    const mockResumeData: any = [
      { contentId: 'session1', completionPercentage: 80, status: 1, lastCompletedTime: '2023-12-01' },
      { contentId: 'session2', completionPercentage: 100, status: 2, lastCompletedTime: '2023-12-02' }
    ]

    it('should map session completion percentage with provided resume data', () => {
      const contentLoaderSpy = jest.spyOn(service.contentLoader, 'next')
      service.mapSessionCompletionPercentage(mockBatchData, mockResumeData)

      expect(mockBatchData.content[0].batchAttributes.sessionDetails_v2[0].completionPercentage).toBe(80)
      expect(mockBatchData.content[0].batchAttributes.sessionDetails_v2[0].completionStatus).toBe(1)
      expect(mockBatchData.content[0].batchAttributes.sessionDetails_v2[1].completionPercentage).toBe(100)
      expect(mockBatchData.content[0].batchAttributes.sessionDetails_v2[1].completionStatus).toBe(2)
      expect(contentLoaderSpy).toHaveBeenCalledWith(false)
    })

    it('should map session completion percentage without provided resume data', () => {
      service.mapSessionCompletionPercentage(mockBatchData)
      service.resumeData.next(mockResumeData)

      expect(mockBatchData.content[0].batchAttributes.sessionDetails_v2[0].completionPercentage).toBe(80)
      expect(mockBatchData.content[0].batchAttributes.sessionDetails_v2[1].completionPercentage).toBe(100)
    })

    it('should handle error in resume data subscription', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      const contentLoaderSpy = jest.spyOn(service.contentLoader, 'next')

      service.mapSessionCompletionPercentage(mockBatchData)
      // Simulate error
      service.resumeData.error(new Error('Test error'))

      expect(consoleSpy).toHaveBeenCalledWith('error on resumeDataSubscription')
      expect(contentLoaderSpy).toHaveBeenCalledWith(false)

      consoleSpy.mockRestore()
    })

    it('should handle missing session data', () => {
      const batchDataWithoutSessions = { content: [{}] }
      service.mapSessionCompletionPercentage(batchDataWithoutSessions, mockResumeData)
      // Should not throw error
    })
  })

  describe('sessionCompletionPercentage', () => {
    it('should map completion percentage when data exists', () => {
      const mockBatchData: any = {
        content: [{
          batchAttributes: {
            sessionDetails_v2: [{ sessionId: 'session1' }]
          }
        }]
      }
      const mockResumeData = [{ contentId: 'session1', completionPercentage: 90, status: 2 }]

      const contentLoaderSpy = jest.spyOn(service.contentLoader, 'next')
      service.sessionCompletionPercentage(mockBatchData, mockResumeData)

      expect(mockBatchData.content[0].batchAttributes.sessionDetails_v2[0].completionPercentage).toBe(90)
      expect(contentLoaderSpy).toHaveBeenCalledWith(false)
    })
  })

  describe('showStartButton', () => {
    it('should show start button for regular content', () => {
      const mockContent = {
        artifactUrl: 'http://example.com/content',
        resourceType: 'Resource'
      } as NsContent.IContent

      const result = service.showStartButton(mockContent)
      expect(result.show).toBe(true)
      expect(result.msg).toBe('')
    })

    it('should not show start button for YouTube content in China', () => {
      mockConfigurationsService.userProfile.country = 'China'
      const mockContent = {
        artifactUrl: 'https://youtube.com/watch?v=test',
        resourceType: 'Resource'
      } as NsContent.IContent

      const result = service.showStartButton(mockContent)
      expect(result.show).toBe(false)
      expect(result.msg).toBe('youtubeForbidden')
    })

    it('should not show start button for Certification', () => {
      const mockContent = {
        artifactUrl: 'http://example.com/content',
        resourceType: 'Certification'
      } as NsContent.IContent

      const result = service.showStartButton(mockContent)
      expect(result.show).toBe(false)
      expect(result.msg).toBe('')
    })

    it('should handle null content', () => {
      const result = service.showStartButton(null)
      expect(result.show).toBe(false)
      expect(result.msg).toBe('')
    })
  })

  describe('initData', () => {
    it('should initialize data with valid content', () => {
      const mockData = {
        content: {
          data: {
            identifier: 'test-content-id',
            name: 'Test Content'
          }
        }
      }

      const contentLoaderSpy = jest.spyOn(service.contentLoader, 'next')
      const result = service.initData(mockData, false)

      expect(result.content).toBe(mockData.content.data)
      expect(result.errorCode).toBeNull()
      expect(contentLoaderSpy).toHaveBeenCalledWith(true)
      expect(contentLoaderSpy).toHaveBeenCalledWith(false)
    })

    it('should initialize data with resume data needed', () => {
      const mockData = {
        content: {
          data: {
            identifier: 'test-content-id',
            name: 'Test Content'
          }
        }
      }

      const result = service.initData(mockData, true)

      expect(result.content).toBe(mockData.content.data)
      expect(result.errorCode).toBeNull()
    })

    it('should handle API failure', () => {
      const mockData = {
        error: 'API Error'
      }

      const result = service.initData(mockData)

      expect(result.content).toBeNull()
      expect(result.errorCode).toBe(NsAppToc.EWsTocErrorCode.API_FAILURE)
    })

    it('should handle no data', () => {
      const mockData = {}

      const result = service.initData(mockData)

      expect(result.content).toBeNull()
      expect(result.errorCode).toBe(NsAppToc.EWsTocErrorCode.NO_DATA)
    })

    it('should handle resume data subscription with data', () => {
      const mockData = {
        content: {
          data: {
            identifier: 'test-content-id',
            children: []
          }
        }
      }
      const mockResumeData: any = [{ contentId: 'test', progress: 50 }]

      service.initData(mockData, true)
      service.resumeData.next(mockResumeData)

      // Should trigger mapCompletionPercentage
    })

    it('should handle resume data subscription error', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      const mockData = {
        content: {
          data: {
            identifier: 'test-content-id'
          }
        }
      }

      service.initData(mockData, true)
      service.resumeData.error(new Error('Test error'))

      expect(consoleSpy).toHaveBeenCalledWith('error on resumeDataSubscription')
      consoleSpy.mockRestore()
    })
  })

  describe('mapCompletionPercentage', () => {
    it('should map completion percentage for content with children', () => {
      const mockContent = {
        children: [
          { identifier: 'child1', completionPercentage: 0 },
          { identifier: 'child2', completionPercentage: 0 }
        ]
      } as NsContent.IContent

      const mockDataResult = [
        { contentId: 'child1', completionPercentage: 80, status: 1 },
        { contentId: 'child2', completionPercentage: 100, status: 2 }
      ]

      const contentLoaderSpy = jest.spyOn(service.contentLoader, 'next')
      service.mapCompletionPercentage(mockContent, mockDataResult)

      expect(mockContent.children[0].completionPercentage).toBe(80)
      expect(mockContent.children[0].completionStatus).toBe(1)
      expect(mockContent.children[1].completionPercentage).toBe(100)
      expect(mockContent.children[1].completionStatus).toBe(2)
      expect(contentLoaderSpy).toHaveBeenCalledWith(false)
    })

    it('should handle nested children recursively', () => {
      const mockContent = {
        children: [
          {
            identifier: 'parent1',
            children: [
              { identifier: 'child1' }
            ]
          }
        ]
      } as NsContent.IContent

      const mockDataResult = [
        { contentId: 'child1', progress: 75, status: 1 }
      ]

      service.mapCompletionPercentage(mockContent, mockDataResult)

      expect(mockContent.children[0].children[0].completionPercentage).toBe(75)
    })

    it('should handle content without children', () => {
      const mockContent = null
      const mockDataResult: any = []

      const contentLoaderSpy = jest.spyOn(service.contentLoader, 'next')
      service.mapCompletionPercentage(mockContent, mockDataResult)

      expect(contentLoaderSpy).toHaveBeenCalledWith(false)
    })
  })

  describe('mapModuleCount', () => {
    it('should count modules correctly', () => {
      const mockContent = {
        children: [
          { primaryCategory: NsContent.EPrimaryCategory.MODULE },
          { primaryCategory: NsContent.EPrimaryCategory.RESOURCE },
          {
            primaryCategory: NsContent.EPrimaryCategory.COURSE,
            children: [
              { primaryCategory: NsContent.EPrimaryCategory.MODULE }
            ]
          }
        ]
      } as NsContent.IContent

      service.mapModuleCount(mockContent)

      expect(mockContent['moduleCount']).toBe(1)
    })

    it('should handle nested courses', () => {
      const mockContent = {
        children: [
          {
            primaryCategory: NsContent.EPrimaryCategory.COURSE,
            children: [
              { primaryCategory: NsContent.EPrimaryCategory.MODULE }
            ]
          }
        ]
      } as NsContent.IContent

      service.mapModuleCount(mockContent)
      // Should recursively process nested courses
    })
  })

  describe('getMimeType', () => {
    it('should return mime type for matching identifier', () => {
      const mockContent = {
        identifier: 'test-id',
        mimeType: NsContent.EMimeTypes.PDF
      } as NsContent.IContent

      const result = service.getMimeType(mockContent, 'test-id')
      expect(result).toBe(NsContent.EMimeTypes.PDF)
    })

    it('should search in children for mime type', () => {
      const mockContent = {
        identifier: 'parent-id',
        mimeType: NsContent.EMimeTypes.PDF,
        children: [
          {
            identifier: 'child-id',
            mimeType: NsContent.EMimeTypes.MP4
          }
        ]
      } as NsContent.IContent

      const result = service.getMimeType(mockContent, 'child-id')
      expect(result).toBe(NsContent.EMimeTypes.MP4)
    })

    it('should handle empty children array', () => {
      const mockContent = {
        identifier: 'parent-id',
        mimeType: NsContent.EMimeTypes.PDF,
        children: []
      } as unknown as NsContent.IContent

      const result = service.getMimeType(mockContent, 'parent-id')
      expect(result).toBe(NsContent.EMimeTypes.PDF)
    })

    it('should return unknown for unmatched identifier', () => {
      const mockContent = {
        identifier: 'parent-id',
        mimeType: NsContent.EMimeTypes.PDF
      } as NsContent.IContent

      const result = service.getMimeType(mockContent, 'unknown-id')
      expect(result).toBe(NsContent.EMimeTypes.UNKNOWN)
    })

    it('should handle nested children', () => {
      const mockContent = {
        identifier: 'root',
        mimeType: NsContent.EMimeTypes.PDF,
        children: [
          {
            identifier: 'level1',
            mimeType: NsContent.EMimeTypes.MP4,
            children: [
              {
                identifier: 'level2',
                mimeType: NsContent.EMimeTypes.MP3
              }
            ]
          }
        ]
      } as NsContent.IContent

      const result = service.getMimeType(mockContent, 'level2')
      expect(result).toBe(NsContent.EMimeTypes.MP3)
    })
  })

  describe('getTocStructure', () => {
    it('should count different content types correctly', () => {
      const mockContent = {
        primaryCategory: NsContent.EPrimaryCategory.COURSE,
        children: [
          {
            primaryCategory: NsContent.EPrimaryCategory.MODULE,
            children: [
              {
                primaryCategory: NsContent.EPrimaryCategory.RESOURCE,
                mimeType: NsContent.EMimeTypes.PDF
              },
              {
                primaryCategory: NsContent.EPrimaryCategory.RESOURCE,
                mimeType: NsContent.EMimeTypes.MP4
              }
            ]
          }
        ]
      } as NsContent.IContent

      const initialStructure: NsAppToc.ITocStructure = {
        course: 0,
        learningModule: 0,
        podcast: 0,
        video: 0,
        pdf: 0,
        webPage: 0,
        survey: 0,
        assessment: 0,
        offlineSession: 0,
        practiceTest: 0,
        finalTest: 0,
        interactivecontent: 0,
        other: 0,
        handsOn: 0,
        interactiveVideo: 0,
        quiz: 0,
        webModule: 0,
        youtube: 0
      }

      const result = service.getTocStructure(mockContent, initialStructure)

      expect(result.course).toBe(1)
      expect(result.learningModule).toBe(1)
      expect(result.pdf).toBe(1)
      expect(result.video).toBe(1)
    })

    it('should handle all mime types', () => {
      const mockContent = {
        primaryCategory: NsContent.EPrimaryCategory.RESOURCE,
        mimeType: NsContent.EMimeTypes.MP3
      } as NsContent.IContent

      const initialStructure: NsAppToc.ITocStructure = {
        course: 0,
        learningModule: 0,
        podcast: 0,
        video: 0,
        pdf: 0,
        webPage: 0,
        survey: 0,
        assessment: 0,
        offlineSession: 0,
        practiceTest: 0,
        finalTest: 0,
        interactivecontent: 0,
        other: 0,
        handsOn: 0,
        interactiveVideo: 0,
        quiz: 0,
        webModule: 0,
        youtube: 0
      }

      const result = service.getTocStructure(mockContent, initialStructure)
      expect(result.podcast).toBe(1)
    })

    it('should handle survey mime type', () => {
      const mockContent = {
        primaryCategory: NsContent.EPrimaryCategory.RESOURCE,
        mimeType: NsContent.EMimeTypes.SURVEY
      } as NsContent.IContent

      const initialStructure: NsAppToc.ITocStructure = {
        course: 0,
        learningModule: 0,
        podcast: 0,
        video: 0,
        pdf: 0,
        webPage: 0,
        survey: 0,
        assessment: 0,
        offlineSession: 0,
        practiceTest: 0,
        finalTest: 0,
        interactivecontent: 0,
        other: 0,
        handsOn: 0,
        interactiveVideo: 0,
        quiz: 0,
        webModule: 0,
        youtube: 0
      }

      const result = service.getTocStructure(mockContent, initialStructure)
      expect(result.survey).toBe(1)
    })

    it('should handle assessment mime types', () => {
      const mockContent = {
        primaryCategory: NsContent.EPrimaryCategory.RESOURCE,
        mimeType: NsContent.EMimeTypes.QUIZ
      } as NsContent.IContent

      const initialStructure: NsAppToc.ITocStructure = {
        course: 0,
        learningModule: 0,
        podcast: 0,
        video: 0,
        pdf: 0,
        webPage: 0,
        survey: 0,
        assessment: 0,
        offlineSession: 0,
        practiceTest: 0,
        finalTest: 0,
        interactivecontent: 0,
        other: 0,
        handsOn: 0,
        interactiveVideo: 0,
        quiz: 0,
        webModule: 0,
        youtube: 0
      }

      const result = service.getTocStructure(mockContent, initialStructure)
      expect(result.assessment).toBe(1)
    })

    it('should handle offline session mime type', () => {
      const mockContent = {
        primaryCategory: NsContent.EPrimaryCategory.OFFLINE_SESSION,
        mimeType: NsContent.EMimeTypes.OFFLINE_SESSION
      } as NsContent.IContent

      const initialStructure: NsAppToc.ITocStructure = {
        course: 0,
        learningModule: 0,
        podcast: 0,
        video: 0,
        pdf: 0,
        webPage: 0,
        survey: 0,
        assessment: 0,
        offlineSession: 0,
        practiceTest: 0,
        finalTest: 0,
        interactivecontent: 0,
        other: 0,
        handsOn: 0,
        interactiveVideo: 0,
        quiz: 0,
        webModule: 0,
        youtube: 0
      }

      const result = service.getTocStructure(mockContent, initialStructure)
      expect(result.offlineSession).toBe(1)
    })

    it('should handle practice resource', () => {
      const mockContent = {
        primaryCategory: NsContent.EPrimaryCategory.PRACTICE_RESOURCE,
        mimeType: NsContent.EMimeTypes.PRACTICE_RESOURCE
      } as NsContent.IContent

      const initialStructure: NsAppToc.ITocStructure = {
        course: 0,
        learningModule: 0,
        podcast: 0,
        video: 0,
        pdf: 0,
        webPage: 0,
        survey: 0,
        assessment: 0,
        offlineSession: 0,
        practiceTest: 0,
        finalTest: 0,
        interactivecontent: 0,
        other: 0,
        handsOn: 0,
        interactiveVideo: 0,
        quiz: 0,
        webModule: 0,
        youtube: 0
      }

      const result = service.getTocStructure(mockContent, initialStructure)
      expect(result.practiceTest).toBe(1)
    })

    it('should handle final assessment', () => {
      const mockContent = {
        primaryCategory: NsContent.EPrimaryCategory.FINAL_ASSESSMENT,
        mimeType: NsContent.EMimeTypes.PRACTICE_RESOURCE
      } as NsContent.IContent

      const initialStructure: NsAppToc.ITocStructure = {
        course: 0,
        learningModule: 0,
        podcast: 0,
        video: 0,
        pdf: 0,
        webPage: 0,
        survey: 0,
        assessment: 0,
        offlineSession: 0,
        practiceTest: 0,
        finalTest: 0,
        interactivecontent: 0,
        other: 0,
        handsOn: 0,
        interactiveVideo: 0,
        quiz: 0,
        webModule: 0,
        youtube: 0
      }

      const result = service.getTocStructure(mockContent, initialStructure)
      expect(result.finalTest).toBe(1)
    })

    it('should handle ZIP mime types', () => {
      const mockContent = {
        primaryCategory: NsContent.EPrimaryCategory.RESOURCE,
        mimeType: NsContent.EMimeTypes.ZIP
      } as NsContent.IContent

      const initialStructure: NsAppToc.ITocStructure = {
        course: 0,
        learningModule: 0,
        podcast: 0,
        video: 0,
        pdf: 0,
        webPage: 0,
        survey: 0,
        assessment: 0,
        offlineSession: 0,
        practiceTest: 0,
        finalTest: 0,
        interactivecontent: 0,
        other: 0,
        handsOn: 0,
        interactiveVideo: 0,
        quiz: 0,
        webModule: 0,
        youtube: 0
      }

      const result = service.getTocStructure(mockContent, initialStructure)
      expect(result.interactivecontent).toBe(1)
    })

    it('should handle unknown mime types', () => {
      const mockContent = {
        primaryCategory: NsContent.EPrimaryCategory.RESOURCE,
        mimeType: 'unknown/type' as NsContent.EMimeTypes
      } as NsContent.IContent

      const initialStructure: NsAppToc.ITocStructure = {
        course: 0,
        learningModule: 0,
        podcast: 0,
        video: 0,
        pdf: 0,
        webPage: 0,
        survey: 0,
        assessment: 0,
        offlineSession: 0,
        practiceTest: 0,
        finalTest: 0,
        interactivecontent: 0,
        other: 0,
        handsOn: 0,
        interactiveVideo: 0,
        quiz: 0,
        webModule: 0,
        youtube: 0
      }

      const result = service.getTocStructure(mockContent, initialStructure)
      expect(result.other).toBe(1)
    })
  })

  describe('filterToc', () => {
    it('should filter content by category', () => {
      const mockContent = {
        primaryCategory: NsContent.EPrimaryCategory.COURSE,
        children: [
          {
            primaryCategory: NsContent.EPrimaryCategory.RESOURCE,
            resourceType: 'Learning Resource'
          }
        ]
      } as NsContent.IContent

      const result = service.filterToc(mockContent, NsContent.EFilterCategory.LEARN)
      expect(result).toBeTruthy()
      expect(result?.children?.length).toBe(1)
    })

    it('should return null when no children match filter', () => {
      const mockContent = {
        primaryCategory: NsContent.EPrimaryCategory.COURSE,
        children: [
          {
            primaryCategory: NsContent.EPrimaryCategory.RESOURCE,
            resourceType: 'Assessment'
          }
        ]
      } as NsContent.IContent

      const result = service.filterToc(mockContent, NsContent.EFilterCategory.LEARN)
      expect(result).toBeNull()
    })

    it('should handle resource content directly', () => {
      const mockContent = {
        primaryCategory: NsContent.EPrimaryCategory.RESOURCE,
        resourceType: 'Learning Resource'
      } as NsContent.IContent

      const result = service.filterToc(mockContent, NsContent.EFilterCategory.LEARN)
      expect(result).toBeTruthy()
    })
  })

  describe('filterUnitContent', () => {
    it('should filter LEARN category correctly', () => {
      const mockContent = {
        resourceType: 'Learning Resource'
      } as NsContent.IContent

      const result = service.filterUnitContent(mockContent, NsContent.EFilterCategory.LEARN)
      expect(result).toBe(true)
    })

    it('should filter PRACTICE category correctly', () => {
      const mockContent = {
        resourceType: 'Practice'
      } as NsContent.IContent

      // Mock the VALID_PRACTICE_RESOURCES set
      const mockValidPracticeResources = new Set(['Practice']);
      (NsContentConstants as any).VALID_PRACTICE_RESOURCES = mockValidPracticeResources

      const result = service.filterUnitContent(mockContent, NsContent.EFilterCategory.PRACTICE)
      expect(result).toBe(true)
    })

    it('should filter ASSESS category correctly', () => {
      const mockContent = {
        resourceType: 'Assessment'
      } as NsContent.IContent

      // Mock the VALID_ASSESSMENT_RESOURCES set
      const mockValidAssessmentResources = new Set(['Assessment']);
      (NsContentConstants as any).VALID_ASSESSMENT_RESOURCES = mockValidAssessmentResources

      const result = service.filterUnitContent(mockContent, NsContent.EFilterCategory.ASSESS)
      expect(result).toBe(true)
    })

    it('should return true for ALL category', () => {
      const mockContent = {
        resourceType: 'Any Resource'
      } as NsContent.IContent

      const result = service.filterUnitContent(mockContent, NsContent.EFilterCategory.ALL)
      expect(result).toBe(true)
    })

    it('should return true for default case', () => {
      const mockContent = {
        resourceType: 'Any Resource'
      } as NsContent.IContent

      const result = service.filterUnitContent(mockContent, 'UNKNOWN' as NsContent.EFilterCategory)
      expect(result).toBe(true)
    })
  })

  describe('Analytics Methods', () => {
    it('should fetch content analytics client data when not fetching or done', () => {
      service.analyticsFetchStatus = 'none'
      const getContentAnalyticsClientSpy = jest.spyOn(service as any, 'getContentAnalyticsClient')

      service.fetchContentAnalyticsClientData('test-content-id')

      expect(getContentAnalyticsClientSpy).toHaveBeenCalledWith('test-content-id')
    })

    it('should not fetch content analytics client data when already fetching', () => {
      service.analyticsFetchStatus = 'fetching'
      const getContentAnalyticsClientSpy = jest.spyOn(service as any, 'getContentAnalyticsClient')

      service.fetchContentAnalyticsClientData('test-content-id')

      expect(getContentAnalyticsClientSpy).not.toHaveBeenCalled()
    })

    it('should not fetch content analytics client data when done', () => {
      service.analyticsFetchStatus = 'done'
      const getContentAnalyticsClientSpy = jest.spyOn(service as any, 'getContentAnalyticsClient')

      service.fetchContentAnalyticsClientData('test-content-id')

      expect(getContentAnalyticsClientSpy).not.toHaveBeenCalled()
    })

    it('should get content analytics client successfully', () => {
      const mockResponse = { data: 'analytics data' }
      mockHttpClient.get.mockReturnValue(of(mockResponse))
      const nextSpy = jest.spyOn(service.analyticsReplaySubject, 'next');

      (service as any).getContentAnalyticsClient('test-content-id')

      expect(service.analyticsFetchStatus).toBe('fetching')
      expect(mockHttpClient.get).toHaveBeenCalled()
      expect(nextSpy).toHaveBeenCalledWith(mockResponse)
      expect(service.analyticsFetchStatus).toBe('done')
    })

    it('should handle get content analytics client error', () => {
      mockHttpClient.get.mockReturnValue(throwError('Network error'))
      const nextSpy = jest.spyOn(service.analyticsReplaySubject, 'next');

      (service as any).getContentAnalyticsClient('test-content-id')

      expect(nextSpy).toHaveBeenCalledWith(null)
      expect(service.analyticsFetchStatus).toBe('done')
    })

    it('should fetch content analytics data when not fetching or done', () => {
      service.analyticsFetchStatus = 'none'
      const getContentAnalyticsSpy = jest.spyOn(service as any, 'getContentAnalytics')

      service.fetchContentAnalyticsData('test-content-id')

      expect(getContentAnalyticsSpy).toHaveBeenCalledWith('test-content-id')
    })

    it('should get content analytics successfully', () => {
      const mockResponse = { data: 'analytics data' }
      mockHttpClient.get.mockReturnValue(of(mockResponse))
      const nextSpy = jest.spyOn(service.analyticsReplaySubject, 'next');

      (service as any).getContentAnalytics('test-content-id')

      expect(service.analyticsFetchStatus).toBe('fetching')
      expect(mockHttpClient.get).toHaveBeenCalled()
      expect(nextSpy).toHaveBeenCalledWith(mockResponse)
      expect(service.analyticsFetchStatus).toBe('done')
    })

    it('should handle get content analytics error', () => {
      mockHttpClient.get.mockReturnValue(throwError('Network error'))
      const nextSpy = jest.spyOn(service.analyticsReplaySubject, 'next');

      (service as any).getContentAnalytics('test-content-id')

      expect(nextSpy).toHaveBeenCalledWith(null)
      expect(service.analyticsFetchStatus).toBe('done')
    })

    it('should clear analytics data', () => {
      const unsubscribeSpy = jest.fn()
      service.analyticsReplaySubject.unsubscribe = unsubscribeSpy

      service.clearAnalyticsData()

      expect(unsubscribeSpy).toHaveBeenCalled()
    })
  })

  describe('HTTP Methods', () => {
    it('should fetch content parents', () => {
      const result = service.fetchContentParents('test-content-id')
      expect(result).toBeDefined()
    })

    it('should fetch content whats next with content type', () => {
      const mockResponse = [{ identifier: 'next-content' }]
      mockHttpClient.get.mockReturnValue(of(mockResponse))

      const result$ = service.fetchContentWhatsNext('test-content-id', 'Course')

      result$.subscribe(result => {
        expect(result).toEqual(mockResponse)
      })
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('contentType=Course')
      )
    })

    it('should fetch content whats next without content type', () => {
      const mockResponse = [{ identifier: 'next-content' }]
      mockHttpClient.get.mockReturnValue(of(mockResponse))

      const result$ = service.fetchContentWhatsNext('test-content-id')

      result$.subscribe(result => {
        expect(result).toEqual(mockResponse)
      })
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('ts=')
      )
    })

    it('should fetch more like this paid', () => {
      const mockResponse = [{ identifier: 'paid-content' }]
      mockHttpClient.get.mockReturnValue(of(mockResponse))

      const result$ = service.fetchMoreLikeThisPaid('test-content-id')

      result$.subscribe(result => {
        expect(result).toEqual(mockResponse)
      })
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('exclusiveContent=true')
      )
    })

    it('should fetch more like this free', () => {
      const mockResponse = [{ identifier: 'free-content' }]
      mockHttpClient.get.mockReturnValue(of(mockResponse))

      const result$ = service.fetchMoreLikeThisFree('test-content-id')

      result$.subscribe(result => {
        expect(result).toEqual(mockResponse)
      })
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('exclusiveContent=false')
      )
    })

    it('should fetch content cohorts', () => {
      const mockResponse = [{ cohortId: 'test-cohort' }]
      mockHttpClient.get.mockReturnValue(of(mockResponse))

      const result$ = service.fetchContentCohorts(NsCohorts.ECohortTypes.BATCH, 'test-content-id')

      result$.subscribe(result => {
        expect(result).toEqual(mockResponse)
      })
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            rootOrg: 'test-root-org',
            org: 'test-org'
          })
        })
      )
    })

    it('should fetch external content access', () => {
      const mockResponse = { hasAccess: true }
      mockHttpClient.get.mockReturnValue(of(mockResponse))

      const result$ = service.fetchExternalContentAccess('test-content-id')

      result$.subscribe(result => {
        expect(result).toEqual(mockResponse)
      })
      expect(mockHttpClient.get).toHaveBeenCalled()
    })

    it('should fetch cohort group users', () => {
      const mockResponse = [{ userId: 'test-user' }]
      mockHttpClient.get.mockReturnValue(of(mockResponse))

      const result$ = service.fetchCohortGroupUsers(123)

      result$.subscribe(result => {
        expect(result).toEqual(mockResponse)
      })
      expect(mockHttpClient.get).toHaveBeenCalled()
    })

    it('should fetch more like this', () => {
      const mockResponse = [{ identifier: 'related-content' }]
      mockHttpClient.get.mockReturnValue(of(mockResponse))

      const result$ = service.fetchMoreLikeThis('test-content-id', 'Course')

      result$.subscribe(result => {
        expect(result).toEqual(mockResponse)
      })
      expect(mockHttpClient.get).toHaveBeenCalled()
    })

    it('should fetch post assessment status', () => {
      const mockResponse = { result: [{ assessmentId: 'test-assessment' }] }
      mockHttpClient.get.mockReturnValue(of(mockResponse))

      const result$ = service.fetchPostAssessmentStatus('test-content-id')

      result$.subscribe(result => {
        expect(result).toEqual(mockResponse)
      })
      expect(mockHttpClient.get).toHaveBeenCalled()
    })

    it('should fetch get content data for non-preview', () => {
      window.location.href = 'http://localhost:4200/app/toc'
      const mockResponse = { result: { content: 'test' } }
      mockHttpClient.get.mockReturnValue(of(mockResponse))

      const result$ = service.fetchGetContentData('test-content-id')

      result$.subscribe(result => {
        expect(result).toEqual(mockResponse)
      })
      expect(mockHttpClient.get).toHaveBeenCalled()
    })

    it('should fetch get content data for preview with editMode=true', () => {
      window.location.href = 'http://localhost:4200/public/toc?editMode=true&_rc'
      const mockResponse = { result: { content: 'test' } }
      mockHttpClient.get.mockReturnValue(of(mockResponse))

      const result$ = service.fetchGetContentData('test-content-id')

      result$.subscribe(result => {
        expect(result).toEqual(mockResponse)
      })
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/apis/proxies/v8/action/content/v3/read/')
      )
    })

    it('should fetch get content data for preview without editMode', () => {
      window.location.href = 'http://localhost:4200/public/toc'
      const mockResponse = { result: { content: 'test' } }
      mockHttpClient.get.mockReturnValue(of(mockResponse))

      const result$ = service.fetchGetContentData('test-content-id')

      result$.subscribe(result => {
        expect(result).toEqual(mockResponse)
      })
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/content/v1/read/')
      )
    })

    it('should fetch content parent for non-preview', () => {
      const mockData: any = { request: 'test' }
      const mockResponse = { result: 'parent-data' }
      mockHttpClient.post.mockReturnValue(of(mockResponse))

      const result$ = service.fetchContentParent('test-content-id', mockData, false)

      result$.subscribe(result => {
        expect(result).toEqual(mockResponse)
      })
      expect(mockHttpClient.post).toHaveBeenCalled()
    })

    it('should fetch content parent for preview', () => {
      const mockData: any = { request: 'test' }
      const mockResponse = { result: 'parent-data' }
      mockHttpClient.post.mockReturnValue(of(mockResponse))

      const result$ = service.fetchContentParent('test-content-id', mockData, true)

      result$.subscribe(result => {
        expect(result).toEqual(mockResponse)
      })
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        expect.stringContaining('/apis/authApi/action/content/parent/hierarchy/'),
        mockData
      )
    })

    it('should create batch', () => {
      const mockBatchData = { batchId: 'test-batch' }
      const mockResponse = { result: 'success' }
      mockHttpClient.post.mockReturnValue(of(mockResponse))

      const result$ = service.createBatch(mockBatchData)

      result$.subscribe(result => {
        expect(result).toEqual(mockResponse)
      })
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        expect.any(String),
        { request: mockBatchData }
      )
    })

    it('should fetch content history V2', () => {
      const mockReq = {
        request: {
          batchId: 'test-batch',
          userId: 'test-user',
          courseId: 'test-course',
          contentIds: [],
          fields: ['progressdetails']
        }
      }
      const mockResponse = { result: { contentList: [] } }
      mockHttpClient.post.mockReturnValue(of(mockResponse))

      const result$ = service.fetchContentHistoryV2(mockReq)

      result$.subscribe(result => {
        expect(result).toEqual(mockResponse)
      })
      expect(mockHttpClient.post).toHaveBeenCalled()
    })

    it('should download certificate', () => {
      const mockResponse = { result: { printUri: 'test-uri' } }
      mockHttpClient.get.mockReturnValue(of(mockResponse))

      const result$ = service.dowonloadCertificate('test-cert-id')

      result$.subscribe(result => {
        expect(result).toEqual(mockResponse)
      })
      expect(mockHttpClient.get).toHaveBeenCalled()
    })

    it('should get server date', () => {
      const mockResponse = { result: [] }
      mockHttpClient.get.mockReturnValue(of(mockResponse))

      const result$ = service.getServerDate()

      result$.subscribe(result => {
        expect(result).toEqual(mockResponse)
      })
      expect(mockHttpClient.get).toHaveBeenCalled()
    })

    it('should get form by id', () => {
      const mockResponse = { form: 'data' }
      mockHttpClient.get.mockReturnValue(of(mockResponse))

      const result$ = service.getFormById('test-form-id')

      result$.subscribe(result => {
        expect(result).toEqual(mockResponse)
      })
      expect(mockHttpClient.get).toHaveBeenCalled()
    })

    it('should submit form', () => {
      const mockFormData = { form: 'data' }
      const mockResponse = { result: 'success' }
      mockHttpClient.post.mockReturnValue(of(mockResponse))

      const result$ = service.submitForm(mockFormData)

      result$.subscribe(result => {
        expect(result).toEqual(mockResponse)
      })
      expect(mockHttpClient.post).toHaveBeenCalledWith(expect.any(String), mockFormData)
    })

    it('should share content', () => {
      const mockReqBody = { content: 'data' }
      const mockResponse = { result: 'success' }
      mockHttpClient.post.mockReturnValue(of(mockResponse))

      const result$ = service.shareContent(mockReqBody)

      result$.subscribe(result => {
        expect(result).toEqual(mockResponse)
      })
      expect(mockHttpClient.post).toHaveBeenCalledWith(expect.any(String), mockReqBody)
    })

    it('should get AI resource VTT file', () => {
      const mockResponse = { vtt: 'data' }
      mockHttpClient.get.mockReturnValue(of(mockResponse))

      const result$ = service.aiGetResourceVttFile('test-resource-id')

      result$.subscribe(result => {
        expect(result).toEqual(mockResponse)
      })
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('resource_id=test-resource-id')
      )
    })
  })

  describe('Complex Program Methods', () => {
    beforeEach(() => {
      mockWidgetContentService.getFirstChildInHierarchy.mockReturnValue({
        identifier: 'first-child-id'
      })
      mockHttpClient.post.mockReturnValue(of({
        result: {
          contentList: [
            { contentId: 'child1', progress: 100, completionPercentage: 100, status: 2 }
          ]
        }
      }))
    })

    it('should map completion percentage for program with 100% complete parent', async () => {
      const mockContent = {
        identifier: 'program-id',
        primaryCategory: NsContent.EPrimaryCategory.CURATED_PROGRAM,
        leafNodesCount: 10,
        children: [
          {
            identifier: 'course1',
            primaryCategory: NsContent.EPrimaryCategory.COURSE,
            leafNodesCount: 5,
            leafNodes: ['child1', 'child2']
          }
        ]
      } as unknown as NsContent.IContent

      const mockEnrolmentList = [
        {
          collectionId: 'program-id',
          completionPercentage: 100,
          userId: 'user1',
          batch: { batchId: 'batch1' }
        }
      ]

      const mapCompletionChildSpy = jest.spyOn(service, 'mapCompletionChildPercentageProgram')
      const contentLoaderSpy = jest.spyOn(service.contentLoader, 'next')

      await service.mapCompletionPercentageProgram(mockContent, mockEnrolmentList)

      expect(mapCompletionChildSpy).toHaveBeenCalled()
      expect(contentLoaderSpy).toHaveBeenCalledWith(true)
      expect(contentLoaderSpy).toHaveBeenCalledWith(false)
    })

    it('should map completion percentage for program with courses', async () => {
      const mockContent = {
        identifier: 'program-id',
        primaryCategory: NsContent.EPrimaryCategory.CURATED_PROGRAM,
        leafNodesCount: 10,
        children: [
          {
            identifier: 'course1',
            primaryCategory: NsContent.EPrimaryCategory.COURSE,
            leafNodesCount: 5,
            leafNodes: ['child1', 'child2']
          }
        ]
      } as unknown as NsContent.IContent

      const mockEnrolmentList = [
        {
          collectionId: 'program-id',
          completionPercentage: 50,
          userId: 'user1',
          batch: { batchId: 'batch1' }
        },
        {
          collectionId: 'course1',
          completionPercentage: 100,
          userId: 'user1',
          batch: { batchId: 'batch2' },
          issuedCertificates: [
            { identifier: 'cert1', lastIssuedOn: '2023-12-01' }
          ]
        }
      ]

      await service.mapCompletionPercentageProgram(mockContent, mockEnrolmentList)

      expect(mockContent.children[0].completionPercentage).toBe(100)
      expect(mockContent.children[0].completionStatus).toBe(2)
      expect(mockContent.children[0]['issuedCertificatesId']).toBe('cert1')
    })

    it('should handle course with progress data', async () => {
      const mockContent = {
        identifier: 'program-id',
        primaryCategory: NsContent.EPrimaryCategory.CURATED_PROGRAM,
        leafNodesCount: 10,
        children: [
          {
            identifier: 'course1',
            primaryCategory: NsContent.EPrimaryCategory.COURSE,
            leafNodesCount: 5,
            leafNodes: ['child1', 'child2'],
            completionPercentage: 0
          }
        ]
      } as unknown as NsContent.IContent

      const mockEnrolmentList = [
        {
          collectionId: 'program-id',
          completionPercentage: 50,
          userId: 'user1',
          batch: { batchId: 'batch1' }
        },
        {
          collectionId: 'course1',
          completionPercentage: 50,
          userId: 'user1',
          batch: { batchId: 'batch2' }
        }
      ]

      await service.mapCompletionPercentageProgram(mockContent, mockEnrolmentList)

      expect(mockContent.completionPercentage).toBeGreaterThanOrEqual(0)
    })

    it('should handle blended program', async () => {
      const mockContent = {
        identifier: 'program-id',
        primaryCategory: NsContent.EPrimaryCategory.BLENDED_PROGRAM,
        leafNodesCount: 10,
        children: []
      } as unknown as NsContent.IContent

      const mockEnrolmentList = [
        {
          collectionId: 'program-id',
          completionPercentage: 50,
          userId: 'user1',
          batch: { batchId: 'batch1' }
        }
      ]

      await service.mapCompletionPercentageProgram(mockContent, mockEnrolmentList)

      expect(mockContent.completionPercentage).toBeDefined()
    })

    it('should handle empty in-progress data with first uncomplete course', async () => {
      const mockContent = {
        identifier: 'program-id',
        primaryCategory: NsContent.EPrimaryCategory.CURATED_PROGRAM,
        leafNodesCount: 10,
        children: [
          {
            identifier: 'course1',
            primaryCategory: NsContent.EPrimaryCategory.COURSE,
            leafNodesCount: 5,
            leafNodes: ['child1', 'child2'],
            completionPercentage: 0
          }
        ]
      } as unknown as NsContent.IContent

      const mockEnrolmentList = [
        {
          collectionId: 'program-id',
          completionPercentage: 0,
          userId: 'user1',
          batch: { batchId: 'batch1' }
        },
        {
          collectionId: 'course1',
          completionPercentage: 0,
          userId: 'user1',
          batch: { batchId: 'batch2' }
        }
      ]

      // Mock empty progress data
      mockHttpClient.post.mockReturnValue(of({
        result: {
          contentList: []
        }
      }))

      const updateResumaSpy = jest.spyOn(service, 'updateResumaData')

      await service.mapCompletionPercentageProgram(mockContent, mockEnrolmentList)

      expect(updateResumaSpy).toHaveBeenCalled()
    })
  })

  describe('Helper Methods', () => {
    it('should check completed leaf nodes', () => {
      const leafNodes = ['node1']
      const completedCount = [
        { contentId: 'node2' },
        { contentId: 'node3' }
      ]

      service.checkCompletedLeafnodes(leafNodes, completedCount)

      expect(leafNodes).toContain('node2')
      expect(leafNodes).toContain('node3')
    })

    it('should find enrollment by collection id', () => {
      const enrolmentList = [
        { collectionId: 'course1', userId: 'user1' },
        { collectionId: 'course2', userId: 'user2' }
      ]

      const result = service.findEnrolmentByCollectionId(enrolmentList, 'course1')
      expect(result).toEqual({ collectionId: 'course1', userId: 'user1' })

      const notFound = service.findEnrolmentByCollectionId(enrolmentList, 'course3')
      expect(notFound).toBeUndefined()
    })

    it('should handle empty enrollment list', () => {
      const result = service.findEnrolmentByCollectionId([], 'course1')
      expect(result).toBeUndefined()

      const nullResult = service.findEnrolmentByCollectionId(null, 'course1')
      expect(nullResult).toBeUndefined()
    })

    it('should map completion child percentage for program', async () => {
      const mockCourse: any = {
        children: [
          {
            identifier: 'module1',
            primaryCategory: NsContent.EPrimaryCategory.MODULE,
            children: [
              { identifier: 'resource1' }
            ]
          },
          {
            identifier: 'resource2',
            primaryCategory: NsContent.EPrimaryCategory.RESOURCE
          }
        ]
      }

      await service.mapCompletionChildPercentageProgram(mockCourse)

      expect(mockCourse['moduleCount']).toBe(1)
      expect(mockCourse.children[1]['completionPercentage']).toBe(100)
      expect(mockCourse.children[1]['completionStatus']).toBe(2)
    })

    it('should map module duration and progress', () => {
      const mockContent = {
        primaryCategory: NsContent.EPrimaryCategory.MODULE,
        children: [
          { duration: 100, completionStatus: 2 },
          { duration: 200, completionPercentage: 100 }
        ],
        leafNodesCount: 2
      } as unknown as NsContent.IContent

      service.mapModuleDurationAndProgress(mockContent, null)

      expect(mockContent['duration']).toBe(300)
      expect(mockContent['completionPercentage']).toBe(100)
      expect(mockContent['completionStatus']).toBe(2)
    })

    it('should handle nested modules in duration mapping', () => {
      const mockContent = {
        children: [
          {
            primaryCategory: NsContent.EPrimaryCategory.MODULE,
            children: [
              { duration: 50 }
            ],
            leafNodesCount: 1
          }
        ]
      } as unknown as NsContent.IContent

      service.mapModuleDurationAndProgress(mockContent, null)
      // Should handle nested structure
    })

    it('should get calculations from children', () => {
      const mockItem = {
        children: [
          { duration: 100, completionStatus: 2 },
          { duration: 200, completionPercentage: 100 }
        ],
        leafNodesCount: 2
      } as unknown as NsContent.IContent

      const result = service.getCalculationsFromChildren(mockItem)

      expect(result['duration']).toBe(300)
      expect(result['completionPercentage']).toBe(100)
      expect(result['completionStatus']).toBe(2)
    })

    it('should create hierarchy progress hashmap', () => {
      const mockHierarchy = {
        identifier: 'root',
        children: [
          {
            identifier: 'child1',
            parent: 'root',
            leafNodesCount: 5,
            leafNodes: ['leaf1', 'leaf2'],
            completionPercentage: 80,
            primaryCategory: NsContent.EPrimaryCategory.MODULE,
            duration: 100
          }
        ]
      } as unknown as NsContent.IContent

      service.createHirarchyProgressHashmap(mockHierarchy)

      expect(service.hashmap['child1']).toBeDefined()
      expect(service.hashmap['child1'].identifier).toBe('child1')
      expect(service.hashmap['child1'].leafNodesCount).toBe(5)
    })

    it('should call hierarchy progress hashmap', () => {
      const mockHierarchy = {
        identifier: 'root',
        parent: null,
        leafNodesCount: 10,
        leafNodes: ['leaf1'],
        completionPercentage: 50,
        primaryCategory: NsContent.EPrimaryCategory.CURATED_PROGRAM,
        compatibilityLevel: 5,
        contextLockingType: NsContent.EContextLockingType.COURSE_ASSESSMENT_ONLY,
        children: []
      } as unknown as NsContent.IContent

      const createHashmapSpy = jest.spyOn(service, 'createHirarchyProgressHashmap')

      service.callHirarchyProgressHashmap(mockHierarchy)

      expect(service.hashmap['root']).toBeDefined()
      expect(service.hashmap['root'].contextLockingType).toBe(NsContent.EContextLockingType.COURSE_ASSESSMENT_ONLY)
      expect(createHashmapSpy).toHaveBeenCalledWith(mockHierarchy)
    })

    it('should handle null hierarchy in hashmap', () => {
      service.callHirarchyProgressHashmap(null)
      // Should not throw error
    })

    it('should check module wise data', () => {
      const mockContent: any = {
        children: [
          {
            primaryCategory: NsContent.EPrimaryCategory.MODULE,
            children: [
              { primaryCategory: NsContent.EPrimaryCategory.RESOURCE },
              { primaryCategory: NsContent.EPrimaryCategory.OFFLINE_SESSION },
              { primaryCategory: NsContent.EPrimaryCategory.RESOURCE }
            ]
          },
          {
            primaryCategory: NsContent.EPrimaryCategory.COURSE,
            children: [
              {
                primaryCategory: NsContent.EPrimaryCategory.MODULE,
                children: [
                  { primaryCategory: NsContent.EPrimaryCategory.RESOURCE }
                ]
              }
            ]
          }
        ]
      }

      const checkModuleWiseDataSpy = jest.spyOn(service, 'checkModuleWiseData')

      service.checkModuleWiseData(mockContent)

      expect(mockContent.children[0]['moduleResourseCount']).toBe(2)
      expect(mockContent.children[0]['offlineResourseCount']).toBe(1)
      expect(checkModuleWiseDataSpy).toHaveBeenCalledWith(mockContent.children[1])
    })

    it('should fetch course hierarchy', async () => {
      const mockContentData = {
        children: [
          {
            identifier: 'course1',
            primaryCategory: NsContent.ECourseCategory.COURSE
          },
          {
            identifier: 'module1',
            primaryCategory: NsContent.EPrimaryCategory.MODULE
          }
        ]
      }

      const mockSubContent = {
        result: {
          content: {
            children: [
              { identifier: 'child1' },
              { identifier: 'child2' }
            ]
          }
        }
      }

      mockWidgetContentService.fetchContent.mockReturnValue(of(mockSubContent))

      await service.fetchCourseHeirarchy(mockContentData)

      expect(mockWidgetContentService.fetchContent).toHaveBeenCalledWith('course1')
      // expect(mockContentData.children[0]['children']).toEqual(mockSubContent.result.content.children);
    })

    it('should handle fetch course hierarchy without children', async () => {
      const mockContentData: any = {
        children: [
          {
            identifier: 'course1',
            primaryCategory: NsContent.ECourseCategory.COURSE
          }
        ]
      }

      const mockSubContent = {
        result: {
          content: {
            children: null
          }
        }
      }

      mockWidgetContentService.fetchContent.mockReturnValue(of(mockSubContent))

      await service.fetchCourseHeirarchy(mockContentData)

      expect(mockContentData.children[0]['children']).toBeUndefined()
    })

    it('should handle null content data in fetch course hierarchy', async () => {
      await service.fetchCourseHeirarchy(null)
      // Should not throw error
    })
  })

  describe('Transcription Methods', () => {
    it('should set transcription data', () => {
      const mockData = { language: 'en', content: 'test transcription' }
      const nextSpy = jest.spyOn(service.transriptionDataSubject, 'next')

      service.setTranscriptionData(mockData)

      expect(nextSpy).toHaveBeenCalledWith(mockData)
    })

    it('should set active subtitle language', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      const mockActiveLang = { code: 'en', name: 'English' }
      const nextSpy = jest.spyOn(service.transriptionActiveLanguageDataObject, 'next')

      service.setActiveSubtitleLanguage(mockActiveLang)

      expect(consoleSpy).toHaveBeenCalledWith('activeLang--', mockActiveLang)
      expect(nextSpy).toHaveBeenCalledWith(mockActiveLang)

      consoleSpy.mockRestore()
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('should handle missing batch attributes in session completion', () => {
      const mockBatchData: any = {
        content: [{}]
      }
      const mockResumeData: any = []

      service.mapSessionCompletionPercentage(mockBatchData, mockResumeData)
      // Should not throw error
    })

    it('should handle missing content array in batch data', () => {
      const mockBatchData = {}
      const mockResumeData: any = []

      service.mapSessionCompletionPercentage(mockBatchData, mockResumeData)
      // Should not throw error
    })

    it('should handle YouTube URL variations in China', () => {
      mockConfigurationsService.userProfile.country = 'China'

      const testCases = [
        'https://youtube.com/watch',
        'https://youtu.be/watch',
        'http://youtube.com/embed',
        'https://www.youtube.com/watch'
      ]

      testCases.forEach(url => {
        const mockContent = {
          artifactUrl: url,
          resourceType: 'Resource'
        } as NsContent.IContent

        const result = service.showStartButton(mockContent)
        expect(result.show).toBe(false)
        expect(result.msg).toBe('youtubeForbidden')
      })
    })

    it('should handle missing user profile', () => {
      mockConfigurationsService.userProfile = { country: 'india' }
      const mockContent = {
        artifactUrl: 'https://youtube.com/watch',
        resourceType: 'Resource'
      } as NsContent.IContent

      const result = service.showStartButton(mockContent)
      expect(result.show).toBe(true)
    })

    it('should handle missing org configuration in cohorts', () => {
      mockConfigurationsService.org = []
      const mockResponse = [{ cohortId: 'test-cohort' }]
      mockHttpClient.get.mockReturnValue(of(mockResponse))

      const result$ = service.fetchContentCohorts(NsCohorts.ECohortTypes.BATCH, 'test-content-id')

      result$.subscribe(result => {
        expect(result).toEqual(mockResponse)
      })
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            org: ''
          })
        })
      )
    })

    it('should handle missing rootOrg configuration', () => {
      mockConfigurationsService.rootOrg = ''
      const mockResponse = [{ cohortId: 'test-cohort' }]
      mockHttpClient.get.mockReturnValue(of(mockResponse))

      const result$ = service.fetchContentCohorts(NsCohorts.ECohortTypes.BATCH, 'test-content-id')

      result$.subscribe(result => {
        expect(result).toEqual(mockResponse)
      })
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            rootOrg: ''
          })
        })
      )
    })

    it('should handle empty children in getTocStructure', () => {
      const mockContent = {
        primaryCategory: NsContent.EPrimaryCategory.COURSE,
        children: []
      } as unknown as NsContent.IContent

      const initialStructure: NsAppToc.ITocStructure = {
        course: 0,
        learningModule: 0,
        podcast: 0,
        video: 0,
        pdf: 0,
        webPage: 0,
        survey: 0,
        assessment: 0,
        offlineSession: 0,
        practiceTest: 0,
        finalTest: 0,
        interactivecontent: 0,
        other: 0,
        handsOn: 0,
        interactiveVideo: 0,
        quiz: 0,
        webModule: 0,
        youtube: 0
      }

      const result = service.getTocStructure(mockContent, initialStructure)
      expect(result.course).toBe(1)
    })

    it('should handle missing fields in request for fetchContentHistoryV2', () => {
      const mockReq: any = {
        request: {
          batchId: 'test-batch',
          userId: 'test-user',
          courseId: 'test-course',
          contentIds: []
        }
      }
      const mockResponse = { result: { contentList: [] } }
      mockHttpClient.post.mockReturnValue(of(mockResponse))

      const result$ = service.fetchContentHistoryV2(mockReq as any)

      result$.subscribe(result => {
        expect(result).toEqual(mockResponse)
      })
      expect(mockReq.request.fields).toEqual(['progressdetails'])
    })

    it('should handle preview URL with preview=true', () => {
      window.location.href = 'http://localhost:4200/app/toc?preview=true'
      const mockResponse = { result: { content: 'test' } }
      mockHttpClient.get.mockReturnValue(of(mockResponse))

      const result$ = service.fetchGetContentData('test-content-id')

      result$.subscribe(result => {
        expect(result).toEqual(mockResponse)
      })
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/content/v1/read/')
      )
    })

    it('should handle multiple certificates and select earliest', async () => {
      const mockContent = {
        identifier: 'program-id',
        primaryCategory: NsContent.EPrimaryCategory.CURATED_PROGRAM,
        leafNodesCount: 10,
        children: [
          {
            identifier: 'course1',
            primaryCategory: NsContent.EPrimaryCategory.COURSE,
            leafNodesCount: 5,
            leafNodes: ['child1', 'child2']
          }
        ]
      } as unknown as NsContent.IContent

      const mockEnrolmentList = [
        {
          collectionId: 'program-id',
          completionPercentage: 50,
          userId: 'user1',
          batch: { batchId: 'batch1' }
        },
        {
          collectionId: 'course1',
          completionPercentage: 100,
          userId: 'user1',
          batch: { batchId: 'batch2' },
          issuedCertificates: [
            { identifier: 'cert2', lastIssuedOn: '2023-12-02' },
            { identifier: 'cert1', lastIssuedOn: '2023-12-01' }
          ]
        }
      ]

      await service.mapCompletionPercentageProgram(mockContent, mockEnrolmentList)

      expect(mockContent.children[0]['issuedCertificatesId']).toBe('cert1')
    })

    it('should handle empty certificate array', async () => {
      const mockContent = {
        identifier: 'program-id',
        primaryCategory: NsContent.EPrimaryCategory.CURATED_PROGRAM,
        leafNodesCount: 10,
        children: [
          {
            identifier: 'course1',
            primaryCategory: NsContent.EPrimaryCategory.COURSE,
            leafNodesCount: 5,
            leafNodes: ['child1', 'child2']
          }
        ]
      } as unknown as NsContent.IContent

      const mockEnrolmentList = [
        {
          collectionId: 'program-id',
          completionPercentage: 50,
          userId: 'user1',
          batch: { batchId: 'batch1' }
        },
        {
          collectionId: 'course1',
          completionPercentage: 100,
          userId: 'user1',
          batch: { batchId: 'batch2' },
          issuedCertificates: []
        }
      ]

      await service.mapCompletionPercentageProgram(mockContent, mockEnrolmentList)

      expect(mockContent.children[0]['issuedCertificatesId']).toBeUndefined()
    })
  })

  describe('Observable Cleanup', () => {
    it('should properly handle subscription cleanup', () => {
      const mockData = {
        content: {
          data: {
            identifier: 'test-content-id'
          }
        }
      }

      service.initData(mockData, true)

      expect(service.resumeDataSubscription).toBeDefined()

      if (service.resumeDataSubscription) {
        const unsubscribeSpy = jest.spyOn(service.resumeDataSubscription, 'unsubscribe')
        service.resumeDataSubscription.unsubscribe()
        expect(unsubscribeSpy).toHaveBeenCalled()
      }
    })

    it('should handle null subscription in cleanup', () => {
      service.resumeDataSubscription = null
      // Should not throw error when trying to clean up null subscription
      expect(() => {
        if (service.resumeDataSubscription) {
          service.resumeDataSubscription.unsubscribe()
        }
      }).not.toThrow()
    })
  })

  describe('Subject Event Emissions', () => {
    it('should emit transcription identifier events', () => {
      const nextSpy = jest.spyOn(service.transriptionIdentifier, 'next')
      service.transriptionIdentifier.next('test-identifier')
      expect(nextSpy).toHaveBeenCalledWith('test-identifier')
    })

    it('should emit change transcription language events', () => {
      const nextSpy = jest.spyOn(service.changeTranscriptionLanguageEvent, 'next')
      service.changeTranscriptionLanguageEvent.next({ language: 'en' })
      expect(nextSpy).toHaveBeenCalledWith({ language: 'en' })
    })

    it('should emit play transcription video events', () => {
      const nextSpy = jest.spyOn(service.playTranscriptionVideo, 'next')
      service.playTranscriptionVideo.next({ play: true })
      expect(nextSpy).toHaveBeenCalledWith({ play: true })
    })

    it('should emit page scroll updates', () => {
      const nextSpy = jest.spyOn(service.getPageScroll, 'next')
      service.getPageScroll.next(false)
      expect(nextSpy).toHaveBeenCalledWith(false)
    })
  })

  describe('Complex Scenario Integration Tests', () => {
    it('should handle complete program flow with mixed completion states', async () => {
      const mockContent = {
        identifier: 'program-id',
        primaryCategory: NsContent.EPrimaryCategory.CURATED_PROGRAM,
        leafNodesCount: 20,
        children: [
          {
            identifier: 'course1',
            primaryCategory: NsContent.EPrimaryCategory.COURSE,
            leafNodesCount: 10,
            leafNodes: ['leaf1', 'leaf2', 'leaf3'],
            completionPercentage: 0
          },
          {
            identifier: 'course2',
            primaryCategory: NsContent.EPrimaryCategory.COURSE,
            leafNodesCount: 10,
            leafNodes: ['leaf4', 'leaf5', 'leaf6'],
            completionPercentage: 0
          }
        ]
      } as unknown as NsContent.IContent

      const mockEnrolmentList = [
        {
          collectionId: 'program-id',
          completionPercentage: 50,
          userId: 'user1',
          batch: { batchId: 'batch1' }
        },
        {
          collectionId: 'course1',
          completionPercentage: 100,
          userId: 'user1',
          batch: { batchId: 'batch2' },
          issuedCertificates: [{ identifier: 'cert1', lastIssuedOn: '2023-12-01' }]
        },
        {
          collectionId: 'course2',
          completionPercentage: 30,
          userId: 'user1',
          batch: { batchId: 'batch3' }
        }
      ]

      // Mock different responses for different courses
      mockHttpClient.post
        .mockReturnValueOnce(of({
          result: {
            contentList: [
              { contentId: 'leaf4', progress: 80, completionPercentage: 80, status: 1 },
              { contentId: 'leaf5', progress: 100, completionPercentage: 100, status: 2 }
            ]
          }
        }))
        .mockReturnValueOnce(of({
          result: {
            contentList: []
          }
        }))

      const mapCompletionSpy = jest.spyOn(service, 'mapCompletionPercentage')
      const checkCompletedLeafnodesSpy = jest.spyOn(service, 'checkCompletedLeafnodes')

      await service.mapCompletionPercentageProgram(mockContent, mockEnrolmentList)

      expect(mockContent.children[0].completionPercentage).toBe(100)
      expect(mockContent.children[0]['issuedCertificatesId']).toBe('cert1')
      expect(mapCompletionSpy).toHaveBeenCalled()
      expect(checkCompletedLeafnodesSpy).toHaveBeenCalled()
      expect(mockContent.completionPercentage).toBeGreaterThanOrEqual(0)
    })

    it('should handle program with 100% completion and generate resume data', async () => {
      const mockContent = {
        identifier: 'program-id',
        primaryCategory: NsContent.EPrimaryCategory.CURATED_PROGRAM,
        leafNodesCount: 10,
        children: [
          {
            identifier: 'course1',
            primaryCategory: NsContent.EPrimaryCategory.COURSE,
            leafNodesCount: 10,
            leafNodes: ['leaf1', 'leaf2']
          }
        ]
      } as unknown as NsContent.IContent

      const mockEnrolmentList = [
        {
          collectionId: 'program-id',
          completionPercentage: 100,
          userId: 'user1',
          batch: { batchId: 'batch1' }
        },
        {
          collectionId: 'course1',
          completionPercentage: 100,
          userId: 'user1',
          batch: { batchId: 'batch2' },
          courseId: 'course1'
        }
      ]

      mockHttpClient.post.mockReturnValue(of({
        result: {
          contentList: []
        }
      }))

      const updateResumaSpy = jest.spyOn(service, 'updateResumaData')

      await service.mapCompletionPercentageProgram(mockContent, mockEnrolmentList)

      expect(mockContent.completionPercentage).toBe(100)
      expect(updateResumaSpy).toHaveBeenCalled()
    })
  })
})