import { TncAppResolverService } from './tnc-app-resolver.service'
import { HttpClient } from '@angular/common/http'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { of, throwError } from 'rxjs'
import { NsTnc } from '../models/tnc.model'

describe('TncAppResolverService', () => {
  let service: TncAppResolverService
  let httpClientMock: jest.Mocked<HttpClient>
  let configSvcMock: ConfigurationsService

  beforeEach(() => {
    httpClientMock = {
      get: jest.fn(), // Mocking the 'get' method
    } as unknown as jest.Mocked<HttpClient> // Casting HttpClient as a jest.Mocked type

    configSvcMock = {
      userPreference: {
        selectedLocale: 'en',
      },
    } as unknown as ConfigurationsService

    service = new TncAppResolverService(httpClientMock, configSvcMock)
  })

  describe('resolve', () => {
    it('should return resolved data on success', (done) => {
      const mockResponse: NsTnc.ITnc = {
        isAccepted: false,
        termsAndConditions: []
      }
      const resolvedResponse = { data: mockResponse, error: null }

      // Mocking the response of the 'get' method
      httpClientMock.get.mockReturnValue(of(mockResponse))

      service.resolve().subscribe(response => {
        expect(response).toEqual(resolvedResponse)
        done()
      })
    })

    it('should return error data on failure', (done) => {
      const mockError = new Error('Network error')
      const resolvedResponse = { error: mockError, data: null }

      // Mocking the 'get' method to throw an error
      httpClientMock.get.mockReturnValue(throwError(mockError))

      service.resolve().subscribe(response => {
        expect(response).toEqual(resolvedResponse)
        done()
      })
    })

    it('should use empty locale when userPreference is null', (done) => {
      configSvcMock = {
        userPreference: null,
      } as unknown as ConfigurationsService
      service = new TncAppResolverService(httpClientMock, configSvcMock)

      const mockResponse: NsTnc.ITnc = { isAccepted: false, termsAndConditions: [] }
      httpClientMock.get.mockReturnValue(of(mockResponse))

      service.resolve().subscribe(() => {
        // When userPreference is null, locale stays '' so no ?locale= param
        expect(httpClientMock.get).toHaveBeenCalledWith('/apis/protected/v8/user/tnc')
        done()
      })
    })
  })

  describe('getTnc', () => {
    it('should call the correct URL with no locale', () => {
      service.getTnc()
      expect(httpClientMock.get).toHaveBeenCalledWith('/apis/protected/v8/user/tnc')
    })

    it('should call the correct URL with locale', () => {
      const locale = 'en'
      service.getTnc(locale)
      expect(httpClientMock.get).toHaveBeenCalledWith(`/apis/protected/v8/user/tnc?locale=${locale}`)
    })
  })
})
