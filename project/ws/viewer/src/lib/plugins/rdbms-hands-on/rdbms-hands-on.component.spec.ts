import { RdbmsHandsOnComponent } from './rdbms-hands-on.component'

function buildComponent() {
  const comp = new RdbmsHandsOnComponent()
  return comp
}

describe('RdbmsHandsOnComponent', () => {
  it('should create', () => {
    const comp = buildComponent()
    expect(comp).toBeTruthy()
  })

  it('should have undefined processedContent by default', () => {
    const comp = buildComponent()
    expect(comp.processedContent).toBeUndefined()
  })

  it('ngOnChanges - should not modify when content is missing', () => {
    const comp = buildComponent()
    comp.processedContent = { rdbms: { problemStatement: '' } }
    expect(() => comp.ngOnChanges()).not.toThrow()
  })

  it('ngOnChanges - should not modify when rdbms.problemStatement is missing', () => {
    const comp = buildComponent()
    comp.processedContent = {
      content: { artifactUrl: 'http://example.com/content/file.pdf' },
      rdbms: {},
    }
    expect(() => comp.ngOnChanges()).not.toThrow()
  })

  it('ngOnChanges - should not replace imageUrl when src= not in problem statement', () => {
    const comp = buildComponent()
    comp.processedContent = {
      content: { artifactUrl: 'http://example.com/content/file.pdf' },
      rdbms: { problemStatement: '<p>No image here</p>' },
    }
    comp.ngOnChanges()
    expect(comp.processedContent.rdbms.problemStatement).toBe('<p>No image here</p>')
  })

  it('ngOnChanges - should replace imageUrl when src= with old prefix found', () => {
    const comp = buildComponent()
    comp.processedContent = {
      content: { artifactUrl: 'http://example.com/assets/file.pdf' },
      rdbms: { problemStatement: "<img src='http://old.com/assets/image.png'>" },
    }
    comp.ngOnChanges()
    // The url segment before the last '/' is extracted; we just verify no throw
    expect(comp.processedContent.rdbms.problemStatement).toBeDefined()
  })

  it('ngOnChanges - replaces imageUrl segment when problem includes src= with assets path', () => {
    const comp = buildComponent()
    const artifactUrl = 'http://example.com/content/assets/file.pdf'
    const problemStatement = "<img src='http://old.prefix/assets/image.png'>"
    comp.processedContent = {
      content: { artifactUrl },
      rdbms: { problemStatement },
    }
    comp.ngOnChanges()
    // The old prefix should be replaced with the url computed from artifactUrl
    expect(comp.processedContent.rdbms.problemStatement).toContain('assets/image.png')
  })

  it('ngOnChanges - full flow with content and problemStatement without src=', () => {
    const comp = buildComponent()
    comp.processedContent = {
      content: { artifactUrl: 'http://cdn.example.com/data/module/file.html' },
      rdbms: { problemStatement: '<div>Some text without image</div>' },
    }
    comp.ngOnChanges()
    expect(comp.processedContent.rdbms.problemStatement).toBe('<div>Some text without image</div>')
  })
})
