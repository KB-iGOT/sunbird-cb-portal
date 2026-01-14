import { of } from 'rxjs'
import { UserProfileService } from './user-profile.service'

describe('UserProfileService (unit)', () => {
  let mockHttp: any
  let mockTranslate: any
  let service: UserProfileService

  beforeEach(() => {
    mockHttp = {
      post: jest.fn().mockReturnValue(of({})),
      get: jest.fn().mockReturnValue(of({ result: { response: ['resp'] } })),
      patch: jest.fn().mockReturnValue(of({})),
    }

    mockTranslate = {
      instant: jest.fn().mockReturnValue('translated'),
      setDefaultLang: jest.fn(),
      use: jest.fn()
    }

    // ensure localStorage key is not set by default
    localStorage.removeItem('websiteLanguage')

    service = new UserProfileService(mockHttp, mockTranslate)
  })

  it('constructor does not call translate when no localStorage key', () => {
    expect(mockTranslate.setDefaultLang).not.toHaveBeenCalled()
    expect(mockTranslate.use).not.toHaveBeenCalled()
  })

  it('constructor triggers translate when websiteLanguage set', () => {
    localStorage.setItem('websiteLanguage', 'hi')
    const s2 = new UserProfileService(mockHttp, mockTranslate)
    expect(s2).toBeTruthy()
    expect(mockTranslate.setDefaultLang).toHaveBeenCalledWith('en')
    expect(mockTranslate.use).toHaveBeenCalledWith('hi')
    localStorage.removeItem('websiteLanguage')
  })

  it('handleTranslateTo builds key and calls translate.instant', () => {
    const res = service.handleTranslateTo('My Menu')
    expect(mockTranslate.instant).toHaveBeenCalledWith('profileInfo.MyMenu')
    expect(res).toBe('translated')
  })

  it('edit/update/get calls http with expected paths', () => {
    service.editProfileDetails({ a: 1 })
    expect(mockHttp.post).toHaveBeenCalled()

    service.updatePrimaryEmailDetails({})
    expect(mockHttp.post).toHaveBeenCalled()

    service.updateProfileDetails({})
    expect(mockHttp.patch).toHaveBeenCalled()

    service.getUserdetails('e@x')
    expect(mockHttp.post).toHaveBeenCalled()
  })

  it('getUserdetailsFromRegistry maps result to response', done => {
    mockHttp.get.mockReturnValue(of({ result: { response: ['u'] } }))
    service.getUserdetailsFromRegistry('wid').subscribe((res: any) => {
      expect(res).toEqual(['u'])
      done()
    })
  })

  it('withDrawRequest posts constructed payload', () => {
    const spy = mockHttp.post
    service.withDrawRequest('user1', 'wf1')
    expect(spy).toHaveBeenCalled()
    const payload = spy.mock.calls[spy.mock.calls.length - 1][1]
    expect(payload.action).toBe('WITHDRAW')
    expect(payload.wfId).toBe('wf1')
  })

  it('fetchEhrmsDetails maps result', done => {
    mockHttp.get.mockReturnValue(of({ data: 1 }))
    service.fetchEhrmsDetails().subscribe((r: any) => {
      expect(r).toEqual({ data: 1 })
      done()
    })
  })

  it('readCustomattributeDetails constructs correct url', () => {
    mockHttp.get.mockReturnValue(of({}))
    service.readCustomattributeDetails('u', 'org')
    const lastCall = mockHttp.get.mock.calls[mockHttp.get.mock.calls.length - 1][0]
    expect(lastCall).toContain('getAdditionalFields/u/org')
  })

  it('other simple getters call http methods', () => {
    service.getMasterLanguages()
    service.getMasterNationality()
    service.getMasterCountries()
    service.getProfilePageMeta()
    service.getOrganizationData({})
    service.readOrgData({})
    service.getAllDepartments()
    service.approveRequest({})
    service.listApprovalPendingFields()
    service.fetchApprovalPendingFields()
    service.fetchApprovedFields()
    service.listRejectedFields()
    service.getDesignations({})
    service.searchDesignation({})
    service.searchPublicDesignation({})
    service.searchIgotDesignation({})
    service.getDesignationV2({})
    service.uploadProfilePhoto({})
    service.getGroups()
    service.getApprovalReqs({})
    service.fetchCustomFields({})
    service.updateCustomFields({})
    expect(mockHttp.get).toHaveBeenCalled()
    expect(mockHttp.post).toHaveBeenCalled()
  })
})