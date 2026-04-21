/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { CompetencyFiltersComponent } from './competency-filters.component'

describe('CompetencyFiltersComponent', () => {
  let component: CompetencyFiltersComponent

  const mockCompetencies = [
    {
      name: 'Technical',
      refId: 'tech-001',
      id: 'tech-001',
      themes: [
        {
          id: 'theme-001',
          name: 'Programming',
          subThemes: [
            { id: 'sub-001', name: 'JavaScript' },
            { id: 'sub-002', name: 'Python' },
          ],
        },
        {
          id: 'theme-002',
          name: 'Database',
          subThemes: [
            { id: 'sub-003', name: 'SQL' },
          ],
        },
      ],
    },
    {
      name: 'Behavioral',
      refId: 'behav-001',
      id: 'behav-001',
      themes: [
        {
          id: 'theme-003',
          name: 'Communication',
          subThemes: [
            { id: 'sub-004', name: 'Presentation' },
          ],
        },
      ],
    },
  ]

  beforeEach(() => {
    component = new CompetencyFiltersComponent()
    component.allCompetencies = []
    component.filteredCompetencyArray = []
    component.appliedFilter = { competencyarea: [], theme: [], subtheme: [] }
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('should create the component', () => {
      expect(component).toBeDefined()
    })

    it('should initialize with default values', () => {
      expect(component.allCompetencies).toEqual([])
      expect(component.filteredCompetencyArray).toEqual([])
      expect(component.appliedFilter).toEqual({ competencyarea: [], theme: [], subtheme: [] })
      expect(component.competencyAreas).toEqual([])
      expect(component.allThemes).toEqual([])
      expect(component.filteredThemes).toEqual([])
      expect(component.themeSearchText).toBe('')
      expect(component.showThemes).toBe(false)
      expect(component.allSubThemes).toEqual([])
      expect(component.filteredSubThemes).toEqual([])
      expect(component.subThemeSearchText).toBe('')
      expect(component.showSubThemes).toBe(false)
    })
  })

  describe('ngOnInit', () => {
    it('should call buildFilterData and restoreAppliedFilters', () => {
      const buildSpy = jest.spyOn(component, 'buildFilterData')
      const restoreSpy = jest.spyOn(component, 'restoreAppliedFilters')

      component.ngOnInit()

      expect(buildSpy).toHaveBeenCalled()
      expect(restoreSpy).toHaveBeenCalled()
    })
  })

  describe('buildFilterData', () => {
    it('should build competency areas from allCompetencies', () => {
      component.allCompetencies = mockCompetencies

      component.buildFilterData()

      expect(component.competencyAreas.length).toBe(2)
      expect(component.competencyAreas[0]).toEqual({
        name: 'Technical',
        refId: 'tech-001',
        selected: false,
      })
      expect(component.competencyAreas[1]).toEqual({
        name: 'Behavioral',
        refId: 'behav-001',
        selected: false,
      })
    })

    it('should handle empty allCompetencies', () => {
      component.allCompetencies = []

      component.buildFilterData()

      expect(component.competencyAreas).toEqual([])
    })

    it('should handle null allCompetencies', () => {
      component.allCompetencies = null as any

      component.buildFilterData()

      expect(component.competencyAreas).toEqual([])
    })

    it('should use refId or id from competency', () => {
      component.allCompetencies = [
        { name: 'Area1', refId: 'ref-001' },
        { name: 'Area2', id: 'id-002' },
        { name: 'Area3' },
      ]

      component.buildFilterData()

      expect(component.competencyAreas[0].refId).toBe('ref-001')
      expect(component.competencyAreas[1].refId).toBe('id-002')
      expect(component.competencyAreas[2].refId).toBe('')
    })
  })

  describe('restoreAppliedFilters', () => {
    beforeEach(() => {
      component.allCompetencies = mockCompetencies
      component.filteredCompetencyArray = mockCompetencies
      component.buildFilterData()
    })

    it('should return early when no filters are applied', () => {
      component.appliedFilter = { competencyarea: [], theme: [], subtheme: [] }

      component.restoreAppliedFilters()

      expect(component.competencyAreas.every(a => !a.selected)).toBe(true)
    })

    it('should restore selected competency areas', () => {
      component.appliedFilter = { competencyarea: ['Technical'], theme: [], subtheme: [] }

      component.restoreAppliedFilters()

      expect(component.competencyAreas[0].selected).toBe(true)
      expect(component.competencyAreas[1].selected).toBe(false)
    })

    it('should restore selected themes', () => {
      component.appliedFilter = {
        competencyarea: ['Technical'],
        theme: ['Programming'],
        subtheme: [],
      }

      component.restoreAppliedFilters()

      expect(component.allThemes.length).toBeGreaterThan(0)
      const programmingTheme = component.allThemes.find(t => t.name === 'Programming')
      expect(programmingTheme?.selected).toBe(true)
    })

    it('should restore selected sub-themes', () => {
      component.appliedFilter = {
        competencyarea: ['Technical'],
        theme: ['Programming'],
        subtheme: ['JavaScript'],
      }

      component.restoreAppliedFilters()

      expect(component.allSubThemes.length).toBeGreaterThan(0)
      const jsSubTheme = component.allSubThemes.find(s => s.name === 'JavaScript')
      expect(jsSubTheme?.selected).toBe(true)
    })

    it('should handle case-insensitive matching', () => {
      component.appliedFilter = {
        competencyarea: ['TECHNICAL'],
        theme: ['programming'],
        subtheme: ['javascript'],
      }

      component.restoreAppliedFilters()

      expect(component.competencyAreas[0].selected).toBe(true)
      expect(component.allThemes.some(t => t.selected)).toBe(true)
      expect(component.allSubThemes.some(s => s.selected)).toBe(true)
    })
  })

  describe('onAreaChange', () => {
    beforeEach(() => {
      component.allCompetencies = mockCompetencies
      component.filteredCompetencyArray = mockCompetencies
      component.buildFilterData()
    })

    it('should update area selection and rebuild themes', () => {
      const rebuildSpy = jest.spyOn(component, 'rebuildThemes')
      const area = component.competencyAreas[0]

      component.onAreaChange(area, true)

      expect(area.selected).toBe(true)
      expect(rebuildSpy).toHaveBeenCalled()
    })

    it('should deselect area and rebuild themes', () => {
      const area = component.competencyAreas[0]
      area.selected = true

      component.onAreaChange(area, false)

      expect(area.selected).toBe(false)
    })
  })

  describe('rebuildThemes', () => {
    beforeEach(() => {
      component.allCompetencies = mockCompetencies
      component.filteredCompetencyArray = mockCompetencies
      component.buildFilterData()
    })

    it('should reset themes when no areas are selected', () => {
      component.showThemes = true
      component.allThemes = [{ name: 'Test', refId: 'test', selected: false, areaName: 'Test' }]

      component.rebuildThemes()

      expect(component.showThemes).toBe(false)
      expect(component.allThemes).toEqual([])
      expect(component.filteredThemes).toEqual([])
      expect(component.themeSearchText).toBe('')
    })

    it('should build themes from selected areas', () => {
      component.competencyAreas[0].selected = true

      component.rebuildThemes()

      expect(component.showThemes).toBe(true)
      expect(component.allThemes.length).toBe(2)
      expect(component.allThemes.some(t => t.name === 'Programming')).toBe(true)
      expect(component.allThemes.some(t => t.name === 'Database')).toBe(true)
    })

    it('should preserve previously selected themes', () => {
      component.competencyAreas[0].selected = true
      component.rebuildThemes()

      component.allThemes[0].selected = true
      const selectedThemeId = component.allThemes[0].refId

      component.rebuildThemes()

      const stillSelected = component.allThemes.find(t => t.refId === selectedThemeId)
      expect(stillSelected?.selected).toBe(true)
    })

    it('should handle behavioral/behavioural spelling variations', () => {
      component.filteredCompetencyArray = [
        {
          name: 'Behavioural',
          themes: [{ id: 't1', name: 'Theme1', subThemes: [] }],
        },
      ]
      component.competencyAreas = [
        { name: 'Behavioral', refId: 'b1', selected: true },
      ]

      component.rebuildThemes()

      expect(component.allThemes.length).toBe(1)
    })

    it('should call rebuildSubThemes', () => {
      const rebuildSubSpy = jest.spyOn(component, 'rebuildSubThemes')
      component.competencyAreas[0].selected = true

      component.rebuildThemes()

      expect(rebuildSubSpy).toHaveBeenCalled()
    })
  })

  describe('onThemeChange', () => {
    it('should update theme selection and rebuild sub-themes', () => {
      const rebuildSpy = jest.spyOn(component, 'rebuildSubThemes')
      const theme = { name: 'Test', refId: 'test', selected: false, areaName: 'Test' }

      component.onThemeChange(theme, true)

      expect(theme.selected).toBe(true)
      expect(rebuildSpy).toHaveBeenCalled()
    })
  })

  describe('rebuildSubThemes', () => {
    beforeEach(() => {
      component.allCompetencies = mockCompetencies
      component.filteredCompetencyArray = mockCompetencies
      component.buildFilterData()
      component.competencyAreas[0].selected = true
      component.rebuildThemes()
    })

    it('should reset sub-themes when no themes are selected', () => {
      component.showSubThemes = true
      component.allSubThemes = [{ name: 'Test', refId: 'test', selected: false, themeId: 't1' }]

      component.rebuildSubThemes()

      expect(component.showSubThemes).toBe(false)
      expect(component.allSubThemes).toEqual([])
      expect(component.filteredSubThemes).toEqual([])
      expect(component.subThemeSearchText).toBe('')
    })

    it('should build sub-themes from selected themes', () => {
      component.allThemes[0].selected = true

      component.rebuildSubThemes()

      expect(component.showSubThemes).toBe(true)
      expect(component.allSubThemes.length).toBeGreaterThan(0)
    })

    it('should preserve previously selected sub-themes', () => {
      component.allThemes[0].selected = true
      component.rebuildSubThemes()

      component.allSubThemes[0].selected = true
      const selectedSubId = component.allSubThemes[0].refId

      component.rebuildSubThemes()

      const stillSelected = component.allSubThemes.find(s => s.refId === selectedSubId)
      expect(stillSelected?.selected).toBe(true)
    })

    it('should handle sub-themes without id', () => {
      component.filteredCompetencyArray = [
        {
          name: 'Technical',
          themes: [
            {
              id: 'theme-1',
              name: 'Theme1',
              subThemes: [{ name: 'SubTheme1' }],
            },
          ],
        },
      ]
      component.competencyAreas[0].selected = true
      component.rebuildThemes()
      component.allThemes[0].selected = true

      component.rebuildSubThemes()

      expect(component.allSubThemes[0].refId).toBe('SubTheme1')
    })
  })

  describe('resetSubThemes', () => {
    it('should reset all sub-theme data', () => {
      component.showSubThemes = true
      component.allSubThemes = [{ name: 'Test', refId: 'test', selected: false, themeId: 't1' }]
      component.filteredSubThemes = [{ name: 'Test', refId: 'test', selected: false, themeId: 't1' }]
      component.subThemeSearchText = 'test'

      component.resetSubThemes()

      expect(component.showSubThemes).toBe(false)
      expect(component.allSubThemes).toEqual([])
      expect(component.filteredSubThemes).toEqual([])
      expect(component.subThemeSearchText).toBe('')
    })
  })

  describe('filterThemes', () => {
    beforeEach(() => {
      component.allThemes = [
        { name: 'Programming', refId: '1', selected: false, areaName: 'Tech' },
        { name: 'Database', refId: '2', selected: false, areaName: 'Tech' },
        { name: 'Communication', refId: '3', selected: false, areaName: 'Soft' },
      ]
      component.filteredThemes = [...component.allThemes]
    })

    it('should filter themes by search text', () => {
      component.themeSearchText = 'prog'

      component.filterThemes()

      expect(component.filteredThemes.length).toBe(1)
      expect(component.filteredThemes[0].name).toBe('Programming')
    })

    it('should be case-insensitive', () => {
      component.themeSearchText = 'DATABASE'

      component.filterThemes()

      expect(component.filteredThemes.length).toBe(1)
      expect(component.filteredThemes[0].name).toBe('Database')
    })

    it('should show all themes when search is empty', () => {
      component.themeSearchText = ''

      component.filterThemes()

      expect(component.filteredThemes.length).toBe(3)
    })

    it('should trim search text', () => {
      component.themeSearchText = '  prog  '

      component.filterThemes()

      expect(component.filteredThemes.length).toBe(1)
    })
  })

  describe('filterSubThemes', () => {
    beforeEach(() => {
      component.allSubThemes = [
        { name: 'JavaScript', refId: '1', selected: false, themeId: 't1' },
        { name: 'Python', refId: '2', selected: false, themeId: 't1' },
        { name: 'Java', refId: '3', selected: false, themeId: 't2' },
      ]
      component.filteredSubThemes = [...component.allSubThemes]
    })

    it('should filter sub-themes by search text', () => {
      component.subThemeSearchText = 'java'

      component.filterSubThemes()

      expect(component.filteredSubThemes.length).toBe(2)
      expect(component.filteredSubThemes.some(s => s.name === 'JavaScript')).toBe(true)
      expect(component.filteredSubThemes.some(s => s.name === 'Java')).toBe(true)
    })

    it('should be case-insensitive', () => {
      component.subThemeSearchText = 'PYTHON'

      component.filterSubThemes()

      expect(component.filteredSubThemes.length).toBe(1)
      expect(component.filteredSubThemes[0].name).toBe('Python')
    })

    it('should show all sub-themes when search is empty', () => {
      component.subThemeSearchText = ''

      component.filterSubThemes()

      expect(component.filteredSubThemes.length).toBe(3)
    })
  })

  describe('onSubThemeChange', () => {
    it('should update sub-theme selection', () => {
      const subTheme = { name: 'Test', refId: 'test', selected: false, themeId: 't1' }

      component.onSubThemeChange(subTheme, true)

      expect(subTheme.selected).toBe(true)
    })

    it('should deselect sub-theme', () => {
      const subTheme = { name: 'Test', refId: 'test', selected: true, themeId: 't1' }

      component.onSubThemeChange(subTheme, false)

      expect(subTheme.selected).toBe(false)
    })
  })

  describe('applyFilters', () => {
    it('should emit filter object with selected items', () => {
      const emitSpy = jest.spyOn(component.getFilterData, 'emit')
      component.competencyAreas = [
        { name: 'Technical', refId: '1', selected: true },
        { name: 'Behavioral', refId: '2', selected: false },
      ]
      component.allThemes = [
        { name: 'Programming', refId: '1', selected: true, areaName: 'Tech' },
        { name: 'Database', refId: '2', selected: false, areaName: 'Tech' },
      ]
      component.allSubThemes = [
        { name: 'JavaScript', refId: '1', selected: true, themeId: 't1' },
        { name: 'Python', refId: '2', selected: false, themeId: 't1' },
      ]

      component.applyFilters()

      expect(emitSpy).toHaveBeenCalledWith({
        competencyarea: ['Technical'],
        theme: ['Programming'],
        subtheme: ['JavaScript'],
      })
    })

    it('should emit empty arrays when nothing is selected', () => {
      const emitSpy = jest.spyOn(component.getFilterData, 'emit')
      component.competencyAreas = [{ name: 'Technical', refId: '1', selected: false }]
      component.allThemes = []
      component.allSubThemes = []

      component.applyFilters()

      expect(emitSpy).toHaveBeenCalledWith({
        competencyarea: [],
        theme: [],
        subtheme: [],
      })
    })
  })

  describe('clearFilters', () => {
    it('should clear all selections and emit empty filter', () => {
      const emitSpy = jest.spyOn(component.clearFilterObj, 'emit')
      component.competencyAreas = [{ name: 'Technical', refId: '1', selected: true }]
      component.allThemes = [{ name: 'Programming', refId: '1', selected: true, areaName: 'Tech' }]
      component.allSubThemes = [{ name: 'JavaScript', refId: '1', selected: true, themeId: 't1' }]
      component.themeSearchText = 'test'
      component.subThemeSearchText = 'test'
      component.showThemes = true
      component.showSubThemes = true

      component.clearFilters()

      expect(component.competencyAreas[0].selected).toBe(false)
      expect(component.themeSearchText).toBe('')
      expect(component.subThemeSearchText).toBe('')
      expect(component.showThemes).toBe(false)
      expect(component.showSubThemes).toBe(false)
      expect(component.allThemes).toEqual([])
      expect(component.filteredThemes).toEqual([])
      expect(component.allSubThemes).toEqual([])
      expect(component.filteredSubThemes).toEqual([])
      expect(emitSpy).toHaveBeenCalledWith({
        competencyarea: [],
        theme: [],
        subtheme: [],
      })
    })
  })

  describe('closeFilter', () => {
    it('should emit false to toggle filter', () => {
      const emitSpy = jest.spyOn(component.toggleFilter, 'emit')

      component.closeFilter()

      expect(emitSpy).toHaveBeenCalledWith(false)
    })
  })

  describe('edge cases', () => {
    it('should handle empty filteredCompetencyArray in rebuildThemes', () => {
      component.filteredCompetencyArray = []
      component.competencyAreas = [{ name: 'Technical', refId: '1', selected: true }]

      component.rebuildThemes()

      expect(component.allThemes).toEqual([])
    })

    it('should handle null themes in filteredCompetencyArray', () => {
      component.filteredCompetencyArray = [{ name: 'Technical', themes: null }]
      component.competencyAreas = [{ name: 'Technical', refId: '1', selected: true }]

      component.rebuildThemes()

      expect(component.allThemes).toEqual([])
    })

    it('should handle empty subThemes in rebuildSubThemes', () => {
      component.filteredCompetencyArray = [
        {
          name: 'Technical',
          themes: [{ id: 'theme-1', name: 'Theme1', subThemes: [] }],
        },
      ]
      component.competencyAreas = [{ name: 'Technical', refId: '1', selected: true }]
      component.rebuildThemes()
      component.allThemes[0].selected = true

      component.rebuildSubThemes()

      expect(component.allSubThemes).toEqual([])
    })

    it('should handle duplicate themes from multiple areas', () => {
      component.filteredCompetencyArray = [
        {
          name: 'Area1',
          themes: [{ id: 'theme-1', name: 'Common Theme', subThemes: [] }],
        },
        {
          name: 'Area2',
          themes: [{ id: 'theme-1', name: 'Common Theme', subThemes: [] }],
        },
      ]
      component.competencyAreas = [
        { name: 'Area1', refId: '1', selected: true },
        { name: 'Area2', refId: '2', selected: true },
      ]

      component.rebuildThemes()

      expect(component.allThemes.length).toBe(1)
    })

    it('should handle multiple selections in applyFilters', () => {
      const emitSpy = jest.spyOn(component.getFilterData, 'emit')
      component.competencyAreas = [
        { name: 'Technical', refId: '1', selected: true },
        { name: 'Behavioral', refId: '2', selected: true },
      ]
      component.allThemes = [
        { name: 'Theme1', refId: '1', selected: true, areaName: 'Tech' },
        { name: 'Theme2', refId: '2', selected: true, areaName: 'Tech' },
      ]
      component.allSubThemes = [
        { name: 'Sub1', refId: '1', selected: true, themeId: 't1' },
        { name: 'Sub2', refId: '2', selected: true, themeId: 't1' },
      ]

      component.applyFilters()

      expect(emitSpy).toHaveBeenCalledWith({
        competencyarea: ['Technical', 'Behavioral'],
        theme: ['Theme1', 'Theme2'],
        subtheme: ['Sub1', 'Sub2'],
      })
    })
  })
})
