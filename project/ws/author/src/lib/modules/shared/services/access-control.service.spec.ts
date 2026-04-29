jest.mock('@ws/author/src/lib/constants/apiEndpoints', () => ({
  AUTHORING_CONTENT_BASE: '/authoring/content/',
}), { virtual: true })

jest.mock('@ws/author/src/lib/constants/icons', () => ({
  ICON_TYPE: {
    kBoard: 'grid_on',
    program: 'account_tree',
    course: 'school',
    learningModule: 'folder',
    certificate: 'card_membership',
    externalContent: 'open_in_new',
    internalContent: 'article',
    emptyFile: 'insert_drive_file',
    pdf: 'picture_as_pdf',
    youtube: 'play_circle_filled',
    assessment: 'assignment',
    quiz: 'quiz',
    dragNDrop: 'drag_indicator',
    htmlPicker: 'web',
    handsOn: 'computer',
    iap: 'important_devices',
    audio: 'audiotrack',
    video: 'videocam',
    default: 'help',
  },
}), { virtual: true })

jest.mock('@ws/author/src/lib/constants/mimeType', () => ({
  MIME_TYPE: {
    collection: 'application/vnd.ekstep.content-collection',
    html: 'text/x-url',
    pdf: 'application/pdf',
    youtube: 'video/x-youtube',
    quiz: 'application/vnd.ekstep.ecml-archive',
    dragDrop: 'application/drag-drop',
    htmlPicker: 'text/html',
    webModule: 'application/web-module',
    handson: 'application/json',
    iap: 'application/iap-content',
    mp3: 'audio/mpeg',
    mp4: 'video/mp4',
  },
}), { virtual: true })

jest.mock('@ws/author/src/lib/interface/search', () => ({ ISearchContent: {} }), { virtual: true })
jest.mock('@ws/author/src/lib/interface/content', () => ({ NSContent: {} }), { virtual: true })
jest.mock('@angular/common', () => ({ APP_BASE_HREF: 'APP_BASE_HREF' }), { virtual: true })
jest.mock('@sunbird-cb/utils-v2', () => ({
  ConfigurationsService: jest.fn(),
  NsInstanceConfig: {},
}), { virtual: true })

import { AccessControlService } from './access-control.service'

function buildService(configOverrides: any = {}, baseHref = '/en/') {
  const mockConfig: any = {
    userRoles: new Set(['editor']),
    userProfile: { userId: 'u1', userName: 'testUser' },
    activeOrg: 'TestOrg',
    rootOrg: 'testRoot',
    activeThemeObject: { color: { primary: '#FF0000' } },
    instanceConfig: {
      logos: { defaultContent: '/logo.png' },
      details: { appName: 'TestApp' },
      authoring: { environment: 'test' },
    },
    ...configOverrides,
  }
  return new AccessControlService(mockConfig, baseHref)
}

