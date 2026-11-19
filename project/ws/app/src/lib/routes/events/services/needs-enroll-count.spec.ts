import { needsEnrollCount } from './events.service'

describe('needsEnrollCount', () => {
  it.each([
    [{ typeofEvent: 'live', resourceType: 'Samuhik Charcha' }, true],
    [{ typeofEvent: 'Live', resourceType: 'samuhik charcha' }, true],
    [{ typeofEvent: 'live', resourceType: 'Workshop' }, false],
    [{ typeofEvent: 'live', resourceType: 'Webinar' }, false],
    [{ typeofEvent: 'recorded', resourceType: 'Samuhik Charcha' }, false],
    [{}, false],
    [undefined, false],
  ])('%j -> %s', (event, expected) => {
    expect(needsEnrollCount(event)).toBe(expected)
  })
})
