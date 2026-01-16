import { ResourceDownloadHelperService } from './resource-download-helper.service'
import { EventService, WsEvents, NsContent } from '@sunbird-cb/utils-v2'
import * as fileSaver from 'file-saver'

jest.mock('file-saver', () => ({
  saveAs: jest.fn(),
}))

describe('ResourceDownloadHelperService', () => {
  let service: ResourceDownloadHelperService
  let mockEventSvc: any
  const originalFetch = globalThis.fetch
  const originalXMLHttpRequest = globalThis.XMLHttpRequest
  const originalURL = globalThis.URL
  const originalConsoleError = console.error

  beforeEach(() => {
    mockEventSvc = {
      dispatchChatbotEvent: jest.fn(),
    } as Partial<EventService>

    service = new ResourceDownloadHelperService(mockEventSvc as EventService)

    console.error = jest.fn()
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
      ; (globalThis as any).XMLHttpRequest = originalXMLHttpRequest
      ; (globalThis as any).URL = originalURL
    console.error = originalConsoleError
    jest.clearAllMocks()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  describe('raiseDownloadAllTelemetry', () => {
    it('should dispatch telemetry event with correct data', () => {
      const content: Partial<NsContent.IContent> = {
        identifier: 'id1',
        courseCategory: 'Course',
      }

      service.raiseDownloadAllTelemetry('download', content as NsContent.IContent, 'pageId')

      expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalledTimes(1)
      const event = mockEventSvc.dispatchChatbotEvent.mock.calls[0][0]
      expect(event.data.edata.id).toBe('id1')
      expect(event.data.edata.subType).toBe('download')
      expect(event.data.edata.pageid).toBe('pageId')
      expect(event.data.object.id).toBe('id1')
      expect(event.data.object.type).toBe('Course')
      expect(event.pageContext.pageId).toBe('/app/toc/id1')
      expect(event.eventType).toBe(WsEvents.WsEventType.Telemetry)
    })
  })

  describe('downloadPDF', () => {
    it('should log error and return when artifactUrl is missing', () => {
      const content: any = { identifier: 'id1', name: 'Test' }

      service.downloadPDF(content, 'pageId')

      expect(console.error).toHaveBeenCalledWith('No artifact URL provided')
      expect((service as any).downloadInProgress['id1']).toBeUndefined()
    })

    it('should set downloadInProgress and delegate to downloadFile and telemetry when artifactUrl present', () => {
      const content: any = {
        identifier: 'id2',
        name: 'MyFile',
        artifactUrl: 'https://example.com/file.pdf',
        courseCategory: 'Course',
      }

      const downloadSpy = jest
        .spyOn(service as any, 'downloadFile')
        .mockResolvedValue(undefined)

      service.downloadPDF(content, 'homePage')

      expect((service as any).downloadInProgress['id2']).toBe(true)
      expect(downloadSpy).toHaveBeenCalledWith(
        'https://example.com/file.pdf',
        'MyFile',
        'id2',
      )
      expect(mockEventSvc.dispatchChatbotEvent).toHaveBeenCalledTimes(1)
    })
  })

  describe('downloadFile', () => {
    beforeEach(() => {
      ; (service as any).saveBlob = jest.fn()
    })

    it('should append file extension if missing and use fetch success path', async () => {
      const blobMock = new Blob(['data'], { type: 'application/pdf' })
      globalThis.fetch = jest.fn().mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(blobMock),
      }) as any

      const promise = (service as any).downloadFile(
        'https://example.com/file.pdf',
        'report',
        'id3',
      ) as Promise<void>

      await promise

      expect(globalThis.fetch).toHaveBeenCalledWith('https://example.com/file.pdf', {
        method: 'GET',
        mode: 'cors',
      })
      expect((service as any).saveBlob).toHaveBeenCalled()
      const args = (service as any).saveBlob.mock.calls[0]
      expect(args[1]).toBe('report.pdf')
      expect((service as any).downloadInProgress['id3']).toBe(false)
    })

    it('should call downloadWithXHR on fetch failure and clear flag', async () => {
      globalThis.fetch = jest.fn().mockRejectedValue(new Error('fail')) as any

      const xhrSpy = jest
        .spyOn(service as any, 'downloadWithXHR')
        .mockResolvedValue(undefined)

      const promise = (service as any).downloadFile(
        'https://example.com/doc.pdf',
        'doc',
        'id4',
      ) as Promise<void>

      await promise

      expect(xhrSpy).toHaveBeenCalledWith(
        'https://example.com/doc.pdf',
        'doc.pdf',
      )
      expect((service as any).downloadInProgress['id4']).toBe(false)
    })
  })

  describe('downloadWithXHR', () => {
    let xhrMock: any

    beforeEach(() => {
      xhrMock = {
        open: jest.fn(),
        send: jest.fn(),
        setRequestHeader: jest.fn(),
        getResponseHeader: jest.fn(),
      }

      function XMLHttpRequestMock(this: any) {
        return xhrMock
      }

      ; (globalThis as any).XMLHttpRequest = XMLHttpRequestMock as any
        ; (service as any).saveBlob = jest.fn()
        ; (service as any).tryDirectDownload = jest.fn()
    })

    it('should save blob when status is 200', async () => {
      xhrMock.status = 200
      xhrMock.response = new Blob(['x'], { type: 'application/pdf' })
      xhrMock.getResponseHeader.mockReturnValue('application/pdf')

      const promise = (service as any).downloadWithXHR(
        'https://example.com/file.pdf',
        'file.pdf',
      ) as Promise<void>

      xhrMock.onload()
      await promise

      expect((service as any).saveBlob).toHaveBeenCalled()
      const args = (service as any).saveBlob.mock.calls[0]
      expect(args[1]).toBe('file.pdf')
    })

    it('should fallback to tryDirectDownload when status is not 200', async () => {
      xhrMock.status = 404
      xhrMock.getResponseHeader.mockReturnValue(null)

      const promise = (service as any).downloadWithXHR(
        'https://example.com/file.pdf',
        'file.pdf',
      ) as Promise<void>

      xhrMock.onload()
      await promise

      expect((service as any).tryDirectDownload).toHaveBeenCalledWith(
        'https://example.com/file.pdf',
        'file.pdf',
      )
    })

    it('should fallback to tryDirectDownload on XHR error', async () => {
      const promise = (service as any).downloadWithXHR(
        'https://example.com/file.pdf',
        'file.pdf',
      ) as Promise<void>

      xhrMock.onerror()
      await promise

      expect((service as any).tryDirectDownload).toHaveBeenCalledWith(
        'https://example.com/file.pdf',
        'file.pdf',
      )
    })
  })

  describe('getFileExtension', () => {
    it('should return extension from url', () => {
      const ext = (service as any).getFileExtension(
        'https://example.com/path/file.pdf?version=1',
      )
      expect(ext).toBe('pdf')
    })

    it('should return empty string when no extension', () => {
      const ext = (service as any).getFileExtension('https://example.com/path/')
      expect(ext).toBe('')
    })

    it('should return empty string for falsy url', () => {
      const ext = (service as any).getFileExtension('')
      expect(ext).toBe('')
    })
  })

  describe('getMimeTypeFromUrl', () => {
    it('should map known extensions to mime types', () => {
      expect((service as any).getMimeTypeFromUrl('a.pdf')).toBe('application/pdf')
      expect((service as any).getMimeTypeFromUrl('v.mp4')).toBe('video/mp4')
      expect((service as any).getMimeTypeFromUrl('d.doc')).toBe('application/msword')
      expect((service as any).getMimeTypeFromUrl('d.docx')).toBe('application/msword')
      expect((service as any).getMimeTypeFromUrl('s.xls')).toBe(
        'application/vnd.ms-excel',
      )
      expect((service as any).getMimeTypeFromUrl('s.xlsx')).toBe(
        'application/vnd.ms-excel',
      )
      expect((service as any).getMimeTypeFromUrl('p.ppt')).toBe(
        'application/vnd.ms-powerpoint',
      )
      expect((service as any).getMimeTypeFromUrl('p.pptx')).toBe(
        'application/vnd.ms-powerpoint',
      )
      expect((service as any).getMimeTypeFromUrl('i.jpg')).toBe('image/jpeg')
      expect((service as any).getMimeTypeFromUrl('i.jpeg')).toBe('image/jpeg')
      expect((service as any).getMimeTypeFromUrl('i.png')).toBe('image/png')
    })

    it('should return default mime type for unknown extension', () => {
      expect((service as any).getMimeTypeFromUrl('file.unknown')).toBe(
        'application/octet-stream',
      )
    })
  })

  describe('saveBlob', () => {
    it('should use fileSaver.saveAs when available', () => {
      const blob = new Blob(['x'], { type: 'application/pdf' })
        ; (fileSaver.saveAs as unknown as jest.Mock).mockImplementation(() => { })

        ; (service as any).saveBlob(blob, 'file.pdf')

      expect(fileSaver.saveAs).toHaveBeenCalledWith(blob, 'file.pdf')
    })

    it('should fallback to manual download when fileSaver fails', () => {
      const blob = new Blob(['x'], { type: 'application/pdf' })
        ; (fileSaver.saveAs as unknown as jest.Mock).mockImplementation(() => {
          throw new Error('fail')
        })

      const originalCreateObjectURL = originalURL.createObjectURL
      const originalRevokeObjectURL = originalURL.revokeObjectURL
        ; (globalThis as any).URL = {
          ...originalURL,
          createObjectURL: jest.fn().mockReturnValue('blob:url'),
          revokeObjectURL: jest.fn(),
        }

      const anchorClick = jest.fn()
      const originalCreateElement = document.createElement.bind(document)
      jest
        .spyOn(document, 'createElement')
        .mockImplementation((tagName: any): any => {
          if (tagName === 'a') {
            return {
              style: {},
              href: '',
              download: '',
              click: anchorClick,
            }
          }
          return originalCreateElement(tagName)
        })

        ; (service as any).saveBlob(blob, 'file.pdf')

      expect((globalThis as any).URL.createObjectURL).toHaveBeenCalled()
      expect(anchorClick).toHaveBeenCalled()
        ; (globalThis as any).URL.createObjectURL = originalCreateObjectURL
        ; (globalThis as any).URL.revokeObjectURL = originalRevokeObjectURL
    })
  })

  describe('tryDirectDownload', () => {
    beforeEach(() => {
      jest.useFakeTimers()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('should create link inside iframe and click it when doc is available', () => {
      const iframe: any = {
        style: {},
        contentDocument: {
          body: {
            appendChild: jest.fn(),
            removeChild: jest.fn(),
          },
          createElement: jest.fn(() => {
            return {
              href: '',
              download: '',
              style: {},
              click: jest.fn(),
            }
          }),
        },
      }

      const originalCreateElement = document.createElement.bind(document)
      const appendSpy = jest.spyOn(document.body, 'appendChild')
      const removeSpy = jest.spyOn(document.body, 'removeChild')

      jest
        .spyOn(document, 'createElement')
        .mockImplementation((tagName: any): any => {
          if (tagName === 'iframe') {
            return iframe
          }
          return originalCreateElement(tagName)
        })

        ; (service as any).tryDirectDownload('https://example.com/file.pdf', 'file.pdf')

      expect(appendSpy).toHaveBeenCalledWith(iframe)

      jest.runAllTimers()
      expect(removeSpy).toHaveBeenCalledWith(iframe)
    })

    it('should fallback to anchor when iframe document handling fails', () => {
      const iframe: any = {
        style: {},
        contentDocument: {
          body: {
            appendChild: jest.fn(),
            removeChild: jest.fn(),
          },
          createElement: jest.fn(() => {
            throw new Error('fail')
          }),
        },
      }

      const originalCreateElement = document.createElement.bind(document)
      const anchorClick = jest.fn()

      jest
        .spyOn(document, 'createElement')
        .mockImplementation((tagName: any): any => {
          if (tagName === 'iframe') {
            return iframe
          }
          if (tagName === 'a') {
            return {
              href: '',
              download: '',
              target: '',
              style: {},
              click: anchorClick,
            }
          }
          return originalCreateElement(tagName)
        })

        ; (service as any).tryDirectDownload('https://example.com/file.pdf', 'file.pdf')

      expect(anchorClick).toHaveBeenCalled()
    })
  })
})

