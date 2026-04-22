import { of } from 'rxjs'
import { FeedbackService } from './feedback.service'
import {
  IFeedbackSearchQuery,
  IFeedback,
  IFeedbackThread,
  IFeedbackSearchResult,
  IFeedbackSummary,
  IFeedbackConfig,
  INotificationRequest,
  EFeedbackType,
  EFeedbackRole,
} from '../models/feedback.model'

describe('FeedbackService (no TestBed)', () => {
  let service: FeedbackService
  let httpClientMock: any

  beforeEach(() => {
    httpClientMock = {
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
    }

    service = new FeedbackService(httpClientMock)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create the service', () => {
    expect(service).toBeDefined()
  })

  describe('searchFeedback', () => {
    it('should call http.post with correct URL and query parameters', () => {
      const mockQuery: IFeedbackSearchQuery = {
        query: 'test',
        filters: { category: ['content'] },
        viewedBy: 'user',
        all: false,
        from: 0,
        size: 10,
      }

      const mockResponse: IFeedbackSearchResult = {
        hits: 1,
        result: [],
      }

      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.searchFeedback(mockQuery).subscribe((result: any) => {
        expect(result).toEqual(mockResponse)
      })

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/protected/v8/user/feedbackV2/search',
        mockQuery
      )
    })

    it('should return observable with search results', (done) => {
      const mockQuery: IFeedbackSearchQuery = {
        query: '',
        filters: {},
        viewedBy: 'author',
        all: true,
        from: 0,
        size: 20,
      }

      const mockThread: IFeedbackThread = {
        assignedTo: {
          email: 'test@example.com',
          name: 'Test User',
          uuid: '123',
        },
        category: 'general',
        contentDesc: 'Test content',
        contentId: 'content-123',
        contentTitle: 'Test Title',
        contentType: 'Course' as any,
        createdOn: new Date(),
        dimension: 'quality',
        feedbackBy: {
          email: 'user@example.com',
          name: 'User',
          userId: 'user-123',
        },
        feedbackCategory: 'bug',
        feedbackId: 'fb-123',
        feedbackSentimentCategory: 'negative',
        feedbackSentimentValue: 0.5,
        feedbackText: 'Test feedback',
        feedbackType: EFeedbackType.Content,
        lastActivityOn: new Date(),
        lastUpdatedOn: new Date(),
        replied: false,
        rootFeedbackId: 'root-123',
        rootOrg: 'org-123',
        seenReply: false,
      }

      const mockResponse: IFeedbackSearchResult = {
        hits: 1,
        result: [mockThread],
      }

      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.searchFeedback(mockQuery).subscribe((result: any) => {
        expect(result.hits).toBe(1)
        expect(result.result.length).toBe(1)
        expect(result.result[0].feedbackId).toBe('fb-123')
        done()
      })
    })
  })

  describe('getFeedbackThread', () => {
    it('should call http.get with correct URL and feedbackId', () => {
      const feedbackId = 'fb-123'
      const mockResponse: IFeedbackThread[] = []

      httpClientMock.get.mockReturnValue(of(mockResponse))

      service.getFeedbackThread(feedbackId).subscribe((result: any) => {
        expect(result).toEqual(mockResponse)
      })

      expect(httpClientMock.get).toHaveBeenCalledWith(
        '/apis/protected/v8/user/feedbackV2/fb-123'
      )
    })

    it('should return array of feedback threads', (done) => {
      const feedbackId = 'fb-456'
      const mockThread: IFeedbackThread = {
        assignedTo: {
          email: 'admin@example.com',
          name: 'Admin',
          uuid: '456',
        },
        category: 'support',
        contentDesc: 'Content description',
        contentId: 'content-456',
        contentTitle: 'Content Title',
        contentType: 'Resource' as any,
        createdOn: new Date(),
        dimension: 'usability',
        feedbackBy: {
          email: 'feedback@example.com',
          name: 'Feedback User',
          userId: 'user-456',
        },
        feedbackCategory: 'feature',
        feedbackId: 'fb-456',
        feedbackSentimentCategory: 'positive',
        feedbackSentimentValue: 0.8,
        feedbackText: 'Great feature!',
        feedbackType: EFeedbackType.Platform,
        lastActivityOn: new Date(),
        lastUpdatedOn: new Date(),
        replied: true,
        rootFeedbackId: 'root-456',
        rootOrg: 'org-456',
        seenReply: true,
      }

      httpClientMock.get.mockReturnValue(of([mockThread]))

      service.getFeedbackThread(feedbackId).subscribe((result: any) => {
        expect(result.length).toBe(1)
        expect(result[0].feedbackId).toBe('fb-456')
        done()
      })
    })
  })

  describe('submitPlatformFeedback', () => {
    it('should call http.post with correct URL and feedback data', () => {
      const mockFeedback: IFeedback = {
        role: EFeedbackRole.User,
        sentiment: 'positive',
        text: 'Great platform!',
        type: EFeedbackType.Platform,
      }

      const mockResponse = { success: true }
      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.submitPlatformFeedback(mockFeedback).subscribe((result: any) => {
        expect(result).toEqual(mockResponse)
      })

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/protected/v8/user/feedbackV2/platform',
        mockFeedback
      )
    })

    it('should handle platform feedback submission with all fields', (done) => {
      const mockFeedback: IFeedback = {
        category: 'improvement',
        role: EFeedbackRole.Author,
        sentiment: 'negative',
        text: 'Needs improvement',
        type: EFeedbackType.Platform,
        rootFeedbackId: 'root-789',
      }

      const mockResponse = { feedbackId: 'new-123', success: true }
      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.submitPlatformFeedback(mockFeedback).subscribe((result: any) => {
        expect(result.success).toBe(true)
        expect(result.feedbackId).toBe('new-123')
        done()
      })
    })
  })

  describe('contentShareNew', () => {
    it('should call http.post with correct URL and notification request', () => {
      const mockRequest: INotificationRequest = {
        'event-id': 'platform_feedback',
        'tag-value-pair': {
          '#feedback': 'test feedback',
        },
        recipients: {
          learner: ['user1@example.com', 'user2@example.com'],
        },
      }

      const mockResponse = { status: 'sent' }
      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.contentShareNew(mockRequest).subscribe((result: any) => {
        expect(result).toEqual(mockResponse)
      })

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/protected/v8/user/share/content',
        mockRequest
      )
    })

    it('should handle notification request with multiple recipients', (done) => {
      const mockRequest: INotificationRequest = {
        'event-id': 'platform_feedback',
        'tag-value-pair': {
          '#feedback': 'urgent feedback',
        },
        recipients: {
          learner: ['admin@example.com'],
        },
      }

      const mockResponse = { status: 'delivered', count: 1 }
      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.contentShareNew(mockRequest).subscribe((result: any) => {
        expect(result.status).toBe('delivered')
        expect(result.count).toBe(1)
        done()
      })
    })
  })

  describe('submitContentFeedback', () => {
    it('should call http.post with correct URL including contentId', () => {
      const mockFeedback: IFeedback = {
        contentId: 'content-123',
        role: EFeedbackRole.User,
        sentiment: 'positive',
        text: 'Excellent content!',
        type: EFeedbackType.Content,
      }

      const mockResponse = { success: true }
      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.submitContentFeedback(mockFeedback).subscribe((result: any) => {
        expect(result).toEqual(mockResponse)
      })

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/protected/v8/user/feedbackV2/content/content-123',
        mockFeedback
      )
    })

    it('should handle content feedback with category', (done) => {
      const mockFeedback: IFeedback = {
        contentId: 'content-456',
        category: 'quality',
        role: EFeedbackRole.Author,
        sentiment: 'negative',
        text: 'Content needs update',
        type: EFeedbackType.Content,
      }

      const mockResponse = { feedbackId: 'fb-content-123', success: true }
      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.submitContentFeedback(mockFeedback).subscribe((result: any) => {
        expect(result.success).toBe(true)
        expect(result.feedbackId).toBe('fb-content-123')
        done()
      })
    })
  })

  describe('submitContentRequest', () => {
    it('should call http.post with correct URL and feedback data', () => {
      const mockFeedback: IFeedback = {
        role: EFeedbackRole.User,
        text: 'Request for new content on Angular',
        type: EFeedbackType.ContentRequest,
      }

      const mockResponse = { requestId: 'req-123', success: true }
      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.submitContentRequest(mockFeedback).subscribe((result: any) => {
        expect(result).toEqual(mockResponse)
      })

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/protected/v8/user/feedbackV2/content-request',
        mockFeedback
      )
    })

    it('should handle content request with all fields', (done) => {
      const mockFeedback: IFeedback = {
        category: 'new-topic',
        role: EFeedbackRole.Content,
        text: 'Need advanced TypeScript content',
        type: EFeedbackType.ContentRequest,
      }

      const mockResponse = { requestId: 'req-456', status: 'pending' }
      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.submitContentRequest(mockFeedback).subscribe((result: any) => {
        expect(result.requestId).toBe('req-456')
        expect(result.status).toBe('pending')
        done()
      })
    })
  })

  describe('submitServiceRequest', () => {
    it('should call http.post with correct URL and feedback data', () => {
      const mockFeedback: IFeedback = {
        role: EFeedbackRole.User,
        text: 'Request for technical support',
        type: EFeedbackType.ServiceRequest,
      }

      const mockResponse = { ticketId: 'ticket-123', success: true }
      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.submitServiceRequest(mockFeedback).subscribe((result: any) => {
        expect(result).toEqual(mockResponse)
      })

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/protected/v8/user/feedbackV2/service-request',
        mockFeedback
      )
    })

    it('should handle service request with category', (done) => {
      const mockFeedback: IFeedback = {
        category: 'technical',
        role: EFeedbackRole.Service,
        text: 'Server downtime issue',
        type: EFeedbackType.ServiceRequest,
      }

      const mockResponse = { ticketId: 'ticket-789', priority: 'high' }
      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.submitServiceRequest(mockFeedback).subscribe((result: any) => {
        expect(result.ticketId).toBe('ticket-789')
        expect(result.priority).toBe('high')
        done()
      })
    })
  })

  describe('getFeedbackSummary', () => {
    it('should call http.get with correct URL', () => {
      const mockSummary: IFeedbackSummary = {
        forActionCount: 5,
        roles: [],
        totalCount: 10,
      }

      httpClientMock.get.mockReturnValue(of(mockSummary))

      service.getFeedbackSummary().subscribe((result: any) => {
        expect(result).toEqual(mockSummary)
      })

      expect(httpClientMock.get).toHaveBeenCalledWith(
        '/apis/protected/v8/user/feedbackV2/feedback-summary'
      )
    })

    it('should return complete feedback summary with roles', (done) => {
      const mockSummary: IFeedbackSummary = {
        forActionCount: 15,
        roles: [
          {
            enabled: true,
            forActionCount: 5,
            hasAccess: true,
            role: EFeedbackRole.User,
            totalCount: 20,
          },
          {
            enabled: true,
            forActionCount: 10,
            hasAccess: true,
            role: EFeedbackRole.Author,
            totalCount: 30,
          },
        ],
        totalCount: 50,
      }

      httpClientMock.get.mockReturnValue(of(mockSummary))

      service.getFeedbackSummary().subscribe((result: any) => {
        expect(result.forActionCount).toBe(15)
        expect(result.totalCount).toBe(50)
        expect(result.roles.length).toBe(2)
        expect(result.roles[0].role).toBe(EFeedbackRole.User)
        done()
      })
    })
  })

  describe('updateFeedbackStatus', () => {
    it('should call http.patch with correct URL without category', () => {
      const rootFeedbackId = 'root-123'
      const mockResponse: IFeedbackThread = {
        assignedTo: {
          email: 'test@example.com',
          name: 'Test',
          uuid: '123',
        },
        category: 'resolved',
        contentDesc: 'desc',
        contentId: 'content-123',
        contentTitle: 'title',
        contentType: 'Course' as any,
        createdOn: new Date(),
        dimension: 'quality',
        feedbackBy: {
          email: 'user@example.com',
          name: 'User',
          userId: 'user-123',
        },
        feedbackCategory: 'bug',
        feedbackId: 'fb-123',
        feedbackSentimentCategory: 'negative',
        feedbackSentimentValue: 0.5,
        feedbackText: 'test',
        feedbackType: EFeedbackType.Content,
        lastActivityOn: new Date(),
        lastUpdatedOn: new Date(),
        replied: true,
        rootFeedbackId: 'root-123',
        rootOrg: 'org-123',
        seenReply: true,
      }

      httpClientMock.patch.mockReturnValue(of(mockResponse))

      service.updateFeedbackStatus(rootFeedbackId).subscribe((result: any) => {
        expect(result).toEqual(mockResponse)
      })

      expect(httpClientMock.patch).toHaveBeenCalledWith(
        '/apis/protected/v8/user/feedbackV2/root-123',
        {}
      )
    })

    it('should call http.patch with correct URL with category parameter', () => {
      const rootFeedbackId = 'root-456'
      const category = 'in-progress'
      const mockResponse: IFeedbackThread = {
        assignedTo: {
          email: 'admin@example.com',
          name: 'Admin',
          uuid: '456',
        },
        category: 'in-progress',
        contentDesc: 'description',
        contentId: 'content-456',
        contentTitle: 'Test Content',
        contentType: 'Resource' as any,
        createdOn: new Date(),
        dimension: 'functionality',
        feedbackBy: {
          email: 'feedback@example.com',
          name: 'Feedback User',
          userId: 'user-456',
        },
        feedbackCategory: 'enhancement',
        feedbackId: 'fb-456',
        feedbackSentimentCategory: 'positive',
        feedbackSentimentValue: 0.7,
        feedbackText: 'Good suggestion',
        feedbackType: EFeedbackType.Platform,
        lastActivityOn: new Date(),
        lastUpdatedOn: new Date(),
        replied: false,
        rootFeedbackId: 'root-456',
        rootOrg: 'org-456',
        seenReply: false,
      }

      httpClientMock.patch.mockReturnValue(of(mockResponse))

      service.updateFeedbackStatus(rootFeedbackId, category).subscribe((result: any) => {
        expect(result.category).toBe('in-progress')
      })

      expect(httpClientMock.patch).toHaveBeenCalledWith(
        '/apis/protected/v8/user/feedbackV2/root-456?category=in-progress',
        {}
      )
    })

    it('should handle status update with various categories', (done) => {
      const rootFeedbackId = 'root-789'
      const category = 'closed'
      const mockResponse: any = {
        feedbackId: 'fb-789',
        category: 'closed',
        updatedOn: new Date(),
      }

      httpClientMock.patch.mockReturnValue(of(mockResponse))

      service.updateFeedbackStatus(rootFeedbackId, category).subscribe((result: any) => {
        expect(result.category).toBe('closed')
        expect(result.feedbackId).toBe('fb-789')
        done()
      })
    })
  })

  describe('getFeedbackConfig', () => {
    it('should call http.get with correct URL', () => {
      const mockConfig: IFeedbackConfig = {
        feedbackCategories: ['bug', 'feature', 'improvement'],
        feedbackSentimentMode: true,
      }

      httpClientMock.get.mockReturnValue(of(mockConfig))

      service.getFeedbackConfig().subscribe((result: any) => {
        expect(result).toEqual(mockConfig)
      })

      expect(httpClientMock.get).toHaveBeenCalledWith(
        '/apis/protected/v8/user/feedbackV2/config'
      )
    })

    it('should return config with categories and sentiment mode', (done) => {
      const mockConfig: IFeedbackConfig = {
        feedbackCategories: ['content-quality', 'usability', 'performance', 'accessibility'],
        feedbackSentimentMode: false,
      }

      httpClientMock.get.mockReturnValue(of(mockConfig))

      service.getFeedbackConfig().subscribe((result: any) => {
        expect(result.feedbackCategories.length).toBe(4)
        expect(result.feedbackSentimentMode).toBe(false)
        expect(result.feedbackCategories).toContain('usability')
        done()
      })
    })

    it('should handle empty config', (done) => {
      const mockConfig: IFeedbackConfig = {
        feedbackCategories: [],
        feedbackSentimentMode: true,
      }

      httpClientMock.get.mockReturnValue(of(mockConfig))

      service.getFeedbackConfig().subscribe((result: any) => {
        expect(result.feedbackCategories.length).toBe(0)
        expect(result.feedbackSentimentMode).toBe(true)
        done()
      })
    })
  })

  describe('API Base URLs', () => {
    it('should use correct feedback API base URL', () => {
      const mockQuery: IFeedbackSearchQuery = {
        query: 'test',
        filters: {},
        viewedBy: 'user',
        all: false,
        from: 0,
        size: 10,
      }

      httpClientMock.post.mockReturnValue(of({ hits: 0, result: [] }))
      service.searchFeedback(mockQuery).subscribe()

      const callUrl = httpClientMock.post.mock.calls[0][0]
      expect(callUrl).toContain('/apis/protected/v8/user/feedbackV2')
    })

    it('should use correct event notification URL', () => {
      const mockRequest: INotificationRequest = {
        'event-id': 'platform_feedback',
        'tag-value-pair': { '#feedback': 'test' },
        recipients: { learner: [] },
      }

      httpClientMock.post.mockReturnValue(of({}))
      service.contentShareNew(mockRequest).subscribe()

      const callUrl = httpClientMock.post.mock.calls[0][0]
      expect(callUrl).toBe('/apis/protected/v8/user/share/content')
    })
  })

  describe('HTTP Method Usage', () => {
    it('should use POST for search operations', () => {
      const mockQuery: IFeedbackSearchQuery = {
        query: '',
        filters: {},
        viewedBy: 'user',
        all: false,
        from: 0,
        size: 10,
      }

      httpClientMock.post.mockReturnValue(of({ hits: 0, result: [] }))
      service.searchFeedback(mockQuery).subscribe()

      expect(httpClientMock.post).toHaveBeenCalled()
      expect(httpClientMock.get).not.toHaveBeenCalled()
    })

    it('should use GET for retrieving data', () => {
      httpClientMock.get.mockReturnValue(of([]))
      service.getFeedbackThread('fb-123').subscribe()

      expect(httpClientMock.get).toHaveBeenCalled()
      expect(httpClientMock.post).not.toHaveBeenCalled()
    })

    it('should use PATCH for status updates', () => {
      httpClientMock.patch.mockReturnValue(of({}))
      service.updateFeedbackStatus('root-123').subscribe()

      expect(httpClientMock.patch).toHaveBeenCalled()
      expect(httpClientMock.post).not.toHaveBeenCalled()
      expect(httpClientMock.get).not.toHaveBeenCalled()
    })
  })
})
