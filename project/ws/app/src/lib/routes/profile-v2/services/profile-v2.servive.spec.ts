import { of } from 'rxjs'

import { ProfileV2Service } from './profile-v2.servive'

describe('ProfileV2Service (no TestBed)', () => {
  let service: ProfileV2Service
  let mockHttp: any

  beforeEach(() => {
    mockHttp = {
      get: jest.fn(),
      post: jest.fn(),
    }

    service = new ProfileV2Service(mockHttp)
  })

  it('should create service instance', () => {
    expect(service).toBeTruthy()
  })

  it('fetchDiscussProfile should GET discuss profile by wid', () => {
    mockHttp.get.mockReturnValue(of({}))
    service.fetchDiscussProfile('user-1').subscribe()
    expect(mockHttp.get).toHaveBeenCalledWith('/apis/protected/v8/discussionHub/users/user-1')
  })

  it('fetchProfile should GET user profile and map response', done => {
    const profile: any = { result: { response: { name: 'User' } } }
    mockHttp.get.mockReturnValue(of(profile))

    service.fetchProfile('user-1').subscribe(res => {
      expect(mockHttp.get)
        .toHaveBeenCalledWith('/apis/proxies/v8/api/user/v2/read/user-1')
      expect(res).toEqual(profile)
      done()
    })
  })

  it('fetchPost should POST to SOCIAL_VIEW_CONVERSATION', () => {
    const body: any = { id: 'post-1' }
    mockHttp.post.mockReturnValue(of({}))

    service.fetchPost(body).subscribe()
    expect(mockHttp.post).toHaveBeenCalledWith('/apis/protected/v8/social/post/viewConversation', body)
  })

  it('fetchCadre should GET cadre details', () => {
    mockHttp.get.mockReturnValue(of({}))
    service.fetchCadre().subscribe()
    expect(mockHttp.get).toHaveBeenCalledWith('/apis/proxies/v8/data/v2/system/settings/get/cadreConfig')
  })

  it('fetchApprovalDetails should POST approval search body', () => {
    mockHttp.post.mockReturnValue(of({}))

    service.fetchApprovalDetails().subscribe()

    expect(mockHttp.post).toHaveBeenCalledWith(
      '/apis/proxies/v8/workflow/v2/userWFApplicationFieldsSearch',
      {
        serviceName: 'profile',
        applicationStatus: 'SEND_FOR_APPROVAL',
      },
    )
  })

  it('withDrawApprovalRequest should POST constructed payload to withDrawRequest endpoint', () => {
    mockHttp.post.mockReturnValue(of({}))

    service.withDrawApprovalRequest('user-1', 'wf-1').subscribe()

    expect(mockHttp.post).toHaveBeenCalledWith(
      '/apis/protected/v8/workflowhandler/transition',
      {
        action: 'WITHDRAW',
        state: 'SEND_FOR_APPROVAL',
        userId: 'user-1',
        applicationId: 'user-1',
        actorUserId: 'user-1',
        wfId: 'wf-1',
        serviceName: 'profile',
        updateFieldValues: [],
        comment: '',
      },
    )
  })

  it('getFormV2ByID should GET form by id', () => {
    mockHttp.get.mockReturnValue(of({}))

    service.getFormV2ByID('form-1').subscribe()

    expect(mockHttp.get).toHaveBeenCalledWith(
      '/apis/proxies/v8/forms/v2/getFormById?formId=form-1',
    )
  })
})
