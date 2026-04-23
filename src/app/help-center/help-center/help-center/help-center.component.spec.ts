import { HelpCenterComponent } from './help-center.component'
import { of } from 'rxjs'

describe('HelpCenterComponent', () => {
  let component: HelpCenterComponent
  let mockHelpCenterSvc: any

  const makeVideo = (id: string, cat: string, title: string) => ({
    id, title, date: '2024-01-01', thumbnail: '', youtubeUrl: `https://youtu.be/${id}`, category: cat,
  })
  const makeGuide = (id: string, cat: string, title: string, desc = 'desc', titleHindi?: string) => ({
    id, title, titleHindi, description: desc, thumbnail: '', category: cat, pdfUrl: `/${id}.pdf`,
  })
  const makeFaq = (id: string, cat: string, q: string, a: string) => ({
    id, question: q, answer: a, category: cat, tag: '', isOpen: false,
  })

  const sampleConfig = {
    roleTabs: [{ id: 'learner', label: 'Learner' }],
    contentTabs: [{ id: 'all', label: 'All' }],
    enabledSections: { videos: true, guides: true, faqs: false },
    videoTutorialsMap: {
      learner: [makeVideo('v1', 'cat1', 'Angular Tutorial'), makeVideo('v2', 'cat2', 'React Basics')],
    },
    howToGuidesMap: {
      learner: [makeGuide('g1', 'cat1', 'How to login', 'Login guide', 'Hindi login')],
    },
    faqItemsMap: {
      learner: [makeFaq('f1', 'cat1', 'What is karmayogi?', 'A platform'), makeFaq('f2', 'cat2', 'How to enroll?', 'Click enroll')],
    },
    videoCategoriesMap: { learner: [{ id: 'cat1', label: 'Category 1' }] },
    guideCategoriesMap: { learner: [{ id: 'cat1', label: 'Category 1' }] },
  }

  beforeEach(() => {
    mockHelpCenterSvc = {
      fetchHelpCenterConfig: jest.fn().mockReturnValue(of(sampleConfig)),
    }
    component = new HelpCenterComponent(mockHelpCenterSvc)
    jest.spyOn(window, 'open').mockImplementation(() => null)
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should have default role tab as learner', () => {
    expect(component.activeRoleTab).toBe('learner')
  })

  it('should have default content tab as all', () => {
    expect(component.activeContentTab).toBe('all')
  })

  describe('ngOnInit', () => {
    it('should call fetchHelpCenterConfig and populate data', () => {
      component.ngOnInit()
      expect(mockHelpCenterSvc.fetchHelpCenterConfig).toHaveBeenCalled()
      expect(component.helpCenterData).toEqual(sampleConfig)
      expect(component.roleTabs).toEqual(sampleConfig.roleTabs)
      expect(component.contentTabs).toEqual(sampleConfig.contentTabs)
      expect(component.enabledSections).toEqual(sampleConfig.enabledSections)
    })

    it('should handle null config gracefully', () => {
      mockHelpCenterSvc.fetchHelpCenterConfig.mockReturnValue(of(null))
      component.ngOnInit()
      expect(component.helpCenterData).toBeNull()
      expect(component.roleTabs).toEqual([])
    })
  })

  describe('isSectionEnabled', () => {
    beforeEach(() => component.ngOnInit())

    it('should return true for enabled section', () => {
      expect(component.isSectionEnabled('videos')).toBe(true)
    })

    it('should return false for disabled section', () => {
      expect(component.isSectionEnabled('faqs')).toBe(false)
    })

    it('should return true for unknown section (not explicitly disabled)', () => {
      expect(component.isSectionEnabled('unknown')).toBe(true)
    })
  })

  describe('allVideos / allGuides / allFaqs', () => {
    beforeEach(() => component.ngOnInit())

    it('allVideos should return videos for active role', () => {
      expect(component.allVideos.length).toBe(2)
    })

    it('allGuides should return guides for active role', () => {
      expect(component.allGuides.length).toBe(1)
    })

    it('allFaqs should return faqs for active role', () => {
      expect(component.allFaqs.length).toBe(2)
    })

    it('allVideos should return [] for unknown role tab', () => {
      component.activeRoleTab = 'mdo-leader'
      expect(component.allVideos).toEqual([])
    })
  })

  describe('filteredVideos', () => {
    beforeEach(() => component.ngOnInit())

    it('should return all videos when searchQuery is empty', () => {
      component.searchQuery = ''
      expect(component.filteredVideos.length).toBe(2)
    })

    it('should filter by title search', () => {
      component.searchQuery = 'angular'
      expect(component.filteredVideos.length).toBe(1)
      expect(component.filteredVideos[0].id).toBe('v1')
    })

    it('should filter by category', () => {
      component.activeVideoCategory = 'cat1'
      expect(component.filteredVideos.length).toBe(1)
    })

    it('should return [] for no match', () => {
      component.searchQuery = 'xyznotfound'
      expect(component.filteredVideos.length).toBe(0)
    })
  })

  describe('filteredGuides', () => {
    beforeEach(() => component.ngOnInit())

    it('should return all guides when no search', () => {
      expect(component.filteredGuides.length).toBe(1)
    })

    it('should filter guide by title', () => {
      component.searchQuery = 'login'
      expect(component.filteredGuides.length).toBe(1)
    })

    it('should filter guide by description', () => {
      component.searchQuery = 'Login guide'
      expect(component.filteredGuides.length).toBe(1)
    })

    it('should filter guide by titleHindi', () => {
      component.searchQuery = 'hindi'
      expect(component.filteredGuides.length).toBe(1)
    })

    it('should return [] for no match in guide', () => {
      component.searchQuery = 'zzz'
      expect(component.filteredGuides.length).toBe(0)
    })
  })

  describe('filteredFaqs', () => {
    beforeEach(() => component.ngOnInit())

    it('should return all faqs when no search', () => {
      expect(component.filteredFaqs.length).toBe(2)
    })

    it('should filter by question', () => {
      component.searchQuery = 'karmayogi'
      expect(component.filteredFaqs.length).toBe(1)
    })

    it('should filter by answer', () => {
      component.searchQuery = 'click enroll'
      expect(component.filteredFaqs.length).toBe(1)
    })

    it('should filter by category', () => {
      component.activeFaqCategory = 'cat1'
      expect(component.filteredFaqs.length).toBe(1)
    })
  })

  describe('showVideos / showGuides / showFaqs', () => {
    beforeEach(() => component.ngOnInit())

    it('showVideos should be true when tab is all', () => {
      component.activeContentTab = 'all'
      expect(component.showVideos).toBe(true)
    })

    it('showVideos should be true when tab is videos', () => {
      component.activeContentTab = 'videos'
      expect(component.showVideos).toBe(true)
    })

    it('showVideos should be false when tab is faqs', () => {
      component.activeContentTab = 'faqs'
      expect(component.showVideos).toBe(false)
    })

    it('showVideos should be true during search with results', () => {
      component.searchQuery = 'angular'
      expect(component.showVideos).toBe(true)
    })

    it('showVideos should be false during search with no results', () => {
      component.searchQuery = 'zzzznotfound'
      expect(component.showVideos).toBe(false)
    })

    it('showGuides should be true when tab is guides', () => {
      component.activeContentTab = 'guides'
      expect(component.showGuides).toBe(true)
    })

    it('showFaqs should be true when tab is faqs', () => {
      component.activeContentTab = 'faqs'
      expect(component.showFaqs).toBe(true)
    })
  })

  describe('setRoleTab', () => {
    beforeEach(() => component.ngOnInit())

    it('should set activeRoleTab and reset other filters', () => {
      component.searchQuery = 'something'
      component.activeContentTab = 'videos'
      component.setRoleTab('mdo-leader')
      expect(component.activeRoleTab).toBe('mdo-leader')
      expect(component.activeContentTab).toBe('all')
      expect(component.searchQuery).toBe('')
      expect(component.activeVideoCategory).toBe('all')
    })
  })

  describe('setContentTab', () => {
    it('should set activeContentTab', () => {
      component.setContentTab('videos')
      expect(component.activeContentTab).toBe('videos')
      expect(component.videoSectionOpen).toBe(true)
    })

    it('should handle guides tab', () => {
      component.setContentTab('guides')
      expect(component.activeContentTab).toBe('guides')
    })

    it('should handle faqs tab', () => {
      component.setContentTab('faqs')
      expect(component.activeContentTab).toBe('faqs')
    })
  })

  describe('toggleSection', () => {
    it('should toggle video section', () => {
      const initial = component.videoSectionOpen
      component.toggleSection('video')
      expect(component.videoSectionOpen).toBe(!initial)
    })

    it('should toggle guides section', () => {
      const initial = component.guidesSectionOpen
      component.toggleSection('guides')
      expect(component.guidesSectionOpen).toBe(!initial)
    })

    it('should toggle faq section', () => {
      const initial = component.faqSectionOpen
      component.toggleSection('faq')
      expect(component.faqSectionOpen).toBe(!initial)
    })
  })

  describe('toggleFaq', () => {
    it('should toggle faq isOpen', () => {
      const faq = makeFaq('f1', 'cat1', 'Q', 'A')
      faq.isOpen = false
      component.toggleFaq(faq)
      expect(faq.isOpen).toBe(true)
      component.toggleFaq(faq)
      expect(faq.isOpen).toBe(false)
    })
  })

  describe('onSearch', () => {
    it('should set searchQuery from input event', () => {
      const event = { target: { value: 'angular' } } as any
      component.onSearch(event)
      expect(component.searchQuery).toBe('angular')
    })
  })

  describe('getVideoCount', () => {
    beforeEach(() => component.ngOnInit())

    it('should return total count for all', () => {
      expect(component.getVideoCount('all')).toBe(2)
    })

    it('should return count for specific category', () => {
      expect(component.getVideoCount('cat1')).toBe(1)
    })

    it('should filter by search', () => {
      component.searchQuery = 'react'
      expect(component.getVideoCount('all')).toBe(1)
    })
  })

  describe('getGuideCount', () => {
    beforeEach(() => component.ngOnInit())

    it('should return count for all', () => {
      expect(component.getGuideCount('all')).toBe(1)
    })

    it('should return 0 for non-existent category', () => {
      expect(component.getGuideCount('catX')).toBe(0)
    })
  })

  describe('getFaqCount', () => {
    beforeEach(() => component.ngOnInit())

    it('should return count for all', () => {
      expect(component.getFaqCount('all')).toBe(2)
    })

    it('should return count for category', () => {
      expect(component.getFaqCount('cat1')).toBe(1)
    })

    it('should filter by search', () => {
      component.searchQuery = 'karmayogi'
      expect(component.getFaqCount('all')).toBe(1)
    })
  })

  describe('openVideo', () => {
    it('should open youtube url in new tab', () => {
      const video = makeVideo('abc123', 'cat1', 'Test')
      component.openVideo(video)
      expect(window.open).toHaveBeenCalledWith(`https://youtu.be/abc123`, '_blank')
    })

    it('should not open if no youtubeUrl', () => {
      const video = { ...makeVideo('x', 'c', 'T'), youtubeUrl: '' }
      component.openVideo(video)
      expect(window.open).not.toHaveBeenCalled()
    })
  })

  describe('openPDF', () => {
    it('should open pdf url in new tab', () => {
      const pdf = { pdfUrl: '/guide.pdf' }
      component.openPDF(pdf)
      expect(window.open).toHaveBeenCalledWith('/guide.pdf', '_blank')
    })

    it('should not open if pdf is falsy', () => {
      component.openPDF(null)
      expect(window.open).not.toHaveBeenCalled()
    })
  })

  describe('getYoutubeThumbnail', () => {
    it('should return thumbnail for standard youtube url', () => {
      const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
      const result = component.getYoutubeThumbnail(url)
      expect(result).toContain('dQw4w9WgXcQ')
      expect(result).toContain('hqdefault.jpg')
    })

    it('should return thumbnail for youtu.be short url', () => {
      const url = 'https://youtu.be/dQw4w9WgXcQ'
      const result = component.getYoutubeThumbnail(url)
      expect(result).toContain('dQw4w9WgXcQ')
    })

    it('should return empty string for empty url', () => {
      expect(component.getYoutubeThumbnail('')).toBe('')
    })

    it('should return empty string for non-youtube url', () => {
      expect(component.getYoutubeThumbnail('https://vimeo.com/12345')).toBe('')
    })
  })

  describe('videoCategories / guideCategories', () => {
    beforeEach(() => component.ngOnInit())

    it('should return video categories for active role', () => {
      expect(component.videoCategories).toEqual(sampleConfig.videoCategoriesMap.learner)
    })

    it('should return guide categories for active role', () => {
      expect(component.guideCategories).toEqual(sampleConfig.guideCategoriesMap.learner)
    })

    it('should return [] for role with no categories', () => {
      component.activeRoleTab = 'mdo-leader'
      expect(component.videoCategories).toEqual([])
    })
  })
})
