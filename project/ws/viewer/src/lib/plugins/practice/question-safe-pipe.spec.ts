import { QuestionSafeUrlPipe } from './question-safe-pipe.pipe'

jest.mock('@angular/platform-browser', () => ({
  DomSanitizer: jest.fn(),
}), { virtual: true })

describe('QuestionSafeUrlPipe', () => {
  it('transform - calls bypassSecurityTrustHtml with the url', () => {
    const mockSanitizer: any = {
      bypassSecurityTrustHtml: jest.fn().mockReturnValue('<safe>html</safe>'),
    }
    const pipe = new QuestionSafeUrlPipe(mockSanitizer)
    const result = pipe.transform('<b>test</b>')
    expect(mockSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith('<b>test</b>')
    expect(result).toBe('<safe>html</safe>')
  })

  it('transform - handles empty string', () => {
    const mockSanitizer: any = {
      bypassSecurityTrustHtml: jest.fn().mockReturnValue(''),
    }
    const pipe = new QuestionSafeUrlPipe(mockSanitizer)
    const result = pipe.transform('')
    expect(mockSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith('')
    expect(result).toBe('')
  })

  it('transform - handles undefined', () => {
    const mockSanitizer: any = {
      bypassSecurityTrustHtml: jest.fn().mockReturnValue(null),
    }
    const pipe = new QuestionSafeUrlPipe(mockSanitizer)
    const result = pipe.transform(undefined as any)
    expect(mockSanitizer.bypassSecurityTrustHtml).toHaveBeenCalledWith(undefined)
    expect(result).toBeNull()
  })
})
