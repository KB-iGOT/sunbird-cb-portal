import { of, throwError } from 'rxjs'
import { SignupService } from './signup.service'

describe('SignupService', () => {
  let service: SignupService
  let httpClientMock: any

  beforeEach(() => {
    httpClientMock = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    }
    service = new SignupService(httpClientMock)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('should create an instance', () => {
      expect(service).toBeTruthy()
    })

    it('should be an instance of SignupService', () => {
      expect(service).toBeInstanceOf(SignupService)
    })
  })

  describe('signup', () => {
    it('should call http.post with correct endpoint and data', () => {
      const mockData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123',
      }
      const mockResponse = {
        result: {
          userId: 'user123',
          message: 'Signup successful',
        },
      }

      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.signup(mockData).subscribe()

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/public/v8/signup',
        mockData
      )
      expect(httpClientMock.post).toHaveBeenCalledTimes(1)
    })

    it('should return the result from response', (done) => {
      const mockData = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        password: 'SecurePass456',
      }
      const mockResponse = {
        result: {
          userId: 'user456',
          message: 'Account created successfully',
          status: 'success',
        },
      }

      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.signup(mockData).subscribe((result) => {
        expect(result).toEqual(mockResponse.result)
        expect(result.userId).toBe('user456')
        expect(result.message).toBe('Account created successfully')
        expect(result.status).toBe('success')
        done()
      })
    })

    it('should handle empty signup data', () => {
      const mockData = {}
      const mockResponse = {
        result: {
          error: 'Invalid data',
        },
      }

      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.signup(mockData).subscribe()

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/public/v8/signup',
        mockData
      )
    })

    it('should handle null signup data', () => {
      const mockData = null
      const mockResponse = {
        result: {
          error: 'Data required',
        },
      }

      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.signup(mockData).subscribe()

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/public/v8/signup',
        mockData
      )
    })

    it('should handle signup with minimal data', () => {
      const mockData = {
        email: 'minimal@example.com',
      }
      const mockResponse = {
        result: {
          userId: 'user789',
        },
      }

      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.signup(mockData).subscribe()

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/public/v8/signup',
        mockData
      )
    })

    it('should handle signup with additional fields', () => {
      const mockData = {
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice.johnson@example.com',
        password: 'StrongPass789',
        phone: '1234567890',
        address: '123 Main St',
        city: 'New York',
        country: 'USA',
      }
      const mockResponse = {
        result: {
          userId: 'user999',
          message: 'Registration complete',
        },
      }

      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.signup(mockData).subscribe()

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/public/v8/signup',
        mockData
      )
    })

    it('should handle http errors', (done) => {
      const mockData = {
        email: 'error@example.com',
        password: 'password',
      }
      const error = new Error('HTTP Error')

      httpClientMock.post.mockReturnValue(throwError(error))

      service.signup(mockData).subscribe(
        () => fail('should have failed'),
        (err) => {
          expect(err).toBe(error)
          done()
        }
      )
    })

    it('should handle 400 Bad Request error', (done) => {
      const mockData = {
        email: 'invalid-email',
        password: '123',
      }
      const error = {
        status: 400,
        message: 'Bad Request',
        error: {
          message: 'Invalid email format',
        },
      }

      httpClientMock.post.mockReturnValue(throwError(error))

      service.signup(mockData).subscribe(
        () => fail('should have failed'),
        (err) => {
          expect(err.status).toBe(400)
          expect(err.message).toBe('Bad Request')
          done()
        }
      )
    })

    it('should handle 409 Conflict error (user already exists)', (done) => {
      const mockData = {
        email: 'existing@example.com',
        password: 'password123',
      }
      const error = {
        status: 409,
        message: 'Conflict',
        error: {
          message: 'User already exists',
        },
      }

      httpClientMock.post.mockReturnValue(throwError(error))

      service.signup(mockData).subscribe(
        () => fail('should have failed'),
        (err) => {
          expect(err.status).toBe(409)
          expect(err.error.message).toBe('User already exists')
          done()
        }
      )
    })

    it('should handle 500 Internal Server Error', (done) => {
      const mockData = {
        email: 'test@example.com',
        password: 'password',
      }
      const error = {
        status: 500,
        message: 'Internal Server Error',
      }

      httpClientMock.post.mockReturnValue(throwError(error))

      service.signup(mockData).subscribe(
        () => fail('should have failed'),
        (err) => {
          expect(err.status).toBe(500)
          done()
        }
      )
    })

    it('should handle network errors', (done) => {
      const mockData = {
        email: 'network@example.com',
        password: 'password',
      }
      const error = {
        status: 0,
        message: 'Network error',
        error: {
          message: 'No internet connection',
        },
      }

      httpClientMock.post.mockReturnValue(throwError(error))

      service.signup(mockData).subscribe(
        () => fail('should have failed'),
        (err) => {
          expect(err.status).toBe(0)
          done()
        }
      )
    })

    it('should map response correctly with nested result', (done) => {
      const mockData = {
        email: 'nested@example.com',
        password: 'password',
      }
      const mockResponse = {
        result: {
          user: {
            id: 'nested123',
            email: 'nested@example.com',
          },
          token: 'jwt-token-here',
        },
      }

      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.signup(mockData).subscribe((result) => {
        expect(result).toEqual(mockResponse.result)
        expect(result.user.id).toBe('nested123')
        expect(result.token).toBe('jwt-token-here')
        done()
      })
    })

    it('should handle response with empty result', (done) => {
      const mockData = {
        email: 'empty@example.com',
        password: 'password',
      }
      const mockResponse = {
        result: {},
      }

      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.signup(mockData).subscribe((result) => {
        expect(result).toEqual({})
        done()
      })
    })

    it('should handle response with null result', (done) => {
      const mockData = {
        email: 'null@example.com',
        password: 'password',
      }
      const mockResponse = {
        result: null,
      }

      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.signup(mockData).subscribe((result) => {
        expect(result).toBeNull()
        done()
      })
    })

    it('should handle response with array result', (done) => {
      const mockData = {
        email: 'array@example.com',
        password: 'password',
      }
      const mockResponse = {
        result: ['item1', 'item2', 'item3'],
      }

      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.signup(mockData).subscribe((result) => {
        expect(result).toEqual(['item1', 'item2', 'item3'])
        expect(result.length).toBe(3)
        done()
      })
    })

    it('should handle signup with special characters in data', () => {
      const mockData = {
        firstName: "O'Brien",
        lastName: 'Smith-Jones',
        email: 'test+special@example.com',
        password: 'P@ssw0rd!#$',
      }
      const mockResponse = {
        result: {
          userId: 'special123',
        },
      }

      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.signup(mockData).subscribe()

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/public/v8/signup',
        mockData
      )
    })

    it('should handle signup with unicode characters', () => {
      const mockData = {
        firstName: '李明',
        lastName: '王',
        email: 'test@例え.jp',
        password: 'Password123',
      }
      const mockResponse = {
        result: {
          userId: 'unicode123',
        },
      }

      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.signup(mockData).subscribe()

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/public/v8/signup',
        mockData
      )
    })

    it('should handle multiple sequential signup calls', (done) => {
      const mockData1 = { email: 'user1@example.com', password: 'pass1' }
      const mockData2 = { email: 'user2@example.com', password: 'pass2' }
      const mockResponse1 = { result: { userId: 'user1' } }
      const mockResponse2 = { result: { userId: 'user2' } }

      httpClientMock.post
        .mockReturnValueOnce(of(mockResponse1))
        .mockReturnValueOnce(of(mockResponse2))

      service.signup(mockData1).subscribe((result1) => {
        expect(result1.userId).toBe('user1')

        service.signup(mockData2).subscribe((result2) => {
          expect(result2.userId).toBe('user2')
          expect(httpClientMock.post).toHaveBeenCalledTimes(2)
          done()
        })
      })
    })

    it('should handle signup with boolean fields', () => {
      const mockData = {
        email: 'test@example.com',
        password: 'password',
        acceptTerms: true,
        newsletter: false,
      }
      const mockResponse = {
        result: {
          userId: 'bool123',
        },
      }

      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.signup(mockData).subscribe()

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/public/v8/signup',
        mockData
      )
    })

    it('should handle signup with numeric fields', () => {
      const mockData = {
        email: 'test@example.com',
        password: 'password',
        age: 25,
        phoneNumber: 1234567890,
      }
      const mockResponse = {
        result: {
          userId: 'num123',
        },
      }

      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.signup(mockData).subscribe()

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/public/v8/signup',
        mockData
      )
    })

    it('should handle response with success status code', (done) => {
      const mockData = {
        email: 'success@example.com',
        password: 'password',
      }
      const mockResponse = {
        result: {
          userId: 'success123',
          statusCode: 200,
          message: 'Success',
        },
      }

      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.signup(mockData).subscribe((result) => {
        expect(result.statusCode).toBe(200)
        expect(result.message).toBe('Success')
        done()
      })
    })

    it('should not modify the input data', (done) => {
      const mockData = {
        email: 'test@example.com',
        password: 'password',
      }
      const originalData = { ...mockData }
      const mockResponse = {
        result: {
          userId: 'test123',
        },
      }

      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.signup(mockData).subscribe(() => {
        expect(mockData).toEqual(originalData)
        done()
      })
    })
  })
})
