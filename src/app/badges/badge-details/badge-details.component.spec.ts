import { of, throwError } from 'rxjs'
jest.mock('jspdf', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    internal: { pageSize: { getWidth: () => 800, getHeight: () => 600 } },
    addImage: jest.fn(),
    save: jest.fn(),
  })),
}))
import { BadgeDetailsComponent } from './badge-details.component'

describe('BadgeDetailsComponent', () => {
  let component: BadgeDetailsComponent
  let badgeService: any
  let router: any

  const response = {
    result: {
      summary: { totalBadgesEarned: 2, courseCompleted: 3, completionRate: 75 },
      earnedBadgesDetails: {
        badges: [{
          courseName: 'Course One',
          courseId: 'do_123',
          badgeDetails_v1: [{ badgeTemplate: 'template.svg', badgeTitle: 'Gold', badgeSubTitle: 'Level 1', badgeId: 'b1' }],
        }],
      },
      inProgressBadgesDetails: {
        badges: [{
          courseName: 'Course Two',
          courseId: 'ext_123',
          completionPercentage: 40,
          badgeDetails_v1: [{ badgeTemplate: 'icon.svg', badgeTitle: 'Silver', badgeEarningDateTime: 'date' }],
        }],
      },
    },
  }

  beforeEach(() => {
    jest.useFakeTimers()
    badgeService = {
      fetchBadgeDetails: jest.fn(() => of(response)),
      generateBadge: jest.fn(() => of({ result: { printUri: 'data:image/svg+xml;base64,abc' } })),
    }
    router = { navigate: jest.fn(), navigateByUrl: jest.fn() }
    component = new BadgeDetailsComponent(badgeService, router, badgeService, { userProfile: { userId: 'user-1' } } as any)
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it('loads earned badges on init and switches tabs', () => {
    component.ngOnInit()
    expect(badgeService.fetchBadgeDetails).toHaveBeenCalledWith({ request: { status: 'Completed' } })
    expect(component.data.stats.map(s => s.value)).toEqual([2, 3, 75])
    expect(component.data.earnedBadges[0]).toMatchObject({ title: 'Gold', courseName: 'Course One', courseId: 'do_123' })

    component.showTab('inprogress')
    expect(component.activeTab).toBe('inprogress')
    expect(component.data.inProgress[0]).toMatchObject({ badgeTitle: 'Silver', progress: '40%', continue: true })
  })

  it('handles api errors without throwing', () => {
    const log = jest.spyOn(console, 'log').mockImplementation()
    badgeService.fetchBadgeDetails.mockReturnValueOnce(throwError(() => new Error('fail')))
    expect(() => component.getBadgeDetails()).not.toThrow()
    expect(log).toHaveBeenCalled()
    log.mockRestore()
  })

  it('navigates to content based on id', () => {
    component.goToContent({ courseId: 'do_123' })
    expect(router.navigate).toHaveBeenCalledWith(['/app/toc', 'do_123', 'overview'])

    component.goToContent({ courseId: 'ext_123' })
    expect(router.navigateByUrl).toHaveBeenCalledWith('/app/toc/ext/ext_123')

    component.goToContent({})
    expect(router.navigate).toHaveBeenCalledTimes(1)
  })

  it('handles modal and menu interactions', () => {
    const event = { stopPropagation: jest.fn() } as any
    const badge = { courseId: 'do_123' }
    component.openModal(badge)
    expect(component.selectedBadge).toBe(badge)
    expect(component.showModal).toBe(true)
    component.closeModal()
    expect(component.showModal).toBe(false)

    component.toggleMenu(badge, event)
    expect(component.openMenuBadge).toBe(badge)
    component.toggleMenu(badge, event)
    expect(component.openMenuBadge).toBeNull()
    component.viewBadge(badge)
    component.downloadBadge(badge)
    component.closeMenu()
    expect(component.openMenuBadge).toBeNull()
  })

  it('checks truncation and triggers svg badge download', () => {
    const anchor = document.createElement('a')
    const click = jest.spyOn(anchor, 'click').mockImplementation()
    const append = jest.spyOn(document.body, 'appendChild').mockReturnValue(anchor)
    jest.spyOn(document, 'createElement').mockReturnValue(anchor)

    expect(component.isTruncated({ scrollWidth: 20, clientWidth: 10 } as HTMLElement)).toBe(true)
    component.downloadBadgeSvg({ courseId: 'do_123', badgeId: 'b1' })

    expect(badgeService.generateBadge).toHaveBeenCalledWith({ request: { userId: 'user-1', courseId: 'do_123', badgeId: 'b1' } })
    expect(anchor.download).toBe('badge.svg')
    expect(click).toHaveBeenCalled()
    append.mockRestore()
  })

  it('logs svg download failures', () => {
    const error = jest.spyOn(console, 'error').mockImplementation()
    badgeService.generateBadge.mockReturnValueOnce(throwError(() => new Error('fail')))
    component.downloadBadgeSvg({ courseId: 'do_123', badgeId: 'b1' })
    expect(error).toHaveBeenCalled()
    error.mockRestore()
  })

  it('downloads png and pdf after generated image loads', () => {
    const oldImage = (global as any).Image
    class MockImage {
      width = 400
      height = 200
      onload: any
      set src(_value: string) {
        setTimeout(() => this.onload && this.onload(), 0)
      }
    }
    ;(global as any).Image = MockImage

    const anchor = { href: '', download: '', click: jest.fn(), remove: jest.fn() } as any
    const canvas = {
      width: 0,
      height: 0,
      getContext: jest.fn(() => ({ drawImage: jest.fn() })),
      toDataURL: jest.fn(() => 'data:image/png;base64,abc'),
    } as any
    const create = jest.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'canvas') return canvas
      return anchor
    })

    component.downloadBadgePng({ courseId: 'do_123', badgeId: 'b1' })
    jest.runOnlyPendingTimers()
    expect(anchor.download).toBe('badge.png')
    expect(anchor.click).toHaveBeenCalled()

    component.downloadBadgePdf({ courseId: 'do_123', badgeId: 'b1' })
    jest.runOnlyPendingTimers()

    create.mockRestore()
    ;(global as any).Image = oldImage
  })
})
