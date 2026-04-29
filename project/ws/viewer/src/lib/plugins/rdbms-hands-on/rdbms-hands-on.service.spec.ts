import { of } from 'rxjs'

jest.mock('@angular/core', () => ({
  Injectable: () => () => {},
}), { virtual: true })

jest.mock('@angular/common/http', () => ({
  HttpClient: jest.fn(),
}), { virtual: true })

jest.mock('./rdbms-hands-on.model', () => ({ NSRdbmsHandsOn: {} }), { virtual: true })

import { RdbmsHandsOnService } from './rdbms-hands-on.service'

describe('RdbmsHandsOnService', () => {
  let service: RdbmsHandsOnService
  let mockHttp: any

  beforeEach(() => {
    mockHttp = {
      get: jest.fn().mockReturnValue(of({ data: 'result' })),
      post: jest.fn().mockReturnValue(of({ data: 'result' })),
    }
    service = new RdbmsHandsOnService(mockHttp)
  })

  it('should create', () => {
    expect(service).toBeTruthy()
  })

  it('verifyQuery posts to correct endpoint', done => {
    service.verifyQuery({ query: 'SELECT 1' }, 'do_123').subscribe(res => {
      expect(res).toEqual({ data: 'result' })
      expect(mockHttp.post).toHaveBeenCalledWith(
        '/apis/protected/v8/user/rdbms/verifyExercise/do_123',
        { query: 'SELECT 1' },
      )
      done()
    })
  })

  it('submitQuery posts to correct endpoint', done => {
    service.submitQuery({ ans: 'x' }, 'do_456').subscribe(res => {
      expect(res).toEqual({ data: 'result' })
      expect(mockHttp.post).toHaveBeenCalledWith(
        '/apis/protected/v8/user/rdbms/submitExercise/do_456',
        { ans: 'x' },
      )
      done()
    })
  })

  it('runQuery wraps input in input_data and posts', done => {
    service.runQuery('SELECT 1').subscribe(res => {
      expect(res).toEqual({ data: 'result' })
      expect(mockHttp.post).toHaveBeenCalledWith(
        '/apis/protected/v8/user/rdbms/executeQuery',
        { input_data: 'SELECT 1' },
      )
      done()
    })
  })

  it('compareQuery posts original and user queries', done => {
    service.compareQuery('SELECT 1', 'SELECT 2').subscribe(res => {
      expect(res).toEqual({ data: 'result' })
      expect(mockHttp.post).toHaveBeenCalledWith(
        '/apis/protected/v8/user/rdbms/compareQuery',
        { original_query: 'SELECT 1', user_query: 'SELECT 2' },
      )
      done()
    })
  })

  it('playground wraps input in input_data and posts', done => {
    service.playground('SELECT *').subscribe(res => {
      expect(res).toEqual({ data: 'result' })
      expect(mockHttp.post).toHaveBeenCalledWith(
        '/apis/protected/v8/user/rdbms/playground',
        { input_data: 'SELECT *' },
      )
      done()
    })
  })

  it('compositeQuery wraps input in input_data and posts with type', done => {
    service.compositeQuery('SELECT 1', 'dml').subscribe(res => {
      expect(res).toEqual({ data: 'result' })
      expect(mockHttp.post).toHaveBeenCalledWith(
        '/apis/protected/v8/user/rdbms/compositeQuery/dml',
        { input_data: 'SELECT 1' },
      )
      done()
    })
  })

  it('initializeDatabase calls get with correct URL', done => {
    service.initializeDatabase('do_789').subscribe(res => {
      expect(res).toEqual({ data: 'result' })
      expect(mockHttp.get).toHaveBeenCalledWith(
        '/apis/protected/v8/user/rdbms/initializeDb/do_789',
      )
      done()
    })
  })

  it('fetchDBStructure calls get with correct URL', done => {
    service.fetchDBStructure('do_111').subscribe(res => {
      expect(res).toEqual({ data: 'result' })
      expect(mockHttp.get).toHaveBeenCalledWith(
        '/apis/protected/v8/user/rdbms/dbStructure/do_111',
      )
      done()
    })
  })

  it('tableRefresh calls get with correct URL', done => {
    service.tableRefresh('do_222').subscribe(res => {
      expect(res).toEqual({ data: 'result' })
      expect(mockHttp.get).toHaveBeenCalledWith(
        '/apis/protected/v8/user/rdbms/tableRefresh/do_222',
      )
      done()
    })
  })

  it('fetchConceptData calls get with correct URL', done => {
    service.fetchConceptData('do_333').subscribe(res => {
      expect(res).toEqual({ data: 'result' })
      expect(mockHttp.get).toHaveBeenCalledWith(
        '/apis/protected/v8/user/rdbms/conceptData/do_333',
      )
      done()
    })
  })

  it('fetchExpectedOutput calls get with correct URL', done => {
    service.fetchExpectedOutput('do_444').subscribe(res => {
      expect(res).toEqual({ data: 'result' })
      expect(mockHttp.get).toHaveBeenCalledWith(
        '/apis/protected/v8/user/rdbms/expectedOutput/do_444',
      )
      done()
    })
  })
})
