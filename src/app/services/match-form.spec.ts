import { IFormCatalog, IFormUserContext, matchForm, selectRoleBucket } from './match-form'
import { FORM_CATALOG_SAMPLE as sample } from './__fixtures__/form-catalog.sample'

const catalog = sample as unknown as IFormCatalog

function user(overrides: Partial<{ roles: string[]; rootOrgId: string; designation: string; ministryOrStateType: string }> = {}): IFormUserContext {
  const roles = overrides.roles || ['PUBLIC']
  const profile: any = { rootOrgId: overrides.rootOrgId || 'org-1', profileDetails: {} }
  if (overrides.designation) {
    profile.profileDetails.professionalDetails = [{ designation: overrides.designation }]
  }
  if (overrides.ministryOrStateType) {
    profile.profileDetails.ministryOrStateType = overrides.ministryOrStateType
  }
  return { roles, profile }
}

describe('selectRoleBucket', () => {
  it('is public by default and when both roles are present', () => {
    expect(selectRoleBucket(['PUBLIC'])).toBe('public')
    expect(selectRoleBucket(['PUBLIC', 'VOLUNTEER'])).toBe('public')
    expect(selectRoleBucket(['MDO_ADMIN'])).toBe('public')
    expect(selectRoleBucket([])).toBe('public')
  })
  it('is volunteer only when volunteer and not public', () => {
    expect(selectRoleBucket(['VOLUNTEER'])).toBe('volunteer')
    expect(selectRoleBucket(['volunteer', 'CONTENT_CREATOR'])).toBe('volunteer')
  })
})

describe('matchForm against sampleOutput.json', () => {
  it('ministry Director gets the ministry designation sheet (40)', () => {
    const u = user({ designation: 'Director', ministryOrStateType: 'ministry' })
    expect(matchForm(catalog, u, 'home', 2)!.id).toBe(40)
  })

  it('state Secretary gets the state designation sheet (43)', () => {
    const u = user({ designation: 'Secretary', ministryOrStateType: 'state' })
    expect(matchForm(catalog, u, 'home', 2)!.id).toBe(43)
  })

  it('designation matches but ministryOrStateType mismatches → wildcard form (30)', () => {
    const u = user({ designation: 'Director', ministryOrStateType: 'state' })
    expect(matchForm(catalog, u, 'home', 2)!.id).toBe(30)
  })

  it('designation matches but user has no ministryOrStateType → falls back to wildcard form (30)', () => {
    const u = user({ designation: 'Director' })
    expect(matchForm(catalog, u, 'home', 2)!.id).toBe(30)
  })

  it('plain public user with no designation → 30', () => {
    expect(matchForm(catalog, user(), 'home', 2)!.id).toBe(30)
  })

  it('volunteer-only user reads the volunteer bucket (33)', () => {
    expect(matchForm(catalog, user({ roles: ['VOLUNTEER'] }), 'home', 2)!.id).toBe(33)
  })

  it('user with both roles is treated as public (30)', () => {
    expect(matchForm(catalog, user({ roles: ['PUBLIC', 'VOLUNTEER'] }), 'home', 2)!.id).toBe(30)
  })

  it('clientVersion is respected and tolerant of 1 vs 1.0', () => {
    expect(matchForm(catalog, user(), 'home', 1)!.id).toBe(3)
    expect(matchForm(catalog, user(), 'home', '1.0')!.id).toBe(3)
    expect(matchForm(catalog, user(), 'global-web', 2.0)!.id).toBe(28)
    expect(matchForm(catalog, user(), 'globalenv', 1)!.id).toBe(55)
  })

  it('returns null for an unknown subType / version', () => {
    expect(matchForm(catalog, user(), 'nope', 1)).toBeNull()
    expect(matchForm(catalog, user(), 'home', 9)).toBeNull()
  })

  it('returns null when catalogue or user is missing', () => {
    expect(matchForm(null, user(), 'home', 2)).toBeNull()
    expect(matchForm(catalog, null, 'home', 2)).toBeNull()
  })
})

