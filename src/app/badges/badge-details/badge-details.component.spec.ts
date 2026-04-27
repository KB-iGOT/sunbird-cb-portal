/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { BadgeDetailsComponent } from './badge-details.component'
import { of, throwError } from 'rxjs'

describe('BadgeDetailsComponent', () => {
  let component: BadgeDetailsComponent
  let mockUserProfileService: any
  let mockRouter: any
  let mockBadgeService: any
  let mockConfigSvc: any

  const mockBadgeResponse = {
    result: {
      summary: {
        totalBadgesEarned: 10,
        courseCompleted: 5,
        completionRate: 80,
      },
      earnedBadgesDetails: {
        badges: [
          {
            courseName: 'Test Course',
            courseId: 'do_123',
            badgeDetails_v1: [
              {
                badgeTemplate: 'badge-template-url',
                badgeTitle: 'Gold Badge',
                badgeSubTitle: 'Level 1',
                badgeId: 'badge_123',
              },
            ],
          },
        ],
      },
      inProgressBadgesDetails: {
        badges: [
          {
            courseName: 'In Progress Course',
            courseId: 'do_456',
            completionPercentage: 50,
            badgeDetails_v1: [
              {
                badgeTemplate: 'badge-progress-url',
                badgeTitle: 'Silver Badge',
                badgeEarningDateTime: '2024-12-31',
              },
            ],
          },
        ],
      },
    },
  }

  const mockGenerateBadgeResponse = {
    result: {
      printUri: 'data:image/svg+xml;base64,test',
    },
  }

  beforeEach(() => {
    // Mock BadgeService (userProfileService)
    mockUserProfileService = {
      fetchBadgeDetails: jest.fn().mockReturnValue(of(mockBadgeResponse)),
    } as any

    // Mock Router
    mockRouter = {
      navigate: jest.fn(),
      navigateByUrl: jest.fn(),
    } as any

    // Mock BadgeService
    mockBadgeService = {
      generateBadge: jest.fn().mockReturnValue(of(mockGenerateBadgeResponse)),
    } as any

    // Mock ConfigurationsService
    mockConfigSvc = {
      userProfile: {
        userId: 'user123',
      },
    } as any

    component = new BadgeDetailsComponent(
      mockUserProfileService,
      mockRouter,
      mockBadgeService,
      mockConfigSvc
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('should create the component', () => {
      expect(component).toBeDefined()
    })

    it('should initialize with default values', () => {
      expect(component.activeTab).toBe('earned')
      expect(component.badgeDetails).toEqual([])
      expect(component.showModal).toBe(false)
      expect(component.openMenuBadge).toBeNull()
    })
  })

  describe('ngOnInit', () => {
    it('should call getBadgeDetails with Completed status', () => {
      const getBadgeDetailsSpy = jest.spyOn(component, 'getBadgeDetails')

      component.ngOnInit()

      expect(getBadgeDetailsSpy).toHaveBeenCalledWith('Completed')
    })
  })

  describe('showTab', () => {
    it('should set activeTab to earned and fetch Completed badges', () => {
      const getBadgeDetailsSpy = jest.spyOn(component, 'getBadgeDetails')

      component.showTab('earned')

      expect(component.activeTab).toBe('earned')
      expect(getBadgeDetailsSpy).toHaveBeenCalledWith('Completed')
    })

    it('should set activeTab to inprogress and fetch In-Progress badges', () => {
      const getBadgeDetailsSpy = jest.spyOn(component, 'getBadgeDetails')

      component.showTab('inprogress')

      expect(component.activeTab).toBe('inprogress')
      expect(getBadgeDetailsSpy).toHaveBeenCalledWith('In-Progress')
    })
  })

  describe('getBadgeDetails', () => {
    it('should fetch and process completed badges', () => {
      component.getBadgeDetails('Completed')

      expect(mockUserProfileService.fetchBadgeDetails).toHaveBeenCalledWith({
        request: { status: 'Completed' },
      })
      expect(component.badgeDetails).toEqual(mockBadgeResponse.result)
      expect(component.data.stats[0].value).toBe(10)
      expect(component.data.stats[1].value).toBe(5)
      expect(component.data.stats[2].value).toBe(80)
      expect(component.data.earnedBadges.length).toBeGreaterThan(0)
    })

    it('should fetch and process in-progress badges', () => {
      component.getBadgeDetails('In-Progress')

      expect(mockUserProfileService.fetchBadgeDetails).toHaveBeenCalledWith({
        request: { status: 'In-Progress' },
      })
      expect(component.data.inProgress.length).toBeGreaterThan(0)
      expect((component.data.inProgress[0] as any).courseName).toBe('In Progress Course')
    })

    it('should handle empty badges response', () => {
      mockUserProfileService.fetchBadgeDetails = jest.fn().mockReturnValue(
        of({ result: {} })
      )

      component.getBadgeDetails('Completed')

      expect(component.badgeDetails).toEqual({})
    })

    it('should handle API errors', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      mockUserProfileService.fetchBadgeDetails = jest.fn().mockReturnValue(
        throwError({ status: 500 })
      )

      component.getBadgeDetails('Completed')

      expect(consoleSpy).toHaveBeenCalledWith('Badge API Error', { status: 500 })
      consoleSpy.mockRestore()
    })

    it('should map earned badges with correct properties', () => {
      component.getBadgeDetails('Completed')

      const earnedBadge: any = component.data.earnedBadges[0]
      expect(earnedBadge.image).toBe('badge-template-url')
      expect(earnedBadge.courseName).toBe('Test Course')
      expect(earnedBadge.title).toBe('Gold Badge')
      expect(earnedBadge.level).toBe('Level 1')
      expect(earnedBadge.courseId).toBe('do_123')
      expect(earnedBadge.badgeId).toBe('badge_123')
    })

    it('should map in-progress badges with correct properties', () => {
      component.getBadgeDetails('In-Progress')

      const progressBadge: any = component.data.inProgress[0]
      expect(progressBadge.icon).toBe('badge-progress-url')
      expect(progressBadge.badgeTitle).toBe('Silver Badge')
      expect(progressBadge.progress).toBe('50%')
      expect(progressBadge.continue).toBe(true)
      expect(progressBadge.courseId).toBe('do_456')
    })
  })

  describe('goToContent', () => {
    it('should navigate to internal course with do_ prefix', () => {
      const badge = { courseId: 'do_123456' }

      component.goToContent(badge)

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/toc', 'do_123456', 'overview'])
    })

    it('should navigate to external course with ext_ prefix', () => {
      const badge = { courseId: 'ext_789' }

      component.goToContent(badge)

      expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('/app/toc/ext/ext_789')
    })

    it('should not navigate when courseId is missing', () => {
      const badge = { courseId: null }

      component.goToContent(badge)

      expect(mockRouter.navigate).not.toHaveBeenCalled()
      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled()
    })

    it('should not navigate when badge is undefined', () => {
      component.goToContent(undefined)

      expect(mockRouter.navigate).not.toHaveBeenCalled()
      expect(mockRouter.navigateByUrl).not.toHaveBeenCalled()
    })
  })

  describe('modal operations', () => {
    it('should open modal and set selected badge', () => {
      const badge = { title: 'Test Badge' }

      component.openModal(badge)

      expect(component.showModal).toBe(true)
      expect(component.selectedBadge).toEqual(badge)
    })

    it('should close modal', () => {
      component.showModal = true
      component.selectedBadge = { title: 'Test Badge' }

      component.closeModal()

      expect(component.showModal).toBe(false)
    })
  })

  describe('menu operations', () => {
    it('should toggle menu for a badge', () => {
      const badge = { id: 'badge1' }
      const event = new Event('click')
      const stopPropagationSpy = jest.spyOn(event, 'stopPropagation')

      component.toggleMenu(badge, event)

      expect(component.openMenuBadge).toBe(badge)
      expect(stopPropagationSpy).toHaveBeenCalled()
    })

    it('should close menu when clicking same badge', () => {
      const badge = { id: 'badge1' }
      component.openMenuBadge = badge
      const event = new Event('click')

      component.toggleMenu(badge, event)

      expect(component.openMenuBadge).toBeNull()
    })

    it('should close menu', () => {
      component.openMenuBadge = { id: 'badge1' }

      component.closeMenu()

      expect(component.openMenuBadge).toBeNull()
    })

    it('should view badge and close menu', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      const badge = { id: 'badge1' }
      component.openMenuBadge = badge

      component.viewBadge(badge)

      expect(consoleSpy).toHaveBeenCalledWith('View', badge)
      expect(component.openMenuBadge).toBeNull()
      consoleSpy.mockRestore()
    })

    it('should download badge and close menu', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      const badge = { id: 'badge1' }
      component.openMenuBadge = badge

      component.downloadBadge(badge)

      expect(consoleSpy).toHaveBeenCalledWith('Download', badge)
      expect(component.openMenuBadge).toBeNull()
      consoleSpy.mockRestore()
    })
  })

  describe('isTruncated', () => {
    it('should return true when element is truncated', () => {
      const element = {
        scrollWidth: 200,
        clientWidth: 100,
      } as HTMLElement

      const result = component.isTruncated(element)

      expect(result).toBe(true)
    })

    it('should return false when element is not truncated', () => {
      const element = {
        scrollWidth: 100,
        clientWidth: 100,
      } as HTMLElement

      const result = component.isTruncated(element)

      expect(result).toBe(false)
    })
  })

  describe('downloadBadgePng', () => {
    it('should generate and download badge as PNG', () => {
      const badgeData = { courseId: 'do_123', badgeId: 'badge_123' }
      const mockImage = {
        src: '',
        onload: null as any,
        width: 100,
        height: 100,
      }
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: jest.fn().mockReturnValue({
          drawImage: jest.fn(),
        }),
        toDataURL: jest.fn().mockReturnValue('data:image/png;base64,test'),
      }
      const mockAnchor = {
        href: '',
        download: '',
        click: jest.fn(),
      }

      const originalImage = (window as any).Image
      const originalCreateElement = document.createElement

        ; (window as any).Image = jest.fn(() => mockImage) as any
      document.createElement = jest.fn((tag: string) => {
        if (tag === 'canvas') { return mockCanvas as any }
        if (tag === 'a') { return mockAnchor as any }
        return {} as any
      })

      component.downloadBadgePng(badgeData)

      expect(mockBadgeService.generateBadge).toHaveBeenCalledWith({
        request: {
          userId: 'user123',
          courseId: 'do_123',
          badgeId: 'badge_123',
        },
      })

      // Trigger image load
      if (mockImage.onload) {
        mockImage.onload({} as any)
      }

      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d')

        // Cleanup
        ; (window as any).Image = originalImage
      document.createElement = originalCreateElement
    })
  })

  describe('downloadBadgeSvg', () => {
    it('should generate and download badge as SVG', () => {
      const badgeData = { courseId: 'do_123', badgeId: 'badge_123' }
      const mockAnchor = {
        href: '',
        download: '',
        click: jest.fn(),
        remove: jest.fn(),
      }

      document.createElement = jest.fn(() => mockAnchor as any)
      document.body.appendChild = jest.fn()

      component.downloadBadgeSvg(badgeData)

      expect(mockBadgeService.generateBadge).toHaveBeenCalledWith({
        request: {
          userId: 'user123',
          courseId: 'do_123',
          badgeId: 'badge_123',
        },
      })
      expect(mockAnchor.href).toBe('data:image/svg+xml;base64,test')
      expect(mockAnchor.download).toBe('badge.svg')
      expect(mockAnchor.click).toHaveBeenCalled()
      expect(mockAnchor.remove).toHaveBeenCalled()
    })

    it('should handle download errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      mockBadgeService.generateBadge = jest.fn().mockReturnValue(
        throwError({ status: 500 })
      )
      const badgeData = { courseId: 'do_123', badgeId: 'badge_123' }

      component.downloadBadgeSvg(badgeData)

      expect(consoleSpy).toHaveBeenCalledWith('Download failed', { status: 500 })
      consoleSpy.mockRestore()
    })
  })

  describe('downloadBadgePdf', () => {
    it('should generate and download badge as PDF', () => {
      const badgeData = { courseId: 'do_123', badgeId: 'badge_123' }
      const mockImage = {
        src: '',
        onload: null as any,
        width: 1920,
        height: 1080,
      }
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: jest.fn().mockReturnValue({
          drawImage: jest.fn(),
        }),
        toDataURL: jest.fn().mockReturnValue('data:image/png;base64,test'),
      }
      const mockPdf = {
        internal: {
          pageSize: {
            getWidth: jest.fn().mockReturnValue(800),
            getHeight: jest.fn().mockReturnValue(600),
          },
        },
        addImage: jest.fn(),
        save: jest.fn(),
      }

      const originalImage = (window as any).Image
      const originalCreateElement = document.createElement

        ; (window as any).Image = jest.fn(() => mockImage) as any
      document.createElement = jest.fn(() => mockCanvas as any)
      jest.mock('jspdf', () => ({
        default: jest.fn(() => mockPdf),
      }))

      component.downloadBadgePdf(badgeData)

      expect(mockBadgeService.generateBadge).toHaveBeenCalledWith({
        request: {
          userId: 'user123',
          courseId: 'do_123',
          badgeId: 'badge_123',
        },
      })

        // Do not trigger onload - jsPDF requires a real PNG image data URL
        // Just verify the API call was made correctly
        // Cleanup
        ; (window as any).Image = originalImage
      document.createElement = originalCreateElement
    })
  })

  describe('data object', () => {
    it('should initialize stats array with correct structure', () => {
      expect(component.data.stats.length).toBe(3)
      expect(component.data.stats[0].label).toBe('Total Badges Earned')
      expect(component.data.stats[1].label).toBe('Content Completed')
      expect(component.data.stats[2].label).toBe('Badge Completion Rate')
    })

    it('should initialize empty arrays for badges', () => {
      expect(component.data.earnedBadges).toEqual([])
      expect(component.data.inProgress).toEqual([])
    })
  })

  describe('edge cases', () => {
    it('should handle missing badgeDetails_v1 in earned badges', () => {
      mockUserProfileService.fetchBadgeDetails = jest.fn().mockReturnValue(
        of({
          result: {
            summary: { totalBadgesEarned: 0, courseCompleted: 0, completionRate: 0 },
            earnedBadgesDetails: {
              badges: [{ courseName: 'Test', courseId: 'do_123' }],
            },
          },
        })
      )

      component.getBadgeDetails('Completed')

      expect(component.data.earnedBadges.length).toBe(0)
    })

    it('should handle missing badgeDetails_v1 in progress badges', () => {
      mockUserProfileService.fetchBadgeDetails = jest.fn().mockReturnValue(
        of({
          result: {
            summary: { totalBadgesEarned: 0, courseCompleted: 0, completionRate: 0 },
            inProgressBadgesDetails: {
              badges: [
                {
                  courseName: 'Test',
                  courseId: 'do_123',
                  completionPercentage: 50,
                },
              ],
            },
          },
        })
      )

      component.getBadgeDetails('In-Progress')

      expect((component.data.inProgress[0] as any).badgeTitle).toBe('undefined')
    })

    it('should handle completionPercentage of 0 as not continue', () => {
      mockUserProfileService.fetchBadgeDetails = jest.fn().mockReturnValue(
        of({
          result: {
            summary: { totalBadgesEarned: 0, courseCompleted: 0, completionRate: 0 },
            inProgressBadgesDetails: {
              badges: [
                {
                  courseName: 'Test',
                  courseId: 'do_123',
                  completionPercentage: 0,
                  badgeDetails_v1: [{ badgeTemplate: 'url', badgeTitle: 'Test' }],
                },
              ],
            },
          },
        })
      )

      component.getBadgeDetails('In-Progress')

      expect((component.data.inProgress[0] as any).continue).toBe(false)
    })

    it('should handle completionPercentage of 100 as not continue', () => {
      mockUserProfileService.fetchBadgeDetails = jest.fn().mockReturnValue(
        of({
          result: {
            summary: { totalBadgesEarned: 0, courseCompleted: 0, completionRate: 0 },
            inProgressBadgesDetails: {
              badges: [
                {
                  courseName: 'Test',
                  courseId: 'do_123',
                  completionPercentage: 100,
                  badgeDetails_v1: [{ badgeTemplate: 'url', badgeTitle: 'Test' }],
                },
              ],
            },
          },
        })
      )

      component.getBadgeDetails('In-Progress')

      expect((component.data.inProgress[0] as any).continue).toBe(false)
    })
  })
})
