import { NotificationService } from './notification.service'
import { of } from 'rxjs'

jest.mock('@ws/author', () => ({ ApiService: jest.fn() }), { virtual: true })
jest.mock('@ws/author/src/lib/services/init.service', () => ({
  AuthInitService: jest.fn(),
}), { virtual: true })
jest.mock('@ws/author/src/lib/services/work-flow.service', () => ({
  WorkFlowService: jest.fn(),
}), { virtual: true })
jest.mock('@ws/author/src/lib/modules/shared/services/access-control.service', () => ({
  AccessControlService: jest.fn(),
}), { virtual: true })
jest.mock('../constants/apiEndpoints', () => ({
  NOTIFICATION: '/apis/proxies/v8/notification/v1/send',
  AUTHORING_BASE: '/authoring/v1/',
  ACTION_BASE: '/apis/proxies/v8/action/',
  AUTHORING_CONTENT_BASE: '/authoring/v1/content/',
}), { virtual: true })

function buildService(overrides: any = {}) {
  const mockApiService: any = {
    post: jest.fn().mockReturnValue(of({ ok: true })),
    ...overrides.apiService,
  }
  const mockWorkFlowService: any = {
    getWorkFlow: jest.fn().mockReturnValue(['Draft', 'InReview', 'Live']),
    getNextStatus: jest.fn().mockReturnValue('InReview'),
    getOwner: jest.fn().mockImplementation((status: string) => {
      if (status === 'Draft') return 'creatorContacts'
      if (status === 'InReview') return 'reviewerContacts'
      return null
    }),
    getActionName: jest.fn().mockImplementation((status: string) => {
      if (status === 'Draft') return 'Submit'
      if (status === 'InReview') return 'Approve'
      return null
    }),
    getOwnerName: jest.fn().mockImplementation((status: string) => {
      if (status === 'Draft') return 'Author'
      if (status === 'InReview') return 'Reviewer'
      return null
    }),
    ...overrides.workFlowService,
  }
  const mockAccessService: any = {
    userId: 'user1',
    ...overrides.accessService,
  }
  const mockInitService: any = {
    authAdditionalConfig: { allowNotification: true },
    ...overrides.initService,
  }
  const svc = new NotificationService(mockApiService, mockWorkFlowService, mockAccessService, mockInitService)
  return { svc, mockApiService, mockWorkFlowService, mockAccessService, mockInitService }
}

function buildContent(overrides: any = {}) {
  return {
    identifier: 'content1',
    name: 'Test Content',
    category: 'Resource',
    contentType: 'Resource',
    primaryCategory: 'Learning Resource',
    status: 'Draft',
    creatorContacts: [{ id: 'user1' }],
    reviewerContacts: [{ id: 'reviewer1' }],
    ...overrides,
  } as any
}

