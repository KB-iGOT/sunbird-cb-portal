import { WorkFlowService } from './work-flow.service'

jest.mock('@ws/author/src/lib/modules/shared/services/access-control.service', () => ({
  AccessControlService: jest.fn(),
}), { virtual: true })
jest.mock('@ws/author/src/lib/modules/shared/services/condition-check.service', () => ({
  ConditionCheckService: jest.fn(),
}), { virtual: true })
jest.mock('@ws/author/src/lib/services/init.service', () => ({
  AuthInitService: jest.fn(),
}), { virtual: true })

function buildService(overrides: any = {}) {
  const mockInitService: any = {
    workFlowTable: [
      {
        conditions: { fit: [{ contentType: ['Resource'] }] },
        workFlow: ['Draft', 'InReview', 'Live'],
      },
    ],
    ownerDetails: [
      { status: ['Draft', 'Live'], owner: 'creatorContacts', name: 'Author', actionName: 'Submit', relatedActions: [] },
      { status: ['InReview'], owner: 'reviewerContacts', name: 'Reviewer', actionName: 'Publish', relatedActions: [] },
    ],
    optimizedWorkFlow: {
      allow: false,
      conditions: {},
    },
    ...overrides.initService,
  }
  const mockConditionSvc: any = {
    checkConditionV2: jest.fn().mockReturnValue(true),
    ...overrides.conditionService,
  }
  const mockAccessControlSvc: any = {
    userId: 'user1',
    ...overrides.accessControl,
  }
  const svc = new WorkFlowService(mockInitService, mockConditionSvc, mockAccessControlSvc)
  return { svc, mockInitService, mockConditionSvc, mockAccessControlSvc }
}

