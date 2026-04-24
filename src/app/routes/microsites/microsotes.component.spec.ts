jest.mock('./microsites.service', () => ({
  MicrositeService: class {
    searchContentV6 = jest.fn()
  },
}))

jest.mock('@sunbird-cb/consumption', () => ({
  CommonMethodsService: class {
    transformContentsToWidgets = jest.fn()
  },
}))

import { MicrosotesComponent } from './microsotes.component'
import { of } from 'rxjs'

describe('MicrosotesComponent', () => {
  let component: MicrosotesComponent
  let contentSvcMock: any
  let commonSvcMock: any

  beforeEach(() => {
    contentSvcMock = {
      searchV6: jest.fn().mockReturnValue(of({ result: { content: [] } })),
    }
    commonSvcMock = {
      transformContentsToWidgets: jest.fn().mockReturnValue([]),
      transformSkeletonToWidgets: jest.fn().mockReturnValue([]),
    }
    component = new MicrosotesComponent(contentSvcMock, commonSvcMock)
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should initialize sectionList with data', () => {
    expect(component.sectionList).toBeDefined()
    expect(Array.isArray(component.sectionList)).toBe(true)
    expect(component.sectionList.length).toBeGreaterThan(0)
  })

  it('should initialize contentDataList as empty array', () => {
    expect(component.contentDataList).toEqual([])
  })

  it('should initialize loadContentSearch as false', () => {
    expect(component.loadContentSearch).toBe(false)
  })

  describe('ngOnInit', () => {
    it('should call getNavitems and getDataFromSearch', async () => {
      const navSpy = jest.spyOn(component, 'getNavitems')
      const dataSpy = jest.spyOn(component, 'getDataFromSearch').mockResolvedValue(undefined as any)
      component.ngOnInit()
      expect(navSpy).toHaveBeenCalled()
      expect(dataSpy).toHaveBeenCalled()
    })
  })

  describe('getNavitems', () => {
    it('should filter sections with enabled, navigation, and navOrder', () => {
      component.getNavitems()
      expect(component.navList).toBeDefined()
      expect(Array.isArray(component.navList)).toBe(true)
    })

    it('should sort navList by navOrder ascending', () => {
      component.getNavitems()
      if (component.navList.length > 1) {
        for (let i = 0; i < component.navList.length - 1; i++) {
          expect(component.navList[i].navOrder).toBeLessThanOrEqual(component.navList[i + 1].navOrder)
        }
      }
    })

    it('should only include sections with navigation=true', () => {
      component.getNavitems()
      component.navList.forEach((item: any) => {
        expect(item.navigation).toBe(true)
        expect(item.enabled).toBe(true)
      })
    })
  })

  describe('scrollToSection', () => {
    it('should call window.scrollTo when section element exists', () => {
      const mockElement = { offsetTop: 200 }
      jest.spyOn(document, 'getElementById').mockReturnValue(mockElement as any)
      const scrollSpy = jest.spyOn(window, 'scrollTo').mockImplementation(() => { })

      component.scrollToSection('testSection')

      expect(scrollSpy).toHaveBeenCalledWith({
        top: 200 - 121,
        behavior: 'smooth',
      })
      scrollSpy.mockRestore()
    })

    it('should not throw when section element does not exist', () => {
      jest.spyOn(document, 'getElementById').mockReturnValue(null)
      expect(() => component.scrollToSection('nonExistent')).not.toThrow()
    })
  })

  describe('handleSearchQuery', () => {
    it('should call getDataFromSearch when event has value', () => {
      const spy = jest.spyOn(component, 'getDataFromSearch').mockResolvedValue(undefined as any)
      component.handleSearchQuery({ target: { value: 'Angular' } } as any)
      expect(spy).toHaveBeenCalled()
    })

    it('should not call getDataFromSearch when event value is empty', () => {
      const spy = jest.spyOn(component, 'getDataFromSearch').mockResolvedValue(undefined as any)
      component.handleSearchQuery({ target: { value: '' } } as any)
      expect(spy).not.toHaveBeenCalled()
    })
  })

  describe('getDataFromSearch', () => {
    it('should call fetchFromSearchV6 and update contentDataList on success', async () => {
      const mockContent = [{ identifier: 'c1', name: 'Course 1' }]
      contentSvcMock.searchV6.mockReturnValue(
        of({ result: { content: mockContent } })
      )
      commonSvcMock.transformContentsToWidgets.mockReturnValue([{ widget: 'w1' }])

      await component.getDataFromSearch()

      expect(commonSvcMock.transformContentsToWidgets).toHaveBeenCalled()
      expect(component.contentDataList).toEqual([{ widget: 'w1' }])
      expect(component.loadContentSearch).toBe(false)
    })

    it('should handle empty content result', async () => {
      contentSvcMock.searchV6.mockReturnValue(of({ result: {} }))
      await component.getDataFromSearch()
      expect(component.loadContentSearch).toBe(false)
    })
  })

  describe('fetchFromSearchV6', () => {
    it('should resolve with results from searchV6', async () => {
      const mockData = { result: { content: [] } }
      contentSvcMock.searchV6.mockReturnValue(of(mockData))

      const request = { request: { query: '' } }
      const result = await component.fetchFromSearchV6(request)

      expect(result).toEqual({ results: mockData })
    })

    it('should reject when searchV6 errors', async () => {
      contentSvcMock.searchV6.mockReturnValue({
        subscribe: (_: any, errCb: any) => errCb(new Error('API Error')),
      })

      const request = { request: { query: '' } }
      await expect(component.fetchFromSearchV6(request)).rejects.toThrow('API Error')
    })

    it('should not call searchV6 when request is falsy', () => {
      // fetchFromSearchV6(null) returns a promise that never settles (by design)
      // just verify searchV6 is not called synchronously
      component.fetchFromSearchV6(null as any)
      expect(contentSvcMock.searchV6).not.toHaveBeenCalled()
    })
  })

  describe('formRequest', () => {
    it('should return a request object with contentType Course', () => {
      const req = component.formRequest()
      expect(req.request.filters.contentType).toBe('Course')
      expect(req.request.filters.status).toContain('Live')
    })

    it('should include queryText when provided', () => {
      const req = component.formRequest('Angular')
      expect(req.request.query).toBe('Angular')
    })

    it('should use empty string as default query', () => {
      const req = component.formRequest()
      expect(req.request.query).toBe('')
    })

    it('should spread addFilter into filters when provided', () => {
      const req = component.formRequest('test', { primaryCategory: 'Program' })
      expect(req.request.filters.primaryCategory).toBe('Program')
    })
  })

  describe('getNavitems branch coverage', () => {
    it('should filter out items where enabled is false', () => {
      component.sectionList = [
        { active: true, enabled: false, key: 'row1', navigation: true, navOrder: 1 },
        { active: true, enabled: true, key: 'row2', navigation: true, navOrder: 2 },
      ] as any
      component.getNavitems()
      expect(component.navList.length).toBe(1)
      expect(component.navList[0].key).toBe('row2')
    })

    it('should filter out items where navigation is falsy', () => {
      component.sectionList = [
        { active: true, enabled: true, key: 'row1', navigation: false, navOrder: 1 },
        { active: true, enabled: true, key: 'row2', navigation: true, navOrder: 2 },
      ] as any
      component.getNavitems()
      expect(component.navList.length).toBe(1)
    })
  })

  describe('loadCardSkeletonLoader branch coverage', () => {
    it('should not set contentDataList when sectionList has no contentSearch key', () => {
      component.sectionList = [
        { active: true, enabled: true, key: 'other', column: [] },
      ] as any
      component.contentDataList = []
      component.loadCardSkeletonLoader()
      // contentDataList remains unchanged since no contentSearch section found
      expect(component.contentDataList).toEqual([])
    })
  })

  describe('getDataFromSearch error handling', () => {
    it('should handle fetchFromSearchV6 rejection gracefully (catch block)', async () => {
      const { throwError } = require('rxjs')
      contentSvcMock.searchV6.mockReturnValue(throwError(new Error('search error')))
      // Should not throw - catch block handles the error
      await expect(component.getDataFromSearch()).resolves.not.toThrow()
    })
  })
})
