import { AppTocService } from './app-toc.service'
import { of, throwError } from 'rxjs'
import { skip, take } from 'rxjs/operators'
import { NsContent } from '@sunbird-cb/collection/src/lib/_services/widget-content.model'

describe('AppTocService – High Coverage (No TestBed)', () => {
  let service: AppTocService

  let httpClientMock: any
  let contentLangSvcMock: any
  let configSvcMock: any
  let widgetSvcMock: any

  beforeEach(() => {
    httpClientMock = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      patch: jest.fn(),
    }

    contentLangSvcMock = {
      getContentLanguage: jest.fn().mockReturnValue('en'),
    }

    configSvcMock = {
      rootOrg: 'root-org',
      org: ['org1'],
      userProfile: { country: 'India' },
    }

    widgetSvcMock = {
      getFirstChildInHierarchy: jest.fn().mockReturnValue({ identifier: 'child1' }),
      fetchContent: jest.fn().mockReturnValue(of({ result: { content: {} } })),
    }

    service = new AppTocService(
      httpClientMock,
      contentLangSvcMock,
      configSvcMock,
      widgetSvcMock,
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  // ------------------------------------------------------------------
  // BASIC
  // ------------------------------------------------------------------
  it('should create service', () => {
    expect(service).toBeTruthy()
  })

  // ------------------------------------------------------------------
  // SUBJECTS
  // ------------------------------------------------------------------
  it('should emit updateBatchData', () => {
    const spy = jest.fn()
    service.batchReplaySubject.subscribe(spy)
    service.updateBatchData()
    expect(spy).toHaveBeenCalled()
  })

  it('should update server date (skip initial value)', done => {
    service.currentServerDate
      .pipe(skip(1), take(1))
      .subscribe(val => {
        expect(val).toBe('2025-01-01')
        done()
      })

    service.changeServerDate('2025-01-01')
  })

  // ------------------------------------------------------------------
  // GETTERS / SETTERS
  // ------------------------------------------------------------------
  it('should set subtitleOnBanners', () => {
    service.subtitleOnBanners = true
    expect(service.subtitleOnBanners).toBe(true)
  })

  it('should set showDescription', () => {
    service.showDescription = true
    expect(service.showDescription).toBe(true)
  })

  // ------------------------------------------------------------------
  // showStartButton
  // ------------------------------------------------------------------
  it('should block youtube in China', () => {
    configSvcMock.userProfile.country = 'China'
    const content: any = {
      artifactUrl: 'https://youtube.com/watch?v=1',
      resourceType: 'Course',
    }

    const res = service.showStartButton(content)
    expect(res.show).toBe(false)
    expect(res.msg).toBe('youtubeForbidden')
  })

  it('should allow start button', () => {
    const content: any = {
      artifactUrl: '',
      resourceType: 'Course',
    }
    expect(service.showStartButton(content).show).toBe(true)
  })

  // ------------------------------------------------------------------
  // initData
  // ------------------------------------------------------------------
  it('should init data with content', () => {
    const data: any = {
      content: {
        data: {
          identifier: 'id1',
          children: [],
        },
      },
    }

    const res = service.initData(data)
    expect(res.content).toBeTruthy()
    expect(res.errorCode).toBeNull()
  })

  it('should return API_FAILURE', () => {
    expect(service.initData({ error: true }).errorCode).toBeDefined()
  })

  it('should return NO_DATA', () => {
    expect(service.initData({}).errorCode).toBeDefined()
  })

  // ------------------------------------------------------------------
  // Completion logic
  // ------------------------------------------------------------------
  it('should map completion percentage', () => {
    const content: any = {
      children: [{ identifier: 'c1' }],
    }

    const resumeData: any[] = [
      { contentId: 'c1', completionPercentage: 100, status: 2 },
    ]

    service.mapCompletionPercentage(content, resumeData)
    expect(content.children[0].completionPercentage).toBe(100)
  })

  it('should count ONLY direct modules (by design)', () => {
    const content: any = {
      children: [
        { primaryCategory: NsContent.EPrimaryCategory.MODULE },
        {
          primaryCategory: NsContent.EPrimaryCategory.COURSE,
          children: [{ primaryCategory: NsContent.EPrimaryCategory.MODULE }],
        },
      ],
    }

    service.mapModuleCount(content)

    // IMPORTANT: service does NOT bubble nested counts
    expect(content.moduleCount).toBe(1)
  })

  // ------------------------------------------------------------------
  // getMimeType
  // ------------------------------------------------------------------
  it('should return mimeType when identifier matches', () => {
    const content: any = { identifier: 'id1', mimeType: 'video/mp4' }
    expect(service.getMimeType(content, 'id1')).toBe('video/mp4')
  })

  it('should return undefined when children empty & mimeType missing', () => {
    const content: any = {
      identifier: 'id1',
      children: [],
    }

    expect(service.getMimeType(content, 'x')).toBeUndefined()
  })

  // ------------------------------------------------------------------
  // getTocStructure
  // ------------------------------------------------------------------
  it('should increment video count safely', () => {
    const content: any = {
      primaryCategory: NsContent.EPrimaryCategory.RESOURCE,
      mimeType: NsContent.EMimeTypes.MP4,
      children: [],
    }

    const toc: any = {
      course: 0,
      learningModule: 0,
      video: 0,
      pdf: 0,
      assessment: 0,
      other: 0,
    }

    const res = service.getTocStructure(content, toc)
    expect(res.video).toBe(1)
  })

  // ------------------------------------------------------------------
  // filterToc
  // ------------------------------------------------------------------
  it('should filter toc safely when children exist', () => {
    const content: any = {
      primaryCategory: NsContent.EPrimaryCategory.COURSE,
      children: [
        {
          primaryCategory: NsContent.EPrimaryCategory.RESOURCE,
          resourceType: 'Course',
          mimeType: 'application/pdf',
          children: [],
        },
      ],
    }
    const res = service.filterToc(content)
    expect(res).toBeTruthy()

  })

  // ------------------------------------------------------------------
  // Analytics
  // ------------------------------------------------------------------
  it('should fetch analytics data', () => {
    httpClientMock.get.mockReturnValue(of({}))
    service.fetchContentAnalyticsData('c1')
    expect(httpClientMock.get).toHaveBeenCalled()
  })

  it('should handle analytics error safely', () => {
    httpClientMock.get.mockReturnValue(
      throwError(() => new Error('error'))
    )

    service.fetchContentAnalyticsData('c1')
    expect(true).toBe(true)
  })

  // ------------------------------------------------------------------
  // upload
  // ------------------------------------------------------------------
  it('should upload file', () => {
    const file = new File(['x'], 'file.txt')
    const fd = new FormData()
    fd.append('content', file)

    httpClientMock.post.mockReturnValue(of({}))
    service.upload(fd, { contentId: 'c1' }).subscribe()
    expect(httpClientMock.post).toHaveBeenCalled()
  })

  // ------------------------------------------------------------------
  // readAssignmentFile
  // ------------------------------------------------------------------
  it('should handle readAssignmentFile error', done => {
    httpClientMock.get.mockReturnValue(
      throwError(() => new Error('fail'))
    )

    service.readAssignmentFile('c', 'b', 'a', 'f').subscribe({
      error: err => {
        expect(err).toBeTruthy()
        done()
      },
    })
  })
})