describe('WorkFlowService', () => {
  it('should create', () => {
    const { svc } = buildService()
    expect(svc).toBeTruthy()
  })

  it('getWorkFlow - returns workflow for matching content', () => {
    const { svc } = buildService()
    const content: any = { contentType: 'Resource', status: 'Draft' }
    expect(svc.getWorkFlow(content)).toEqual(['Draft', 'InReview', 'Live'])
  })

  it('getNextStatus - simple workflow (<=3 steps) returns Live', () => {
    const { svc } = buildService()
    const content: any = { contentType: 'Resource', status: 'Draft' }
    expect(svc.getNextStatus(content)).toBe('Live')
  })

  it('getNextStatus - longer workflow, not optimized, returns next in flow', () => {
    const { svc } = buildService({
      initService: {
        workFlowTable: [{
          conditions: {},
          workFlow: ['Draft', 'InReview', 'QualityCheck', 'Live'],
        }],
        ownerDetails: [
          { status: ['Draft'], owner: 'creatorContacts', name: 'Author', actionName: 'Submit', relatedActions: [] },
          { status: ['InReview'], owner: 'reviewerContacts', name: 'Reviewer', actionName: 'Approve', relatedActions: [] },
          { status: ['QualityCheck'], owner: 'qcContacts', name: 'QC', actionName: 'Publish', relatedActions: [] },
          { status: ['Live'], owner: null, name: 'Publisher', actionName: null, relatedActions: [] },
        ],
        optimizedWorkFlow: { allow: false, conditions: {} },
      },
    })
    const content: any = { status: 'Draft', contentType: 'Resource' }
    const result = svc.getNextStatus(content)
    expect(result).toBe('InReview')
  })

  it('isOptimised - returns false when optimizedWorkFlow.allow is false', () => {
    const { svc } = buildService()
    const content: any = { contentType: 'Resource', status: 'Draft' }
    expect(svc.isOptimised(content)).toBe(false)
  })

  it('isOptimised - returns true when allow is true and condition matches', () => {
    const { svc } = buildService({
      initService: {
        workFlowTable: [{ conditions: {}, workFlow: ['Draft', 'Live'] }],
        ownerDetails: [{ status: ['Draft', 'Live'], owner: null, name: 'A', actionName: null, relatedActions: [] }],
        optimizedWorkFlow: { allow: true, conditions: {} },
      },
    })
    const content: any = { contentType: 'Resource', status: 'Draft' }
    expect(svc.isOptimised(content)).toBe(true)
  })

  it('getOwner - returns owner for matching status', () => {
    const { svc } = buildService()
    expect(svc.getOwner('Draft')).toBe('creatorContacts')
  })

  it('getOwner - returns reviewer owner for InReview', () => {
    const { svc } = buildService()
    expect(svc.getOwner('InReview')).toBe('reviewerContacts')
  })

  it('getActionName - returns actionName for matching status', () => {
    const { svc } = buildService()
    expect(svc.getActionName('Draft')).toBe('Submit')
  })

  it('getNextStatus - optimized workflow, at index 0, skips to next non-owned status', () => {
    // User owns 'InReview', so index skips from 0→1→2 (QualityCheck not owned by user)
    const { svc } = buildService({
      initService: {
        workFlowTable: [{
          conditions: {},
          workFlow: ['Draft', 'InReview', 'QualityCheck', 'Live'],
        }],
        ownerDetails: [
          { status: ['Draft'], owner: 'creatorContacts', name: 'Author', actionName: 'Submit', relatedActions: [] },
          { status: ['InReview'], owner: 'reviewerContacts', name: 'Reviewer', actionName: 'Approve', relatedActions: [] },
          { status: ['QualityCheck'], owner: 'qcContacts', name: 'QC', actionName: 'Publish', relatedActions: [] },
          { status: ['Live'], owner: null, name: 'Publisher', actionName: null, relatedActions: [] },
        ],
        optimizedWorkFlow: { allow: true, conditions: {} },
      },
      accessControl: { userId: 'reviewer1' },
    })
    // Content at Draft (index 0), reviewer1 owns InReview → skip to QualityCheck
    const content: any = {
      status: 'Draft',
      contentType: 'Resource',
      reviewerContacts: [{ id: 'reviewer1' }],
      qcContacts: [],
    }
    // index=0 → set to 1; owner of InReview is reviewerContacts, user owns it → skip to 2
    // owner of QualityCheck is qcContacts, user does NOT own it → stop at 2
    expect(svc.getNextStatus(content)).toBe('QualityCheck')
  })

  it('getNextStatus - optimized workflow, at last index, resets to index 1', () => {
    const { svc } = buildService({
      initService: {
        workFlowTable: [{
          conditions: {},
          workFlow: ['Draft', 'InReview', 'QualityCheck', 'Live'],
        }],
        ownerDetails: [
          { status: ['Draft'], owner: 'creatorContacts', name: 'A', actionName: 'Submit', relatedActions: [] },
          { status: ['InReview'], owner: 'reviewerContacts', name: 'R', actionName: 'Approve', relatedActions: [] },
          { status: ['QualityCheck'], owner: 'qcContacts', name: 'Q', actionName: 'Publish', relatedActions: [] },
          { status: ['Live'], owner: null, name: 'L', actionName: null, relatedActions: [] },
        ],
        optimizedWorkFlow: { allow: true, conditions: {} },
      },
      accessControl: { userId: 'newuser' },
    })
    const content: any = {
      status: 'Live',
      contentType: 'Resource',
      reviewerContacts: [],
      qcContacts: [],
    }
    // index=3 (last) → set to 1; owner of InReview is reviewerContacts, user NOT in it → stop at 1
    expect(svc.getNextStatus(content)).toBe('InReview')
  })

  it('getNextStatus - non-optimized workflow > 3 steps returns next index directly', () => {
    const { svc } = buildService({
      initService: {
        workFlowTable: [{
          conditions: {},
          workFlow: ['Draft', 'InReview', 'QualityCheck', 'Live'],
        }],
        ownerDetails: [
          { status: ['Draft'], owner: null, name: 'A', actionName: 'Submit', relatedActions: [] },
          { status: ['InReview'], owner: null, name: 'R', actionName: 'Approve', relatedActions: [] },
          { status: ['QualityCheck'], owner: null, name: 'Q', actionName: 'Publish', relatedActions: [] },
          { status: ['Live'], owner: null, name: 'L', actionName: null, relatedActions: [] },
        ],
        optimizedWorkFlow: { allow: false, conditions: {} },
      },
    })
    const content: any = { status: 'InReview', contentType: 'Resource' }
    // index=1, not optimized → returns workflow[2] = 'QualityCheck'
    expect(svc.getNextStatus(content)).toBe('QualityCheck')
  })
})
