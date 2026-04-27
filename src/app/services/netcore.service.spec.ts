import { NetCoreService } from './netcore.service'
import { HttpClient } from '@angular/common/http'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { of, throwError } from 'rxjs'
import moment from 'moment'

// Mock the global smartech function
const mockSmartech = jest.fn();
(global as any).smartech = mockSmartech

// Mock moment
jest.mock('moment', () => {
  const actualMoment = jest.requireActual('moment')
  return {
    __esModule: true,
    default: jest.fn(() => ({
      add: jest.fn().mockReturnThis(),
      format: jest.fn().mockReturnValue('2023-12-01 10:30:00')
    })),
    ...actualMoment
  }
})

describe('NetCoreService', () => {
  let service: NetCoreService
  let httpClientMock: jest.Mocked<HttpClient>
  let configSvcMock: jest.Mocked<ConfigurationsService>

  beforeEach(() => {
    // Create mocks
    httpClientMock = {
      post: jest.fn(),
      get: jest.fn()
    } as any

    configSvcMock = {
      sitePath: '/test/path'
    } as any

    // Create service instance
    service = new NetCoreService(httpClientMock, configSvcMock)

    // Clear all mocks
    jest.clearAllMocks()
  })

  describe('getOrgReadData', () => {
    it('should make POST request with correct payload and return mapped response', (done) => {
      const organisationId = 'test-org-id'
      const mockResponse = {
        result: {
          response: { data: 'test-data' }
        }
      }

      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.getOrgReadData(organisationId).subscribe((result: any) => {
        expect(httpClientMock.post).toHaveBeenCalledWith('/api/org/v1/read', {
          request: { organisationId }
        })
        expect(result).toEqual({ data: 'test-data' })
        done()
      })
    })

    it('should handle undefined response gracefully', (done) => {
      const organisationId = 'test-org-id'
      const mockResponse = {}

      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.getOrgReadData(organisationId).subscribe((result: any) => {
        expect(result).toBeUndefined()
        done()
      })
    })
  })

  describe('formReadData', () => {
    it('should make POST request to FORM_READ endpoint', (done) => {
      const request = { test: 'payload' }
      const mockResponse = { result: 'success' }

      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.formReadData(request).subscribe((result: any) => {
        expect(httpClientMock.post).toHaveBeenCalledWith('/apis/v1/form/read', request)
        expect(result).toEqual(mockResponse)
        done()
      })
    })
  })

  describe('netCoreConfigReadData', () => {
    it('should return form data when formReadData succeeds', (done) => {
      const payload = { test: 'payload' }
      const mockFormResponse = {
        result: {
          form: {
            data: { config: 'test-config' }
          }
        }
      }

      httpClientMock.post.mockReturnValue(of(mockFormResponse))

      service.netCoreConfigReadData(payload).subscribe((result: any) => {
        expect(result).toEqual({ config: 'test-config' })
        done()
      })
    })

    it('should fallback to netcore.json when formReadData fails', (done) => {
      const payload = { test: 'payload' }
      const fallbackData = { fallback: 'config' }

      httpClientMock.post.mockReturnValue(throwError('Form read error'))
      httpClientMock.get.mockReturnValue(of(fallbackData))

      service.netCoreConfigReadData(payload).subscribe((result: any) => {
        expect(httpClientMock.get).toHaveBeenCalledWith('/test/path/netcore.json')
        expect(result).toEqual(fallbackData)
        done()
      })
    })

    it('should handle fallback error gracefully', (done) => {
      const payload = { test: 'payload' }

      httpClientMock.post.mockReturnValue(throwError('Form read error'))
      httpClientMock.get.mockReturnValue(throwError('Fallback error'))

      service.netCoreConfigReadData(payload).subscribe((result: any) => {
        expect(result).toEqual({ data: null, error: 'Fallback error' })
        done()
      })
    })

    it('should handle null form data', (done) => {
      const payload = { test: 'payload' }
      const mockFormResponse = {
        result: {
          form: {
            data: null
          }
        }
      }

      httpClientMock.post.mockReturnValue(of(mockFormResponse))

      service.netCoreConfigReadData(payload).subscribe((result: any) => {
        expect(result).toBeNull()
        done()
      })
    })
  })

  describe('netCoreUserLoginSetup', () => {
    it('should call smartech with correct parameters', () => {
      const payload = { userId: 'test-user' }

      service.netCoreUserLoginSetup(payload)

      expect(mockSmartech).toHaveBeenCalledWith('contact', '', payload)
    })
  })

  describe('netCoreUserNameUpdate', () => {
    it('should call smartech with correct parameters', () => {
      const payload = { name: 'John Doe' }

      service.netCoreUserNameUpdate(payload)

      expect(mockSmartech).toHaveBeenCalledWith('contact', '', payload)
    })
  })

  describe('netCoreUserProfilePhotoUpdate', () => {
    it('should call smartech with correct parameters', () => {
      const payload = { photoUrl: 'test-url' }

      service.netCoreUserProfilePhotoUpdate(payload)

      expect(mockSmartech).toHaveBeenCalledWith('contact', '', payload)
    })
  })

  describe('netCoreUserProfilepdate', () => {
    it('should call smartech with correct parameters', () => {
      const payload = { profile: 'data' }

      service.netCoreUserProfilepdate(payload)

      expect(mockSmartech).toHaveBeenCalledWith('contact', '', payload)
    })
  })

  describe('netCoreUserProfileUpdateEvent', () => {
    it('should call smartech identify and dispatch with correct parameters', () => {
      const payload = { profile: 'data' }
      const eventName = 'profile_update'
      const userIdentifier = 'user123'

      service.netCoreUserProfileUpdateEvent(payload, eventName, userIdentifier)

      expect(mockSmartech).toHaveBeenCalledWith('identify', userIdentifier)
      expect(mockSmartech).toHaveBeenCalledWith('dispatch', eventName, payload)
      expect(mockSmartech).toHaveBeenCalledTimes(2)
    })
  })

  describe('trackEvent', () => {
    beforeEach(() => {
      // Reset the moment mock for each test
      const mockMoment = moment as jest.MockedFunction<typeof moment>
      mockMoment.mockReturnValue({
        add: jest.fn().mockReturnThis(),
        format: jest.fn().mockReturnValue('2023-12-01 10:30:00')
      } as any)
    })

    it('should track event with basic payload when no user payload provided', () => {
      const eventName = 'test_event'
      const userIdentifier = 'user123'

      service.trackEvent(eventName, userIdentifier)

      const expectedPayload = {
        action_time: '2023-12-01 10:30:00',
        action_device: 'Desktop'
      }

      expect(mockSmartech).toHaveBeenCalledWith('identify', userIdentifier)
      expect(mockSmartech).toHaveBeenCalledWith('dispatch', eventName, expectedPayload)
    })

    it('should include profile_attribute_updated when user payload is object', () => {
      const eventName = 'test_event'
      const userIdentifier = 'user123'
      const userPayload = { key: 'value' }

      service.trackEvent(eventName, userIdentifier, userPayload)

      const expectedPayload = {
        action_time: '2023-12-01 10:30:00',
        action_device: 'Desktop',
        profile_attribute_updated: '[object Object]'
      }

      expect(mockSmartech).toHaveBeenCalledWith('identify', userIdentifier)
      expect(mockSmartech).toHaveBeenCalledWith('dispatch', eventName, expectedPayload)
    })

    it('should include profile_attribute_updated when user payload is array', () => {
      const eventName = 'test_event'
      const userIdentifier = 'user123'
      const userPayload = ['item1', 'item2']

      service.trackEvent(eventName, userIdentifier, userPayload)

      const expectedPayload = {
        action_time: '2023-12-01 10:30:00',
        action_device: 'Desktop',
        profile_attribute_updated: 'item1,item2'
      }

      expect(mockSmartech).toHaveBeenCalledWith('identify', userIdentifier)
      expect(mockSmartech).toHaveBeenCalledWith('dispatch', eventName, expectedPayload)
    })

    it('should handle null user payload', () => {
      const eventName = 'test_event'
      const userIdentifier = 'user123'

      service.trackEvent(eventName, userIdentifier, null)

      const expectedPayload = {
        action_time: '2023-12-01 10:30:00',
        action_device: 'Desktop'
      }

      expect(mockSmartech).toHaveBeenCalledWith('identify', userIdentifier)
      expect(mockSmartech).toHaveBeenCalledWith('dispatch', eventName, expectedPayload)
    })

    it('should include profile_attribute_updated when user payload is a non-empty string', () => {
      const eventName = 'test_event'
      const userIdentifier = 'user123'
      const userPayload = 'profileData' // string: typeof !== 'object', but length is truthy

      service.trackEvent(eventName, userIdentifier, userPayload)

      const expectedPayload = {
        action_time: '2023-12-01 10:30:00',
        action_device: 'Desktop',
        profile_attribute_updated: 'profileData'
      }

      expect(mockSmartech).toHaveBeenCalledWith('identify', userIdentifier)
      expect(mockSmartech).toHaveBeenCalledWith('dispatch', eventName, expectedPayload)
    })
  })

  describe('trackEventForContentAndEvent', () => {
    beforeEach(() => {
      // Reset the moment mock for each test
      const mockMoment = moment as jest.MockedFunction<typeof moment>
      mockMoment.mockReturnValue({
        add: jest.fn().mockReturnThis(),
        format: jest.fn().mockReturnValue('2023-12-01 10:30:00')
      } as any)
    })

    it('should merge content payload with base payload', () => {
      const eventName = 'content_event'
      const userIdentifier = 'user123'
      const contentPayload = { contentId: 'content123', type: 'video' }

      service.trackEventForContentAndEvent(eventName, userIdentifier, contentPayload)

      const expectedPayload = {
        action_time: '2023-12-01 10:30:00',
        action_device: 'Desktop',
        contentId: 'content123',
        type: 'video'
      }

      expect(mockSmartech).toHaveBeenCalledWith('identify', userIdentifier)
      expect(mockSmartech).toHaveBeenCalledWith('dispatch', eventName, expectedPayload)
    })

    it('should handle empty content payload object', () => {
      const eventName = 'content_event'
      const userIdentifier = 'user123'
      const contentPayload = {}

      service.trackEventForContentAndEvent(eventName, userIdentifier, contentPayload)

      const expectedPayload = {
        action_time: '2023-12-01 10:30:00',
        action_device: 'Desktop'
      }

      expect(mockSmartech).toHaveBeenCalledWith('identify', userIdentifier)
      expect(mockSmartech).toHaveBeenCalledWith('dispatch', eventName, expectedPayload)
    })

    it('should handle empty object content payload (no keys)', () => {
      const eventName = 'content_event'
      const userIdentifier = 'user123'
      // When contentpayload is an empty object, Object.keys({}).length === 0, so it gets reset to {}
      // The merged payload is just the base payload since empty {} spread adds nothing
      const contentPayload = {}

      service.trackEventForContentAndEvent(eventName, userIdentifier, contentPayload)

      const expectedPayload = {
        action_time: '2023-12-01 10:30:00',
        action_device: 'Desktop'
      }

      expect(mockSmartech).toHaveBeenCalledWith('identify', userIdentifier)
      expect(mockSmartech).toHaveBeenCalledWith('dispatch', eventName, expectedPayload)
    })

    it('should prioritize content payload values over base payload when keys conflict', () => {
      const eventName = 'content_event'
      const userIdentifier = 'user123'
      const contentPayload = {
        action_device: 'Mobile', // This should override the base 'Desktop' value
        additionalData: 'test'
      }

      service.trackEventForContentAndEvent(eventName, userIdentifier, contentPayload)

      const expectedPayload = {
        action_time: '2023-12-01 10:30:00',
        action_device: 'Mobile', // Content payload should override
        additionalData: 'test'
      }

      expect(mockSmartech).toHaveBeenCalledWith('identify', userIdentifier)
      expect(mockSmartech).toHaveBeenCalledWith('dispatch', eventName, expectedPayload)
    })
  })

  describe('Time handling', () => {
    it('should add 5 hours and 30 minutes to current time', () => {
      const mockMomentInstance = {
        add: jest.fn().mockReturnThis(),
        format: jest.fn().mockReturnValue('2023-12-01 10:30:00')
      }

      const mockMoment = moment as jest.MockedFunction<typeof moment>
      mockMoment.mockReturnValue(mockMomentInstance as any)

      service.trackEvent('test', 'user123')

      expect(mockMomentInstance.add).toHaveBeenCalledWith(5, 'hours')
      expect(mockMomentInstance.add).toHaveBeenCalledWith(30, 'minutes')
      expect(mockMomentInstance.format).toHaveBeenCalledWith('YYYY-MM-DD HH:mm:ss')
    })
  })
})