describe('matchForm priority rules', () => {
  const base: IFormCatalog = {
    rulePriority: ['rootOrg', 'designation', 'ministryOrStateType'],
    userFields: {
      rootOrg: 'rootOrgId',
      designation: 'profileDetails.professionalDetails.0.designation',
      ministryOrStateType: 'profileDetails.ministryOrStateType',
    },
    valuePriority: { ministryOrStateType: ['ministry', 'state'] },
    forms: { public: { portal: [] } },
  }

  it('exact rootOrg beats a "*" form that matches designation + ministry', () => {
    const c: IFormCatalog = {
      ...base,
      forms: { public: { portal: [
        { id: 10, name: 'star-desig', subType: 'home', clientVersion: 2,
          criteria: { rootOrg: '*', designation: ['Director'], ministryOrStateType: ['ministry'] } },
        { id: 20, name: 'org-only', subType: 'home', clientVersion: 2, criteria: { rootOrg: 'org-1' } },
      ] } },
    }
    const u = user({ rootOrgId: 'org-1', designation: 'Director', ministryOrStateType: 'ministry' })
    expect(matchForm(c, u, 'home', 2)!.id).toBe(20)
  })

  it('"*" is the second choice when the user rootOrg has no form of its own', () => {
    const c: IFormCatalog = {
      ...base,
      forms: { public: { portal: [
        { id: 20, name: 'other-org', subType: 'home', clientVersion: 2, criteria: { rootOrg: 'org-2' } },
        { id: 30, name: 'star', subType: 'home', clientVersion: 2, criteria: { rootOrg: '*' } },
      ] } },
    }
    expect(matchForm(c, user({ rootOrgId: 'org-1' }), 'home', 2)!.id).toBe(30)
  })

  it('equal score → lowest id', () => {
    const c: IFormCatalog = {
      ...base,
      forms: { public: { portal: [
        { id: 50, name: 'b', subType: 'home', clientVersion: 2, criteria: { rootOrg: '*' } },
        { id: 7, name: 'a', subType: 'home', clientVersion: 2, criteria: {} },
        { id: 9, name: 'c', subType: 'home', clientVersion: 2, criteria: null },
      ] } },
    }
    expect(matchForm(c, user(), 'home', 2)!.id).toBe(7)
  })

  it('empty-criteria default is used when every scoped form is ineligible', () => {
    const c: IFormCatalog = {
      ...base,
      forms: { public: { portal: [
        { id: 40, name: 'scoped', subType: 'home', clientVersion: 2,
          criteria: { rootOrg: '*', designation: ['Director'], ministryOrStateType: ['ministry'] } },
        { id: 99, name: 'default', subType: 'home', clientVersion: 2, criteria: {} },
      ] } },
    }
    expect(matchForm(c, user({ designation: 'Director' }), 'home', 2)!.id).toBe(99)
    expect(matchForm(c, user({ designation: 'Clerk', ministryOrStateType: 'ministry' }), 'home', 2)!.id).toBe(99)
  })

  it('designation comparison is case-insensitive and uses the first professionalDetails entry', () => {
    const c: IFormCatalog = {
      ...base,
      forms: { public: { portal: [
        { id: 40, name: 'scoped', subType: 'home', clientVersion: 2, criteria: { designation: ['director'] } },
        { id: 99, name: 'default', subType: 'home', clientVersion: 2, criteria: {} },
      ] } },
    }
    expect(matchForm(c, user({ designation: 'Director' }), 'home', 2)!.id).toBe(40)
  })

  it('valuePriority ranks a ministry match above a state match at equal specificity', () => {
    const c: IFormCatalog = {
      ...base,
      userFields: { ...base.userFields, ministryOrStateType: 'profileDetails.ministryOrStateType' },
      forms: { public: { portal: [
        { id: 1, name: 'both', subType: 'home', clientVersion: 2, criteria: { ministryOrStateType: ['ministry', 'state'] } },
      ] } },
    }
    // sanity: a single-value user still matches a form listing both values
    expect(matchForm(c, user({ ministryOrStateType: 'state' }), 'home', 2)!.id).toBe(1)
  })
})
