import { of, throwError } from 'rxjs'
import { CustomHomeFormResolverService } from './custom-home-form-resolver.service'

describe('CustomHomeFormResolverService (Jest, no TestBed)', () => {
  let service: CustomHomeFormResolverService
  let mockFormSvc: any

  beforeEach(() => {
    mockFormSvc = {
      formReadData: jest.fn()
    } as any

    service = new CustomHomeFormResolverService(mockFormSvc)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should call formReadData with mapped deptId when id is ec and return data on success', (done) => {
    const route: any = {
      paramMap: {
        get: (key: string) => key === 'id' ? 'ec' : null
      }
    }
    const state: any = {}

    const apiResponse: any = {
      result: {
        form: {
          data: { some: 'config' }
        }
      }
    }

    mockFormSvc.formReadData.mockReturnValue(of(apiResponse))

    service.resolve(route, state).subscribe((res: any) => {
      expect(mockFormSvc.formReadData).toHaveBeenCalledTimes(1)
      const calledWith = mockFormSvc.formReadData.mock.calls[0][0]
      expect(calledWith.request.subType).toBe('iiidem')
      expect(res).toEqual({ data: apiResponse.result.form.data, error: null })
      done()
    })
  })

  it('should use route id directly when not ec and return data', (done) => {
    const route: any = {
      paramMap: {
        get: (key: string) => key === 'id' ? 'finance' : null
      }
    }
    const state: any = {}

    const apiResponse: any = {
      result: {
        form: {
          data: { dept: 'finance' }
        }
      }
    }

    mockFormSvc.formReadData.mockReturnValue(of(apiResponse))

    service.resolve(route, state).subscribe((res: any) => {
      const calledWith = mockFormSvc.formReadData.mock.calls[0][0]
      expect(calledWith.request.subType).toBe('finance')
      expect(res).toEqual({ data: apiResponse.result.form.data, error: null })
      done()
    })
  })

  it('should handle error from formReadData and return error object', (done) => {
    const route: any = {
      paramMap: {
        get: (_key: string) => 'dept1'
      }
    }
    const state: any = {}

    const mockError: any = new Error('API failure')
    mockFormSvc.formReadData.mockReturnValue(throwError(mockError))

    service.resolve(route, state).subscribe((res: any) => {
      expect(mockFormSvc.formReadData).toHaveBeenCalled()
      expect(res).toEqual({ error: mockError, data: null })
      done()
    })
  })
})
