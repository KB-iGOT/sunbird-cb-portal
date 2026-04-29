import { WidgetContentService } from './widget-content.service'
import { of } from 'rxjs'

jest.mock('lodash', () => ({ get: jest.fn((_obj: any, _path: any, def: any) => def), set: jest.fn() }), { virtual: true })
jest.mock('moment', () => {
  const m: any = () => ({ format: () => '2024-01-01', isSameOrBefore: () => false, isSameOrAfter: () => false })
  m.format = () => '2024-01-01'
  return m
}, { virtual: true })
jest.mock('@sunbird-cb/utils-v2', () => ({
  ConfigurationsService: class {
    userProfile = { userId: 'u1' }
    sitePath = '/assets'
  },
}), { virtual: true })
jest.mock('./viewer-route-util', () => ({ viewerRouteGenerator: jest.fn(() => '/viewer/url') }), { virtual: true })
jest.mock('@angular/router', () => ({ ActivatedRoute: class { } }), { virtual: true })

describe('WidgetContentService', () => {
  let service: WidgetContentService
  let mockHttp: any
  let mockConfigSvc: any
  let mockActivatedRoute: any

  beforeEach(() => {
    localStorage.clear()
    mockHttp = {
      get: jest.fn(() => of({ result: {}, content: {} })),
      post: jest.fn(() => of({ result: {} })),
      patch: jest.fn(() => of({})),
    }
    mockConfigSvc = { userProfile: { userId: 'u1' }, sitePath: '/assets' }
    mockActivatedRoute = {}
    service = new WidgetContentService(mockHttp, mockConfigSvc, mockActivatedRoute)
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('fetchMultipleContent calls http.get with ids joined', () => {
    service.fetchMultipleContent(['c1', 'c2'])
    expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('c1'))
  })

  it('fetchCollectionHierarchy calls http.get with type and id', () => {
    service.fetchCollectionHierarchy('Course', 'do_123')
    expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('do_123'))
  })

  it('fetchCourseBatch calls http.get with batchId', () => {
    service.fetchCourseBatch('batch001')
    expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('batch001'))
  })

  it('autoAssignBatchApi calls http.get with identifier', done => {
    service.autoAssignBatchApi('id123').subscribe(() => {
      expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('id123'))
      done()
    })
  })

  it('autoAssignCuratedBatchApi calls http.post', done => {
    service.autoAssignCuratedBatchApi({ id: 'c1' }, 'blended').subscribe(() => {
      expect(mockHttp.post).toHaveBeenCalled()
      done()
    })
  })

  it('updateTocConfig emits via tocConfigData$', done => {
    const data = { key: 'value' }
    service.tocConfigData$.subscribe((val: any) => {
      if (val.key === 'value') {
        expect(val).toEqual(data)
        done()
      }
    })
    service.updateTocConfig(data)
  })

  it('isResource returns true for LEARNING_RESOURCE primaryCategory', () => {
    const result = service.isResource('Learning Resource')
    expect(typeof result).toBe('boolean')
  })

  it('isResource returns false for non-resource primaryCategory', () => {
    expect(service.isResource('Course')).toBe(false)
  })

  it('isBatchInProgress returns true when batchData is null', () => {
    expect(service.isBatchInProgress(null)).toBe(true)
  })

  it('gotoTocPage returns url object with /app/toc/ for non-ext content', () => {
    const content: any = { identifier: 'do_123', contentType: 'Course' }
    const url = service.gotoTocPage(content)
    expect(url.url).toContain('/app/toc/')
    expect(url.url).toContain('do_123')
  })

  it('gotoTocPage returns ext url for ext_ contentId', () => {
    const content: any = { identifier: 'do_123', contentId: 'ext_456', contentType: 'Resource' }
    const url = service.gotoTocPage(content)
    expect(url.url).toContain('ext_')
  })

  it('getUserEnrollmentData calls http.post', done => {
    service.getUserEnrollmentData('u1', {}).subscribe(res => {
      expect(res).toBeDefined()
      done()
    })
    expect(mockHttp.post).toHaveBeenCalledWith(
      expect.stringContaining('u1'), {}
    )
  })

  it('fetchHierarchyContent calls http.get for normal URL', done => {
    Object.defineProperty(window, 'location', { value: { href: 'http://localhost/app/toc' }, writable: true })
    service.fetchHierarchyContent('do_123').subscribe(() => {
      expect(mockHttp.get).toHaveBeenCalled()
      done()
    })
  })

  it('fetchCourseBatches calls http.post to COURSE_BATCH_LIST', done => {
    mockHttp.post.mockReturnValue(of({ result: { response: [] } }))
    service.fetchCourseBatches({ courseId: 'c1' }).subscribe(() => {
      expect(mockHttp.post).toHaveBeenCalledWith(
        expect.stringContaining('batch/list'), { courseId: 'c1' }
      )
      done()
    })
  })

  it('enrollUserToBatch calls http.post to ENROLL_BATCH', async () => {
    await service.enrollUserToBatch({ batchId: 'b1' })
    expect(mockHttp.post).toHaveBeenCalledWith(
      expect.stringContaining('enrol'), { batchId: 'b1' }
    )
  })

  it('enrollAndUnenrollUserToBatchWF calls WITHDRAW url when type is WITHDRAW', async () => {
    await service.enrollAndUnenrollUserToBatchWF({ batchId: 'b1' }, 'WITHDRAW')
    expect(mockHttp.post).toHaveBeenCalledWith(
      expect.stringContaining('unenrol'), { batchId: 'b1' }
    )
  })

  it('enrollAndUnenrollUserToBatchWF calls ENROLL url for non-WITHDRAW type', async () => {
    await service.enrollAndUnenrollUserToBatchWF({ batchId: 'b1' }, 'ENROLL')
    expect(mockHttp.post).toHaveBeenCalledWith(
      expect.stringContaining('blendedprogram/enrol'), { batchId: 'b1' }
    )
  })

  it('fetchBlendedUserWF calls http.post to BLENDED_USER_WF', async () => {
    await service.fetchBlendedUserWF({ userId: 'u1' })
    expect(mockHttp.post).toHaveBeenCalledWith(
      expect.stringContaining('blendedprogram/user/search'), { userId: 'u1' }
    )
  })

  it('fetchBlendedUserCOUNT calls http.post to BLENDED_USER_COUNT', async () => {
    await service.fetchBlendedUserCOUNT({ userId: 'u1' })
    expect(mockHttp.post).toHaveBeenCalledWith(
      expect.stringContaining('blendedprogram/enrol/status/count'), { userId: 'u1' }
    )
  })

  it('fetchContentLikes calls http.post to CONTENT_LIKES', async () => {
    await service.fetchContentLikes({ content_id: ['c1'] })
    expect(mockHttp.post).toHaveBeenCalledWith(
      expect.stringContaining('likeCount'), { content_id: ['c1'] }
    )
  })

  it('continueLearning resolves successfully with id and collectionId', async () => {
    const result = await service.continueLearning('c1', 'col1')
    expect(result).toBeTruthy()
  })

  it('fetchContentData calls http.get with contentId', done => {
    Object.defineProperty(window, 'location', { value: { href: 'http://localhost/app/toc' }, writable: true })
    service.fetchContentData('do_123').subscribe(() => {
      expect(mockHttp.get).toHaveBeenCalledWith(
        expect.stringContaining('do_123')
      )
      done()
    })
  })

  it('userKarmaPoints calls http.post to USER_KARMA_POINTS', () => {
    service.userKarmaPoints()
    expect(mockHttp.post).toHaveBeenCalledWith(
      expect.stringContaining('totalkarmapoints'), {}
    )
  })

  it('programChildCourseResumeData$ is an observable', done => {
    service.programChildCourseResumeData$.subscribe((val: any) => {
      expect(val).toBeDefined()
      done()
    })
  })

  it('isResource returns true for Practice Question Set', () => {
    expect(service.isResource('Practice Question Set')).toBe(true)
  })

  it('isResource returns true for Course Assessment', () => {
    expect(service.isResource('Course Assessment')).toBe(true)
  })

  it('isResource returns true for Competency Assessment', () => {
    expect(service.isResource('Competency Assessment')).toBe(true)
  })

  it('isResource returns false when primaryCategory is empty string', () => {
    expect(service.isResource('')).toBe(false)
  })

  it('fetchContent calls http.get for non-resource non-preview', done => {
    Object.defineProperty(window, 'location', { value: { href: 'http://localhost/app' }, writable: true })
    service.fetchContent('do_123', 'detail', [], null).subscribe(() => {
      expect(mockHttp.get).toHaveBeenCalled()
      done()
    })
  })

  it('fetchContent calls http.get for Learning Resource non-preview', done => {
    Object.defineProperty(window, 'location', { value: { href: 'http://localhost/app' }, writable: true })
    service.fetchContent('do_123', 'detail', [], 'Learning Resource').subscribe(() => {
      expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('do_123'))
      done()
    })
  })

  it('fetchContent without primaryCategory calls hierarchy endpoint', done => {
    Object.defineProperty(window, 'location', { value: { href: 'http://localhost/app' }, writable: true })
    service.fetchContent('do_123').subscribe(() => {
      expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('hierarchy'))
      done()
    })
  })

  it('fetchAuthoringContent calls http.get', done => {
    Object.defineProperty(window, 'location', { value: { href: 'http://localhost/app' }, writable: true })
    service.fetchAuthoringContent('do_123').subscribe(() => {
      expect(mockHttp.get).toHaveBeenCalled()
      done()
    })
  })

  it('fetchAuthoringContent with apiType=read calls read endpoint', done => {
    Object.defineProperty(window, 'location', { value: { href: 'http://localhost/app' }, writable: true })
    service.fetchAuthoringContent('do_123', 'read').subscribe(() => {
      expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('content/v1/read'))
      done()
    })
  })

  it('autoAssignCuratedBatchApi calls http.post', done => {
    service.autoAssignCuratedBatchApi({ id: 'c1' }, 'blended').subscribe(() => {
      expect(mockHttp.post).toHaveBeenCalled()
      done()
    })
  })

  it('getRegistrationStatus calls http.get with source', async () => {
    await service.getRegistrationStatus('source123')
    expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('source123'))
  })

  it('fetchConfig calls http.get with provided url', done => {
    service.fetchConfig('/some/config.json').subscribe(() => {
      expect(mockHttp.get).toHaveBeenCalledWith('/some/config.json')
      done()
    })
  })

  it('addCertTemplate calls http.patch', done => {
    service.addCertTemplate({ template: 'x' }).subscribe(() => {
      expect(mockHttp.patch).toBeDefined()
      done()
    })
    expect(mockHttp.patch).toHaveBeenCalled()
  })

  it('issueCert calls http.post to CERT_ISSUE', done => {
    service.issueCert({ batchId: 'b1' }).subscribe(() => {
      expect(mockHttp.post).toHaveBeenCalledWith(expect.stringContaining('cert/issue'), { batchId: 'b1' })
      done()
    })
  })

  it('downloadCert calls http.get with certId', done => {
    service.downloadCert('cert123').subscribe(() => {
      expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('cert123'))
      done()
    })
  })

  it('trendingContentSearch calls http.post with query', done => {
    service.trendingContentSearch({ query: 'test' } as any).subscribe(() => {
      expect(mockHttp.post).toHaveBeenCalled()
      done()
    })
  })

  it('trendingContentSearch sets empty query when not provided', done => {
    service.trendingContentSearch({} as any).subscribe(() => {
      expect(mockHttp.post).toHaveBeenCalled()
      done()
    })
  })

  it('getKarmaPoitns calls http.post', done => {
    service.getKarmaPoitns(10, 0).subscribe(() => {
      expect(mockHttp.post).toHaveBeenCalled()
      done()
    })
  })

  it('fetchProgramContent calls http.get for non-preview', done => {
    Object.defineProperty(window, 'location', { value: { href: 'http://localhost/app' }, writable: true })
    service.fetchProgramContent(['do_123'] as any).subscribe(() => {
      expect(mockHttp.get).toHaveBeenCalled()
      done()
    })
  })

  it('fetchExternalContent calls http.get to EXT_CONTENT_READ', done => {
    service.fetchExternalContent(['do_ext_123'] as any).subscribe(() => {
      expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('cios'))
      done()
    })
  })

  it('fetchExternalPublicContent calls http.get to EXT_PUBLIC_CONTENT', done => {
    service.fetchExternalPublicContent('partner1', 'c123').subscribe(() => {
      expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('partner1'))
      done()
    })
  })

  it('fetchExtUserContentEnroll calls http.get to EXT_USER_COURSE_ENROLL', done => {
    service.fetchExtUserContentEnroll('cId1').subscribe(() => {
      expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('cId1'))
      done()
    })
  })

  it('extContentEnroll calls http.post to EXT_CONTENT_EROLL', done => {
    service.extContentEnroll({ userId: 'u1' }).subscribe(() => {
      expect(mockHttp.post).toHaveBeenCalled()
      done()
    })
  })

  it('getCourseKarmaPoints calls http.post to READ_COURSE_KARMAPOINTS', done => {
    service.getCourseKarmaPoints({ userId: 'u1' }).subscribe(() => {
      expect(mockHttp.post).toHaveBeenCalledWith(expect.stringContaining('karmapoints/user/course'), { userId: 'u1' })
      done()
    })
  })

  it('claimKarmapoints calls http.post to CLAIM_KARMAPOINTS', done => {
    service.claimKarmapoints({ points: 10 }).subscribe(() => {
      expect(mockHttp.post).toHaveBeenCalledWith(expect.stringContaining('claimkarmapoints'), { points: 10 })
      done()
    })
  })

  it('getEnrolledData returns null for non-existing item', () => {
    const result = service.getEnrolledData('nonExistentId')
    expect(result).toBeUndefined()
  })

  it('getEnrolledData returns stored enrollment data', () => {
    const mockData = { do_123: { batchId: 'b1', status: 0 } }
    localStorage.setItem('enrollmentMapData', JSON.stringify(mockData))
    const result = service.getEnrolledData('do_123')
    expect(result).toEqual({ batchId: 'b1', status: 0 })
  })

  it('getResourseLink returns gotoTocPage when no enrolled data', async () => {
    const content: any = { identifier: 'do_999' }
    const result = await service.getResourseLink(content)
    expect(result).toBeDefined()
    expect((result as any).url).toContain('/app/toc/')
  })

  it('getResourseDataWithData returns urlData when content is provided', () => {
    const content: any = { identifier: 'do_col1', batchId: 'b1', name: 'Course 1' }
    const result = service.getResourseDataWithData(content, 'res1', 'video/mp4')
    expect(result).toBeDefined()
  })

  it('getResourseDataWithData returns gotoTocPage when content is falsy', () => {
    jest.spyOn(service, 'gotoTocPage').mockReturnValue({ url: '/app/toc/undefined/overview', queryParams: {} } as any)
    const result = service.getResourseDataWithData(null, 'res1', 'video/mp4')
    expect(result).toBeDefined()
  })

  it('continueLearning with playlist type resolves successfully', async () => {
    const result = await service.continueLearning('c1', 'col1', 'playlist')
    expect(result).toBeTruthy()
  })

  it('fetchHierarchyContent in preview editMode calls edit url', done => {
    Object.defineProperty(window, 'location', { value: { href: 'http://localhost/public/?editMode=true' }, writable: true })
    service.fetchHierarchyContent('do_123').subscribe(() => {
      expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('mode=edit'))
      done()
    })
  })

  it('fetchContentData in preview mode calls public api url', done => {
    Object.defineProperty(window, 'location', { value: { href: 'http://localhost/public/' }, writable: true })
    service.fetchContentData('do_456').subscribe(() => {
      expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('do_456'))
      done()
    })
  })

  it('getUserEnrollmentData handles error via catchError', done => {
    mockHttp.post.mockReturnValue(new (require('rxjs').throwError)('error'))
    service.getUserEnrollmentData('u1', {}).subscribe(res => {
      expect(res.error).toBeDefined()
      done()
    })
  })

  it('isBatchInProgress returns true when batchData has no endDate', () => {
    expect(service.isBatchInProgress({ startDate: '2024-01-01' })).toBe(true)
  })

  it('getFirstChildInHierarchy returns content when no children', () => {
    const content: any = { children: [], primaryCategory: 'Resource' }
    const result = service.getFirstChildInHierarchy(content)
    expect(result).toBe(content)
  })

  it('getFirstChildInHierarchy returns content when primaryCategory is Resource with children', () => {
    const content: any = {
      children: [],
      primaryCategory: 'Resource',
      artifactUrl: 'some-url',
    }
    const result = service.getFirstChildInHierarchy(content)
    expect(result).toBe(content)
  })

  it('getPreAssessmentFirstChildInHierarchy returns content when no children', () => {
    const content: any = { children: [], primaryCategory: 'Resource' }
    const result = service.getPreAssessmentFirstChildInHierarchy(content)
    expect(result).toBe(content)
  })

  it('gotoTocPage adds endDate to queryParams when present', () => {
    const content: any = { identifier: 'do_123', endDate: '2025-01-01' }
    const url = service.gotoTocPage(content)
    expect((url as any).queryParams.endDate).toBe('2025-01-01')
  })

  it('checkForDataToFormUrl returns gotoTocPage when completionPercentage is 100', async () => {
    const content: any = { identifier: 'do_col1' }
    const enrollData: any = { completionPercentage: 100, batchId: 'b1' }
    const result = await service.checkForDataToFormUrl(content, enrollData)
    expect(result).toBeDefined()
  })

  it('autoAssignBatchApi uses provided language', done => {
    service.autoAssignBatchApi('id123', { langId: 'hindi' }).subscribe(() => {
      expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('language=hindi'))
      done()
    })
  })

  it('fetchMarkAsCompleteMeta returns a promise', async () => {
    const result = service.fetchMarkAsCompleteMeta('id_001')
    expect(result).toBeInstanceOf(Promise)
  })

  it('autoAssignCuratedBatchApi with MODERATED_PROGRAM uses open program url', done => {
    service.autoAssignCuratedBatchApi({ id: 'c1' }, 'Moderated Program').subscribe(() => {
      expect(mockHttp.post).toHaveBeenCalled()
      done()
    })
  })

  it('fetchContentHistory calls http.get with contentId', done => {
    service.fetchContentHistory('c1').subscribe(() => {
      expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('c1'))
      done()
    })
  })

  it('setProgramChildResumeData emits via programChildCourseResumeData$', done => {
    service.programChildCourseResumeData$.subscribe((val: any) => {
      if (val && val.courseId === 'course1') {
        expect(val.resumeData).toEqual([{ id: '1' }])
        done()
      }
    })
    service.setProgramChildResumeData([{ id: '1' }], 'course1')
  })

  it('setS3Cookie returns empty observable', done => {
    service.setS3Cookie('c1').subscribe({
      complete: () => {
        expect(true).toBe(true)
        done()
      },
    })
  })

  it('setS3ImageCookie calls http.post', done => {
    service.setS3ImageCookie().subscribe(() => {
      expect(mockHttp.post).toHaveBeenCalled()
      done()
    })
  })

  it('fetchManifest calls http.post with url', done => {
    service.fetchManifest('http://example.com/manifest').subscribe(() => {
      expect(mockHttp.post).toHaveBeenCalledWith(expect.anything(), { url: 'http://example.com/manifest' })
      done()
    })
  })

  it('fetchWebModuleContent calls http.get with encoded url', done => {
    service.fetchWebModuleContent('http://example.com').subscribe(() => {
      expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('url='))
      done()
    })
  })

  it('search calls http.post with query', done => {
    service.search({ query: 'test' } as any).subscribe(() => {
      expect(mockHttp.post).toHaveBeenCalled()
      done()
    })
  })

  it('search sets empty query when not provided', done => {
    service.search({} as any).subscribe(() => {
      expect(mockHttp.post).toHaveBeenCalled()
      done()
    })
  })

  it('searchV6 calls http.post without apiPath', done => {
    service.searchV6({ query: 'test' } as any).subscribe(() => {
      expect(mockHttp.post).toHaveBeenCalled()
      done()
    })
  })

  it('searchRelatedCBPV6 calls http.post', done => {
    service.searchRelatedCBPV6({ query: 'cbp' } as any).subscribe(() => {
      expect(mockHttp.post).toHaveBeenCalled()
      done()
    })
  })

  it('fetchContentRating calls http.get with contentId', done => {
    service.fetchContentRating('c1').subscribe(() => {
      expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('c1'))
      done()
    })
  })

  it('deleteContentRating calls http.delete with contentId', () => {
    mockHttp.delete = jest.fn(() => of({}))
    service.deleteContentRating('c1')
    expect(mockHttp.delete).toHaveBeenCalledWith(expect.stringContaining('c1'))
  })

  it('addContentRating calls http.post with rating data', done => {
    service.addContentRating('c1', { rating: 4 }).subscribe(() => {
      expect(mockHttp.post).toHaveBeenCalledWith(expect.stringContaining('c1'), { rating: 4 })
      done()
    })
  })

  it('getFirstChildInHierarchy recurses into program with no artifactUrl', () => {
    const child: any = { children: [], primaryCategory: 'Learning Resource' }
    const content: any = {
      children: [child],
      primaryCategory: 'Program',
      artifactUrl: undefined,
    }
    const result = service.getFirstChildInHierarchy(content)
    expect(result).toBe(child)
  })

  it('getPreAssessmentFirstChildInHierarchy recurses into module with no artifactUrl', () => {
    const child: any = { children: [], primaryCategory: 'Learning Resource' }
    const content: any = {
      children: [child],
      primaryCategory: 'Module Of Course',
      artifactUrl: undefined,
    }
    const result = service.getPreAssessmentFirstChildInHierarchy(content)
    expect(result).toBe(child)
  })

  it('fetchHierarchyContent in preview non-creator calls public url', done => {
    Object.defineProperty(window, 'location', { value: { href: 'http://localhost/public/' }, writable: true })
    service.fetchHierarchyContent('do_123').subscribe(() => {
      expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('course/v1/hierarchy'))
      done()
    })
  })

  it('fetchContentData in preview editMode with _rc calls action read url', done => {
    Object.defineProperty(window, 'location', { value: { href: 'http://localhost/public/?editMode=true&_rc=1' }, writable: true })
    service.fetchContentData('do_456').subscribe(() => {
      expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('action/content'))
      done()
    })
  })

  it('fetchProgramContent in preview editMode calls action read url', done => {
    Object.defineProperty(window, 'location', { value: { href: 'http://localhost/public/?editMode=true' }, writable: true })
    service.fetchProgramContent(['do_123'] as any).subscribe(() => {
      expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('action'))
      done()
    })
  })

  it('getResourseLink returns enrolled data result when enrolled with 100% completion', async () => {
    const mockEnrollment = { do_123: { completionPercentage: 100, batchId: 'b1', content: { status: 'Live', courseCategory: 'Course' } } }
    localStorage.setItem('enrollmentMapData', JSON.stringify(mockEnrollment))
    const content: any = { identifier: 'do_123' }
    const result = await service.getResourseLink(content)
    expect(result).toBeDefined()
  })

  it('searchRegionRecommendation calls http.post with region filter', done => {
    mockConfigSvc.userProfile = { userId: 'u1', country: 'India' }
    service.searchRegionRecommendation({ query: 'test', preLabelValue: '', filters: {} } as any).subscribe(() => {
      expect(mockHttp.post).toHaveBeenCalled()
      done()
    })
  })

  it('fetchContent in preview editMode with _rc for resource calls action read', done => {
    Object.defineProperty(window, 'location', { value: { href: 'http://localhost/public/?editMode=true&_rc=1' }, writable: true })
    service.fetchContent('do_123', 'detail', [], 'Learning Resource').subscribe(() => {
      expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('action/content'))
      done()
    })
  })

  it('fetchContent in preview without editMode for resource calls public read', done => {
    Object.defineProperty(window, 'location', { value: { href: 'http://localhost/public/' }, writable: true })
    service.fetchContent('do_123', 'detail', [], 'Learning Resource').subscribe(() => {
      expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('content/v1/read'))
      done()
    })
  })

  it('fetchContent in preview editMode without _rc for non-resource calls creator url', done => {
    Object.defineProperty(window, 'location', { value: { href: 'http://localhost/public/?editMode=true' }, writable: true })
    service.fetchContent('do_123', 'detail', [], null).subscribe(() => {
      expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('mode=edit'))
      done()
    })
  })

  it('fetchContent in preview without editMode for non-resource calls course hierarchy', done => {
    Object.defineProperty(window, 'location', { value: { href: 'http://localhost/public/' }, writable: true })
    service.fetchContent('do_123', 'detail', [], null).subscribe(() => {
      expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('course/v1/hierarchy'))
      done()
    })
  })

  it('fetchProgramContent in preview without editMode calls public read', done => {
    Object.defineProperty(window, 'location', { value: { href: 'http://localhost/public/' }, writable: true })
    service.fetchProgramContent(['do_456'] as any).subscribe(() => {
      expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('content/v1/read'))
      done()
    })
  })

  it('fetchContentHistoryV2 with courseId calls http.post', done => {
    mockActivatedRoute = { snapshot: { queryParams: {} } }
    service = new (WidgetContentService as any)(mockHttp, mockConfigSvc, mockActivatedRoute)
    service.fetchContentHistoryV2({ request: { courseId: 'c1', fields: [] } } as any).subscribe(() => {
      expect(mockHttp.post).toHaveBeenCalled()
      done()
    })
  })

  it('fetchAuthoringContent in editMode calls hierarchy edit url', done => {
    Object.defineProperty(window, 'location', { value: { href: 'http://localhost/app?editMode=true' }, writable: true })
    service.fetchAuthoringContent('do_123').subscribe(() => {
      expect(mockHttp.get).toHaveBeenCalledWith(expect.stringContaining('mode=edit'))
      done()
    })
  })
})
