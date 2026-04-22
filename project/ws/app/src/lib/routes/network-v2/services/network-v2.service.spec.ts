import { of } from 'rxjs'
import { NetworkV2Service } from './network-v2.service'
import { NSNetworkDataV2 } from '../models/network-v2.model'

describe('NetworkV2Service (no TestBed)', () => {
  let service: NetworkV2Service
  let httpClientMock: any

  beforeEach(() => {
    httpClientMock = {
      get: jest.fn(),
      post: jest.fn(),
    }

    service = new NetworkV2Service(httpClientMock)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should create the service', () => {
    expect(service).toBeDefined()
  })

  it('should have headers configured with cache control', () => {
    expect(service.headers).toBeDefined()
    expect(service.headers.get('Cache-Control')).toBe('no-cache, no-store, must-revalidate, post-check=0, pre-check=0')
    expect(service.headers.get('Pragma')).toBe('no-cache')
    expect(service.headers.get('Expires')).toBe('0')
  })

  describe('fetchProfile', () => {
    it('should call http.get with correct URL and userId', () => {
      const userId = 'user-123'
      const mockProfile: NSNetworkDataV2.IProfile = {
        id: 'profile-123',
        userId: 'user-123',
        academics: [],
        employmentDetails: {
          allotmentYearOfService: '2020',
          cadre: 'IAS',
          civilListNo: 'CL123',
          departmentName: 'Finance',
          dojOfService: '2020-01-01',
          employeeCode: 'EMP123',
          officialPostalAddress: 'Address',
          osCreatedAt: '2020-01-01',
          osCreatedBy: 'system',
          osUpdatedAt: '2020-01-01',
          osUpdatedBy: 'system',
          osid: 'osid-123',
          payType: 'monthly',
          pinCode: '123456',
          service: 'Civil Service',
        },
        interests: [],
        photo: 'photo.jpg',
        osCreatedAt: '2020-01-01',
        osCreatedBy: 'system',
        osUpdatedAt: '2020-01-01',
        osUpdatedBy: 'system',
        verifiedKarmayogiBadge: true,
        osid: 'osid-profile-123',
        personalDetails: {
          firstName: 'John',
          category: 'General',
          countryCode: '+91',
          dob: '1990-01-01',
          domicileMedium: 'English',
          firstname: 'John',
          lasttname: 'Doe',
          gender: 'Male',
          knownLanguages: ['English', 'Hindi'],
          maritalStatus: 'Single',
          middlename: '',
          mobile: 9876543210,
          nationality: 'Indian',
          officialEmail: 'john@gov.in',
          osCreatedAt: '2020-01-01',
          osCreatedBy: 'system',
          osUpdatedAt: '2020-01-01',
          osUpdatedBy: 'system',
          osid: 'osid-personal-123',
          personalEmail: 'john@email.com',
          pincode: '123456',
          postalAddress: 'Address',
          primaryEmail: 'john@gov.in',
          surname: 'Doe',
          telephone: '1234567890',
        },
        professionalDetails: [],
        skills: [],
      }

      httpClientMock.get.mockReturnValue(of(mockProfile))

      service.fetchProfile(userId).subscribe((result: any) => {
        expect(result).toEqual(mockProfile)
      })

      expect(httpClientMock.get).toHaveBeenCalledWith(`/apis/proxies/v8/api/user/v2/read/${userId}`)
    })

    it('should return profile data through pipe and map', (done) => {
      const userId = 'user-456'
      const mockProfile: any = {
        id: 'profile-456',
        userId: 'user-456',
        personalDetails: {
          firstName: 'Jane',
          firstname: 'Jane',
          lasttname: 'Smith',
          surname: 'Smith',
          primaryEmail: 'jane@gov.in',
        } as any,
        osid: 'osid-456',
        photo: null,
        interests: [],
        skills: [],
        professionalDetails: [],
      }

      httpClientMock.get.mockReturnValue(of(mockProfile))

      service.fetchProfile(userId).subscribe((result: any) => {
        expect(result).toBeDefined()
        expect(result.userId).toBe('user-456')
        expect(httpClientMock.get).toHaveBeenCalled()
        done()
      })
    })
  })

  describe('fetchAllConnectionRequests', () => {
    it('should call http.get with correct URL and headers', () => {
      const mockResponse: NSNetworkDataV2.IConnectionRequestResponse = {
        size: 10,
        offset: 0,
        result: {
          data: [],
        },
      }

      httpClientMock.get.mockReturnValue(of(mockResponse))

      service.fetchAllConnectionRequests().subscribe((result: any) => {
        expect(result).toEqual(mockResponse)
      })

      expect(httpClientMock.get).toHaveBeenCalledWith(
        '/apis/protected/v8/connections/v2/connections/requested',
        { headers: service.headers }
      )
    })

    it('should return connection requests with data', (done) => {
      const mockUser: NSNetworkDataV2.INetworkUser = {
        employmentDetails: {
          departmentName: 'IT',
        } as any,
        personalDetails: {
          firstName: 'Test',
          firstname: 'Test',
        } as any,
        verifiedKarmayogi: true,
        id: 'user-123',
        photo: 'photo.jpg',
        identifier: 'id-123',
        name: 'Test User',
        departmentName: 'IT',
        department: 'IT',
        department_name: 'IT',
        email: 'test@example.com',
        first_name: 'Test',
        kid: 'kid-123',
        last_name: 'User',
        rank: 1,
        wid: 'wid-123',
        firstName: 'Test',
        lastName: 'User',
        channel: 'default',
        requestSent: false,
        fullName: 'Test User',
        role: ['user'],
      }

      const mockResponse: NSNetworkDataV2.IConnectionRequestResponse = {
        size: 1,
        offset: 0,
        result: {
          data: [mockUser],
        },
      }

      httpClientMock.get.mockReturnValue(of(mockResponse))

      service.fetchAllConnectionRequests().subscribe((result: any) => {
        expect(result.result.data.length).toBe(1)
        expect(result.result.data[0].id).toBe('user-123')
        done()
      })
    })
  })

  describe('fetchAllReceivedConnectionRequests', () => {
    it('should call http.get with correct URL and headers', () => {
      const mockRequest: NSNetworkDataV2.IConnectionRequest = {
        employmentDetails: {
          departmentName: 'HR',
        } as any,
        personalDetails: {
          firstName: 'Alice',
          firstname: 'Alice',
        } as any,
        id: 'user-789',
        photo: 'alice.jpg',
      }

      httpClientMock.get.mockReturnValue(of(mockRequest))

      service.fetchAllReceivedConnectionRequests().subscribe((result: any) => {
        expect(result).toEqual(mockRequest)
      })

      expect(httpClientMock.get).toHaveBeenCalledWith(
        '/apis/protected/v8/connections/v2/connections/requests/received',
        { headers: service.headers }
      )
    })

    it('should return received connection requests', (done) => {
      const mockRequest: NSNetworkDataV2.IConnectionRequest = {
        employmentDetails: {
          departmentName: 'Finance',
          cadre: 'IFS',
        } as any,
        personalDetails: {
          firstName: 'Bob',
          firstname: 'Bob',
          surname: 'Johnson',
        } as any,
        id: 'user-999',
        photo: null,
      }

      httpClientMock.get.mockReturnValue(of(mockRequest))

      service.fetchAllReceivedConnectionRequests().subscribe((result: any) => {
        expect(result.id).toBe('user-999')
        expect(result.personalDetails.firstName).toBe('Bob')
        done()
      })
    })
  })

  describe('fetchAllRecommendedUsers', () => {
    it('should call http.post with correct URL and request data', () => {
      const mockData: NSNetworkDataV2.IRecommendedUserReq = {
        size: 10,
        offset: 0,
        search: [
          {
            field: 'department',
            values: ['IT', 'Finance'],
          },
        ],
      }

      const mockResponse = {
        data: [],
      }

      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.fetchAllRecommendedUsers(mockData).subscribe((result: any) => {
        expect(result).toEqual(mockResponse)
      })

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/protected/v8/connections/v2/connections/recommended',
        mockData
      )
    })

    it('should return recommended users based on search criteria', (done) => {
      const mockData: NSNetworkDataV2.IRecommendedUserReq = {
        offset: 0,
        search: [
          {
            field: 'skills',
            values: ['Java', 'Python'],
          },
        ],
      }

      const mockResponse: any = {
        data: [
          {
            field: 'skills',
            results: [
              {
                id: 'user-recommended-1',
                name: 'Recommended User',
                department: 'Tech',
              } as any,
            ],
          },
        ],
      }

      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.fetchAllRecommendedUsers(mockData).subscribe((result: any) => {
        expect(result.data.length).toBeGreaterThan(0)
        expect(result.data[0].field).toBe('skills')
        done()
      })
    })
  })

  describe('fetchAllSuggestedUsers', () => {
    it('should call http.get with correct URL', () => {
      const mockResponse = {
        data: [],
      }

      httpClientMock.get.mockReturnValue(of(mockResponse))

      service.fetchAllSuggestedUsers().subscribe((result: any) => {
        expect(result).toEqual(mockResponse)
      })

      expect(httpClientMock.get).toHaveBeenCalledWith(
        '/apis/protected/v8/connections/v2/connections/suggests'
      )
    })

    it('should return suggested users list', (done) => {
      const mockResponse: any = {
        data: [
          {
            id: 'suggested-1',
            name: 'Suggested User 1',
            email: 'suggested1@example.com',
          },
          {
            id: 'suggested-2',
            name: 'Suggested User 2',
            email: 'suggested2@example.com',
          },
        ],
      }

      httpClientMock.get.mockReturnValue(of(mockResponse))

      service.fetchAllSuggestedUsers().subscribe((result: any) => {
        expect(result.data.length).toBe(2)
        expect(result.data[0].id).toBe('suggested-1')
        done()
      })
    })
  })

  describe('createConnection', () => {
    it('should call http.post with correct URL and data', () => {
      const mockData = {
        userId: 'user-123',
        targetUserId: 'user-456',
        message: 'Let\'s connect!',
      }

      const mockResponse = {
        success: true,
        connectionId: 'conn-123',
      }

      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.createConnection(mockData).subscribe((result: any) => {
        expect(result).toEqual(mockResponse)
      })

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/protected/v8/connections/v2/add/connection',
        mockData
      )
    })

    it('should handle connection creation with different data structures', (done) => {
      const mockData: any = {
        from: 'user-alice',
        to: 'user-bob',
        status: 'pending',
        timestamp: new Date().toISOString(),
      }

      const mockResponse: any = {
        success: true,
        message: 'Connection request sent',
        id: 'new-connection-789',
      }

      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.createConnection(mockData).subscribe((result: any) => {
        expect(result.success).toBe(true)
        expect(result.id).toBe('new-connection-789')
        done()
      })
    })
  })

  describe('updateConnection', () => {
    it('should call http.post with correct URL and update data', () => {
      const mockData = {
        connectionId: 'conn-123',
        status: 'accepted',
      }

      const mockResponse = {
        success: true,
        updatedConnection: mockData,
      }

      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.updateConnection(mockData).subscribe((result: any) => {
        expect(result).toEqual(mockResponse)
      })

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/apis/protected/v8/connections/v2/update/connection',
        mockData
      )
    })

    it('should handle connection update with rejection status', (done) => {
      const mockData: any = {
        connectionId: 'conn-456',
        status: 'rejected',
        reason: 'Not interested',
      }

      const mockResponse: any = {
        success: true,
        message: 'Connection rejected',
      }

      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.updateConnection(mockData).subscribe((result: any) => {
        expect(result.success).toBe(true)
        expect(result.message).toBe('Connection rejected')
        done()
      })
    })

    it('should handle connection update with accepted status', (done) => {
      const mockData: any = {
        connectionId: 'conn-789',
        status: 'accepted',
        acceptedAt: new Date().toISOString(),
      }

      const mockResponse: any = {
        success: true,
        message: 'Connection established',
        connectionId: 'conn-789',
      }

      httpClientMock.post.mockReturnValue(of(mockResponse))

      service.updateConnection(mockData).subscribe((result: any) => {
        expect(result.message).toBe('Connection established')
        expect(result.connectionId).toBe('conn-789')
        done()
      })
    })
  })

  describe('fetchAllConnectionEstablished', () => {
    it('should call http.get with correct URL and headers', () => {
      const mockResponse: NSNetworkDataV2.IEstablishedConnectResopnse = {
        data: [],
      }

      httpClientMock.get.mockReturnValue(of(mockResponse))

      service.fetchAllConnectionEstablished().subscribe((result: any) => {
        expect(result).toEqual(mockResponse)
      })

      expect(httpClientMock.get).toHaveBeenCalledWith(
        '/apis/protected/v8/connections/v2/connections/established',
        { headers: service.headers }
      )
    })

    it('should return all established connections', (done) => {
      const mockUser1: NSNetworkDataV2.INetworkUser = {
        employmentDetails: {
          departmentName: 'Engineering',
        } as any,
        personalDetails: {
          firstName: 'Engineer',
          firstname: 'Engineer',
        } as any,
        verifiedKarmayogi: true,
        id: 'eng-1',
        photo: 'eng1.jpg',
        identifier: 'eng-id-1',
        name: 'Engineer One',
        departmentName: 'Engineering',
        department: 'Engineering',
        department_name: 'Engineering',
        email: 'eng1@example.com',
        first_name: 'Engineer',
        kid: 'kid-eng1',
        last_name: 'One',
        rank: 5,
        wid: 'wid-eng1',
        firstName: 'Engineer',
        lastName: 'One',
        channel: 'default',
        requestSent: false,
        fullName: 'Engineer One',
        role: ['engineer'],
      }

      const mockResponse: NSNetworkDataV2.IEstablishedConnectResopnse = {
        data: [mockUser1],
      }

      httpClientMock.get.mockReturnValue(of(mockResponse))

      service.fetchAllConnectionEstablished().subscribe((result: any) => {
        expect(result.data.length).toBe(1)
        expect(result.data[0].name).toBe('Engineer One')
        done()
      })
    })
  })

  describe('fetchAllConnectionEstablishedById', () => {
    it('should call http.get with correct URL including wid and headers', () => {
      const wid = 'wid-specific-123'
      const mockResponse: NSNetworkDataV2.IEstablishedConnectResopnse = {
        data: [],
      }

      httpClientMock.get.mockReturnValue(of(mockResponse))

      service.fetchAllConnectionEstablishedById(wid).subscribe((result: any) => {
        expect(result).toEqual(mockResponse)
      })

      expect(httpClientMock.get).toHaveBeenCalledWith(
        `/apis/protected/v8/connections/v2/connections/established/${wid}`,
        { headers: service.headers }
      )
    })

    it('should return established connections for specific user', (done) => {
      const wid = 'wid-user-999'
      const mockUser: NSNetworkDataV2.INetworkUser = {
        employmentDetails: {
          departmentName: 'Sales',
        } as any,
        personalDetails: {
          firstName: 'Sales',
          firstname: 'Sales',
          surname: 'Manager',
        } as any,
        verifiedKarmayogi: false,
        id: 'sales-1',
        photo: null,
        identifier: 'sales-id-1',
        name: 'Sales Manager',
        departmentName: 'Sales',
        department: 'Sales',
        department_name: 'Sales',
        email: 'sales@example.com',
        first_name: 'Sales',
        kid: 'kid-sales',
        last_name: 'Manager',
        rank: 3,
        wid: 'wid-sales',
        firstName: 'Sales',
        lastName: 'Manager',
        channel: 'default',
        requestSent: false,
        fullName: 'Sales Manager',
        role: ['manager'],
      }

      const mockResponse: NSNetworkDataV2.IEstablishedConnectResopnse = {
        data: [mockUser],
      }

      httpClientMock.get.mockReturnValue(of(mockResponse))

      service.fetchAllConnectionEstablishedById(wid).subscribe((result: any) => {
        expect(result.data.length).toBe(1)
        expect(result.data[0].wid).toBe('wid-sales')
        expect(result.data[0].department).toBe('Sales')
        done()
      })
    })

    it('should handle numeric wid parameter', (done) => {
      const wid = 12345
      const mockResponse: NSNetworkDataV2.IEstablishedConnectResopnse = {
        data: [],
      }

      httpClientMock.get.mockReturnValue(of(mockResponse))

      service.fetchAllConnectionEstablishedById(wid).subscribe((result: any) => {
        expect(result.data).toEqual([])
        expect(httpClientMock.get).toHaveBeenCalledWith(
          `/apis/protected/v8/connections/v2/connections/established/${wid}`,
          { headers: service.headers }
        )
        done()
      })
    })
  })

  describe('API Endpoint Usage', () => {
    it('should use correct API endpoint for profile fetch', () => {
      httpClientMock.get.mockReturnValue(of({}))
      service.fetchProfile('test-user').subscribe()

      const callUrl = httpClientMock.get.mock.calls[0][0]
      expect(callUrl).toContain('/apis/proxies/v8/api/user/v2/read/')
    })

    it('should use correct API endpoint for connection requests', () => {
      httpClientMock.get.mockReturnValue(of({ result: { data: [] } }))
      service.fetchAllConnectionRequests().subscribe()

      const callUrl = httpClientMock.get.mock.calls[0][0]
      expect(callUrl).toBe('/apis/protected/v8/connections/v2/connections/requested')
    })

    it('should use correct API endpoint for recommended users', () => {
      const mockData: NSNetworkDataV2.IRecommendedUserReq = {
        offset: 0,
        search: [{ field: 'test', values: [] }],
      }

      httpClientMock.post.mockReturnValue(of({}))
      service.fetchAllRecommendedUsers(mockData).subscribe()

      const callUrl = httpClientMock.post.mock.calls[0][0]
      expect(callUrl).toBe('/apis/protected/v8/connections/v2/connections/recommended')
    })
  })

  describe('HTTP Method Usage', () => {
    it('should use GET method for fetching data', () => {
      httpClientMock.get.mockReturnValue(of({}))
      service.fetchAllSuggestedUsers().subscribe()

      expect(httpClientMock.get).toHaveBeenCalled()
      expect(httpClientMock.post).not.toHaveBeenCalled()
    })

    it('should use POST method for creating connections', () => {
      httpClientMock.post.mockReturnValue(of({}))
      service.createConnection({ test: 'data' }).subscribe()

      expect(httpClientMock.post).toHaveBeenCalled()
      expect(httpClientMock.get).not.toHaveBeenCalled()
    })

    it('should use POST method for updating connections', () => {
      httpClientMock.post.mockReturnValue(of({}))
      service.updateConnection({ test: 'update' }).subscribe()

      expect(httpClientMock.post).toHaveBeenCalled()
      expect(httpClientMock.get).not.toHaveBeenCalled()
    })
  })

  describe('Headers Usage', () => {
    it('should include headers when fetching connection requests', () => {
      httpClientMock.get.mockReturnValue(of({ result: { data: [] } }))
      service.fetchAllConnectionRequests().subscribe()

      const options = httpClientMock.get.mock.calls[0][1]
      expect(options.headers).toBeDefined()
      expect(options.headers).toBe(service.headers)
    })

    it('should include headers when fetching established connections', () => {
      httpClientMock.get.mockReturnValue(of({ data: [] }))
      service.fetchAllConnectionEstablished().subscribe()

      const options = httpClientMock.get.mock.calls[0][1]
      expect(options.headers).toBeDefined()
    })

    it('should include headers when fetching connections by id', () => {
      httpClientMock.get.mockReturnValue(of({ data: [] }))
      service.fetchAllConnectionEstablishedById('test-wid').subscribe()

      const options = httpClientMock.get.mock.calls[0][1]
      expect(options.headers).toBeDefined()
    })
  })
})
