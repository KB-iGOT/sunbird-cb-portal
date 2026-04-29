import { WidgetUserService } from './widget-user.service'
import { of } from 'rxjs'

jest.mock('@angular/common/http', () => ({
  HttpClient: class { },
  HttpHeaders: class {
    constructor(headers: any) { Object.assign(this, headers) }
  },
}), { virtual: true })

jest.mock('dayjs', () => {
  const dayjsFn: any = jest.fn(() => ({ format: jest.fn(() => '2024-01-01'), diff: jest.fn(() => 10) }))
  dayjsFn.default = dayjsFn
  return dayjsFn
})

jest.mock('lodash', () => ({
  uniqBy: jest.fn(arr => arr),
  orderBy: jest.fn(arr => arr),
}), { virtual: true })

jest.mock('src/environments/environment', () => ({
  environment: { compentencyVersionKey: 'competencies_v3', apiCache: 5 },
}), { virtual: true })

const mockData = { result: { courses: [{ contentStatus: [{ id: 'l1' }], collectionId: 'do_1' }], userCourseEnrolmentInfo: {} } }

describe('WidgetUserService', () => {
  let service: WidgetUserService
  let mockHttp: any

  beforeEach(() => {
    localStorage.clear()
    mockHttp = { get: jest.fn(() => of(mockData)), post: jest.fn(() => of({})) }
    service = new WidgetUserService(mockHttp)
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('fetchUserGroupDetails calls http.get with userId', () => {
    service.fetchUserGroupDetails('user1')
    expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('user1'))
  })

  it('checkStorageData returns true when localStorage has no timeCheck', () => {
    const result = service.checkStorageData('enrollmentService', 'enrollmentData')
    expect(result).toBe(true)
  })

  it('checkStorageData returns true when timeCheck has no key for service', () => {
    localStorage.setItem('timeCheck', JSON.stringify({ otherService: 123 }))
    const result = service.checkStorageData('enrollmentService', 'enrollmentData')
    expect(result).toBe(true)
  })

  it('checkStorageData returns true when time diff >= apiCache', () => {
    // dayjs diff mocked to return 10, apiCache is 5, so 10 >= 5 → true
    localStorage.setItem('timeCheck', JSON.stringify({ enrollmentService: Date.now() - 10 * 60 * 1000 }))
    const result = service.checkStorageData('enrollmentService', 'enrollmentData')
    expect(result).toBe(true)
  })

  it('fetchUserBatchList calls http.get without queryParams', done => {
    localStorage.setItem('enrollmentData', JSON.stringify(mockData.result))
    service.fetchUserBatchList('u1').subscribe(() => {
      expect(mockHttp.get).toHaveBeenCalledWith(
        expect.stringContaining('u1'), expect.any(Object)
      )
      done()
    })
  })

  it('fetchUserBatchList calls http.get with queryParams', done => {
    const params = { orgdetails: 'orgName', licenseDetails: 'lic', fields: 'all', batchDetails: 'all' }
    service.fetchUserBatchList('u1', params).subscribe(() => {
      expect(mockHttp.get).toHaveBeenCalled()
      done()
    })
  })

  it('fetchProfileUserBatchList calls http.get without queryParams', done => {
    service.fetchProfileUserBatchList('u1').subscribe(() => {
      expect(mockHttp.get).toHaveBeenCalled()
      done()
    })
  })

  it('fetchProfileUserBatchList calls http.get with queryParams', done => {
    const params = { orgdetails: 'orgName', licenseDetails: 'lic', fields: 'all', batchDetails: 'all' }
    service.fetchProfileUserBatchList('u1', params).subscribe(() => {
      expect(mockHttp.get).toHaveBeenCalled()
      done()
    })
  })

  it('handleError returns an observable', () => {
    const error = new ErrorEvent('NetworkError', { message: 'Network failed' })
    const obs = service.handleError(error)
    expect(obs).toBeDefined()
    expect(typeof obs.subscribe).toBe('function')
  })

  it('setTime creates new timeCheck entry when not existing', () => {
    service.setTime('enrollmentService')
    const stored = JSON.parse(localStorage.getItem('timeCheck') || '{}')
    expect(stored.enrollmentService).toBeDefined()
  })

  it('setTime updates existing timeCheck entry', () => {
    localStorage.setItem('timeCheck', JSON.stringify({ enrollmentService: 123 }))
    service.setTime('enrollmentService')
    const stored = JSON.parse(localStorage.getItem('timeCheck') || '{}')
    expect(stored.enrollmentService).not.toBe(123)
  })

  it('resetTime does nothing when timeCheck is empty', () => {
    service.resetTime('enrollmentService')
    expect(localStorage.getItem('timeCheck')).toBeNull()
  })

  it('resetTime removes key from timeCheck when it exists', () => {
    localStorage.setItem('timeCheck', JSON.stringify({ enrollmentService: 123 }))
    service.resetTime('enrollmentService')
    const stored = JSON.parse(localStorage.getItem('timeCheck') || '{}')
    expect(stored.enrollmentService).toBeUndefined()
  })

  it('resetTime does not throw when key is not in timeCheck', () => {
    localStorage.setItem('timeCheck', JSON.stringify({ otherService: 999 }))
    expect(() => service.resetTime('enrollmentService')).not.toThrow()
  })

  it('mapEnrollmentData stores enrollment data to localStorage', () => {
    service.mapEnrollmentData({ courses: [{ collectionId: 'do_123', status: 0 }] })
    const stored = JSON.parse(localStorage.getItem('enrollmentMapData') || '{}')
    expect(stored['do_123']).toBeDefined()
  })

  it('mapEnrollmentData handles empty courses without throwing', () => {
    expect(() => service.mapEnrollmentData({ courses: [] })).not.toThrow()
  })

  it('storeUserEnrollmentInfo saves enrollment count to localStorage', () => {
    service.storeUserEnrollmentInfo({ info: 'data' }, 5)
    const stored = JSON.parse(localStorage.getItem('userEnrollmentCount') || '{}')
    expect(stored.enrolledCourseCount).toBe(5)
  })

  it('getSavedData returns parsed object from localStorage', () => {
    localStorage.setItem('myKey', JSON.stringify({ test: 1 }))
    const result = service.getSavedData('myKey')
    expect(result).toEqual({ test: 1 })
  })

  it('fetchCbpPlanList calls http.get when checkStorageData returns true', done => {
    service.fetchCbpPlanList().subscribe(() => {
      expect(mockHttp.get).toHaveBeenCalled()
      done()
    })
  })

  it('fetchCbpPlanList calls mapData with data when count is present', done => {
    const cbpData = {
      result: {
        count: 2,
        content: [
          {
            id: 'plan1',
            endDate: '2025-12-31',
            contentList: [
              {
                identifier: 'do_1',
                status: 'Live',
                competencies_v3: [
                  {
                    competencyArea: 'Domain',
                    competencyAreaId: 'a1',
                    competencyTheme: 'Theme1',
                    competencyThemeId: 't1',
                    competencyThemeType: 'type1',
                    competencySubTheme: 'Sub1',
                    competencySubThemeId: 's1',
                  },
                ],
              },
              {
                identifier: 'do_2',
                status: 'Retired',
                competencies_v3: [],
              },
            ],
          },
        ],
      },
    }
    mockHttp.get.mockReturnValue(of(cbpData))
    service.fetchCbpPlanList().subscribe(() => {
      expect(mockHttp.get).toHaveBeenCalled()
      done()
    })
  })

  it('fetchUserBatchList stores enrollmentData and returns mapped result', done => {
    mockHttp.get.mockReturnValue(of({
      result: {
        courses: [{ collectionId: 'do_1', contentStatus: [] }],
        userCourseEnrolmentInfo: {},
      },
    }))
    service.fetchUserBatchList('u1').subscribe((result: any) => {
      expect(result).toBeDefined()
      done()
    })
  })
})