describe('NotificationService', () => {
  it('should create', () => {
    const { svc } = buildService()
    expect(svc).toBeTruthy()
  })

  it('triggerPushPullNotification - returns empty observable when allowNotification is false', (done) => {
    const { svc } = buildService({ initService: { authAdditionalConfig: { allowNotification: false } } })
    svc.triggerPushPullNotification(buildContent(), 'comment', true).subscribe((result: any) => {
      expect(result).toEqual({})
      done()
    })
  })

  it('triggerPushPullNotification - approved=true triggers send notification for Draft->InReview', (done) => {
    // 4-step workflow: workFlow.indexOf('InReview')=1 < workFlow.length-2=2 → sends to reviewer
    const { svc, mockApiService } = buildService({
      workFlowService: {
        getWorkFlow: jest.fn().mockReturnValue(['Draft', 'InReview', 'QualityCheck', 'Live']),
        getNextStatus: jest.fn().mockReturnValue('InReview'),
        getOwner: jest.fn().mockImplementation((status: string) => {
          if (status === 'Draft') return 'creatorContacts'
          if (status === 'InReview') return 'reviewerContacts'
          return null
        }),
        getActionName: jest.fn().mockReturnValue('Submit'),
        getOwnerName: jest.fn().mockReturnValue('Reviewer'),
      },
    })
    const content = buildContent({ status: 'Draft', reviewerContacts: [{ id: 'reviewer1' }] })
    svc.triggerPushPullNotification(content, 'review comment', true).subscribe(() => {
      expect(mockApiService.post).toHaveBeenCalled()
      done()
    })
  })

  it('triggerPushPullNotification - approved=false triggers reject notification', (done) => {
    const { svc, mockApiService } = buildService({
      workFlowService: {
        getWorkFlow: jest.fn().mockReturnValue(['Draft', 'InReview', 'Live']),
        getNextStatus: jest.fn().mockReturnValue('Live'),
        getOwner: jest.fn().mockImplementation((status: string) => {
          if (status === 'Draft') return 'creatorContacts'
          if (status === 'InReview') return 'reviewerContacts'
          return null
        }),
        getActionName: jest.fn().mockImplementation((status: string) => {
          if (status === 'Draft') return 'Submit'
          if (status === 'InReview') return 'Approve'
          return null
        }),
        getOwnerName: jest.fn().mockImplementation((status: string) => {
          if (status === 'Draft') return 'Author'
          if (status === 'InReview') return 'Reviewer'
          return null
        }),
      },
    })
    const content = buildContent({ status: 'InReview', creatorContacts: [{ id: 'user1' }], reviewerContacts: [{ id: 'reviewer1' }] })
    svc.triggerPushPullNotification(content, 'reject reason', false).subscribe(() => {
      expect(mockApiService.post).toHaveBeenCalled()
      done()
    })
  })

  it('triggerPushPullNotification - no nextStateOwner returns empty obs', (done) => {
    const { svc } = buildService({
      workFlowService: {
        getWorkFlow: jest.fn().mockReturnValue(['Draft', 'InReview', 'Live']),
        getNextStatus: jest.fn().mockReturnValue('InReview'),
        getOwner: jest.fn().mockReturnValue(null),
        getActionName: jest.fn().mockReturnValue('Submit'),
        getOwnerName: jest.fn().mockReturnValue(null),
      },
    })
    const content = buildContent({ status: 'Draft' })
    svc.triggerPushPullNotification(content, '', true).subscribe((result: any) => {
      expect(result).toEqual({})
      done()
    })
  })

  it('triggerPushPullNotification - reviewer stage transitions trigger approve notification', (done) => {
    // 5-step workflow: workFlow.indexOf('QualityCheck')=2 < workFlow.length-2=3 → triggers approve
    const { svc, mockApiService } = buildService({
      workFlowService: {
        getWorkFlow: jest.fn().mockReturnValue(['Draft', 'InReview', 'QualityCheck', 'Published', 'Live']),
        getNextStatus: jest.fn().mockReturnValue('QualityCheck'),
        getOwner: jest.fn().mockImplementation((s: string) => s === 'InReview' ? 'reviewerContacts' : 'qcContacts'),
        getActionName: jest.fn().mockReturnValue('Approve'),
        getOwnerName: jest.fn().mockReturnValue('Reviewer'),
      },
    })
    const content = buildContent({
      status: 'InReview',
      reviewerContacts: [{ id: 'rev1' }],
      qcContacts: [{ id: 'qc1' }],
    })
    svc.triggerPushPullNotification(content, 'approve', true).subscribe(() => {
      expect(mockApiService.post).toHaveBeenCalled()
      done()
    })
  })

  it('deleteContent - returns empty when allowNotification is false', (done) => {
    const { svc } = buildService({ initService: { authAdditionalConfig: { allowNotification: false } } })
    svc.deleteContent(buildContent(), 'deleted').subscribe((result: any) => {
      expect(result).toEqual({})
      done()
    })
  })

  it('deleteContent - calls api when allowNotification is true', (done) => {
    const { svc, mockApiService } = buildService()
    svc.deleteContent(buildContent({ status: 'Draft' }), 'reason').subscribe(() => {
      expect(mockApiService.post).toHaveBeenCalled()
      done()
    })
  })

  it('markForDeletion - returns empty when allowNotification is false', (done) => {
    const { svc } = buildService({ initService: { authAdditionalConfig: { allowNotification: false } } })
    svc.markForDeletion(buildContent(), 'mark').subscribe((result: any) => {
      expect(result).toEqual({})
      done()
    })
  })

  it('markForDeletion - calls api when allowNotification is true', (done) => {
    const { svc, mockApiService } = buildService()
    svc.markForDeletion(buildContent(), 'mark').subscribe(() => {
      expect(mockApiService.post).toHaveBeenCalled()
      done()
    })
  })

  it('unpublishContent - returns empty when allowNotification is false', (done) => {
    const { svc } = buildService({ initService: { authAdditionalConfig: { allowNotification: false } } })
    svc.unpublishContent(buildContent(), 'reason').subscribe((result: any) => {
      expect(result).toEqual({})
      done()
    })
  })

  it('moveToDraft - returns empty when allowNotification is false', (done) => {
    const { svc } = buildService({ initService: { authAdditionalConfig: { allowNotification: false } } })
    svc.moveToDraft(buildContent(), 'reason').subscribe((result: any) => {
      expect(result).toEqual({})
      done()
    })
  })

  it('moveToDraft - calls api when allowNotification is true', (done) => {
    const { svc, mockApiService } = buildService()
    svc.moveToDraft(buildContent(), 'reason').subscribe(() => {
      expect(mockApiService.post).toHaveBeenCalled()
      done()
    })
  })
})
