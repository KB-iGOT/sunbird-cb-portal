import { RootService } from './root.service'
import { BehaviorSubject, throwError, of } from 'rxjs'
import { HttpHeaders } from '@angular/common/http'

// Mock HttpClient
const mockHttpClient = {
  post: jest.fn(),
  get: jest.fn(),
}

describe('RootService', () => {
  let service: RootService

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()

    // Create service instance with mocked HttpClient
    service = new RootService(mockHttpClient as any)

      // Reset document.cookie
      ; (document as any).cookie = ''
  })

  describe('Constructor and Properties', () => {
    it('should create service with default properties', () => {
      expect(service).toBeDefined()
      expect(service.showNavbarDisplay$ instanceof BehaviorSubject).toBe(true)
      expect(service.showNavbarDisplay$.value).toBe(true)
      expect(service.openSupportAIChatbot instanceof BehaviorSubject).toBe(true)
      expect(service.openSupportAIChatbot.value).toBe(false)
      expect(service.discussionCnfig).toBeUndefined()
      expect(service.iGOTAIChatHistory).toBeUndefined()
    })
  })

  describe('createUser', () => {
    it('should call http.post with correct parameters', () => {
      const mockRequest = { name: 'test user' }
      const mockResponse = of({ id: 1, name: 'test user' })
      mockHttpClient.post.mockReturnValue(mockResponse)

      const result$ = service.createUser(mockRequest)

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/discussion/user/v1/create',
        mockRequest,
      )
      result$.subscribe((response: any) => {
        expect(response).toEqual({ id: 1, name: 'test user' })
      })
    })
  })

  describe('setDiscussionConfig', () => {
    it('should set discussionCnfig property', () => {
      const config = { setting1: 'value1', setting2: 'value2' }

      service.setDiscussionConfig(config)

      expect(service.discussionCnfig).toBe(config)
    })
  })

  describe('getCookie', () => {
    it('should return cookie value when cookie exists', () => {
      ; (document as any).cookie = 'testCookie=testValue; anotherCookie=anotherValue'

      const result = service.getCookie('testCookie')

      expect(result).toBe('testValue')
    })

    it('should return cookie value when cookie exists with leading spaces', () => {
      ; (document as any).cookie = ' testCookie=testValue; anotherCookie=anotherValue'

      const result = service.getCookie('testCookie')

      expect(result).toBe('testValue')
    })

    it('should return empty string when cookie does not exist', () => {
      ; (document as any).cookie = 'anotherCookie=anotherValue'

      const result = service.getCookie('nonExistentCookie')

      expect(result).toBe('')
    })

    it('should return empty string when no cookies exist', () => {
      ; (document as any).cookie = ''

      const result = service.getCookie('testCookie')

      expect(result).toBe('')
    })

    it('should handle multiple cookies and return correct one', () => {
      ; (document as any).cookie = 'cookie1=value1; cookie2=value2; cookie3=value3'

      const result = service.getCookie('cookie2')

      expect(result).toBe('value2')
    })

    it('should handle cookie that appears later in the array', () => {
      ; (document as any).cookie = 'cookie1=value1; cookie2=value2; targetCookie=targetValue'

      const result = service.getCookie('targetCookie')

      expect(result).toBe('targetValue')
    })
  })

  describe('deleteCookie', () => {
    it('should call setCookie with empty value and -1 expiry', () => {
      const setCookieSpy = jest.spyOn(service, 'setCookie').mockImplementation(() => { })

      service.deleteCookie('testCookie')

      expect(setCookieSpy).toHaveBeenCalledWith('testCookie', '', -1)
      setCookieSpy.mockRestore()
    })
  })

  describe('setCookie', () => {
    it('should set cookie with default path', () => {
      service.setCookie('testName', 'testValue', 7)

      const cookie = (document as any).cookie as string
      expect(cookie).toContain('testName=testValue')
      expect(cookie).toContain('expires=')
      expect(cookie).not.toContain('path=')
    })

    it('should set cookie with custom path', () => {
      service.setCookie('testName', 'testValue', 7, '/custom')

      const cookie = (document as any).cookie as string
      expect(cookie).toContain('testName=testValue')
      expect(cookie).toContain('expires=')
      expect(cookie).toContain('path=/custom')
    })

    it('should set cookie with empty path', () => {
      service.setCookie('testName', 'testValue', 7, '')

      const cookie = (document as any).cookie as string
      expect(cookie).toContain('testName=testValue')
      expect(cookie).toContain('expires=')
      expect(cookie).not.toContain('path=')
    })
  })

  describe('getChatData', () => {
    it('should call http.post with correct parameters', () => {
      const mockTabType = { type: 'general' }
      const mockResponse = of({ data: 'chat data' })
      mockHttpClient.post.mockReturnValue(mockResponse)

      const result$ = service.getChatData(mockTabType)

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/api/faq/v1/assistant/configs/language',
        mockTabType,
      )
      result$.subscribe((response: any) => {
        expect(response).toEqual({ data: 'chat data' })
      })
    })
  })

  describe('getLangugages', () => {
    it('should call http.get with correct endpoint', () => {
      const mockResponse = of({ languages: ['en', 'es'] })
      mockHttpClient.get.mockReturnValue(mockResponse)

      const result$ = service.getLangugages()

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/api/faq/v1/assistant/available/language',
      )
      result$.subscribe((response: any) => {
        expect(response).toEqual({ languages: ['en', 'es'] })
      })
    })
  })

  describe('aiGlobalSearch', () => {
    it('should call http.post with correct parameters', () => {
      const mockRequestBody = { query: 'test' }
      const mockChatId = 'chat123'
      const mockUserID = 'user456'
      const mockResponse = { results: [] }

      mockHttpClient.post.mockReturnValue(of(mockResponse))

      const result$ = service.aiGlobalSearch(mockRequestBody, mockChatId, mockUserID)

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/chatbot/v3/search?chatID=chat123&userID=user456',
        mockRequestBody,
      )

      result$.subscribe(response => {
        expect(response).toEqual(mockResponse)
      })
    })

    it('should handle 502 error in catchError operator', (done) => {
      const mockError = { status: 502, message: 'Bad Gateway' }
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { })

      mockHttpClient.post.mockReturnValue(throwError(() => mockError))

      const result$ = service.aiGlobalSearch({}, 'chat123', 'user456')

      result$.subscribe({
        next: () => {
          // Should not be called on error
          fail('next should not be called')
        },
        error: err => {
          expect(err).toBe(mockError)
          expect(consoleErrorSpy).toHaveBeenCalledWith('502 Bad Gateway from aiGlobalSearch')
          consoleErrorSpy.mockRestore()
          done()
        },
      })
    })

    it('should handle 500 error in catchError operator', (done) => {
      const mockError = { status: 500, message: 'Internal Server Error' }
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { })

      mockHttpClient.post.mockReturnValue(throwError(() => mockError))

      const result$ = service.aiGlobalSearch({}, 'chat123', 'user456')

      result$.subscribe({
        next: () => {
          fail('next should not be called')
        },
        error: err => {
          expect(err).toBe(mockError)
          expect(consoleErrorSpy).toHaveBeenCalledWith('500 Internal Server Error from aiGlobalSearch')
          consoleErrorSpy.mockRestore()
          done()
        },
      })
    })

    it('should handle other errors in catchError operator', (done) => {
      const mockError = { status: 404, message: 'Not Found' }
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { })

      mockHttpClient.post.mockReturnValue(throwError(() => mockError))

      const result$ = service.aiGlobalSearch({}, 'chat123', 'user456')

      result$.subscribe({
        next: () => {
          fail('next should not be called')
        },
        error: err => {
          expect(err).toBe(mockError)
          expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Unhandled error (404):',
            'Not Found',
          )
          consoleErrorSpy.mockRestore()
          done()
        },
      })
    })
  })

  describe('saveAIChatPositiveContentRating', () => {
    it('should call http.post with correct parameters and log values', () => {
      const mockRequestBody = { rating: 5 }
      const mockChatId = 'chat123'
      const mockUserID = 'user456'
      const mockResponse = of({ success: true })
      const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => { })

      mockHttpClient.post.mockReturnValue(mockResponse)

      const result$ = service.saveAIChatPositiveContentRating(
        mockRequestBody,
        mockChatId,
        mockUserID,
      )

      expect(consoleLogSpy).toHaveBeenCalledWith(
        'chatId=',
        'chat123',
        'userID=',
        'user456',
      )
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/chatbot/v3/feedbacks/save?chatID=chat123&userID=user456',
        mockRequestBody,
      )
      result$.subscribe((response: any) => {
        expect(response).toEqual({ success: true })
      })

      consoleLogSpy.mockRestore()
    })
  })

  describe('shareAIFeedback', () => {
    it('should call http.post with correct parameters', () => {
      const mockRequestBody = { feedback: 'good' }
      const mockChatId = 'chat123'
      const mockUserID = 'user456'
      const mockResponse = of({ success: true })
      mockHttpClient.post.mockReturnValue(mockResponse)

      const result$ = service.shareAIFeedback(mockRequestBody, mockChatId, mockUserID)

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/chatbot/v3/feedbacks/save?chatID=chat123&userID=user456',
        mockRequestBody,
      )
      result$.subscribe((response: any) => {
        expect(response).toEqual({ success: true })
      })
    })
  })

  describe('aiGlobalSearchFromInternet', () => {
    it('should call http.post with correct parameters using user_id', () => {
      const mockRequestBody = { query: 'internet search' }
      const mockChatId = 'chat123'
      const mockUserID = 'user456'
      const mockResponse = of({ results: [] })
      mockHttpClient.post.mockReturnValue(mockResponse)

      const result$ = service.aiGlobalSearchFromInternet(
        mockRequestBody,
        mockChatId,
        mockUserID,
      )

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/chatbot/v3/global/search?chatID=chat123&user_id=user456',
        mockRequestBody,
      )
      result$.subscribe((response: any) => {
        expect(response).toEqual({ results: [] })
      })
    })
  })

  describe('aiStartChathForSupport', () => {
    it('should call http.post with correct parameters and headers', () => {
      const mockRequestBody = { message: 'start chat' }
      const mockUserID = 'user456'
      const mockResponse = of({ chatId: 'new-chat-123' })
      mockHttpClient.post.mockReturnValue(mockResponse)

      const result$ = service.aiStartChathForSupport(mockRequestBody, mockUserID)

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/support/ai/chat/start',
        mockRequestBody,
        {
          headers: (expect as any).any(HttpHeaders),
        },
      )

      // Verify the headers were set correctly
      const callArgs = mockHttpClient.post.mock.calls[0]
      const options = callArgs[2]
      expect(options.headers instanceof HttpHeaders).toBe(true)
      result$.subscribe((response: any) => {
        expect(response).toEqual({ chatId: 'new-chat-123' })
      })
    })
  })

  describe('aiSendChathForSupport', () => {
    it('should call http.post with correct parameters and headers', () => {
      const mockRequestBody = { message: 'send message' }
      const mockUserID = 'user456'
      const mockResponse = of({ messageId: 'msg-123' })
      mockHttpClient.post.mockReturnValue(mockResponse)

      const result$ = service.aiSendChathForSupport(mockRequestBody, mockUserID)

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        '/apis/proxies/v8/support/ai/chat/send',
        mockRequestBody,
        {
          headers: (expect as any).any(HttpHeaders),
        },
      )

      // Verify the headers were set correctly
      const callArgs = mockHttpClient.post.mock.calls[0]
      const options = callArgs[2]
      expect(options.headers instanceof HttpHeaders).toBe(true)
      result$.subscribe((response: any) => {
        expect(response).toEqual({ messageId: 'msg-123' })
      })
    })
  })

  describe('Edge Cases', () => {
    it('should handle null/undefined values in setDiscussionConfig', () => {
      service.setDiscussionConfig(null)
      expect(service.discussionCnfig).toBeNull()

      service.setDiscussionConfig(undefined)
      expect(service.discussionCnfig).toBeUndefined()
    })

    it('should handle special characters in cookie names and values', () => {
      ; (document as any).cookie = 'special-cookie=value%20with%20spaces; normal=value'

      const result = service.getCookie('special-cookie')
      expect(result).toBe('value%20with%20spaces')
    })

    it('should handle empty cookie string', () => {
      ; (document as any).cookie = ''

      const result = service.getCookie('anyCookie')
      expect(result).toBe('')
    })

    it('should handle single cookie without semicolon', () => {
      ; (document as any).cookie = 'singleCookie=singleValue'

      const result = service.getCookie('singleCookie')
      expect(result).toBe('singleValue')
    })
  })
})