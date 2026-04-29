import { WidgetContentShareService } from './widget-content-share.service'
import { of } from 'rxjs'

jest.mock('@sunbird-cb/utils-v2', () => ({
  ConfigurationsService: class {
    sitePath = '/assets'
    userProfile = { userId: 'u1', email: 'user@test.com', userName: 'Test User', rootOrgId: 'org1', group: [] }
  },
}), { virtual: true })

describe('WidgetContentShareService', () => {
  let service: WidgetContentShareService
  let mockHttp: any
  let mockConfigSvc: any

  beforeEach(() => {
    mockHttp = {
      get: jest.fn(() => of({ result: {} })),
      post: jest.fn(() => of({ status: 'success' })),
    }
    mockConfigSvc = {
      sitePath: '/assets',
      userProfile: { userId: 'u1', email: 'user@test.com', userName: 'Test', rootOrgId: 'org1', group: [] },
    }
    service = new WidgetContentShareService(mockHttp, mockConfigSvc)
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('fetchConfigFile calls http.get with sitePath config file', () => {
    service.fetchConfigFile()
    expect(mockHttp.get).toHaveBeenCalledWith('/assets/feature/common.json')
  })

  it('contentShareNew posts req to content share endpoint', done => {
    const req: any = { contentId: 'c1', message: 'shared', sharedWith: ['u2'] }
    service.contentShareNew(req).subscribe(() => {
      expect(mockHttp.post).toHaveBeenCalledWith(
        expect.stringContaining('content'), req
      )
      done()
    })
  })

  it('shareContent calls http.post with email request', done => {
    const content: any = {
      identifier: 'c1',
      name: 'Test Content',
      contentType: 'Resource',
      mimeType: 'application/pdf',
      appUrl: 'http://app.url',
      track: [],
    }
    service.shareContent(content, [{ email: 'other@test.com' }], 'Check this out', 'share').subscribe(() => {
      expect(mockHttp.post).toHaveBeenCalledWith(
        expect.stringContaining('share'), expect.any(Object)
      )
      done()
    })
  })

  it('shareContent works without userProfile', done => {
    mockConfigSvc.userProfile = null
    const content: any = {
      identifier: 'c1', name: 'Test', contentType: 'Resource',
      mimeType: 'pdf', appUrl: 'http://app', track: [],
    }
    service.shareContent(content, [{ email: 'a@b.com' }], '', 'share').subscribe(() => {
      expect(mockHttp.post).toHaveBeenCalled()
      done()
    })
  })
})
