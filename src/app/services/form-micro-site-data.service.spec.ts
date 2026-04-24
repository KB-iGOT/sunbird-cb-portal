import { of, throwError } from 'rxjs'
import { Router } from '@angular/router'
import { FormMicroSiteDataService } from './form-micro-site-data.service'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { FormExtService } from './form-ext.service'

describe('FormMicroSiteDataService', () => {
  let service: FormMicroSiteDataService
  let mockConfigSvc: any
  let mockFormSvc: any
  let mockRouter: any

  beforeEach(() => {
    mockConfigSvc = {
      userProfile: {
        userRootOrg: null,
      },
    } as Partial<ConfigurationsService>

    mockFormSvc = {
      formReadData: jest.fn(),
    } as Partial<FormExtService>

    mockRouter = {
      navigateByUrl: jest.fn(),
    } as Partial<Router>

    service = new FormMicroSiteDataService(
      mockConfigSvc as ConfigurationsService,
      mockFormSvc as FormExtService,
      mockRouter as Router,
    )
    localStorage.clear()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should redirect and disable flag when localStorage data enabled is true', () => {
    const localData = {
      enabled: true,
      channelName: 'channel1',
      orgId: 'org1',
    }
    localStorage.setItem('microSiteRedirectionData', JSON.stringify(localData))

    const result = service.resolve({} as any, {} as any)

    expect(result).toBe(false)
    const stored = JSON.parse(
      localStorage.getItem('microSiteRedirectionData') || '{}',
    )
    expect(stored.enabled).toBe(false)
  })

  it('should return cached data when localStorage has data but enabled is false', () => {
    const localData = {
      enabled: false,
      channelName: 'channel1',
      orgId: 'org1',
    }
    localStorage.setItem('microSiteRedirectionData', JSON.stringify(localData))

    const result = service.resolve({} as any, {} as any)

    expect(result).toEqual({ data: localData, error: null })
    expect(mockFormSvc.formReadData).not.toHaveBeenCalled()
  })

  it('should return error when rootOrgId is empty and no local data', () => {
    mockConfigSvc.userProfile = { userRootOrg: {} }

    const result = service.resolve({} as any, {} as any)

    expect(result).toEqual({
      data: null,
      error: 'Root Organization ID is required',
    })
    expect(localStorage.getItem('microSiteRedirectionData')).toBeNull()
  })

  it('should return error when userRootOrg has keys but unknown ministryOrStateType', () => {
    mockConfigSvc.userProfile = {
      userRootOrg: { someKey: 'value' }, // keys exist but no ministryOrStateType
    }
    const result = service.resolve({} as any, {} as any)
    expect(result).toEqual({ data: null, error: 'Root Organization ID is required' })
  })

  it('should set rootOrgId from ministry or state and call API', done => {
    mockConfigSvc.userProfile = {
      userRootOrg: {
        ministryOrStateType: 'Ministry',
        ministryOrStateId: 'min1',
      },
    }

    const apiResponse = {
      result: {
        form: {
          data: {
            userRedirectionData: {
              enabled: false,
              channelName: 'ch',
              orgId: 'o1',
            },
          },
        },
      },
    }
      ; (mockFormSvc.formReadData as jest.Mock).mockReturnValue(of(apiResponse))

    const obs: any = service.resolve({} as any, {} as any)

    obs.subscribe((res: any) => {
      expect(mockFormSvc.formReadData).toHaveBeenCalled()
      expect(res).toEqual({
        data: apiResponse.result.form.data.userRedirectionData,
        error: null,
      })
      done()
    })
  })

  it('should set rootOrgId from spv and call API', done => {
    mockConfigSvc.userProfile = {
      userRootOrg: {
        ministryOrStateType: 'spv',
        rootOrgId: 'root-1',
      },
    }

    const apiResponse = {
      result: {
        form: {
          data: {
            userRedirectionData: {
              enabled: false,
            },
          },
        },
      },
    }
      ; (mockFormSvc.formReadData as jest.Mock).mockReturnValue(of(apiResponse))

    const obs: any = service.resolve({} as any, {} as any)

    obs.subscribe(() => {
      expect(mockFormSvc.formReadData).toHaveBeenCalledWith({
        request: {
          action: 'page-configuration',
          component: 'portal',
          rootOrgId: 'root-1',
          subType: 'microsite-v3',
          type: 'MDO-channel',
        },
      })
      done()
    })
  })

  it('should handle enabled true from API and redirect', done => {
    mockConfigSvc.userProfile = {
      userRootOrg: {
        ministryOrStateType: 'state',
        ministryOrStateId: 'm1',
      },
    }

    const apiResponse = {
      result: {
        form: {
          data: {
            userRedirectionData: {
              enabled: true,
              channelName: 'ch1',
              orgId: 'org1',
            },
          },
        },
      },
    }
      ; (mockFormSvc.formReadData as jest.Mock).mockReturnValue(of(apiResponse))

    const obs: any = service.resolve({} as any, {} as any)

    obs.subscribe((res: any) => {
      expect(res).toBe(false)
      const stored = JSON.parse(
        localStorage.getItem('microSiteRedirectionData') || '{}',
      )
      expect(stored.enabled).toBe(false)
      done()
    })
  })

  it('should handle API error and set localStorage disabled', done => {
    mockConfigSvc.userProfile = {
      userRootOrg: {
        ministryOrStateType: 'state',
        ministryOrStateId: 'm1',
      },
    }

    const error = new Error('api fail')
      ; (mockFormSvc.formReadData as jest.Mock).mockReturnValue(throwError(error))

    const obs: any = service.resolve({} as any, {} as any)

    obs.subscribe((res: any) => {
      expect(res).toEqual({ data: null, error })
      const stored = JSON.parse(
        localStorage.getItem('microSiteRedirectionData') || '{}',
      )
      expect(stored.enabled).toBe(false)
      done()
    })
  })

  it('should invoke router.navigateByUrl after setTimeout fires when localData enabled is true', () => {
    jest.useFakeTimers()
    const localData = { enabled: true, channelName: 'testChannel', orgId: 'testOrg' }
    localStorage.setItem('microSiteRedirectionData', JSON.stringify(localData))

    service.resolve({} as any, {} as any)
    expect(mockRouter.navigateByUrl).not.toHaveBeenCalled()

    jest.runAllTimers()
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith(
      '/app/learn/mdo-channels/testChannel/testOrg/v3/micro-sites',
    )
    jest.useRealTimers()
  })

  it('should invoke router.navigateByUrl after setTimeout fires when API returns enabled=true', done => {
    jest.useFakeTimers()
    mockConfigSvc.userProfile = {
      userRootOrg: {
        ministryOrStateType: 'state',
        ministryOrStateId: 'm2',
      },
    }
    const apiResponse = {
      result: {
        form: {
          data: {
            userRedirectionData: {
              enabled: true,
              channelName: 'apiChannel',
              orgId: 'apiOrg',
            },
          },
        },
      },
    }
      ; (mockFormSvc.formReadData as jest.Mock).mockReturnValue(of(apiResponse))

    const obs: any = service.resolve({} as any, {} as any)
    obs.subscribe((_res: any) => {
      jest.runAllTimers()
      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith(
        '/app/learn/mdo-channels/apiChannel/apiOrg/v3/micro-sites',
      )
      jest.useRealTimers()
      done()
    })
  })
})

