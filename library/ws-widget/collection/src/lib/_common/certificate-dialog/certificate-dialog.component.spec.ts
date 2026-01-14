/* eslint-disable @typescript-eslint/no-explicit-any */
jest.mock('jspdf', () => ({ jsPDF: jest.fn().mockImplementation(() => ({ addImage: jest.fn(), save: jest.fn() })) }))
import { CertificateDialogComponent } from './certificate-dialog.component'
import { environment } from 'src/environments/environment'

describe('CertificateDialogComponent (no TestBed)', () => {
  let component: CertificateDialogComponent
  let events: any
  let dialogRef: any
  const data = { cet: 'data:image/png;base64,abc', certId: '123' }

  beforeEach(() => {
    events = { raiseInteractTelemetry: jest.fn() } as any
    dialogRef = { close: jest.fn() } as any
    component = new CertificateDialogComponent(events, dialogRef, data as any)
      ; (environment as any).contentHost = 'https://example.com'
  })

  test('ngOnInit sets url and navUrl', () => {
    component.ngOnInit()
    expect(component.url).toBe(data.cet)
    expect(component.navUrl).toContain((environment as any).contentHost)
    expect(component.navUrl).toContain(data.certId)
  })

  test('downloadCert creates anchor and triggers click', () => {
    const origCreate = document.createElement.bind(document)
    const anchorMock: any = { href: '', download: '', style: '', click: jest.fn(), remove: jest.fn() }
      ; (document as any).createElement = jest.fn().mockImplementation((tag: string) => {
        if (tag === 'a') return anchorMock
        return origCreate(tag)
      })
    const appendSpy = jest.spyOn(document.body, 'appendChild')
    component.downloadCert()
    expect(anchorMock.href).toBe(data.cet)
    expect(anchorMock.download).toBe('Certificate')
    expect(appendSpy).toHaveBeenCalled()
    expect(anchorMock.click).toHaveBeenCalled()
      ; (document as any).createElement = origCreate
    appendSpy.mockRestore()
  })

  test('downloadCertPng draws image to canvas and triggers download', () => {
    const origCreate = document.createElement.bind(document)
    const canvasMock: any = { width: 0, height: 0, getContext: jest.fn().mockReturnValue({ drawImage: jest.fn() }), toDataURL: jest.fn().mockReturnValue('data:image/png;base64,xyz') }
    const anchorMock: any = { href: '', download: '', append: jest.fn(), click: jest.fn(), remove: jest.fn() }
      ; (document as any).createElement = jest.fn().mockImplementation((tag: string) => {
        if (tag === 'canvas') return canvasMock
        if (tag === 'a') return anchorMock
        return origCreate(tag)
      })
    let lastImage: any = null
    class ImageMock {
      src = ''
      width = 0
      height = 0
      onload: any = null
      constructor() { lastImage = this }
    }
    ; (global as any).Image = ImageMock
    component.downloadCertPng()
    expect(lastImage).not.toBeNull()
    lastImage.onload()
    expect(canvasMock.getContext).toHaveBeenCalledWith('2d')
    expect(anchorMock.href).toBe('data:image/png;base64,xyz')
    expect(anchorMock.download).toBe('Certificate')
    expect(anchorMock.click).toHaveBeenCalled()
      ; (document as any).createElement = origCreate
  })

  test('downloadCertPdf uses jsPDF and saves', () => {
    const origCreate = document.createElement.bind(document)
    const canvasMock: any = { width: 0, height: 0, getContext: jest.fn().mockReturnValue({ drawImage: jest.fn() }), toDataURL: jest.fn().mockReturnValue('data:application/pdf;base64,xyz') }
      ; (document as any).createElement = jest.fn().mockImplementation((tag: string) => {
        if (tag === 'canvas') return canvasMock
        if (tag === 'a') return { href: '', download: '', append: jest.fn(), click: jest.fn(), remove: jest.fn() }
        return origCreate(tag)
      })
    let lastImage: any = null
    class ImageMock { src = ''; width = 0; height = 0; onload: any = null; constructor() { lastImage = this } }
    ; (global as any).Image = ImageMock
    component.downloadCertPdf()
    lastImage.onload()
    const { jsPDF } = require('jspdf')
    const jsPdfInstance = (jsPDF as any).mock.results[0].value
    expect(jsPdfInstance.addImage).toHaveBeenCalled()
    expect(jsPdfInstance.save).toHaveBeenCalledWith('Certificate.pdf')
      ; (document as any).createElement = origCreate
  })

  test('shareCert opens window with navUrl and raises telemetry', () => {
    component.ngOnInit()
    const openSpy = jest.spyOn(window, 'open').mockImplementation(() => null as any)
    component.shareCert()
    expect(openSpy).toHaveBeenCalledWith(component.navUrl, '_blank')
    openSpy.mockRestore()
  })

  test('raiseShareIntreactTelemetry and raiseIntreactTelemetry call events', () => {
    component.ngOnInit()
    component.raiseShareIntreactTelemetry('share', 'action')
    component.raiseIntreactTelemetry('pdf')
    expect(events.raiseInteractTelemetry).toHaveBeenCalled()
  })
})