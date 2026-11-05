import { DefaultUrlSerializer, Router } from '@angular/router'
import { getViewerRedirect } from './microsite-redirect.util'

describe('getViewerRedirect', () => {
  const serializer = new DefaultUrlSerializer()
  const router = { parseUrl: (url: string) => serializer.parse(url) } as unknown as Router

  it('splits an in-app URL into path and query params', () => {
    expect(getViewerRedirect(router, '/app/microsites/campaign/kalp?tab=1&x=a%20b')).toEqual({
      fullUrl: '/app/microsites/campaign/kalp?tab=1&x=a%20b',
      url: '/app/microsites/campaign/kalp',
      queryParams: { tab: '1', x: 'a b' },
    })
  })

  it.each([
    ['missing', undefined],
    ['empty', ''],
    ['absolute URL', 'https://evil.example/app'],
    ['protocol-relative', '//evil.example/app'],
    ['backslash host', '/\\evil.example'],
    ['javascript scheme', 'javascript:alert(1)'],
    ['relative path', 'app/microsites'],
  ])('rejects %s', (_name, value) => {
    expect(getViewerRedirect(router, value)).toBeNull()
  })
})
