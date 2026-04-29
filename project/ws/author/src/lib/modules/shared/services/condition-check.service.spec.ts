import { ConditionCheckService } from './condition-check.service'

function buildService() {
  return new ConditionCheckService()
}

describe('ConditionCheckService', () => {
  it('should create', () => {
    expect(buildService()).toBeTruthy()
  })

  it('checkConditionV2 - returns true when no conditions provided', () => {
    const svc = buildService()
    expect(svc.checkConditionV2({} as any, undefined)).toBe(true)
  })

  it('checkConditionV2 - returns true when empty conditions object', () => {
    const svc = buildService()
    expect(svc.checkConditionV2({} as any, {})).toBe(true)
  })

  it('checkConditionV2 - notFit matches content, returns false', () => {
    const svc = buildService()
    const content: any = { status: 'Draft' }
    const conditions = { notFit: [{ status: ['Draft'] }] }
    expect(svc.checkConditionV2(content, conditions as any)).toBe(false)
  })

  it('checkConditionV2 - notFit does not match, returns true', () => {
    const svc = buildService()
    const content: any = { status: 'Live' }
    const conditions = { notFit: [{ status: ['Draft'] }] }
    expect(svc.checkConditionV2(content, conditions as any)).toBe(true)
  })

  it('checkConditionV2 - fit matches content, returns true', () => {
    const svc = buildService()
    const content: any = { status: 'Live' }
    const conditions = { fit: [{ status: ['Live'] }] }
    expect(svc.checkConditionV2(content, conditions as any)).toBe(true)
  })

  it('checkConditionV2 - fit does not match content, returns false', () => {
    const svc = buildService()
    const content: any = { status: 'Draft' }
    const conditions = { fit: [{ status: ['Live'] }] }
    expect(svc.checkConditionV2(content, conditions as any)).toBe(false)
  })

  it('checkConditionV2 - both notFit and fit - notFit passes, fit matches', () => {
    const svc = buildService()
    const content: any = { status: 'Live' }
    const conditions = {
      notFit: [{ status: ['Draft'] }],
      fit: [{ status: ['Live'] }],
    }
    expect(svc.checkConditionV2(content, conditions as any)).toBe(true)
  })

  it('checkConditionV2 - both notFit and fit - notFit fails (content matches notFit)', () => {
    const svc = buildService()
    const content: any = { status: 'Draft' }
    const conditions = {
      notFit: [{ status: ['Draft'] }],
      fit: [{ status: ['Live'] }],
    }
    expect(svc.checkConditionV2(content, conditions as any)).toBe(false)
  })

  it('checkUniqueCondition - returns true when conditions include wildcard *', () => {
    const svc = buildService()
    const content: any = { status: 'Draft' }
    expect(svc.checkUniqueCondition(content, ['*'] as any)).toBe(true)
  })

  it('checkUniqueCondition - returns true when condition key matches content', () => {
    const svc = buildService()
    const content: any = { status: 'Live', contentType: 'Resource' }
    const conditions = [{ status: ['Live', 'Draft'] }]
    expect(svc.checkUniqueCondition(content, conditions as any)).toBe(true)
  })

  it('checkUniqueCondition - returns false when no condition matches content', () => {
    const svc = buildService()
    const content: any = { status: 'Retired' }
    const conditions = [{ status: ['Live', 'Draft'] }]
    expect(svc.checkUniqueCondition(content, conditions as any)).toBe(false)
  })

  it('checkUniqueCondition - multiple conditions, one matches', () => {
    const svc = buildService()
    const content: any = { status: 'InReview' }
    const conditions = [
      { status: ['Live'] },
      { status: ['InReview'] },
    ]
    expect(svc.checkUniqueCondition(content, conditions as any)).toBe(true)
  })

  it('checkUniqueCondition - returns false on exception', () => {
    const svc = buildService()
    // Pass null conditions to force an exception
    expect(svc.checkUniqueCondition(null as any, null as any)).toBe(false)
  })

  it('checkConditionV2 - empty fit array returns true', () => {
    const svc = buildService()
    const content: any = { status: 'Draft' }
    expect(svc.checkConditionV2(content, { fit: [] } as any)).toBe(true)
  })

  it('checkConditionV2 - empty notFit array returns true', () => {
    const svc = buildService()
    const content: any = { status: 'Draft' }
    expect(svc.checkConditionV2(content, { notFit: [] } as any)).toBe(true)
  })
})
