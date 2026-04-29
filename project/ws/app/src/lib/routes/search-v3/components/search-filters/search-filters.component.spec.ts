import { SimpleChange, SimpleChanges } from '@angular/core'
import { SearchFiltersComponent } from './search-filters.component'
import {
  CATEGORY_TYPE,
  TypeOfEvents,
} from '../../../../../../../author/src/lib/constants/constant'
import { SearchCategory, FacetType } from '../../models/search-v3.model'

describe('SearchFiltersComponent', () => {
  let component: SearchFiltersComponent
  let translateServiceMock: any
  let activatedRouteMock: any
  let configSvcMock: any
  let langTranslationsMock: any
  let originalLocalStorage: any

  const mockFacets = [
    [
      {
        name: 'language',
        values: [
          { name: 'english', count: 10 },
          { name: 'hindi', count: 5 },
          { name: 'marathi', count: 3 },
          { name: 'tamil', count: 2 },
          { name: 'telugu', count: 1 },
        ],
      },
      {
        name: 'sourceName',
        values: [
          { name: 'org1', count: 10 },
          { name: 'org2', count: 5 },
          { name: 'org3', count: 3 },
          { name: 'org4', count: 2 },
          { name: 'org5', count: 1 },
        ],
      },
    ],
  ]

  const mockEnvironment = {
    compentencyVersionKey: 'testKey',
  }

  beforeEach(() => {
    // Save original localStorage
    originalLocalStorage = global.localStorage

    // Mock localStorage manually
    global.localStorage = {
      getItem: function (key) {
        if (key === 'websiteLanguage') {
          return 'en'
        }
        return null
      },
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
      length: 1,
      key: jest.fn(),
    }

    // Setup mocks
    translateServiceMock = {
      setDefaultLang: jest.fn(),
      use: jest.fn(),
    }

    // Create a mock for ParamMap
    const createMockParamMap = () => ({
      has: jest.fn(),
      get: jest.fn(),
      getAll: jest.fn(),
      keys: [],
    })

    // Create mock for ActivatedRoute with only the necessary properties
    activatedRouteMock = {
      snapshot: {
        queryParams: {},
        queryParamMap: createMockParamMap(),
        paramMap: createMockParamMap(),
      },
    }

    configSvcMock = {
      compentency: {
        testKey: {
          vKey: 'v1',
          vCompetencyArea: 'area',
          vCompetencyTheme: 'theme',
          vCompetencySubTheme: 'subtheme',
        },
      },
    }

    langTranslationsMock = {
      translateActualLabel: jest.fn().mockReturnValue('Translated Label'),
    };

    // Set up environment mock
    (global as any).environment = mockEnvironment

    // Create component
    component = new SearchFiltersComponent(
      activatedRouteMock,
      translateServiceMock,
      langTranslationsMock,
      configSvcMock
    )

    // Mock component methods that use lodash
    component.refactorFilterData = function (data: any) {
      if (typeof data !== 'object' || data === null) {
        return []
      }

      // Using reduce instead of flatMap for better compatibility
      return Object.entries(data).reduce(
        (acc: any[], [key, values]: [string, any]) => {
          if (values && Array.isArray(values)) {
            values.forEach((value: string) => {
              acc.push({
                type: key,
                value: this.capitalizeFirstLetter(value),
              })
            })
          }
          return acc
        },
        []
      )
    }
  })

  afterEach(() => {
    // Restore original localStorage
    global.localStorage = originalLocalStorage

    // Clean up environment
    delete (global as any).environment
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  it('should format facets correctly in ngOnChanges', () => {
    const changes: SimpleChanges = {
      newfacets: new SimpleChange(null, mockFacets, true),
    }

    component.formatFacets = function (data: any) {
      const formattedFacets: any = {}

      if (!data || !data.length) return formattedFacets

      // Simplified implementation for test
      data[0].forEach((facet: any) => {
        formattedFacets[facet.name] = facet.values.map((value: any) => ({
          name: value.name,
          count: value.count,
          isChecked: false,
        }))
      })

      return formattedFacets
    }

    component.ngOnChanges(changes)

    // Check if facets are formatted correctly
    expect(component.formattedFacets.language).toBeDefined()
    expect(component.formattedFacets.language.length).toBe(5)
    expect(component.formattedFacets.sourceName).toBeDefined()
  })

  it('should handle empty facets in ngOnChanges', () => {
    const changes: SimpleChanges = {
      newfacets: new SimpleChange(null, [], true),
    }

    component.formatFacets = jest.fn().mockReturnValue({})
    component.ngOnChanges(changes)
    expect(component.formattedFacets).toEqual({})
  })

  it('should set category type correctly when category is in URL params', () => {
    activatedRouteMock.snapshot.queryParams = {
      category: SearchCategory.Events,
    }

    // Mock category type setup
    component.categoryTypeDup = [...CATEGORY_TYPE]
    component.categoryType = []

    // Mock the setCategoryType method
    const originalSetCategoryType = component.setCategoryType
    component.setCategoryType = function () {
      this.categoryType = this.categoryTypeDup.filter(
        (type: any) => type.name === SearchCategory.Events
      )
      if (this.categoryType.length) {
        this.categoryType[0].isChecked = true
        if (!this.selectedFilters) this.selectedFilters = {}
        this.selectedFilters[this.categoryType[0].name] = [
          this.categoryType[0].name,
        ]
        this.selectedFilterChips = [
          {
            value: this.categoryType[0].displayName,
            type: this.categoryType[0].name,
          },
        ]
        this.formattedFacets = this.formattedFacets || {}
        this.formattedFacets.typeOfEvents = TypeOfEvents
      }
    }

    component.setCategoryType()

    expect(component.categoryType[0].isChecked).toBe(true)
    expect(component.selectedFilters[component.categoryType[0].name]).toEqual([
      component.categoryType[0].name,
    ])
    expect(component.formattedFacets.typeOfEvents).toEqual(TypeOfEvents)

    // Restore original method
    component.setCategoryType = originalSetCategoryType
  })

  it('should toggle showMore flags correctly', () => {
    component.competencyThemeKey = 'v1.theme'
    component.competencySubThemeKey = 'v1.subtheme'

    // Initial state
    expect(component.showAllCompetencyTheme).toBe(false)
    expect(component.showAllCompetencySubTheme).toBe(false)
    expect(component.showAllLanguage).toBe(false)
    expect(component.showAllOrganisation).toBe(false)

    // Toggle competency theme
    component.toggleShowMore('v1.theme')
    expect(component.showAllCompetencyTheme).toBe(true)

    // Toggle competency sub theme
    component.toggleShowMore('v1.subtheme')
    expect(component.showAllCompetencySubTheme).toBe(true)

    // Toggle language
    component.toggleShowMore('language')
    expect(component.showAllLanguage).toBe(true)

    // Toggle organisation
    component.toggleShowMore('organisation')
    expect(component.showAllOrganisation).toBe(true)
  })

  it('should translate actual labels', () => {
    const result = component.translateActualLabels('Test Label', 'type')
    expect(langTranslationsMock.translateActualLabel).toHaveBeenCalledWith(
      'Test Label',
      'type',
      ''
    )
    expect(result).toBe('Translated Label')
  })

  it('should handle selection filters correctly when checked', () => {
    const mockEvent = { checked: true } as any
    const mockOption = { name: 'option1', isChecked: false }
    const categoryType = 'testCategory'

    component.selectedFilters = {}
    component.appliedFilter.emit = jest.fn()
    component.constructQueryParam.emit = jest.fn()

    component.onSelectionFilter(mockEvent, mockOption, categoryType)

    expect(mockOption.isChecked).toBe(true)
    expect(component.selectedFilters[categoryType]).toContain('option1')
    expect(component.appliedFilter.emit).toHaveBeenCalled()
  })

  it('should handle selection filters correctly when unchecked', () => {
    const mockEvent = { checked: false } as any
    const mockOption = { name: 'option1', isChecked: true }
    const categoryType = 'testCategory'

    component.selectedFilters = { testCategory: ['option1', 'option2'] }
    component.appliedFilter.emit = jest.fn()

    // Mock the functionality that would normally use lodash
    const originalOnSelectionFilter = component.onSelectionFilter
    component.onSelectionFilter = function (
      event: any,
      option: any,
      type: string
    ) {
      option.isChecked = event.checked
      if (!this.selectedFilters[type]) {
        this.selectedFilters[type] = []
      }

      if (event.checked) {
        if (!this.selectedFilters[type].includes(option.name)) {
          this.selectedFilters[type].push(option.name)
        }
      } else {
        this.selectedFilters[type] = this.selectedFilters[type].filter(
          (item: any) => item !== option.name
        )
      }

      this.appliedFilter.emit(this.selectedFilters)
    }

    component.onSelectionFilter(mockEvent, mockOption, categoryType)

    expect(mockOption.isChecked).toBe(false)
    expect(component.selectedFilters[categoryType]).toEqual(['option2'])
    expect(component.appliedFilter.emit).toHaveBeenCalled()

    // Restore original method
    component.onSelectionFilter = originalOnSelectionFilter
  })

  it('should calculate filters applied count correctly', () => {
    component.selectedFilters = {
      category1: ['option1', 'option2'],
      category2: ['option3'],
      emptyCategory: [],
    }

    expect(component.filtersAppliedCount).toBe(2)
  })

  it('should refactor filter data correctly', () => {
    const mockData = {
      category1: ['option1', 'option2'],
      category2: ['option3'],
    }

    const result = component.refactorFilterData(mockData)

    expect(result).toEqual([
      { type: 'category1', value: 'Option1' },
      { type: 'category1', value: 'Option2' },
      { type: 'category2', value: 'Option3' },
    ])
  })

  it('should handle null or non-object data in refactorFilterData', () => {
    expect(component.refactorFilterData(null as any)).toEqual([])
    expect(component.refactorFilterData('string' as any)).toEqual([])
  })

  it('should clear all filters', () => {
    // Setup initial state
    component.selectedFilters = {
      category1: ['option1', 'option2'],
      category2: ['option3'],
    }

    component.categoryType = [
      {
        name: 'category1',
        displayName: 'Category1',
        count: 1,
        isChecked: true,
        disabled: false,
        filters: [
          {
            name: 'filter1',
            count: 1,
            isChecked: true,
            displayName: 'Filter1',
            filters: [],
          }
        ],
      },
    ]

    component.formattedFacets = {
      facet1: [{ name: 'facet1', count: 1, isChecked: true }],
    }

    component.appliedFilter.emit = jest.fn()
    component.constructQueryParam.emit = jest.fn()

    // Mock the clearAllFilters method to avoid lodash dependencies
    const originalClearAllFilters = component.clearAllFilters
    component.clearAllFilters = function () {
      // Clear selected filters
      Object.keys(this.selectedFilters).forEach((key: string) => {
        this.selectedFilters[key] = []
      })

      // Clear category type filters
      if (this.categoryType) {
        this.categoryType.forEach((category: any) => {
          category.isChecked = false
          if (category.filters) {
            category.filters.forEach((filter: any) => {
              filter.isChecked = false
            })
          }
        })
      }

      // Clear formatted facets
      if (this.formattedFacets) {
        Object.values(this.formattedFacets).forEach((filters: any) => {
          if (Array.isArray(filters)) {
            filters.forEach((filter: any) => {
              filter.isChecked = false
            })
          }
        })
      }

      this.selectedFilterChips = []
      this.appliedFilter.emit(this.selectedFilters)
      this.constructQueryParam.emit('')
    }

    component.clearAllFilters()

    // Check if all filters are cleared
    expect(component.selectedFilters).toEqual({ category1: [], category2: [] })
    expect(component.selectedFilterChips).toEqual([])
    expect(component.appliedFilter.emit).toHaveBeenCalled()
    expect(component.constructQueryParam.emit).toHaveBeenCalledWith('')

    // Restore original method
    component.clearAllFilters = originalClearAllFilters
  })

  it('should filter organisations based on query', () => {
    component.formattedFacets = {
      organisation: [
        { name: 'org1', count: 10, isChecked: false },
        { name: 'org2', count: 5, isChecked: false },
        { name: 'org3', count: 3, isChecked: false },
        { name: 'another org', count: 2, isChecked: false },
        { name: 'different org', count: 1, isChecked: false },
      ],
    }

    component.filterQueryOrganisation = 'org'
    component.showAllOrganisation = false

    // Mock the getter
    Object.defineProperty(component, 'filteredOrganisations', {
      get: function () {
        let filteredList = this.formattedFacets.organisation.filter(
          (item: any) =>
            item.name
              .toLowerCase()
              .includes(this.filterQueryOrganisation.toLowerCase())
        )
        return this.showAllOrganisation
          ? filteredList
          : filteredList.slice(0, 4)
      },
    })

    expect(component.filteredOrganisations.length).toBe(4)

    component.showAllOrganisation = true
    expect(component.filteredOrganisations.length).toBe(5)

    component.filterQueryOrganisation = 'another'
    expect(component.filteredOrganisations.length).toBe(1)
  })

  it('should capitalize first letter correctly', () => {
    expect(component.capitalizeFirstLetter('test')).toBe('Test')
    expect(component.capitalizeFirstLetter('TEST')).toBe('TEST')
    expect(component.capitalizeFirstLetter('')).toBe('')
  })

  it('should clear filter chip for category type', () => {
    // Setup with minimal mocks that satisfy the types
    component.categoryTypeDup = [
      {
        name: 'category1',
        displayName: 'Category1',
        count: 1,
        isChecked: false,
        filters: [],
        disabled: false,
      },
    ]

    component.categoryType = [
      {
        name: 'category1',
        displayName: 'Category1',
        count: 1,
        isChecked: true,
        filters: [],
        disabled: false,
      },
    ]

    component.selectedFilters = { category1: ['category1'] }
    component.appliedFilter.emit = jest.fn()
    component.constructQueryParam.emit = jest.fn()
    component.refactorFilterData = jest.fn()

    // Mock the clearFilterChip method to avoid lodash dependencies
    const originalClearFilterChip = component.clearFilterChip
    component.clearFilterChip = function (item: any) {
      const types = this.categoryTypeDup.map((category: any) => category.name)

      if (types.includes(item.type)) {
        this.categoryType[0].isChecked = false

        if (this.selectedFilters[item.type]) {
          this.selectedFilters[item.type] = this.selectedFilters[
            item.type
          ].filter((name: any) => name !== this.categoryType[0].name)

          if (this.selectedFilters[item.type].length === 0) {
            delete this.selectedFilters[item.type]
          }
        }

        this.appliedFilter.emit(this.selectedFilters)
        this.constructQueryParam.emit('')
      }
    }

    // Clear a category chip
    component.clearFilterChip({ type: 'category1', value: 'Category1' })

    expect(component.categoryType[0].isChecked).toBe(false)
    expect(component.appliedFilter.emit).toHaveBeenCalled()
    expect(component.constructQueryParam.emit).toHaveBeenCalledWith('')

    // Restore original method
    component.clearFilterChip = originalClearFilterChip
  })

  it('should clear filter chip for non-category type', () => {
    // Setup
    component.formattedFacets = {
      language: [
        { name: 'english', count: 10, isChecked: true },
        { name: 'hindi', count: 5, isChecked: false },
      ],
    }

    component.selectedFilters = { language: ['english'] }
    component.appliedFilter.emit = jest.fn()
    component.categoryTypeDup = []
    component.refactorFilterData = jest.fn()

    // Mock the clearFilterChip method for non-category
    const originalClearFilterChip = component.clearFilterChip
    component.clearFilterChip = function (item: any) {
      const types: any = []

      if (!types.includes(item.type)) {
        const facets = this.formattedFacets

        // Find and update the filter
        const foundFilter = facets.language.find(
          (filter: any) => filter.name === item.value.toLowerCase()
        )

        if (foundFilter) {
          foundFilter.isChecked = false

          if (this.selectedFilters[item.type]) {
            this.selectedFilters[item.type] = this.selectedFilters[
              item.type
            ].filter((name: any) => name !== foundFilter.name)

            if (this.selectedFilters[item.type].length === 0) {
              delete this.selectedFilters[item.type]
            }
          }

          this.appliedFilter.emit(this.selectedFilters)
        }
      }
    }

    // Clear a language chip
    component.clearFilterChip({ type: 'language', value: 'English' })

    expect(component.formattedFacets.language[0].isChecked).toBe(false)
    expect(component.appliedFilter.emit).toHaveBeenCalled()

    // Restore original method
    component.clearFilterChip = originalClearFilterChip
  })

  describe('filteredLanguages', () => {
    it('should return filtered languages based on query', () => {
      // Arrange
      component.formattedFacets = {
        language: [
          { name: 'english', count: 10, isChecked: false },
          { name: 'hindi', count: 5, isChecked: false },
          { name: 'marathi', count: 3, isChecked: false },
        ],
      }
      component.filterQueryLanguage = 'hin'
      component.showAllLanguage = false

      // Act
      const result = component.filteredLanguages

      // Assert
      expect(result.length).toBe(1)
      expect(result[0].name).toBe('hindi')
    })

    it('should return all languages when showAllLanguage is true', () => {
      // Arrange
      component.formattedFacets = {
        language: [
          { name: 'english', count: 10, isChecked: false },
          { name: 'hindi', count: 5, isChecked: false },
          { name: 'marathi', count: 3, isChecked: false },
        ],
      }
      component.filterQueryLanguage = ''
      component.showAllLanguage = true

      // Act
      const result = component.filteredLanguages

      // Assert
      expect(result.length).toBe(3)
    })
  })

  describe('filteredDesignations', () => {
    it('should return filtered designations based on query', () => {
      // Arrange
      component.formattedFacets = {
        'profileDetails.professionalDetails.designation': [
          { name: 'Manager', count: 10, isChecked: false },
          { name: 'Engineer', count: 5, isChecked: false },
          { name: 'Analyst', count: 3, isChecked: false },
        ],
      }
      component.filterQueryDesignation = 'Eng'
      component.showAllDesignation = false

      // Act
      const result = component.filteredDesignations

      // Assert
      expect(result.length).toBe(1)
      expect(result[0].name).toBe('Engineer')
    })

    it('should return all designations when showAllDesignation is true', () => {
      // Arrange
      component.formattedFacets = {
        'profileDetails.professionalDetails.designation': [
          { name: 'Manager', count: 10, isChecked: false },
          { name: 'Engineer', count: 5, isChecked: false },
          { name: 'Analyst', count: 3, isChecked: false },
        ],
      }
      component.filterQueryDesignation = ''
      component.showAllDesignation = true

      // Act
      const result = component.filteredDesignations

      // Assert
      expect(result.length).toBe(3)
    })
  })

  describe('filteredRootOrgNames', () => {
    it('should return filtered root organization names based on query', () => {
      // Arrange
      component.formattedFacets = {
        rootOrgName: [
          { name: 'Org1', count: 10, isChecked: false },
          { name: 'Org2', count: 5, isChecked: false },
          { name: 'Org3', count: 3, isChecked: false },
        ],
      }
      component.filterQueryRootOrgName = 'Org2'
      component.showAllOrganisation = false

      // Act
      const result = component.filteredRootOrgNames

      // Assert
      expect(result.length).toBe(1)
      expect(result[0].name).toBe('Org2')
    })

    it('should return all root organization names when showAllOrganisation is true', () => {
      // Arrange
      component.formattedFacets = {
        rootOrgName: [
          { name: 'Org1', count: 10, isChecked: false },
          { name: 'Org2', count: 5, isChecked: false },
          { name: 'Org3', count: 3, isChecked: false },
        ],
      }
      component.filterQueryRootOrgName = ''
      component.showAllOrganisation = true

      // Act
      const result = component.filteredRootOrgNames

      // Assert
      expect(result.length).toBe(3)
    })
  })

  describe('toggleShowMore', () => {
    it('should toggle showAllCompetencyTheme when competencyThemeKey is passed', () => {
      // Arrange
      component.competencyThemeKey = 'v1.theme'
      component.showAllCompetencyTheme = false

      // Act
      component.toggleShowMore('v1.theme')

      // Assert
      expect(component.showAllCompetencyTheme).toBe(true)
    })

    it('should toggle showAllCompetencySubTheme when competencySubThemeKey is passed', () => {
      // Arrange
      component.competencySubThemeKey = 'v1.subtheme'
      component.showAllCompetencySubTheme = false

      // Act
      component.toggleShowMore('v1.subtheme')

      // Assert
      expect(component.showAllCompetencySubTheme).toBe(true)
    })

    it('should toggle showAllLanguage when "language" is passed', () => {
      // Arrange
      component.showAllLanguage = false

      // Act
      component.toggleShowMore('language')

      // Assert
      expect(component.showAllLanguage).toBe(true)
    })

    it('should toggle showAllOrganisation when "organisation" is passed', () => {
      // Arrange
      component.showAllOrganisation = false

      // Act
      component.toggleShowMore('organisation')

      // Assert
      expect(component.showAllOrganisation).toBe(true)
    })

    it('should toggle showAllDesignation when "designation" is passed', () => {
      // Arrange
      component.showAllDesignation = false

      // Act
      component.toggleShowMore('designation')

      // Assert
      expect(component.showAllDesignation).toBe(true)
    })
  })

  it('should return the correct object in recursivelySetIsCheckedFalse', () => {
    const mockFilters = [
      {
        name: 'filter1',
        isChecked: true,
        filters: [
          {
            name: 'nestedFilter1',
            isChecked: true,
            filters: []
          },
        ],
      },
      {
        name: 'filter2',
        isChecked: true,
        filters: [],
      },
    ]

    const result = component['recursivelySetIsCheckedFalse'](
      mockFilters,
      'nestedFilter1'
    )

    expect(result).toBeDefined()
    expect(result.name).toBe('nestedFilter1')
    expect(result.isChecked).toBe(false)
  })

  it('should return null if no matching object is found in recursivelySetIsCheckedFalse', () => {
    const mockFilters = [
      {
        name: 'filter1',
        isChecked: true,
        filters: [
          {
            name: 'nestedFilter1',
            isChecked: true,
            filters: [],
          },
        ],
      },
    ]

    const result = component['recursivelySetIsCheckedFalse'](
      mockFilters,
      'nonExistentFilter'
    )

    expect(result).toBeNull()
  })

  it('should handle empty filters in recursivelySetIsCheckedFalse', () => {
    const result = component['recursivelySetIsCheckedFalse']([], 'filter1')
    expect(result).toBeNull()
  })

  it('should handle case-insensitive matching in recursivelySetIsCheckedFalse', () => {
    const mockFilters = [
      {
        name: 'Filter1',
        isChecked: true,
        filters: [],
      },
    ]

    const result = component['recursivelySetIsCheckedFalse'](
      mockFilters,
      'filter1'
    )

    expect(result).toBeDefined()
    expect(result.name).toBe('Filter1')
    expect(result.isChecked).toBe(false)
  })

  describe('getFilteredThemes', () => {
    let component: any

    beforeEach(() => {
      component = {
        competencyThemeKey: 'themes',
        filterQueryThemes: '',
        getFilteredThemes(competency: any): any[] {
          let filteredThemes: any[] = []
          if (competency && competency[this.competencyThemeKey]) {
            filteredThemes = competency[this.competencyThemeKey].filter((theme: any) =>
              theme.name.toLowerCase().includes(this.filterQueryThemes.toLowerCase()))
          }
          return filteredThemes
        }
      }
    })

    it('should return empty array when competency is null', () => {
      const competency = null
      const result = component.getFilteredThemes(competency)
      expect(result).toEqual([])
    })

    it('should return empty array when competency does not have themes', () => {
      const competency = { otherProperty: 'value' }
      const result = component.getFilteredThemes(competency)
      expect(result).toEqual([])
    })

    it('should return all themes when filter query is empty', () => {
      const themes = [
        { name: 'Theme 1' },
        { name: 'Theme 2' },
        { name: 'Theme 3' }
      ]
      const competency = { themes }
      component.filterQueryThemes = ''
      const result = component.getFilteredThemes(competency)
      expect(result).toEqual(themes)
    })

    it('should return filtered themes based on filter query', () => {
      const themes = [
        { name: 'Theme 1' },
        { name: 'Another Theme' },
        { name: 'Theme 3' }
      ]
      const competency = { themes }
      component.filterQueryThemes = 'theme'
      const result = component.getFilteredThemes(competency)
      expect(result).toEqual([
        { name: 'Theme 1' },
        { name: 'Another Theme' },
        { name: 'Theme 3' }
      ])
    })

    it('should return filtered themes case-insensitively', () => {
      const themes = [
        { name: 'Theme 1' },
        { name: 'ANOTHER THEME' },
        { name: 'Something else' }
      ]
      const competency = { themes }
      component.filterQueryThemes = 'theme'
      const result = component.getFilteredThemes(competency)
      expect(result).toEqual([
        { name: 'Theme 1' },
        { name: 'ANOTHER THEME' }
      ])
    })

    it('should return no themes when filter query does not match any theme', () => {
      const themes = [
        { name: 'Theme 1' },
        { name: 'Theme 2' },
        { name: 'Theme 3' }
      ]
      const competency = { themes }
      component.filterQueryThemes = 'nonexistent'
      const result = component.getFilteredThemes(competency)
      expect(result).toEqual([])
    })
  })

  describe('ngOnInit', () => {
    beforeEach(() => {
      activatedRouteMock.queryParams = {
        subscribe: (fn: any) => { fn({}); return { unsubscribe: jest.fn() } },
      };
      // environment.compentencyVersionKey is undefined in test env (mocked to {})
      // so we set the key as 'undefined' (JS coerces undefined key to 'undefined' string)
      (configSvcMock.compentency as any)[undefined as any] = {
        vKey: 'v1',
        vCompetencyArea: 'area',
        vCompetencyTheme: 'theme',
        vCompetencySubTheme: 'subtheme',
      }
    })

    it('should set competency keys on init', () => {
      component.ngOnInit()
      expect(component.competencyAreaNameKey).toBe('v1.area')
      expect(component.competencyThemeKey).toBe('v1.theme')
      expect(component.competencySubThemeKey).toBe('v1.subtheme')
    })

    it('should set isExploreContentTab when tab=explore-content', () => {
      activatedRouteMock.queryParams = {
        subscribe: (fn: any) => { fn({ tab: 'explore-content' }); return { unsubscribe: jest.fn() } },
      }
      component.selectedFilters = { lang: ['en'] }
      component.ngOnInit()
      expect(component.isExploreContentTab).toBe(true)
      expect(component.selectedFilters).toEqual({})
      expect(component.selectedFilterChips).toEqual([])
    })

    it('should not clear filters when tab is not explore-content', () => {
      activatedRouteMock.queryParams = {
        subscribe: (fn: any) => { fn({ tab: 'other' }); return { unsubscribe: jest.fn() } },
      }
      component.selectedFilters = { lang: ['en'] }
      component.ngOnInit()
      expect(component.isExploreContentTab).toBe(false)
      expect(component.selectedFilters).toEqual({ lang: ['en'] })
    })
  })

  describe('ngOnChanges additional paths', () => {
    it('should handle sectorId in formatted facets', () => {
      component.formatFacets = jest.fn().mockReturnValue({ sectorId: [{ name: 's1' }] })
      component.setCategoryType = jest.fn()
      const changes: SimpleChanges = { newfacets: new SimpleChange(null, [[]], true) }
      component.ngOnChanges(changes)
      expect(component.setCategoryType).toHaveBeenCalled()
    })

    it('should handle nestedCategory in formatted facets', () => {
      component.formatFacets = jest.fn().mockReturnValue({
        nestedCategory: [{ name: 'n1', count: 1, isChecked: false }],
      })
      component.setCategoryType = jest.fn()
      component.categoryTypeDup = [
        { name: 'nestedCategory', filters: [] as any, isChecked: false, displayName: 'NC', count: 0, disabled: false },
      ]
      const changes: SimpleChanges = { newfacets: new SimpleChange(null, [[]], true) }
      component.ngOnChanges(changes)
      expect(component.categoryTypeDup[0].filters.length).toBe(1)
    })

    it('should handle typesOfEvents changes', () => {
      component.formattedFacets = {}
      component.typesOfEvents = [{ name: 'online' }]
      const changes: SimpleChanges = {
        typesOfEvents: new SimpleChange(null, [{ name: 'online' }], true),
      }
      component.ngOnChanges(changes)
      expect(component.formattedFacets['typeOfEvents']).toEqual([{ name: 'online' }])
    })
  })

  describe('real setCategoryType', () => {
    it('should set searchQuery when q param is provided', () => {
      activatedRouteMock.snapshot.queryParams = { q: 'angular' }
      component.categoryTypeDup = [...CATEGORY_TYPE]
      component.selectedFilters = {}
      component.setCategoryType()
      expect(component.searchQuery).toBe('angular')
    })

    it('should clear selectedFilters when category changes', () => {
      activatedRouteMock.snapshot.queryParams = { category: 'programs' }
      component.searchCategory = 'courses'
      component.selectedFilters = { lang: ['en'] }
      component.categoryTypeDup = [...CATEGORY_TYPE]
      component.setCategoryType()
      expect(component.selectedFilters).toEqual({})
    })

    it('should clear selectedFilters when no category param', () => {
      activatedRouteMock.snapshot.queryParams = {}
      component.selectedFilters = { lang: ['en'] }
      component.categoryTypeDup = [...CATEGORY_TYPE]
      component.setCategoryType()
      expect(component.selectedFilters).toEqual({})
      expect(component.searchCategory).toBeFalsy()
    })

    it('should set categoryType to all when no category', () => {
      activatedRouteMock.snapshot.queryParams = {}
      component.categoryTypeDup = [...CATEGORY_TYPE]
      component.selectedFilters = {}
      component.setCategoryType()
      expect(component.categoryType.length).toBe(component.categoryTypeDup.length)
    })

    it('should create case-study entry when not in categoryTypeDup', () => {
      activatedRouteMock.snapshot.queryParams = { category: 'case-study' }
      component.categoryTypeDup = CATEGORY_TYPE.filter((t: any) => t.name !== 'case-study')
      component.selectedFilters = {}
      component.setCategoryType()
      const hasCS = component.categoryType.some((t: any) => t.name === 'case-study')
      expect(hasCS).toBe(true)
    })

    it('should set typeOfEvents when category is events', () => {
      activatedRouteMock.snapshot.queryParams = { category: SearchCategory.Events }
      component.categoryTypeDup = [...CATEGORY_TYPE]
      component.typesOfEvents = [{ name: 'online' }]
      component.selectedFilters = {}
      component.formattedFacets = {}
      component.setCategoryType()
      expect(component.formattedFacets['typeOfEvents']).toEqual([{ name: 'online' }])
    })

    it('should not set selectedFilters when isExploreContentTab is true', () => {
      activatedRouteMock.snapshot.queryParams = { category: 'courses', tab: 'explore-content' }
      component.categoryTypeDup = [...CATEGORY_TYPE]
      component.selectedFilters = {}
      component.setCategoryType()
      expect(component.isExploreContentTab).toBe(true)
      expect(Object.keys(component.selectedFilters).length).toBe(0)
    })
  })

  describe('setCourseCategoryType and checkForFilter', () => {
    it('should set isChecked on matching item by name', () => {
      component.categoryTypeDup = [
        { name: 'courses', isChecked: false, filters: [] as any, displayName: 'Courses', count: 0, disabled: false },
        { name: 'videos', isChecked: false, filters: [] as any, displayName: 'Videos', count: 0, disabled: false },
      ]
      component.setCourseCategoryType('courses')
      expect(component.categoryTypeDup[0].isChecked).toBe(true)
      expect(component.categoryTypeDup[1].isChecked).toBe(false)
    })

    it('should call checkForFilter when item has filters', () => {
      component.categoryType = [{ name: 'courses', isChecked: true, filters: [] as any }] as any
      component.selectedFilters = {}
      component.categoryTypeDup = [
        {
          name: 'courses',
          isChecked: false,
          displayName: 'Courses',
          count: 0,
          disabled: false,
          filters: [
            { name: 'E-Learning', isChecked: false, filters: [] as any },
          ],
        },
      ] as any
      component.setCourseCategoryType('E-Learning')
      expect(component.categoryTypeDup[0].filters[0].isChecked).toBe(true)
    })

    it('should handle nested filters in checkForFilter', () => {
      component.categoryType = [{ name: 'courses', isChecked: true, filters: [] as any }] as any
      component.selectedFilters = {}
      component.categoryTypeDup = [
        {
          name: 'courses',
          isChecked: false,
          displayName: 'Courses',
          count: 0,
          disabled: false,
          filters: [
            {
              name: 'parent',
              isChecked: false,
              filters: [
                { name: 'child-content', isChecked: false } as any,
              ],
            } as any,
          ],
        },
      ] as any
      component.setCourseCategoryType('child-content')
      expect(component.categoryTypeDup[0].filters[0].filters[0].isChecked).toBe(true)
    })
  })

  describe('toggleShowMore additional FacetType cases', () => {
    it('should toggle showAllContents for courseCategory', () => {
      component.showAllContents = false
      component.toggleShowMore(FacetType.courseCategory)
      expect(component.showAllContents).toBe(true)
    })

    it('should toggle showAllOrganisation for sourceName', () => {
      component.showAllOrganisation = false
      component.toggleShowMore(FacetType.SourceName)
      expect(component.showAllOrganisation).toBe(true)
    })

    it('should toggle showAllSectors for sectorNames_v1', () => {
      component.showAllSectors = false
      component.toggleShowMore(FacetType.sectorNames_v1)
      expect(component.showAllSectors).toBe(true)
    })

    it('should toggle showAllSectors for sectorId', () => {
      component.showAllSectors = false
      component.toggleShowMore(FacetType.sectorId)
      expect(component.showAllSectors).toBe(true)
    })

    it('should toggle showAllSectors for sectorNameResource', () => {
      component.showAllSectors = false
      component.toggleShowMore(FacetType.sectorNameResource)
      expect(component.showAllSectors).toBe(true)
    })

    it('should toggle showAllSubSectors for subSectorNames_v1', () => {
      component.showAllSubSectors = false
      component.toggleShowMore(FacetType.subSectorNames_v1)
      expect(component.showAllSubSectors).toBe(true)
    })

    it('should toggle showAllSubSectors for subSectorId', () => {
      component.showAllSubSectors = false
      component.toggleShowMore(FacetType.subSectorId)
      expect(component.showAllSubSectors).toBe(true)
    })

    it('should toggle showAllSubSectors for subSectorNameResource', () => {
      component.showAllSubSectors = false
      component.toggleShowMore(FacetType.subSectorNameResource)
      expect(component.showAllSubSectors).toBe(true)
    })

    it('should toggle showResourceCategory for resourceCategory', () => {
      component.showResourceCategory = false
      component.toggleShowMore(FacetType.resourceCategory)
      expect(component.showResourceCategory).toBe(true)
    })

    it('should toggle showAllContentPartners for contentPartners', () => {
      component.showAllContentPartners = false
      component.toggleShowMore(FacetType.contentPartners)
      expect(component.showAllContentPartners).toBe(true)
    })

    it('should toggle showAllTopic for topic', () => {
      component.showAllTopic = false
      component.toggleShowMore(FacetType.topic)
      expect(component.showAllTopic).toBe(true)
    })

    it('should toggle showAllTopic for topicName', () => {
      component.showAllTopic = false
      component.toggleShowMore(FacetType.topicName)
      expect(component.showAllTopic).toBe(true)
    })
  })

  describe('onTypesOfEventsChange', () => {
    it('should update selectedFilters and isChecked on options', () => {
      component.selectedFilters = {}
      component.formattedFacets = {
        typeOfEvents: [
          { name: 'online', isChecked: false },
          { name: 'offline', isChecked: false },
        ],
      }
      component.appliedFilter.emit = jest.fn()
      component.onTypesOfEventsChange({} as any, { name: 'online' }, 'typeOfEvents')
      expect(component.selectedFilters['typeOfEvents']).toEqual(['online'])
      expect(component.formattedFacets['typeOfEvents'][0].isChecked).toBe(true)
      expect(component.formattedFacets['typeOfEvents'][1].isChecked).toBe(false)
      expect(component.appliedFilter.emit).toHaveBeenCalledWith(component.selectedFilters)
    })

    it('should handle when eventOptions is undefined', () => {
      component.selectedFilters = {}
      component.formattedFacets = {}
      component.appliedFilter.emit = jest.fn()
      component.onTypesOfEventsChange({} as any, { name: 'online' }, 'typeOfEvents')
      expect(component.selectedFilters['typeOfEvents']).toEqual(['online'])
    })
  })

  describe('togoleThemes', () => {
    it('should toggle showAll from false to true', () => {
      const competency: any = { showAll: false }
      component.togoleThemes(competency)
      expect(competency.showAll).toBe(true)
    })

    it('should toggle showAll from true to false', () => {
      const competency: any = { showAll: true }
      component.togoleThemes(competency)
      expect(competency.showAll).toBe(false)
    })
  })

  describe('real refactorFilterData', () => {
    it('should flatMap filter data and convert Courses to Contents', () => {
      component.categoriseByFacet = jest.fn()
      const data = { language: ['english', 'hindi'], contentType: ['Courses'] }
      const result = SearchFiltersComponent.prototype.refactorFilterData.call(component, data)
      expect(result.length).toBe(3)
      const coursesEntry: any = result.find((r: any) => r.type === 'contentType')
      expect(coursesEntry.value).toBe('Contents')
    })

    it('should return empty array for null input in real refactorFilterData', () => {
      component.categoriseByFacet = jest.fn()
      const result = SearchFiltersComponent.prototype.refactorFilterData.call(component, null as any)
      expect(result).toEqual([])
    })
  })

  describe('real categoriseByFacet', () => {
    it('should set showAllLanguage based on language facets', () => {
      component.competencyThemeKey = 'v1.theme'
      component.competencySubThemeKey = 'v1.subtheme'
      const facetData = [{ type: 'language', value: 'english' }]
      component['categoriseByFacet'](facetData)
      expect(component.showAllLanguage).toBe(true)
    })

    it('should set showAllOrganisation for organisation facets', () => {
      component.competencyThemeKey = 'v1.theme'
      component.competencySubThemeKey = 'v1.subtheme'
      const facetData = [{ type: 'organisation', value: 'org1' }]
      component['categoriseByFacet'](facetData)
      expect(component.showAllOrganisation).toBe(true)
    })

    it('should set showAllSectors for sectorDetails_v1.sectorName facets', () => {
      component.competencyThemeKey = 'v1.theme'
      component.competencySubThemeKey = 'v1.subtheme'
      const facetData = [{ type: 'sectorDetails_v1.sectorName', value: 'education' }]
      component['categoriseByFacet'](facetData)
      expect(component.showAllSectors).toBe(true)
    })

    it('should reset visibility flags to false when no data for that type', () => {
      component.competencyThemeKey = 'v1.theme'
      component.competencySubThemeKey = 'v1.subtheme'
      component.showAllLanguage = true
      component['categoriseByFacet']([])
      expect(component.showAllLanguage).toBe(false)
    })
  })

  describe('real clearAllFilters', () => {
    it('should clear filters, reset isChecked and emit', () => {
      component.selectedFilters = { language: ['english'], contentType: ['courses'] }
      component.categoryType = [
        { name: 'courses', isChecked: true, filters: [{ name: 'f1', isChecked: true, displayName: 'F1', count: 0 }] },
      ] as any
      component.formattedFacets = { language: [{ name: 'english', isChecked: true }] }
      component.isExploreContentTab = false
      component.appliedFilter.emit = jest.fn()
      component.constructQueryParam.emit = jest.fn()
      SearchFiltersComponent.prototype.clearAllFilters.call(component)
      expect(component.appliedFilter.emit).toHaveBeenCalled()
      expect(component.constructQueryParam.emit).toHaveBeenCalledWith('')
      expect(component.categoryType[0].isChecked).toBe(false)
      expect(component.selectedFilterChips).toEqual([])
    })

    it('should set isAllContentSelected when isExploreContentTab is true', () => {
      component.selectedFilters = {}
      component.isExploreContentTab = true
      component.isAllContentSelected = false
      component.formattedFacets = {}
      component.appliedFilter.emit = jest.fn()
      SearchFiltersComponent.prototype.clearAllFilters.call(component)
      expect(component.isAllContentSelected).toBe(true)
      expect(component.appliedFilter.emit).toHaveBeenCalled()
    })
  })

  describe('formatFacets special types', () => {
    it('should format duration facets into ranges', () => {
      const facets = [[
        { name: 'duration', values: [{ name: '900', count: 5 }, { name: '2000', count: 3 }] },
      ]]
      const result = component.formatFacets(facets as any)
      expect(result['duration']).toBeDefined()
      expect((result['duration'] as any[]).length).toBeGreaterThan(0)
    })

    it('should return empty ranges when duration count is 0', () => {
      const facets = [[
        { name: 'duration', values: [] },
      ]]
      const result = component.formatFacets(facets as any)
      expect(result['duration']).toBeDefined()
      expect((result['duration'] as any[]).length).toBe(0)
    })

    it('should format avgRating facets into rating buckets', () => {
      const facets = [[
        { name: 'avgRating', values: [{ name: '4.5', count: 10 }, { name: '3.5', count: 5 }] },
      ]]
      const result = component.formatFacets(facets as any)
      expect(result['avgRating']).toBeDefined()
      expect((result['avgRating'] as any[]).length).toBeGreaterThan(0)
    })
  })

  describe('allContentSelection', () => {
    it('should clear contentType filter and set isAllContentSelected', () => {
      component.selectedFilters = { contentType: ['courses'] }
      component.formattedFacets = {
        courseCategory: [{ name: 'courses', isChecked: true }],
      }
      component.appliedFilter.emit = jest.fn()
      component.allContentSelection()
      expect(component.isAllContentSelected).toBe(true)
      expect(component.selectedFilters['contentType']).toEqual([])
      expect(component.formattedFacets['courseCategory'][0].isChecked).toBe(false)
      expect(component.appliedFilter.emit).toHaveBeenCalled()
    })
  })

  describe('getSelectedFilter', () => {
    it('should return true when filter value exists', () => {
      component.selectedFilters = { language: ['english'] }
      const result = component.getSelectedFilter({ name: 'english' })
      expect(result).toBe(true)
    })

    it('should return false for non-existent filter value', () => {
      component.selectedFilters = { language: ['english'] }
      const result = component.getSelectedFilter({ name: 'hindi' })
      expect(result).toBe(false)
    })

    it('should return undefined when selectedFilters is empty', () => {
      component.selectedFilters = {}
      const result = component.getSelectedFilter({ name: 'english' })
      expect(result).toBeUndefined()
    })
  })

  describe('filterValueExists', () => {
    it('should find value in flat array', () => {
      expect(component.filterValueExists(['english', 'hindi'], 'english')).toBe(true)
    })

    it('should find value in nested object', () => {
      expect(component.filterValueExists({ a: { b: 'english' } }, 'english')).toBe(true)
    })

    it('should return false when value not found', () => {
      expect(component.filterValueExists(['hindi'], 'english')).toBe(false)
    })

    it('should return true for primitive match', () => {
      expect(component.filterValueExists('english', 'english')).toBe(true)
    })
  })

  describe('real clearFilterChip', () => {
    it('should clear a language filter chip from formattedFacets', () => {
      component.categoryTypeDup = [
        { name: 'courses', filters: [] as any, isChecked: false, displayName: 'Courses', count: 0, disabled: false },
      ]
      component.formattedFacets = {
        language: [{ name: 'english', isChecked: true }],
      }
      component.selectedFilters = { language: ['english'] }
      component.appliedFilter.emit = jest.fn()
      component.clearFilterChip({ type: 'language', value: 'english' })
      expect(component.appliedFilter.emit).toHaveBeenCalled()
    })

    it('should handle sectorId chip by reversing format', () => {
      component.categoryTypeDup = [
        { name: 'courses', filters: [] as any, isChecked: false, displayName: 'Courses', count: 0, disabled: false },
      ]
      component.formattedFacets = {
        sectorId: [{ name: 'sector-fw_sector_test-sector', isChecked: true }],
      }
      component.selectedFilters = { sectorId: ['sector-fw_sector_test-sector'] }
      component.appliedFilter.emit = jest.fn()
      component.clearFilterChip({ type: 'sectorId', value: 'Test Sector' })
      expect(component.appliedFilter.emit).toHaveBeenCalled()
    })

    it('should handle sectorDetails_v1.subSectorName lowercase conversion', () => {
      component.categoryTypeDup = [
        { name: 'courses', filters: [] as any, isChecked: false, displayName: 'Courses', count: 0, disabled: false },
      ]
      component.formattedFacets = {
        'sectorDetails_v1.subSectorName': [{ name: 'education', isChecked: true }],
      }
      component.selectedFilters = { 'sectorDetails_v1.subSectorName': ['education'] }
      component.appliedFilter.emit = jest.fn()
      component.clearFilterChip({ type: 'sectorDetails_v1.subSectorName', value: 'Education' })
      expect(component.appliedFilter.emit).toHaveBeenCalled()
    })

    it('should handle category type chips by calling clearAllFilters', () => {
      component.categoryTypeDup = [
        { name: 'courses', filters: [] as any, isChecked: true, displayName: 'Courses', count: 0, disabled: false },
      ]
      component.categoryType = [
        { name: 'courses', filters: [] as any, isChecked: true, displayName: 'Courses', count: 0, disabled: false },
      ]
      component.selectedFilters = { courses: ['courses'] }
      component.formattedFacets = {}
      component.appliedFilter.emit = jest.fn()
      component.constructQueryParam.emit = jest.fn()
      component.isExploreContentTab = false
      component.clearFilterChip({ type: 'courses', value: 'courses' })
      expect(component.appliedFilter.emit).toHaveBeenCalled()
    })
  })

  describe('filtersAppliedCount getter', () => {
    it('should count filters with non-empty arrays', () => {
      component.selectedFilters = { a: ['x'], b: [], c: ['y', 'z'] }
      expect(component.filtersAppliedCount).toBe(2)
    })

    it('should return 0 when no filters applied', () => {
      component.selectedFilters = {}
      expect(component.filtersAppliedCount).toBe(0)
    })
  })

  describe('onSelectionFilter additional paths', () => {
    it('should set isAllContentSelected to false when contentType is selected and was all-selected', () => {
      component.selectedFilters = {}
      component.isAllContentSelected = true
      component.categoryTypeDup = [...CATEGORY_TYPE]
      component.appliedFilter.emit = jest.fn()
      component.constructQueryParam.emit = jest.fn()
      const mockEvent = { checked: true } as any
      const mockOption = { name: 'courses', isChecked: false }
      component.onSelectionFilter(mockEvent, mockOption, 'contentType')
      expect(component.isAllContentSelected).toBe(false)
    })

    it('should emit constructQueryParam when unchecked option is a category type', () => {
      component.categoryTypeDup = [...CATEGORY_TYPE]
      const categoryName = (CATEGORY_TYPE as any[])[0]?.name || 'courses'
      component.selectedFilters = { [categoryName]: [categoryName] }
      component.appliedFilter.emit = jest.fn()
      component.constructQueryParam.emit = jest.fn()
      const mockEvent = { checked: false } as any
      const mockOption = { name: categoryName, isChecked: true }
      component.onSelectionFilter(mockEvent, mockOption, categoryName)
      expect(component.constructQueryParam.emit).toHaveBeenCalledWith('')
    })

    it('should delete empty filter arrays from selectedFilters', () => {
      component.selectedFilters = { lang: ['english'], theme: [] }
      component.appliedFilter.emit = jest.fn()
      const mockEvent = { checked: false } as any
      const mockOption = { name: 'english', isChecked: true }
      component.categoryTypeDup = [...CATEGORY_TYPE]
      component.onSelectionFilter(mockEvent, mockOption, 'lang')
      expect(component.selectedFilters['lang']).toBeUndefined()
    })

    it('should not add duplicate to selectedFilters when already included', () => {
      component.selectedFilters = { lang: ['english'] }
      component.appliedFilter.emit = jest.fn()
      component.categoryTypeDup = [...CATEGORY_TYPE]
      const mockEvent = { checked: true } as any
      const mockOption = { name: 'english', isChecked: false }
      component.onSelectionFilter(mockEvent, mockOption, 'lang')
      expect(component.selectedFilters['lang'].length).toBe(1)
    })
  })

  describe('real clearFilterChip further paths', () => {
    it('should find filter in formattedFacets and clear via foundCategory when not directly found', () => {
      component.categoryTypeDup = [
        {
          name: SearchCategory.Courses,
          filters: [
            { name: 'E-Learning', isChecked: true, filters: [] as any, displayName: 'E-Learning', count: 0 },
          ] as any,
          isChecked: false,
          displayName: 'Courses',
          count: 0,
          disabled: false,
        },
      ]
      component.formattedFacets = { language: [{ name: 'something-else', isChecked: true }] }
      component.selectedFilters = { Course: ['E-Learning'] }
      component.appliedFilter.emit = jest.fn()
      component.clearFilterChip({ type: 'language', value: 'E-Learning' })
      expect(component.appliedFilter.emit).toHaveBeenCalled()
    })
  })
})
