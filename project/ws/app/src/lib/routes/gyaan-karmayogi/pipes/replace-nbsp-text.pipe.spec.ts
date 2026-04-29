import { ReplaceNbspTextPipe } from './replace-nbsp-text.pipe'

describe('ReplaceNbspTextPipe', () => {
  let pipe: ReplaceNbspTextPipe

  beforeEach(() => {
    pipe = new ReplaceNbspTextPipe()
  })

  it('create an instance', () => {
    expect(pipe).toBeTruthy()
  })

  it('replaces &nbsp; with a space', () => {
    expect(pipe.transform('Hello&nbsp;World')).toBe('Hello World')
  })

  it('replaces multiple &nbsp; occurrences', () => {
    expect(pipe.transform('a&nbsp;b&nbsp;c')).toBe('a b c')
  })

  it('returns value unchanged when no &nbsp; present', () => {
    expect(pipe.transform('Hello World')).toBe('Hello World')
  })

  it('returns null when value is null', () => {
    expect(pipe.transform(null)).toBeNull()
  })

  it('returns undefined when value is undefined', () => {
    expect(pipe.transform(undefined)).toBeUndefined()
  })

  it('returns empty string unchanged', () => {
    expect(pipe.transform('')).toBe('')
  })

  it('handles value that includes &nbsp; alongside text', () => {
    expect(pipe.transform('&nbsp;start')).toBe(' start')
    expect(pipe.transform('end&nbsp;')).toBe('end ')
  })
})

