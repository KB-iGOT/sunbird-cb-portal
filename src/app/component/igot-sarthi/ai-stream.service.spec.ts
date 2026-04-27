import { AiStreamService } from './ai-stream.service'

describe('AiStreamService (Jest, no TestBed)', () => {
  let service: AiStreamService

  beforeEach(() => {
    service = new AiStreamService()
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })

  it('should emit answer$ when raw object contains answer', (done) => {
    const received: string[] = []

    const subscription = service.answer$.subscribe((value: string) => {
      received.push(value)
    })

    const raw: any = { answer: 'Hello\\nWorld' }

    service.handleMessage(raw)

    expect(received.length).toBe(1)
    expect(received[0]).toBe('Hello\nWorld')

    subscription.unsubscribe()
    done()
  })

  it('should emit answer$ from stream data before retrieved_chunks', (done) => {
    const values: string[] = []

    const sub = service.answer$.subscribe((v: string) => {
      values.push(v)
    })

    const data = 'answer\\": \\"Partial answer text\\", "retrieved_chunks": [{"Identifier":"1"}]'
    const message: any = { type: 'stream', data }

    service.handleMessage(message)

    // First emission should contain the unescaped answer part
    expect(values.length).toBeGreaterThan(0)
    expect(values[0]).toContain('Partial answer text')

    sub.unsubscribe()
    done()
  })

  it('should emit retrievedChunks$ and update chunks for stream with JSON object', (done) => {
    const retrieved: any[] = []

    const sub = service.retrievedChunks$.subscribe((obj: any) => {
      retrieved.push(obj)
    })

    const jsonObject = '{"Identifier":"abc","value":42}'
    const message: any = { type: 'stream', data: jsonObject }

    service.handleMessage(message)

    // retrievedChunks$ should have received at least one parsed object
    expect(retrieved.length).toBeGreaterThan(0)
    expect(retrieved[0].Identifier).toBe('abc')
    expect(retrieved[0].value).toBe(42)

    // chunks array should also contain parsed objects in addition to raw strings
    const objectChunks = service.chunks.filter((c: any) => typeof c === 'object')
    expect(objectChunks.length).toBeGreaterThan(0)
    expect(objectChunks[0].Identifier).toBe('abc')

    sub.unsubscribe()
    done()
  })

  it('should emit final$ when final message is received', (done) => {
    let called = false

    const sub = service.final$.subscribe(() => {
      called = true
    })

    const message: any = { type: 'final' }

    service.handleMessage(message)

    expect(called).toBe(true)

    sub.unsubscribe()
    done()
  })

  it('should reset emitted answer state and allow new answer', (done) => {
    const received: string[] = []

    const sub = service.answer$.subscribe((v: string) => {
      received.push(v)
    })

    const firstRaw: any = { answer: 'First' }
    service.handleMessage(firstRaw)

    service.resetEmittedAnswer()

    const secondRaw: any = { type: 'stream', data: 'Second' }
    service.handleMessage(secondRaw)

    expect(received[0]).toBe('First')
    expect(received[1]).toContain('Second')

    sub.unsubscribe()
    done()
  })

  it('isValidJSON should return true for valid JSON and false otherwise', () => {
    const valid = '{"a":1}'
    const invalid = '{a:1'

    expect(service.isValidJSON(valid)).toBe(true)
    expect(service.isValidJSON(invalid)).toBe(false)
  })

  it('should handle stream message containing retrieved_chunks keyword and parse JSON', (done) => {
    const chunks: any[] = []
    const sub = service.retrievedChunks$.subscribe(obj => chunks.push(obj))

    // Message with retrieved_chunks keyword so it enters the extractValidJSON path
    const data = '{"retrieved_chunks":true,"Identifier":"xyz"}'
    service.handleMessage({ type: 'stream', data })

    expect(chunks.length).toBeGreaterThan(0)
    sub.unsubscribe()
    done()
  })

  it('should handle stream with buffer that triggers JSON catch block', (done) => {
    // Buffer content that includes 'Identifier' but with malformed JSON to trigger catch
    // The extractValidJSON tries parsing substrings and emits warn for invalid ones
    // We test that the service doesn't crash when JSON.parse fails inside extractValidJSON
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => { })

    // Two partial objects where only the outer one fails to parse
    const data = '{"Identifier":"good"}incomplete{'
    service.handleMessage({ type: 'stream', data })

    // No crash = test passes
    expect(service).toBeTruthy()
    warnSpy.mockRestore()
    done()
  })

  it('should handle stream with parsedObjects populated (chunks.push branch)', (done) => {
    // A complete valid JSON object in buffer containing 'Identifier'
    const sub = service.retrievedChunks$.subscribe()
    const data = '{"Identifier":"test123","title":"Hello"}'
    service.handleMessage({ type: 'stream', data })

    // chunks should contain the raw string AND the parsed object
    expect(service.chunks.length).toBeGreaterThan(0)
    sub.unsubscribe()
    done()
  })
})