describe('AccessControlService', () => {
  it('should create', () => {
    expect(buildService()).toBeTruthy()
  })

  describe('hasRole', () => {
    it('should return true when user has matching role (lowercase)', () => {
      const svc = buildService({ userRoles: new Set(['editor']) })
      expect(svc.hasRole(['editor'])).toBe(true)
    })

    it('should return true when user has matching role (uppercase)', () => {
      const svc = buildService({ userRoles: new Set(['EDITOR']) })
      expect(svc.hasRole(['editor'])).toBe(true)
    })

    it('should return false when user lacks all roles', () => {
      const svc = buildService({ userRoles: new Set(['viewer']) })
      expect(svc.hasRole(['editor', 'admin'])).toBe(false)
    })

    it('should return true for any one matching role', () => {
      const svc = buildService({ userRoles: new Set(['admin']) })
      expect(svc.hasRole(['editor', 'admin'])).toBe(true)
    })

    it('should return false when userRoles is null/undefined', () => {
      const svc = buildService({ userRoles: null })
      expect(svc.hasRole(['editor'])).toBe(false)
    })
  })

  describe('getters', () => {
    it('userId should return from userProfile', () => {
      expect(buildService().userId).toBe('u1')
    })

    it('userId should return empty string when userProfile is null', () => {
      expect(buildService({ userProfile: null }).userId).toBe('')
    })

    it('userName should return from userProfile', () => {
      expect(buildService().userName).toBe('testUser')
    })

    it('userName should return empty string when userProfile is null', () => {
      expect(buildService({ userProfile: null }).userName).toBe('')
    })

    it('org should return activeOrg', () => {
      expect(buildService().org).toBe('TestOrg')
    })

    it('org should return default when activeOrg is null', () => {
      expect(buildService({ activeOrg: null }).org).toBe('DOPT Ltd')
    })

    it('rootOrg should return from config', () => {
      expect(buildService().rootOrg).toBe('testRoot')
    })

    it('rootOrg should return default when null', () => {
      expect(buildService({ rootOrg: null }).rootOrg).toBe('dopt')
    })

    it('orgRootOrgAsQuery should build correct query string', () => {
      expect(buildService().orgRootOrgAsQuery).toBe('?rootOrg=testRoot&org=TestOrg')
    })

    it('defaultLogo should return from instanceConfig', () => {
      expect(buildService().defaultLogo).toBe('/logo.png')
    })

    it('defaultLogo should return empty when instanceConfig missing', () => {
      expect(buildService({ instanceConfig: null }).defaultLogo).toBe('')
    })

    it('appName should return from instanceConfig', () => {
      expect(buildService().appName).toBe('TestApp')
    })

    it('appName should return iGot when instanceConfig missing', () => {
      expect(buildService({ instanceConfig: null }).appName).toBe('iGot')
    })

    it('activePrimary should return from activeThemeObject', () => {
      expect(buildService().activePrimary).toBe('#FF0000')
    })

    it('activePrimary should return empty when theme is null', () => {
      expect(buildService({ activeThemeObject: null }).activePrimary).toBe('')
    })

    it('locale should extract language from baseHref', () => {
      expect(buildService({}, '/en/').locale).toBe('en')
    })

    it('locale should return en when baseHref is /', () => {
      expect(buildService({}, '/').locale).toBe('en')
    })
  })

  describe('getAction', () => {
    it('should return submitted for Draft', () => {
      expect(buildService().getAction('Draft')).toBe('submitted')
    })
    it('should return submitted for Live', () => {
      expect(buildService().getAction('Live')).toBe('submitted')
    })
    it('should return reviewerApproved when InReview with operation=1', () => {
      expect(buildService().getAction('InReview', 1)).toBe('reviewerApproved')
    })
    it('should return reviewerRejected when InReview with operation=0', () => {
      expect(buildService().getAction('InReview', 0)).toBe('reviewerRejected')
    })
    it('should return qualityApproved when QualityReview with operation=1', () => {
      expect(buildService().getAction('QualityReview', 1)).toBe('qualityApproved')
    })
    it('should return qualityRejected when QualityReview with operation=0', () => {
      expect(buildService().getAction('QualityReview', 0)).toBe('qualityRejected')
    })
    it('should return publisherApproved when Reviewed with operation=1', () => {
      expect(buildService().getAction('Reviewed', 1)).toBe('publisherApproved')
    })
    it('should return publisherRejected when Reviewed with operation=0', () => {
      expect(buildService().getAction('Reviewed', 0)).toBe('publisherRejected')
    })
    it('should return submitted for unknown status', () => {
      expect(buildService().getAction('Unknown')).toBe('submitted')
    })
  })

  describe('hasAccess', () => {
    it('should return true for editor role', () => {
      const svc = buildService({ userRoles: new Set(['editor']) })
      expect(svc.hasAccess({} as any)).toBe(true)
    })

    it('should return true for admin role', () => {
      const svc = buildService({ userRoles: new Set(['admin']) })
      expect(svc.hasAccess({} as any)).toBe(true)
    })

    it('should return true for forPreview when visibility is Public', () => {
      const svc = buildService({ userRoles: new Set(['viewer']) })
      expect(svc.hasAccess({ visibility: 'Public' } as any, true)).toBe(true)
    })
  })

  describe('convertToISODate', () => {
    it('should convert a valid date string', () => {
      const result = buildService().convertToISODate('20230115123045')
      expect(result instanceof Date).toBe(true)
    })

    it('should return a valid date for empty string', () => {
      const result = buildService().convertToISODate('')
      expect(result instanceof Date).toBe(true)
    })
  })

  describe('convertToESDate', () => {
    it('should convert Date to ES date format', () => {
      const d = new Date('2023-01-15T12:30:45.000Z')
      const result = buildService().convertToESDate(d)
      expect(result).toContain('+0000')
    })
  })

  describe('getCategory', () => {
    it('should return category when present', () => {
      expect(buildService().getCategory({ category: 'Course', contentType: 'Resource' } as any)).toBe('Course')
    })
    it('should fall back to contentType when category is absent', () => {
      expect(buildService().getCategory({ contentType: 'Resource' } as any)).toBe('Resource')
    })
  })

  describe('getCategoryType', () => {
    it('should return primaryCategory for Learning Resource', () => {
      const svc = buildService()
      expect(svc.getCategoryType({ category: 'Learning Resource', primaryCategory: 'Knowledge Artifact' } as any))
        .toBe('Knowledge Artifact')
    })
    it('should fallback to Resource for Learning Resource without primaryCategory', () => {
      expect(buildService().getCategoryType({ category: 'Learning Resource' } as any)).toBe('Resource')
    })
    it('should return Module fallback for Course Unit', () => {
      expect(buildService().getCategoryType({ category: 'Course Unit' } as any)).toBe('Module')
    })
    it('should return Course fallback', () => {
      expect(buildService().getCategoryType({ category: 'Course' } as any)).toBe('Course')
    })
    it('should return Program fallback', () => {
      expect(buildService().getCategoryType({ category: 'Program' } as any)).toBe('Program')
    })
    it('should return category for unknown', () => {
      expect(buildService().getCategoryType({ category: 'Other', contentType: 'Other' } as any)).toBe('Other')
    })
  })

  describe('getIcon', () => {
    it('should return course icon for collection with category Course', () => {
      const svc = buildService()
      const result = svc.getIcon({ mimeType: 'application/vnd.ekstep.content-collection', category: 'Course' } as any)
      expect(result).toBe('school')
    })
    it('should return pdf icon for pdf mimeType with artifactUrl', () => {
      const result = buildService().getIcon({ mimeType: 'application/pdf', artifactUrl: '/file.pdf' } as any)
      expect(result).toBe('picture_as_pdf')
    })
    it('should return emptyFile icon for pdf with no artifactUrl', () => {
      const result = buildService().getIcon({ mimeType: 'application/pdf', artifactUrl: '' } as any)
      expect(result).toBe('insert_drive_file')
    })
    it('should return youtube icon', () => {
      expect(buildService().getIcon({ mimeType: 'video/x-youtube' } as any)).toBe('play_circle_filled')
    })
    it('should return video icon for mp4', () => {
      expect(buildService().getIcon({ mimeType: 'video/mp4' } as any)).toBe('videocam')
    })
    it('should return audio icon for mp3', () => {
      expect(buildService().getIcon({ mimeType: 'audio/mpeg' } as any)).toBe('audiotrack')
    })
    it('should return default icon for unknown mimeType', () => {
      expect(buildService().getIcon({ mimeType: 'unknown' } as any)).toBe('help')
    })
  })

  describe('proxyToAuthoringUrl', () => {
    it('should not throw for plain string', () => {
      expect(() => buildService().proxyToAuthoringUrl('http://example.com/page')).not.toThrow()
    })
  })
})
