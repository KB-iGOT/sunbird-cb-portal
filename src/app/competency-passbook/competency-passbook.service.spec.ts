import { CompetencyPassbookService } from './competency-passbook.service'
import { of } from 'rxjs'

describe('CompetencyPassbookService', () => {
  let service: CompetencyPassbookService
  let httpMock: any

  beforeEach(() => {
    httpMock = {
      post: jest.fn(),
      get: jest.fn(),
    }
    service = new CompetencyPassbookService(httpMock as any)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('getCompetencyList', () => {
    it('should call http.post with COMPETENCY_LIST endpoint and payload', () => {
      const payload = { search: { type: 'Competency' } }
      const mockResponse = { result: { count: 2, content: [] } }
      httpMock.post.mockReturnValue(of(mockResponse))

      let result: any
      service.getCompetencyList(payload).subscribe(res => (result = res))

      expect(httpMock.post).toHaveBeenCalledWith(
        'apis/proxies/v8/competency/v4/search',
        payload
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('fetchCertificate', () => {
    it('should call http.get with CERTIFICATE_URL + certId', () => {
      const certId = 'cert123'
      const mockResponse = { url: 'https://cert.example.com/cert123' }
      httpMock.get.mockReturnValue(of(mockResponse))

      let result: any
      service.fetchCertificate(certId).subscribe(res => (result = res))

      expect(httpMock.get).toHaveBeenCalledWith(
        `apis/protected/v8/cohorts/course/batch/cert/download/${certId}`
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('fetchAllCompetencyList', () => {
    it('should call http.get with ALL_COMPETENCY_LIST endpoint', () => {
      const mockResponse = { result: { framework: {} } }
      httpMock.get.mockReturnValue(of(mockResponse))

      let result: any
      service.fetchAllCompetencyList().subscribe(res => (result = res))

      expect(httpMock.get).toHaveBeenCalledWith(
        'apis/proxies/v8/framework/v1/read/kcmfinal_fw'
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getMyCompetencyList', () => {
    it('should call http.get with MY_COMPETENCY_LIST endpoint', () => {
      const mockResponse = { result: [] }
      httpMock.get.mockReturnValue(of(mockResponse))

      let result: any
      service.getMyCompetencyList().subscribe(res => (result = res))

      expect(httpMock.get).toHaveBeenCalledWith(
        'apis/proxies/v8/learner/v1/competency/read'
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getIGOTCourseList', () => {
    it('should call http.post with IGOT_COURSE_LIST endpoint and payload', () => {
      const payload = { request: { query: 'Angular' } }
      const mockResponse = { result: { content: [] } }
      httpMock.post.mockReturnValue(of(mockResponse))

      let result: any
      service.getIGOTCourseList(payload).subscribe(res => (result = res))

      expect(httpMock.post).toHaveBeenCalledWith(
        'apis/proxies/v8/sunbirdigot/v4/search',
        payload
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getExternalCourseList', () => {
    it('should call http.post with EXT_COURSE_LIST endpoint and payload', () => {
      const payload = { filters: { type: 'Course' } }
      const mockResponse = { courses: [] }
      httpMock.post.mockReturnValue(of(mockResponse))

      let result: any
      service.getExternalCourseList(payload).subscribe(res => (result = res))

      expect(httpMock.post).toHaveBeenCalledWith(
        'apis/proxies/v8/cios/v1/search/content',
        payload
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getAcheivementsList', () => {
    it('should call http.post with ACHIEVEMENTS_LIST endpoint and payload', () => {
      const payload = { userId: 'user1' }
      const mockResponse = { achievements: [] }
      httpMock.post.mockReturnValue(of(mockResponse))

      let result: any
      service.getAcheivementsList(payload).subscribe(res => (result = res))

      expect(httpMock.post).toHaveBeenCalledWith(
        'apis/proxies/v8/learner/achievement/v2/list',
        payload
      )
      expect(result).toEqual(mockResponse)
    })
  })
})
