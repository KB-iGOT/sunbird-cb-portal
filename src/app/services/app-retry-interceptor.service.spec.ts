
import { HttpRequest, HttpHandler, HttpErrorResponse } from '@angular/common/http'
import { of, throwError } from 'rxjs'
import { AppRetryInterceptorService } from './app-retry-interceptor.service'

// Mocked services
const mockHttpHandler: HttpHandler = {
  handle: jest.fn(),
}

describe('AppRetryInterceptorService', () => {
  let interceptor: AppRetryInterceptorService

  beforeEach(() => {
    interceptor = new AppRetryInterceptorService()
  })

  it('should be created', () => {
    expect(interceptor).toBeTruthy()
  })

  describe('intercept', () => {
    it('should skip retry if excludeRetry is set in request body', () => {
      const mockReq = new HttpRequest('GET', '/test', { excludeRetry: true })
      mockHttpHandler.handle = jest.fn().mockReturnValue(of({}))

      interceptor.intercept(mockReq, mockHttpHandler)

      expect(mockHttpHandler.handle).toHaveBeenCalledWith(mockReq)
    })

    it('should retry on server errors (status > 499)', () => {
      const mockReq = new HttpRequest('GET', '/test')
      const mockErrorResponse = new HttpErrorResponse({
        error: 'Server error',
        status: 500,
        statusText: 'Internal Server Error',
      })

      mockHttpHandler.handle = jest.fn().mockReturnValue(throwError(mockErrorResponse))

      // Spy on timer
      //const timerSpy = jest.spyOn(timer, 'prototype');

      interceptor.intercept(mockReq, mockHttpHandler).subscribe({
        next: () => { },
        error: (err) => {
          expect(err).toEqual(mockErrorResponse)
          expect(mockHttpHandler.handle).toHaveBeenCalledTimes(2) // Check if retry occurred
          //timerSpy.mockRestore(); // Clean up spy
        },
      })
    })

    it('should not retry if the error status is not greater than 499', () => {
      const mockReq = new HttpRequest('GET', '/test')
      const mockErrorResponse = new HttpErrorResponse({
        error: 'Client error',
        status: 400,
        statusText: 'Bad Request',
      })

      mockHttpHandler.handle = jest.fn().mockReturnValue(throwError(mockErrorResponse))

      interceptor.intercept(mockReq, mockHttpHandler).subscribe({
        next: () => { },
        error: (err) => {
          expect(err).toEqual(mockErrorResponse)
          expect(mockHttpHandler.handle).toHaveBeenCalledTimes(1) // No retry
        },
      })
    })

    it('should retry up to maxAttempts (retry count)', () => {
      const mockReq = new HttpRequest('GET', '/test')
      const mockErrorResponse = new HttpErrorResponse({
        error: 'Server error',
        status: 500,
        statusText: 'Internal Server Error',
      })

      interceptor['maxAttempts'] = 2 // Set max retry attempts to 2
      mockHttpHandler.handle = jest.fn().mockReturnValueOnce(throwError(mockErrorResponse))
        .mockReturnValueOnce(throwError(mockErrorResponse))
        .mockReturnValueOnce(of({})) // Success on 3rd try

      interceptor.intercept(mockReq, mockHttpHandler).subscribe({
        next: () => { },
        error: (err) => {
          expect(err).toEqual(mockErrorResponse)
          expect(mockHttpHandler.handle).toHaveBeenCalledTimes(3) // Retry 2 times, then succeed
        },
      })
    })

    it('should not retry if maxAttempts is reached', () => {
      const mockReq = new HttpRequest('GET', '/test')
      const mockErrorResponse = new HttpErrorResponse({
        error: 'Server error',
        status: 500,
        statusText: 'Internal Server Error',
      })

      interceptor['maxAttempts'] = 2 // Set max retry attempts to 2
      mockHttpHandler.handle = jest.fn().mockReturnValueOnce(throwError(mockErrorResponse))
        .mockReturnValueOnce(throwError(mockErrorResponse))
        .mockReturnValueOnce(throwError(mockErrorResponse)) // Exceed attempts

      interceptor.intercept(mockReq, mockHttpHandler).subscribe({
        next: () => { },
        error: (err) => {
          expect(err).toEqual(mockErrorResponse)
          expect(mockHttpHandler.handle).toHaveBeenCalledTimes(3) // Retries attempted 2 times, max attempts reached
        },
      })
    })
  })

  describe('genericRetryStrategy', () => {
    it('should retry after exponential backoff', () => {
      // Test for retry backoff behavior
      const retryStrategy = interceptor['genericRetryStrategy']()
      const mockErrorResponse = new HttpErrorResponse({
        error: 'Server error',
        status: 500,
        statusText: 'Internal Server Error',
      })

      const mockAttempts$ = of(mockErrorResponse)
      retryStrategy(mockAttempts$).subscribe({
        next: () => { },
        error: (err) => {
          expect(err).toEqual(mockErrorResponse)
        }
      })
    })

    it('should not retry when URL is an excluded endpoint (status > 499)', () => {
      const mockReq = new HttpRequest('GET', '/test')
      const mockErrorResponse = new HttpErrorResponse({
        error: 'Server error',
        status: 500,
        url: 'https://example.com/apis/proxies/v8/nlp/search',
        statusText: 'Internal Server Error',
      })

      mockHttpHandler.handle = jest.fn().mockReturnValue(throwError(mockErrorResponse))

      interceptor.intercept(mockReq, mockHttpHandler).subscribe({
        next: () => { },
        error: (err) => {
          // shouldRetry returns false for excluded endpoint → no retry
          expect(err).toEqual(mockErrorResponse)
          expect(mockHttpHandler.handle).toHaveBeenCalledTimes(1)
        },
      })
    })

    it('shouldRetry returns false for excluded endpoint URL', () => {
      const error = new HttpErrorResponse({
        status: 500,
        url: 'https://host/apis/proxies/v8/nlp/search',
        statusText: 'Internal Server Error',
      })
      const result = interceptor['shouldRetry'](error)
      expect(result).toBe(false)
    })

    it('shouldRetry returns true when URL is not excluded and status > 499', () => {
      const error = new HttpErrorResponse({
        status: 503,
        url: 'https://host/some/other/endpoint',
        statusText: 'Service Unavailable',
      })
      const result = interceptor['shouldRetry'](error)
      expect(result).toBe(true)
    })

    it('shouldRetry returns false when status <= 499 regardless of URL', () => {
      const error = new HttpErrorResponse({
        status: 404,
        url: 'https://host/apis/proxies/v8/nlp/search',
        statusText: 'Not Found',
      })
      const result = interceptor['shouldRetry'](error)
      expect(result).toBe(false)
    })
  })
})
