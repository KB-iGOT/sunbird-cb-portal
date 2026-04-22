/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { ApiService } from './api.service'
import { of } from 'rxjs'

// Mock AUTHORING_BASE constant
jest.mock('./../../../constants/apiEndpoints', () => ({
  AUTHORING_BASE: '/authoring/v1',
}))

describe('ApiService', () => {
  let service: ApiService
  let mockHttpClient: any

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
      delete: jest.fn(),
    }

    service = new ApiService(mockHttpClient)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('should create an instance', () => {
      expect(service).toBeTruthy()
    })

    it('should be defined', () => {
      expect(service).toBeDefined()
    })

    it('should store http reference', () => {
      expect((service as any).http).toBe(mockHttpClient)
    })
  })

  describe('base64', () => {
    it('should encode body when url starts with AUTHORING_BASE', () => {
      const url = '/authoring/v1/content/create'
      const body = { name: 'Test Content', type: 'Resource' }

      const result = service.base64(url, body)

      expect(result).toHaveProperty('data')
      expect(typeof result.data).toBe('string')
    })

    it('should return original body when url does not start with AUTHORING_BASE', () => {
      const url = '/api/v1/content/create'
      const body = { name: 'Test Content', type: 'Resource' }

      const result = service.base64(url, body)

      expect(result).toBe(body)
    })

    it('should encode simple object correctly', () => {
      const url = '/authoring/v1/test'
      const body = { key: 'value' }

      const result = service.base64(url, body)

      expect(result).toHaveProperty('data')
      expect(result.data).toBeTruthy()
    })

    it('should encode empty object', () => {
      const url = '/authoring/v1/test'
      const body = {}

      const result = service.base64(url, body)

      expect(result).toHaveProperty('data')
      expect(typeof result.data).toBe('string')
    })

    it('should encode object with nested properties', () => {
      const url = '/authoring/v1/test'
      const body = {
        parent: {
          child: {
            value: 'nested',
          },
        },
      }

      const result = service.base64(url, body)

      expect(result).toHaveProperty('data')
      expect(result.data).toBeTruthy()
    })

    it('should encode object with array properties', () => {
      const url = '/authoring/v1/test'
      const body = {
        items: [1, 2, 3, 4, 5],
        names: ['a', 'b', 'c'],
      }

      const result = service.base64(url, body)

      expect(result).toHaveProperty('data')
      expect(result.data).toBeTruthy()
    })

    it('should encode object with special characters', () => {
      const url = '/authoring/v1/test'
      const body = {
        text: 'Special: @#$%^&*()',
      }

      const result = service.base64(url, body)

      expect(result).toHaveProperty('data')
      expect(result.data).toBeTruthy()
    })

    it('should encode object with unicode characters', () => {
      const url = '/authoring/v1/test'
      const body = {
        text: 'Unicode: 你好世界',
      }

      const result = service.base64(url, body)

      expect(result).toHaveProperty('data')
      expect(result.data).toBeTruthy()
    })

    it('should encode object with null values', () => {
      const url = '/authoring/v1/test'
      const body = {
        nullValue: null,
        stringValue: 'test',
      }

      const result = service.base64(url, body)

      expect(result).toHaveProperty('data')
      expect(result.data).toBeTruthy()
    })

    it('should encode object with boolean values', () => {
      const url = '/authoring/v1/test'
      const body = {
        isActive: true,
        isDeleted: false,
      }

      const result = service.base64(url, body)

      expect(result).toHaveProperty('data')
      expect(result.data).toBeTruthy()
    })

    it('should encode object with number values', () => {
      const url = '/authoring/v1/test'
      const body = {
        count: 42,
        price: 99.99,
        negative: -10,
      }

      const result = service.base64(url, body)

      expect(result).toHaveProperty('data')
      expect(result.data).toBeTruthy()
    })

    it('should handle url with different AUTHORING_BASE path', () => {
      const url = '/authoring/v1/content/update'
      const body = { id: '123' }

      const result = service.base64(url, body)

      expect(result).toHaveProperty('data')
    })

    it('should return body unchanged for non-authoring url', () => {
      const url = '/api/content/create'
      const body = { name: 'Test' }

      const result = service.base64(url, body)

      expect(result).toEqual(body)
      expect(result).not.toHaveProperty('data')
    })
  })

  describe('get', () => {
    it('should call http.get with url', () => {
      const url = '/api/content/list'
      mockHttpClient.get.mockReturnValue(of({ result: [] }))

      service.get(url)

      expect(mockHttpClient.get).toHaveBeenCalledWith(url, undefined)
    })

    it('should call http.get with url and options', () => {
      const url = '/api/content/list'
      const options = { headers: { 'Content-Type': 'application/json' } }
      mockHttpClient.get.mockReturnValue(of({ result: [] }))

      service.get(url, options)

      expect(mockHttpClient.get).toHaveBeenCalledWith(url, options)
    })

    it('should return observable from http.get', () => {
      const url = '/api/content/list'
      const mockResponse = { result: [{ id: '1' }] }
      mockHttpClient.get.mockReturnValue(of(mockResponse))

      const result = service.get(url)

      expect(result).toBeDefined()
      result.subscribe((data) => {
        expect(data).toEqual(mockResponse)
      })
    })

    it('should handle get with empty options', () => {
      const url = '/api/content/list'
      mockHttpClient.get.mockReturnValue(of({}))

      service.get(url, {})

      expect(mockHttpClient.get).toHaveBeenCalledWith(url, {})
    })

    it('should handle get with null options', () => {
      const url = '/api/content/list'
      mockHttpClient.get.mockReturnValue(of({}))

      service.get(url, null)

      expect(mockHttpClient.get).toHaveBeenCalledWith(url, null)
    })

    it('should handle get with query parameters in options', () => {
      const url = '/api/content/search'
      const options = { params: { query: 'test', page: '1' } }
      mockHttpClient.get.mockReturnValue(of({}))

      service.get(url, options)

      expect(mockHttpClient.get).toHaveBeenCalledWith(url, options)
    })

    it('should call http.get exactly once', () => {
      const url = '/api/content/list'
      mockHttpClient.get.mockReturnValue(of({}))

      service.get(url)

      expect(mockHttpClient.get).toHaveBeenCalledTimes(1)
    })
  })

  describe('post', () => {
    it('should call http.post with encoded body for authoring url', () => {
      const url = '/authoring/v1/content/create'
      const body = { name: 'Test' }
      mockHttpClient.post.mockReturnValue(of({}))

      service.post(url, body)

      expect(mockHttpClient.post).toHaveBeenCalled()
      const callArgs = mockHttpClient.post.mock.calls[0]
      expect(callArgs[0]).toBe(url)
      expect(callArgs[1]).toHaveProperty('data')
    })

    it('should call http.post with original body when doEncoding is false', () => {
      const url = '/authoring/v1/content/create'
      const body = { name: 'Test' }
      mockHttpClient.post.mockReturnValue(of({}))

      service.post(url, body, false)

      expect(mockHttpClient.post).toHaveBeenCalledWith(url, body, undefined)
    })

    it('should call http.post with options', () => {
      const url = '/authoring/v1/content/create'
      const body = { name: 'Test' }
      const options = { headers: { 'Authorization': 'Bearer token' } }
      mockHttpClient.post.mockReturnValue(of({}))

      service.post(url, body, true, options)

      expect(mockHttpClient.post).toHaveBeenCalled()
      const callArgs = mockHttpClient.post.mock.calls[0]
      expect(callArgs[2]).toBe(options)
    })

    it('should return observable from http.post', () => {
      const url = '/authoring/v1/content/create'
      const body = { name: 'Test' }
      const mockResponse = { result: { id: '123' } }
      mockHttpClient.post.mockReturnValue(of(mockResponse))

      const result = service.post(url, body)

      expect(result).toBeDefined()
      result.subscribe((data) => {
        expect(data).toEqual(mockResponse)
      })
    })

    it('should handle post with non-authoring url', () => {
      const url = '/api/content/create'
      const body = { name: 'Test' }
      mockHttpClient.post.mockReturnValue(of({}))

      service.post(url, body)

      expect(mockHttpClient.post).toHaveBeenCalledWith(url, body, undefined)
    })

    it('should handle post with doEncoding false and options', () => {
      const url = '/authoring/v1/content/create'
      const body = { name: 'Test' }
      const options = { headers: {} }
      mockHttpClient.post.mockReturnValue(of({}))

      service.post(url, body, false, options)

      expect(mockHttpClient.post).toHaveBeenCalledWith(url, body, options)
    })

    it('should handle post with empty body', () => {
      const url = '/authoring/v1/content/create'
      const body = {}
      mockHttpClient.post.mockReturnValue(of({}))

      service.post(url, body)

      expect(mockHttpClient.post).toHaveBeenCalled()
    })

    it('should handle post with null body and doEncoding false', () => {
      const url = '/authoring/v1/content/create'
      const body = null
      mockHttpClient.post.mockReturnValue(of({}))

      service.post(url, body, false)

      expect(mockHttpClient.post).toHaveBeenCalledWith(url, null, undefined)
    })

    it('should call http.post exactly once', () => {
      const url = '/authoring/v1/content/create'
      const body = { name: 'Test' }
      mockHttpClient.post.mockReturnValue(of({}))

      service.post(url, body)

      expect(mockHttpClient.post).toHaveBeenCalledTimes(1)
    })

    it('should default doEncoding to true', () => {
      const url = '/authoring/v1/content/create'
      const body = { name: 'Test' }
      mockHttpClient.post.mockReturnValue(of({}))

      service.post(url, body)

      const callArgs = mockHttpClient.post.mock.calls[0]
      expect(callArgs[1]).toHaveProperty('data')
    })
  })

  describe('put', () => {
    it('should call http.put with encoded body for authoring url', () => {
      const url = '/authoring/v1/content/update'
      const body = { name: 'Updated' }
      mockHttpClient.put.mockReturnValue(of({}))

      service.put(url, body)

      expect(mockHttpClient.put).toHaveBeenCalled()
      const callArgs = mockHttpClient.put.mock.calls[0]
      expect(callArgs[0]).toBe(url)
      expect(callArgs[1]).toHaveProperty('data')
    })

    it('should call http.put with options', () => {
      const url = '/authoring/v1/content/update'
      const body = { name: 'Updated' }
      const options = { headers: { 'Content-Type': 'application/json' } }
      mockHttpClient.put.mockReturnValue(of({}))

      service.put(url, body, options)

      expect(mockHttpClient.put).toHaveBeenCalled()
      const callArgs = mockHttpClient.put.mock.calls[0]
      expect(callArgs[2]).toBe(options)
    })

    it('should return observable from http.put', () => {
      const url = '/authoring/v1/content/update'
      const body = { name: 'Updated' }
      const mockResponse = { result: { updated: true } }
      mockHttpClient.put.mockReturnValue(of(mockResponse))

      const result = service.put(url, body)

      expect(result).toBeDefined()
      result.subscribe((data) => {
        expect(data).toEqual(mockResponse)
      })
    })

    it('should handle put with non-authoring url', () => {
      const url = '/api/content/update'
      const body = { name: 'Updated' }
      mockHttpClient.put.mockReturnValue(of({}))

      service.put(url, body)

      expect(mockHttpClient.put).toHaveBeenCalledWith(url, body, undefined)
    })

    it('should handle put with empty body', () => {
      const url = '/authoring/v1/content/update'
      const body = {}
      mockHttpClient.put.mockReturnValue(of({}))

      service.put(url, body)

      expect(mockHttpClient.put).toHaveBeenCalled()
    })

    it('should handle put with null options', () => {
      const url = '/authoring/v1/content/update'
      const body = { name: 'Updated' }
      mockHttpClient.put.mockReturnValue(of({}))

      service.put(url, body, null)

      expect(mockHttpClient.put).toHaveBeenCalled()
    })

    it('should call http.put exactly once', () => {
      const url = '/authoring/v1/content/update'
      const body = { name: 'Updated' }
      mockHttpClient.put.mockReturnValue(of({}))

      service.put(url, body)

      expect(mockHttpClient.put).toHaveBeenCalledTimes(1)
    })
  })

  describe('patch', () => {
    it('should call http.patch with encoded body for authoring url', () => {
      const url = '/authoring/v1/content/patch'
      const body = { status: 'active' }
      mockHttpClient.patch.mockReturnValue(of({}))

      service.patch(url, body)

      expect(mockHttpClient.patch).toHaveBeenCalled()
      const callArgs = mockHttpClient.patch.mock.calls[0]
      expect(callArgs[0]).toBe(url)
      expect(callArgs[1]).toHaveProperty('data')
    })

    it('should call http.patch with options', () => {
      const url = '/authoring/v1/content/patch'
      const body = { status: 'active' }
      const options = { headers: { 'X-Custom-Header': 'value' } }
      mockHttpClient.patch.mockReturnValue(of({}))

      service.patch(url, body, options)

      expect(mockHttpClient.patch).toHaveBeenCalled()
      const callArgs = mockHttpClient.patch.mock.calls[0]
      expect(callArgs[2]).toBe(options)
    })

    it('should return observable from http.patch', () => {
      const url = '/authoring/v1/content/patch'
      const body = { status: 'active' }
      const mockResponse = { result: { patched: true } }
      mockHttpClient.patch.mockReturnValue(of(mockResponse))

      const result = service.patch(url, body)

      expect(result).toBeDefined()
      result.subscribe((data) => {
        expect(data).toEqual(mockResponse)
      })
    })

    it('should handle patch with non-authoring url', () => {
      const url = '/api/content/patch'
      const body = { status: 'active' }
      mockHttpClient.patch.mockReturnValue(of({}))

      service.patch(url, body)

      expect(mockHttpClient.patch).toHaveBeenCalledWith(url, body, undefined)
    })

    it('should handle patch with empty body', () => {
      const url = '/authoring/v1/content/patch'
      const body = {}
      mockHttpClient.patch.mockReturnValue(of({}))

      service.patch(url, body)

      expect(mockHttpClient.patch).toHaveBeenCalled()
    })

    it('should call http.patch exactly once', () => {
      const url = '/authoring/v1/content/patch'
      const body = { status: 'active' }
      mockHttpClient.patch.mockReturnValue(of({}))

      service.patch(url, body)

      expect(mockHttpClient.patch).toHaveBeenCalledTimes(1)
    })
  })

  describe('delete', () => {
    it('should call http.delete with url', () => {
      const url = '/authoring/v1/content/delete/123'
      mockHttpClient.delete.mockReturnValue(of({}))

      service.delete(url)

      expect(mockHttpClient.delete).toHaveBeenCalledWith(url, undefined)
    })

    it('should call http.delete with options', () => {
      const url = '/authoring/v1/content/delete/123'
      const options = { headers: { 'Authorization': 'Bearer token' } }
      mockHttpClient.delete.mockReturnValue(of({}))

      service.delete(url, options)

      expect(mockHttpClient.delete).toHaveBeenCalledWith(url, options)
    })

    it('should return observable from http.delete', () => {
      const url = '/authoring/v1/content/delete/123'
      const mockResponse = { result: { deleted: true } }
      mockHttpClient.delete.mockReturnValue(of(mockResponse))

      const result = service.delete(url)

      expect(result).toBeDefined()
      result.subscribe((data) => {
        expect(data).toEqual(mockResponse)
      })
    })

    it('should handle delete with empty options', () => {
      const url = '/authoring/v1/content/delete/123'
      mockHttpClient.delete.mockReturnValue(of({}))

      service.delete(url, {})

      expect(mockHttpClient.delete).toHaveBeenCalledWith(url, {})
    })

    it('should handle delete with null options', () => {
      const url = '/authoring/v1/content/delete/123'
      mockHttpClient.delete.mockReturnValue(of({}))

      service.delete(url, null)

      expect(mockHttpClient.delete).toHaveBeenCalledWith(url, null)
    })

    it('should call http.delete exactly once', () => {
      const url = '/authoring/v1/content/delete/123'
      mockHttpClient.delete.mockReturnValue(of({}))

      service.delete(url)

      expect(mockHttpClient.delete).toHaveBeenCalledTimes(1)
    })

    it('should handle non-authoring delete url', () => {
      const url = '/api/content/delete/123'
      mockHttpClient.delete.mockReturnValue(of({}))

      service.delete(url)

      expect(mockHttpClient.delete).toHaveBeenCalledWith(url, undefined)
    })
  })

  describe('integration scenarios', () => {
    it('should handle multiple get requests', () => {
      mockHttpClient.get.mockReturnValue(of({}))

      service.get('/api/content/1')
      service.get('/api/content/2')
      service.get('/api/content/3')

      expect(mockHttpClient.get).toHaveBeenCalledTimes(3)
    })

    it('should handle mixed request types', () => {
      mockHttpClient.get.mockReturnValue(of({}))
      mockHttpClient.post.mockReturnValue(of({}))
      mockHttpClient.put.mockReturnValue(of({}))
      mockHttpClient.delete.mockReturnValue(of({}))

      service.get('/api/content')
      service.post('/authoring/v1/content', {})
      service.put('/authoring/v1/content/1', {})
      service.delete('/api/content/1')

      expect(mockHttpClient.get).toHaveBeenCalledTimes(1)
      expect(mockHttpClient.post).toHaveBeenCalledTimes(1)
      expect(mockHttpClient.put).toHaveBeenCalledTimes(1)
      expect(mockHttpClient.delete).toHaveBeenCalledTimes(1)
    })

    it('should handle authoring and non-authoring urls differently', () => {
      mockHttpClient.post.mockReturnValue(of({}))
      const body = { test: 'data' }

      service.post('/authoring/v1/content', body)
      service.post('/api/content', body)

      const firstCall = mockHttpClient.post.mock.calls[0]
      const secondCall = mockHttpClient.post.mock.calls[1]

      expect(firstCall[1]).toHaveProperty('data')
      expect(secondCall[1]).toBe(body)
    })
  })

  describe('edge cases', () => {
    it('should handle very long url', () => {
      const url = '/authoring/v1/' + 'a'.repeat(1000)
      mockHttpClient.get.mockReturnValue(of({}))

      service.get(url)

      expect(mockHttpClient.get).toHaveBeenCalledWith(url, undefined)
    })

    it('should handle special characters in url', () => {
      const url = '/authoring/v1/content?id=123&name=test%20name'
      mockHttpClient.get.mockReturnValue(of({}))

      service.get(url)

      expect(mockHttpClient.get).toHaveBeenCalledWith(url, undefined)
    })

    it('should handle complex nested body in base64', () => {
      const url = '/authoring/v1/test'
      const body = {
        level1: {
          level2: {
            level3: {
              data: [1, 2, 3],
              nested: { value: 'deep' },
            },
          },
        },
      }

      const result = service.base64(url, body)

      expect(result).toHaveProperty('data')
      expect(typeof result.data).toBe('string')
    })

    it('should handle body with circular reference prevention', () => {
      const url = '/api/test'
      const body = { name: 'test' }

      const result = service.base64(url, body)

      expect(result).toBe(body)
    })
  })
})
