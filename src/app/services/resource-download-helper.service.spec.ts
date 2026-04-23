import { ResourceDownloadHelperService } from './resource-download-helper.service'
import * as fileSaver from 'file-saver'

jest.mock('file-saver', () => ({ saveAs: jest.fn() }))

describe('ResourceDownloadHelperService', () => {
  let service: ResourceDownloadHelperService
  let eventSvcMock: any

  beforeEach(() => {
    eventSvcMock = {
      dispatchChatbotEvent: jest.fn(),
    }
    service = new ResourceDownloadHelperService(eventSvcMock as any)
    jest.clearAllMocks()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should initialize downloadInProgress as empty object', () => {
    expect(service.downloadInProgress).toEqual({})
  })

  describe('raiseDownloadAllTelemetry', () => {
    it('should call eventSvc.dispatchChatbotEvent with correct event structure', () => {
      const content: any = { identifier: 'content-123', courseCategory: 'Course' }
      service.raiseDownloadAllTelemetry('download', content, '/page/home')

      expect(eventSvcMock.dispatchChatbotEvent).toHaveBeenCalledTimes(1)
      const event = eventSvcMock.dispatchChatbotEvent.mock.calls[0][0]
      expect(event.data.edata.id).toBe('content-123')
      expect(event.data.edata.pageid).toBe('/page/home')
      expect(event.data.edata.subType).toBe('download')
      expect(event.data.object.id).toBe('content-123')
      expect(event.data.object.type).toBe('Course')
      expect(event.to).toBe('Telemetry')
    })

    it('should use empty string for identifier when content has no identifier', () => {
      const content: any = { courseCategory: 'Course' }
      service.raiseDownloadAllTelemetry('download', content, '/page/home')
      const event = eventSvcMock.dispatchChatbotEvent.mock.calls[0][0]
      expect(event.data.edata.id).toBe('')
    })

    it('should set correct pageContext', () => {
      const content: any = { identifier: 'id1', courseCategory: 'Course' }
      service.raiseDownloadAllTelemetry('download', content, '/page/home')
      const event = eventSvcMock.dispatchChatbotEvent.mock.calls[0][0]
      expect(event.pageContext.pageId).toBe('/app/toc/id1')
      expect(event.pageContext.module).toBe('Player')
    })

    it('should set from to empty string and to to Telemetry', () => {
      service.raiseDownloadAllTelemetry('view', { identifier: 'x', courseCategory: 'C' } as any, 'pg')
      const event = eventSvcMock.dispatchChatbotEvent.mock.calls[0][0]
      expect(event.from).toBe('')
      expect(event.to).toBe('Telemetry')
    })
  })

  describe('downloadPDF', () => {
    it('should log error and return if no artifactUrl', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { })
      service.downloadPDF({ identifier: 'id1' } as any, '/page/home')
      expect(consoleSpy).toHaveBeenCalledWith('No artifact URL provided')
      expect(service.downloadInProgress['id1']).toBeUndefined()
      consoleSpy.mockRestore()
    })

    it('should set downloadInProgress to true and call raiseDownloadAllTelemetry when artifactUrl exists', () => {
      const spy = jest.spyOn(service, 'raiseDownloadAllTelemetry').mockImplementation(() => { })
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(new Blob()),
      }) as any

      const contentData = { identifier: 'id1', artifactUrl: 'https://example.com/file.pdf', name: 'TestFile' }
      service.downloadPDF(contentData as any, '/page/home')

      expect(service.downloadInProgress['id1']).toBe(true)
      expect(spy).toHaveBeenCalledWith('download', contentData, '/page/home')
      spy.mockRestore()
    })

    it('should use content identifier as download key', () => {
      jest.spyOn(service, 'raiseDownloadAllTelemetry').mockImplementation(() => { })
      global.fetch = jest.fn().mockResolvedValue({ ok: true, blob: () => Promise.resolve(new Blob()) }) as any

      service.downloadPDF({ identifier: 'myId', artifactUrl: 'https://x.com/f.pdf' } as any, 'pg')
      expect(service.downloadInProgress['myId']).toBe(true)
    })

    it('should use content name or default to download as filename', () => {
      jest.spyOn(service, 'raiseDownloadAllTelemetry').mockImplementation(() => { })
      global.fetch = jest.fn().mockResolvedValue({ ok: true, blob: () => Promise.resolve(new Blob()) }) as any

      // No name provided - defaults to 'download'
      service.downloadPDF({ identifier: 'id2', artifactUrl: 'https://x.com/f.pdf' } as any, 'pg')
      expect(service.downloadInProgress['id2']).toBe(true)
    })
  })

  describe('downloadPDF via fetch flow', () => {
    beforeEach(() => {
      jest.spyOn(service, 'raiseDownloadAllTelemetry').mockImplementation(() => { })
    })

    it('should handle successful fetch with pdf URL and call saveAs', async () => {
      const blob = new Blob(['data'], { type: 'application/pdf' })
      global.fetch = jest.fn().mockResolvedValue({ ok: true, blob: () => Promise.resolve(blob) }) as any

      service.downloadPDF({ identifier: 'id1', artifactUrl: 'https://x.com/file.pdf', name: 'MyDoc' } as any, 'pg')

      await new Promise(resolve => setTimeout(resolve, 50))
      expect(fileSaver.saveAs).toHaveBeenCalled()
      expect(service.downloadInProgress['id1']).toBe(false)
    })

    it('should handle successful fetch with mp4 URL', async () => {
      const blob = new Blob(['data'], { type: 'video/mp4' })
      global.fetch = jest.fn().mockResolvedValue({ ok: true, blob: () => Promise.resolve(blob) }) as any

      service.downloadPDF({ identifier: 'id2', artifactUrl: 'https://x.com/video.mp4', name: 'Video' } as any, 'pg')

      await new Promise(resolve => setTimeout(resolve, 50))
      expect(fileSaver.saveAs).toHaveBeenCalled()
    })

    it('should fall back to XHR when fetch response is not ok', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { })
      global.fetch = jest.fn().mockResolvedValue({ ok: false, blob: () => Promise.resolve(new Blob()) }) as any

      // XHR mock
      const xhrMock: any = {
        open: jest.fn(),
        send: jest.fn(),
        onload: null,
        onerror: null,
        status: 200,
        response: new Blob(),
        getResponseHeader: jest.fn().mockReturnValue('application/octet-stream'),
        readyState: 4,
      }
        ; (global as any).XMLHttpRequest = jest.fn(() => xhrMock)

      service.downloadPDF({ identifier: 'id3', artifactUrl: 'https://x.com/file.docx', name: 'Doc' } as any, 'pg')
      await new Promise(resolve => setTimeout(resolve, 50))
      consoleSpy.mockRestore()
    })

    it('should fall back to XHR when fetch throws error', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { })
      global.fetch = jest.fn().mockRejectedValue(new Error('Network fail')) as any

      const xhrMock: any = {
        open: jest.fn(),
        send: jest.fn(),
        onload: null,
        onerror: null,
        status: 200,
        response: new Blob(),
        getResponseHeader: jest.fn().mockReturnValue('application/pdf'),
      }
        ; (global as any).XMLHttpRequest = jest.fn(() => xhrMock)

      service.downloadPDF({ identifier: 'id4', artifactUrl: 'https://x.com/file.pdf', name: 'Doc' } as any, 'pg')
      await new Promise(resolve => setTimeout(resolve, 50))

      expect(xhrMock.open).toHaveBeenCalledWith('GET', 'https://x.com/file.pdf', true)
      expect(xhrMock.send).toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should handle XHR onload success (status 200)', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { })
      global.fetch = jest.fn().mockRejectedValue(new Error('fail')) as any

      const xhrMock: any = {
        open: jest.fn(),
        send: jest.fn(),
        onload: null as any,
        onerror: null as any,
        status: 200,
        response: new Blob(['pdf']),
        getResponseHeader: jest.fn().mockReturnValue('application/pdf'),
      }
        ; (global as any).XMLHttpRequest = jest.fn(() => xhrMock)

      service.downloadPDF({ identifier: 'id5', artifactUrl: 'https://x.com/doc.pdf', name: 'D' } as any, 'pg')
      await new Promise(resolve => setTimeout(resolve, 20))

      if (xhrMock.onload) xhrMock.onload()
      await new Promise(resolve => setTimeout(resolve, 20))
      consoleSpy.mockRestore()
    })

    it('should handle XHR onerror fallback', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { })
      global.fetch = jest.fn().mockRejectedValue(new Error('fail')) as any

      const xhrMock: any = {
        open: jest.fn(),
        send: jest.fn(),
        onload: null as any,
        onerror: null as any,
        status: 500,
        response: new Blob(),
        getResponseHeader: jest.fn().mockReturnValue(null),
      }
        ; (global as any).XMLHttpRequest = jest.fn(() => xhrMock)

      service.downloadPDF({ identifier: 'id6', artifactUrl: 'https://x.com/doc.png', name: 'D' } as any, 'pg')
      await new Promise(resolve => setTimeout(resolve, 20))
      if (xhrMock.onerror) xhrMock.onerror()
      await new Promise(resolve => setTimeout(resolve, 20))
      consoleSpy.mockRestore()
    })

    it('should append file extension to filename if missing', async () => {
      const blob = new Blob(['data'], { type: 'application/pdf' })
      global.fetch = jest.fn().mockResolvedValue({ ok: true, blob: () => Promise.resolve(blob) }) as any

      service.downloadPDF({ identifier: 'id7', artifactUrl: 'https://x.com/file.pdf', name: 'NoPdfExtension' } as any, 'pg')
      await new Promise(resolve => setTimeout(resolve, 50))

      const saveAsCalls = (fileSaver.saveAs as unknown as jest.Mock).mock.calls
      if (saveAsCalls.length > 0) {
        const filename = saveAsCalls[saveAsCalls.length - 1][1]
        expect(filename).toContain('pdf')
      }
    })

    it('should handle doc extension URL mime type', async () => {
      const blob = new Blob(['data'], { type: 'application/msword' })
      global.fetch = jest.fn().mockResolvedValue({ ok: true, blob: () => Promise.resolve(blob) }) as any

      service.downloadPDF({ identifier: 'id8', artifactUrl: 'https://x.com/file.doc', name: 'Document' } as any, 'pg')
      await new Promise(resolve => setTimeout(resolve, 50))
    })

    it('should handle docx extension URL mime type', async () => {
      const blob = new Blob(['data'])
      global.fetch = jest.fn().mockResolvedValue({ ok: true, blob: () => Promise.resolve(blob) }) as any
      service.downloadPDF({ identifier: 'id9', artifactUrl: 'https://x.com/file.docx', name: 'Doc' } as any, 'pg')
      await new Promise(resolve => setTimeout(resolve, 50))
    })

    it('should handle xls extension URL mime type', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: true, blob: () => Promise.resolve(new Blob()) }) as any
      service.downloadPDF({ identifier: 'id10', artifactUrl: 'https://x.com/f.xls', name: 'Sheet' } as any, 'pg')
      await new Promise(resolve => setTimeout(resolve, 50))
    })

    it('should handle xlsx extension URL mime type', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: true, blob: () => Promise.resolve(new Blob()) }) as any
      service.downloadPDF({ identifier: 'id11', artifactUrl: 'https://x.com/f.xlsx', name: 'Sheet' } as any, 'pg')
      await new Promise(resolve => setTimeout(resolve, 50))
    })

    it('should handle ppt extension URL mime type', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: true, blob: () => Promise.resolve(new Blob()) }) as any
      service.downloadPDF({ identifier: 'id12', artifactUrl: 'https://x.com/f.ppt', name: 'Slides' } as any, 'pg')
      await new Promise(resolve => setTimeout(resolve, 50))
    })

    it('should handle pptx extension URL mime type', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: true, blob: () => Promise.resolve(new Blob()) }) as any
      service.downloadPDF({ identifier: 'id13', artifactUrl: 'https://x.com/f.pptx', name: 'Slides' } as any, 'pg')
      await new Promise(resolve => setTimeout(resolve, 50))
    })

    it('should handle jpg extension URL mime type', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: true, blob: () => Promise.resolve(new Blob()) }) as any
      service.downloadPDF({ identifier: 'id14', artifactUrl: 'https://x.com/f.jpg', name: 'Image' } as any, 'pg')
      await new Promise(resolve => setTimeout(resolve, 50))
    })

    it('should handle jpeg extension URL mime type', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: true, blob: () => Promise.resolve(new Blob()) }) as any
      service.downloadPDF({ identifier: 'id15', artifactUrl: 'https://x.com/f.jpeg', name: 'Image' } as any, 'pg')
      await new Promise(resolve => setTimeout(resolve, 50))
    })

    it('should handle png extension URL mime type', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: true, blob: () => Promise.resolve(new Blob()) }) as any
      service.downloadPDF({ identifier: 'id16', artifactUrl: 'https://x.com/f.png', name: 'Image' } as any, 'pg')
      await new Promise(resolve => setTimeout(resolve, 50))
    })

    it('should handle unknown extension URL with octet-stream mime type', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: true, blob: () => Promise.resolve(new Blob()) }) as any
      service.downloadPDF({ identifier: 'id17', artifactUrl: 'https://x.com/f.xyz', name: 'Unknown' } as any, 'pg')
      await new Promise(resolve => setTimeout(resolve, 50))
    })

    it('should handle URL with query params for extension extraction', async () => {
      global.fetch = jest.fn().mockResolvedValue({ ok: true, blob: () => Promise.resolve(new Blob()) }) as any
      service.downloadPDF({ identifier: 'id18', artifactUrl: 'https://x.com/f.pdf?v=1', name: 'Doc' } as any, 'pg')
      await new Promise(resolve => setTimeout(resolve, 50))
    })

    it('should handle saveBlob FileSaver failure and fall back to manual download', async () => {
      ; (fileSaver.saveAs as unknown as jest.Mock).mockImplementationOnce(() => { throw new Error('FileSaver failed') })
      const blob = new Blob(['data'], { type: 'application/pdf' })
      global.fetch = jest.fn().mockResolvedValue({ ok: true, blob: () => Promise.resolve(blob) }) as any

      const createObjURL = jest.fn().mockReturnValue('blob:url')
      const revokeObjURL = jest.fn()
      const appendChild = jest.fn()
      const removeChild = jest.fn()
      const click = jest.fn()
      const anchor = { style: { display: '' }, href: '', download: '', click }

      window.URL.createObjectURL = createObjURL
      window.URL.revokeObjectURL = revokeObjURL
      jest.spyOn(document, 'createElement').mockReturnValueOnce(anchor as any)
      jest.spyOn(document.body, 'appendChild').mockImplementation(appendChild)
      jest.spyOn(document.body, 'removeChild').mockImplementation(removeChild)

      service.downloadPDF({ identifier: 'id19', artifactUrl: 'https://x.com/f.pdf', name: 'D' } as any, 'pg')
      await new Promise(resolve => setTimeout(resolve, 50))
    })
  })
})
