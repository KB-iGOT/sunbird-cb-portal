import { hasServerReason } from './practice.service'

describe('hasServerReason (no retry for explained failures)', () => {
  it('is true when the server says why it failed', () => {
    expect(hasServerReason({ status: 500, error: { params: { errmsg: 'Maximum retry attempts for assessment reached.' } } })).toBe(true)
  })

  it.each([
    ['a bare 500', { status: 500 }],
    ['a body without errmsg', { status: 500, error: { params: { errmsg: null } } }],
    ['no error at all', undefined],
  ])('is false for %s, which is still retried', (_name, error) => {
    expect(hasServerReason(error)).toBe(false)
  })
})
