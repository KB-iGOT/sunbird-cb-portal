import * as fs from 'fs'
import * as path from 'path'

/**
 * Guards the service worker's navigationUrls. Every navigation the list matches is answered by the
 * service worker with the portal's cached index.html. Paths Nginx routes to other applications
 * (e.g. /Casestudy-tool) must be excluded, or the first visit shows the portal's 404 page and only
 * a hard refresh (which skips the service worker) reaches the real application.
 */

const config = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../ngsw-config.json'), 'utf8'))
const navigationUrls: string[] = config.navigationUrls

/** The service worker's glob rules: '**' spans path segments, '*' and '?' stay within one */
function globToRegex(glob: string): RegExp {
  let pattern = ''
  for (let i = 0; i < glob.length; i++) {
    const char = glob[i]
    if (char === '*' && glob[i + 1] === '*') {
      pattern += '.*'
      i++
    } else if (char === '*') {
      pattern += '[^/]*'
    } else if (char === '?') {
      pattern += '[^/]'
    } else {
      pattern += char.replace(/[.+^${}()|[\]\\]/g, '\\$&')
    }
  }
  return new RegExp(`^${pattern}$`)
}

/** True when the service worker would serve index.html for a navigation to this path */
function servedByServiceWorker(url: string): boolean {
  const includes = navigationUrls.filter(glob => !glob.startsWith('!')).map(globToRegex)
  const excludes = navigationUrls.filter(glob => glob.startsWith('!')).map(glob => globToRegex(glob.slice(1)))
  return includes.some(re => re.test(url)) && !excludes.some(re => re.test(url))
}

describe('ngsw-config navigationUrls', () => {
  it.each([
    '/Casestudy-tool',
    '/Casestudy-tool/',
    '/Casestudy-tool/case/123',
    '/mentorship',
    '/mentorship/home',
    '/ai-assessment/start',
    '/training-pla-ai/plan',
    '/apis/proxies/v8/user/read',
    '/ScormCoursePlayer/index',
  ])('leaves %s to the server (Nginx), not the portal', url => {
    expect(servedByServiceWorker(url)).toBe(false)
  })

  it.each([
    '/page/home',
    '/app/globalsearch',
    '/app/leadership-as-mission-2026',
    '/viewer/video/do_123',
  ])('serves the portal route %s from the service worker', url => {
    expect(servedByServiceWorker(url)).toBe(true)
  })

  it('keeps both the bare path and its sub-paths excluded for the case study tool', () => {
    expect(navigationUrls).toEqual(expect.arrayContaining(['!/Casestudy-tool', '!/Casestudy-tool/**']))
  })
})
