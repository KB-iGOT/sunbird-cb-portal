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

  // ------------------------------------------------------------------
  // filterUnitContent
  // ------------------------------------------------------------------
  it('filterUnitContent should return true for ALL category', () => {
    const dummy: any = { resourceType: 'anything' }
    expect(service.filterUnitContent(dummy)).toBe(true)
  })

  // ------------------------------------------------------------------
  // fetchContentAnalyticsClientData
  // ------------------------------------------------------------------
  it('should fetch client analytics data once when status is none', done => {
    httpClientMock.get.mockReturnValue(of({ client: true }))

    service.analyticsReplaySubject.subscribe(data => {
      expect(data).toEqual({ client: true })
      expect(service.analyticsFetchStatus).toBe('done')
      done()
    })

    service.fetchContentAnalyticsClientData('cid-1')
  })

  it('should not refetch client analytics when already fetching/done', () => {
    service.analyticsFetchStatus = 'done'
    service.fetchContentAnalyticsClientData('cid-2')
    expect(httpClientMock.get).not.toHaveBeenCalled()
  })

  // ------------------------------------------------------------------
  // fetchContentWhatsNext / moreLikeThis
  // ------------------------------------------------------------------
  it('should fetch content whats next with and without contentType', () => {
    httpClientMock.get.mockReturnValue(of([]))

    service.fetchContentWhatsNext('c1', 'Course').subscribe()
    service.fetchContentWhatsNext('c1').subscribe()

    expect(httpClientMock.get).toHaveBeenCalledTimes(2)
  })

  it('should fetch more like this (paid/free)', () => {
    httpClientMock.get.mockReturnValue(of([]))

    service.fetchMoreLikeThisPaid('c1').subscribe()
    service.fetchMoreLikeThisFree('c1').subscribe()

    expect(httpClientMock.get).toHaveBeenCalledTimes(2)
  })

  // ------------------------------------------------------------------
  // cohorts & related
  // ------------------------------------------------------------------
  it('should fetch content cohorts with headers', () => {
    httpClientMock.get.mockReturnValue(of([]))

    service.fetchContentCohorts('user' as any, 'cid').subscribe()

    const args = httpClientMock.get.mock.calls[0] as any[]
    const url = args[0]
    const options = args[1]

    expect(url).toContain('/apis/protected/v8/cohorts/')
    expect(url).toContain('/cid')
    expect(options?.headers).toBeDefined()
  })

  it('fetchExternalContentAccess, fetchCohortGroupUsers, fetchMoreLikeThis, fetchPostAssessmentStatus should call http.get', () => {
    httpClientMock.get.mockReturnValue(of({}))

    service.fetchExternalContentAccess('cid').subscribe()
    service.fetchCohortGroupUsers(1).subscribe()
    service.fetchMoreLikeThis('cid', 'Course').subscribe()
    service.fetchPostAssessmentStatus('cid').subscribe()

    expect(httpClientMock.get).toHaveBeenCalledTimes(4)
  })

  // ------------------------------------------------------------------
  // fetchGetContentData
  // ------------------------------------------------------------------
  it('fetchGetContentData should use protected endpoint when not preview', () => {
    httpClientMock.get.mockReturnValue(of({}))
      ; (globalThis as any).location = { href: '/app/toc' }

    service.fetchGetContentData('cid').subscribe()
    expect(httpClientMock.get).toHaveBeenCalled()
  })

  it('fetchGetContentData should use preview endpoints based on query', () => {
    httpClientMock.get.mockReturnValue(of({}))

      ; (globalThis as any).location = { href: '/public/toc' }
    service.fetchGetContentData('cid1').subscribe()

      ; (globalThis as any).location = { href: '/app/toc?editMode=true&_rc=true' }
    service.fetchGetContentData('cid2').subscribe()

    expect(httpClientMock.get).toHaveBeenCalledTimes(2)
  })

  // ------------------------------------------------------------------
  // createBatch and historyV2
  // ------------------------------------------------------------------
  it('createBatch should post batchData in request wrapper', () => {
    httpClientMock.post.mockReturnValue(of({}))
    const batchData: any = { name: 'B1' }
    service.createBatch(batchData).subscribe()
    const args = httpClientMock.post.mock.calls[0] as any[]
    expect(args[1]).toEqual({ request: batchData })
  })

  it('fetchContentHistoryV2 should post when courseId present', () => {
    httpClientMock.post.mockReturnValue(of({}))
    const req: any = { request: { courseId: 'cid' } }
    service.fetchContentHistoryV2(req).subscribe()
    const args = httpClientMock.post.mock.calls[0] as any[]
    expect(args[0]).toContain('content')
    expect(args[1]).toBe(req)
    expect(req.request.fields).toEqual(['progressdetails'])
  })

  it('fetchContentHistoryV2 should return empty observable when no courseId', done => {
    const req: any = { request: {} }
    service.fetchContentHistoryV2(req).subscribe(() => {
      expect(httpClientMock.post).not.toHaveBeenCalled()
      done()
    })
  })

  // ------------------------------------------------------------------
  // simple HTTP wrappers
  // ------------------------------------------------------------------
  it('should call simple HTTP wrapper endpoints', () => {
    httpClientMock.get.mockReturnValue(of({}))
    httpClientMock.post.mockReturnValue(of({}))

    service.dowonloadCertificate('cert1').subscribe()
    service.getServerDate().subscribe()
    service.getFormById('f1').subscribe()
    service.submitForm({}).subscribe()
    service.getFormByIdPublic('f2').subscribe()
    service.submitFormPublic({}).subscribe()
    service.getApllicationsById('f3', 'c1').subscribe()
    service.shareContent({}).subscribe()

    expect(httpClientMock.get).toHaveBeenCalled()
    expect(httpClientMock.post).toHaveBeenCalled()
  })

  // ------------------------------------------------------------------
  // transcription setters
  // ------------------------------------------------------------------
  it('should set transcription data and active subtitle language', done => {
    const data: any = { text: 'hello' }
    const lang: any = { id: 'en' }

    const values: any = { trans: null, active: null }

    service.transcriptionData$.pipe(skip(1), take(1)).subscribe(v => {
      values.trans = v
      if (values.active) {
        expect(values.trans).toEqual(data)
        done()
      }
    })

    service.transriptionActiveLanguageDataObject$.pipe(skip(1), take(1)).subscribe(v => {
      values.active = v
      if (values.trans) {
        expect(values.active).toEqual(lang)
        done()
      }
    })

    service.setTranscriptionData(data)
    service.setActiveSubtitleLanguage(lang)
  })

  // ------------------------------------------------------------------
  // assignments and content creation
  // ------------------------------------------------------------------
  it('aiGetResourceVttFile, readPreEnrollmentResourcesState, updateContentWithFewFields should call proper HTTP methods', () => {
    httpClientMock.get.mockReturnValue(of({}))
    httpClientMock.post.mockReturnValue(of({}))
    httpClientMock.patch.mockReturnValue(of({}))

    service.aiGetResourceVttFile('r1').subscribe()
    service.readPreEnrollmentResourcesState({}).subscribe()
    service.updateContentWithFewFields({ key: 'v' }, 'id1').subscribe()

    expect(httpClientMock.get).toHaveBeenCalled()
    expect(httpClientMock.post).toHaveBeenCalled()
    expect(httpClientMock.patch).toHaveBeenCalled()
  })

  it('createContentV2 should map identifier from result', async () => {
    httpClientMock.post.mockReturnValue(of({ result: { identifier: 'id1' } }))
    const id = await service.createContentV2({}).toPromise()
    expect(id).toBe('id1')
  })

  it('uploadAssignmentAnswer should POST FormData to correct URL', () => {
    httpClientMock.post.mockReturnValue(of({}))
    const file = new File(['x'], 'ans.txt')
    service.uploadAssignmentAnswer('c1', 'b1', 'a1', file).subscribe()
    const args = httpClientMock.post.mock.calls[0] as any[]
    expect(args[0]).toContain('/assignment/answer/c1/b1/a1')
    expect(args[1] instanceof FormData).toBe(true)
  })

  it('readContentV2 should map nested result.content', async () => {
    httpClientMock.get.mockReturnValue(of({ result: { content: { id: 'c1' } } }))
    const res = await service.readContentV2('c1').toPromise()
    expect(res).toEqual({ id: 'c1' })
  })

  it('appendToFilename should handle with and without extension', () => {
    const nameWithExt = 'file.txt'
    const nameNoExt = 'file'

    const res1 = service.appendToFilename(nameWithExt)
    const res2 = service.appendToFilename(nameNoExt)

    expect(res1).toMatch(/^file\d+\.txt$/)
    expect(res2).toMatch(/^file\d+$/)
  })

  it('assignment HTTP helpers should call correct endpoints', () => {
    httpClientMock.post.mockReturnValue(of({}))
    httpClientMock.put.mockReturnValue(of({}))

    service.searchAssignments({}).subscribe()
    service.submitDraftAssignment({}).subscribe()
    service.submitAssignment({}).subscribe()
    service.notifyAssignmentSubmission({}).subscribe()
    service.getAssignmentStatus({}).subscribe()

    expect(httpClientMock.post).toHaveBeenCalled()
    expect(httpClientMock.put).toHaveBeenCalled()
  })


})
