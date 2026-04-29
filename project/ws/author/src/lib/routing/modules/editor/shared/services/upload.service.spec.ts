import { UploadService } from './upload.service'
import { of } from 'rxjs'

jest.mock('@ws/author/src/lib/constants/apiEndpoints', () => ({
  CONTENT_VIDEO_ENCODE: '/api/encode/',
  CONTENT_BASE_ENCODE: '/api/encode-base',
  CONTENT_BASE_ZIP: '/api/zip/',
}), { virtual: true })

jest.mock('@ws/author/src/lib/constants/upload', () => ({
  FIXED_FILE_NAME: ['iFrame.html', 'artifact.do'],
}), { virtual: true })

jest.mock('@sunbird-cb/utils-v2', () => ({
  ConfigurationsService: class {
    rootOrg = 'testRoot'
    org = ['testOrg']
  },
}), { virtual: true })

jest.mock('@ws/author/src/lib/modules/shared/services/api.service', () => ({
  ApiService: class {
    post = jest.fn(() => of({}))
    base64 = jest.fn(() => ({ data: 'base64data' }))
  },
}), { virtual: true })

jest.mock('@ws/author/src/lib/modules/shared/services/access-control.service', () => ({
  AccessControlService: class {
    rootOrg = 'testRoot'
    org = 'testOrg'
  },
}), { virtual: true })

describe('UploadService', () => {
  let service: UploadService
  let mockApiService: any
  let mockAccessService: any
  let mockHttp: any
  let mockConfigSvc: any

  beforeEach(() => {
    mockApiService = {
      post: jest.fn(() => of({ result: 'SUCCESS' })),
      base64: jest.fn(() => ({ data: 'base64data' })),
    }
    mockAccessService = { rootOrg: 'testRoot', org: 'testOrg' }
    mockHttp = { post: jest.fn(() => of({})) }
    mockConfigSvc = { rootOrg: 'testRoot', org: ['testOrg'] }
    service = new UploadService(mockApiService, mockAccessService, mockHttp, mockConfigSvc)
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('appendToFilename appends timestamp before extension', () => {
    const result = service.appendToFilename('video.mp4')
    expect(result).toMatch(/video\d+\.mp4/)
  })

  it('appendToFilename appends timestamp without extension when no dot', () => {
    const result = service.appendToFilename('videofile')
    expect(result).toMatch(/videofile\d+/)
  })

  it('upload calls apiService.post for non-zip file', () => {
    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' })
    const formData = new FormData()
    formData.append('content', file)
    const contentData: any = { contentId: 'content001', contentType: 'pdf' }
    service.upload(formData, contentData, {}, false)
    expect(mockApiService.post).toHaveBeenCalledWith(
      expect.stringContaining('content001'), expect.any(FormData), false, {}
    )
  })

  it('upload calls zipUpload when isZip=true', () => {
    const file = new File(['zip'], 'archive.zip')
    const formData = new FormData()
    formData.append('content', file)
    const contentData: any = { contentId: 'content001.img', contentType: 'zip' }
    service.upload(formData, contentData, {}, true)
    expect(mockApiService.post).toHaveBeenCalledWith(
      expect.stringContaining('/api/zip/'), expect.any(FormData), false, {}
    )
  })

  it('upload uses original fileName when in FIXED_FILE_NAME list', () => {
    const file = new File(['html'], 'iFrame.html', { type: 'text/html' })
    const formData = new FormData()
    formData.append('content', file)
    const contentData: any = { contentId: 'content002', contentType: 'html' }
    service.upload(formData, contentData, {}, false)
    expect(mockApiService.post).toHaveBeenCalled()
  })

  it('startEncoding calls apiService.post with encoded URL', () => {
    service.startEncoding('http://example.com/video.mp4', 'content001.img')
    expect(mockApiService.post).toHaveBeenCalledWith(
      expect.stringContaining('content001'),
      { authArtifactURL: 'http://example.com/video.mp4' }
    )
  })

  it('fetchCatalog calls http.post with rootOrg and org', () => {
    service.fetchCatalog()
    expect(mockHttp.post).toHaveBeenCalledWith(
      expect.stringContaining('/social/catalog'),
      { rootOrg: 'testRoot', org: ['testOrg'] }
    )
  })

  it('encodedUpload calls apiService.post with encoded data', () => {
    const contentData: any = 'content003.img'
    service.encodedUpload('rawdata', 'file.pdf', contentData)
    expect(mockApiService.post).toHaveBeenCalledWith(
      '/api/encode-base',
      expect.objectContaining({ fileName: 'file.pdf' }),
      false
    )
  })
})
