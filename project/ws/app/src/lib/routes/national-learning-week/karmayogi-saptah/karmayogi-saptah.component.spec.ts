import { KarmayogiSaptahComponent } from './karmayogi-saptah.component'

describe('KarmayogiSaptahComponent', () => {
  let component: KarmayogiSaptahComponent
  let mockActivatedRoute: any
  let mockConfigService: any

  beforeEach(() => {
    // Create mocks
    mockActivatedRoute = {
      snapshot: {
        data: {},
      },
    }

    mockConfigService = {
      userProfile: null,
      activeOrg: null,
      restrictedFeatures: null,
    }

    // Create component instance
    component = new KarmayogiSaptahComponent(
      mockActivatedRoute,
      mockConfigService
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Component Initialization', () => {
    it('should create component instance', () => {
      expect(component).toBeDefined()
      expect(component instanceof KarmayogiSaptahComponent).toBe(true)
    })

    it('should initialize with empty sectionList', () => {
      expect(component.sectionList).toEqual([])
    })

    it('should initialize with undefined nwlConfig', () => {
      expect(component.nwlConfig).toBeUndefined()
    })

    it('should have configService injected', () => {
      expect(component.configService).toBe(mockConfigService)
    })
  })

  describe('ngOnInit - sectionList extraction', () => {
    it('should extract sectionList from route data when available', () => {
      const mockSectionList = [
        { id: 'section1', name: 'Section 1' },
        { id: 'section2', name: 'Section 2' },
      ]

      mockActivatedRoute.snapshot.data = {
        formData: {
          data: {
            result: {
              form: {
                data: {
                  sectionList: mockSectionList,
                },
              },
            },
          },
        },
      }

      component = new KarmayogiSaptahComponent(
        mockActivatedRoute,
        mockConfigService
      )
      component.ngOnInit()

      expect(component.sectionList).toEqual(mockSectionList)
    })

    it('should not set sectionList when formData is missing', () => {
      mockActivatedRoute.snapshot.data = {}

      component.ngOnInit()

      expect(component.sectionList).toEqual([])
    })

    it('should not set sectionList when data is missing', () => {
      mockActivatedRoute.snapshot.data = {
        formData: {},
      }

      component.ngOnInit()

      expect(component.sectionList).toEqual([])
    })

    it('should not set sectionList when result is missing', () => {
      mockActivatedRoute.snapshot.data = {
        formData: {
          data: {},
        },
      }

      component.ngOnInit()

      expect(component.sectionList).toEqual([])
    })

    it('should not set sectionList when form is missing', () => {
      mockActivatedRoute.snapshot.data = {
        formData: {
          data: {
            result: {},
          },
        },
      }

      component.ngOnInit()

      expect(component.sectionList).toEqual([])
    })

    it('should not set sectionList when form.data is missing', () => {
      mockActivatedRoute.snapshot.data = {
        formData: {
          data: {
            result: {
              form: {},
            },
          },
        },
      }

      component.ngOnInit()

      expect(component.sectionList).toEqual([])
    })

    it('should not set sectionList when sectionList is missing', () => {
      mockActivatedRoute.snapshot.data = {
        formData: {
          data: {
            result: {
              form: {
                data: {},
              },
            },
          },
        },
      }

      component.ngOnInit()

      expect(component.sectionList).toEqual([])
    })

    it('should handle empty sectionList array', () => {
      mockActivatedRoute.snapshot.data = {
        formData: {
          data: {
            result: {
              form: {
                data: {
                  sectionList: [],
                },
              },
            },
          },
        },
      }

      component.ngOnInit()

      expect(component.sectionList).toEqual([])
    })

    it('should handle sectionList with multiple items', () => {
      const largeSectionList = Array.from({ length: 10 }, (_, i) => ({
        id: `section${i}`,
        name: `Section ${i}`,
      }))

      mockActivatedRoute.snapshot.data = {
        formData: {
          data: {
            result: {
              form: {
                data: {
                  sectionList: largeSectionList,
                },
              },
            },
          },
        },
      }

      component.ngOnInit()

      expect(component.sectionList).toEqual(largeSectionList)
      expect(component.sectionList.length).toBe(10)
    })
  })

  describe('ngOnInit - nwlConfig extraction', () => {
    it('should extract nwlConfig from route data when available', () => {
      const mockNwlConfig = {
        startDate: '2024-01-01',
        endDate: '2024-01-07',
        theme: 'Learning Week',
      }

      mockActivatedRoute.snapshot.data = {
        configData: {
          data: {
            nationalLearningWeek: mockNwlConfig,
          },
        },
      }

      component.ngOnInit()

      expect(component.nwlConfig).toEqual(mockNwlConfig)
    })

    it('should not set nwlConfig when configData is missing', () => {
      mockActivatedRoute.snapshot.data = {}

      component.ngOnInit()

      expect(component.nwlConfig).toBeUndefined()
    })

    it('should not set nwlConfig when data is missing', () => {
      mockActivatedRoute.snapshot.data = {
        configData: {},
      }

      component.ngOnInit()

      expect(component.nwlConfig).toBeUndefined()
    })

    it('should not set nwlConfig when nationalLearningWeek is missing', () => {
      mockActivatedRoute.snapshot.data = {
        configData: {
          data: {},
        },
      }

      component.ngOnInit()

      expect(component.nwlConfig).toBeUndefined()
    })

    it('should handle empty nwlConfig object', () => {
      mockActivatedRoute.snapshot.data = {
        configData: {
          data: {
            nationalLearningWeek: {},
          },
        },
      }

      component.ngOnInit()

      expect(component.nwlConfig).toEqual({})
    })

    it('should handle nwlConfig with complex nested data', () => {
      const complexNwlConfig = {
        startDate: '2024-01-01',
        endDate: '2024-01-07',
        theme: 'Learning Week',
        sections: [
          { id: 1, name: 'Section 1' },
          { id: 2, name: 'Section 2' },
        ],
        metadata: {
          author: 'Admin',
          version: '1.0',
        },
      }

      mockActivatedRoute.snapshot.data = {
        configData: {
          data: {
            nationalLearningWeek: complexNwlConfig,
          },
        },
      }

      component.ngOnInit()

      expect(component.nwlConfig).toEqual(complexNwlConfig)
    })
  })

  describe('ngOnInit - combined data extraction', () => {
    it('should extract both sectionList and nwlConfig when both are available', () => {
      const mockSectionList = [{ id: 'section1', name: 'Section 1' }]
      const mockNwlConfig = { theme: 'Learning Week' }

      mockActivatedRoute.snapshot.data = {
        formData: {
          data: {
            result: {
              form: {
                data: {
                  sectionList: mockSectionList,
                },
              },
            },
          },
        },
        configData: {
          data: {
            nationalLearningWeek: mockNwlConfig,
          },
        },
      }

      component.ngOnInit()

      expect(component.sectionList).toEqual(mockSectionList)
      expect(component.nwlConfig).toEqual(mockNwlConfig)
    })

    it('should handle when only formData is available', () => {
      const mockSectionList = [{ id: 'section1', name: 'Section 1' }]

      mockActivatedRoute.snapshot.data = {
        formData: {
          data: {
            result: {
              form: {
                data: {
                  sectionList: mockSectionList,
                },
              },
            },
          },
        },
      }

      component.ngOnInit()

      expect(component.sectionList).toEqual(mockSectionList)
      expect(component.nwlConfig).toBeUndefined()
    })

    it('should handle when only configData is available', () => {
      const mockNwlConfig = { theme: 'Learning Week' }

      mockActivatedRoute.snapshot.data = {
        configData: {
          data: {
            nationalLearningWeek: mockNwlConfig,
          },
        },
      }

      component.ngOnInit()

      expect(component.sectionList).toEqual([])
      expect(component.nwlConfig).toEqual(mockNwlConfig)
    })

    it('should handle when neither formData nor configData are available', () => {
      mockActivatedRoute.snapshot.data = {}

      component.ngOnInit()

      expect(component.sectionList).toEqual([])
      expect(component.nwlConfig).toBeUndefined()
    })

    it('should log configService to console', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      component.ngOnInit()

      expect(consoleSpy).toHaveBeenCalledWith('configService ', mockConfigService)

      consoleSpy.mockRestore()
    })
  })

  describe('Constructor Tests', () => {
    it('should accept all required dependencies', () => {
      const newComponent = new KarmayogiSaptahComponent(
        mockActivatedRoute,
        mockConfigService
      )

      expect(newComponent).toBeDefined()
    })

    it('should properly inject route dependency', () => {
      expect(component).toBeDefined()
    })

    it('should properly inject configService dependency', () => {
      expect(component.configService).toBe(mockConfigService)
    })

    it('should create multiple independent instances', () => {
      const instance1 = new KarmayogiSaptahComponent(
        mockActivatedRoute,
        mockConfigService
      )

      const instance2 = new KarmayogiSaptahComponent(
        mockActivatedRoute,
        mockConfigService
      )

      expect(instance1).not.toBe(instance2)
      expect(instance1 instanceof KarmayogiSaptahComponent).toBe(true)
      expect(instance2 instanceof KarmayogiSaptahComponent).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('should handle null route snapshot data', () => {
      mockActivatedRoute.snapshot.data = null

      expect(() => component.ngOnInit()).not.toThrow()
    })

    it('should handle undefined route snapshot', () => {
      mockActivatedRoute.snapshot = undefined

      expect(() => component.ngOnInit()).toThrow()
    })

    it('should handle calling ngOnInit multiple times', () => {
      const mockSectionList = [{ id: 'section1', name: 'Section 1' }]

      mockActivatedRoute.snapshot.data = {
        formData: {
          data: {
            result: {
              form: {
                data: {
                  sectionList: mockSectionList,
                },
              },
            },
          },
        },
      }

      component.ngOnInit()
      component.ngOnInit()
      component.ngOnInit()

      expect(component.sectionList).toEqual(mockSectionList)
    })

    it('should handle sectionList with null values', () => {
      mockActivatedRoute.snapshot.data = {
        formData: {
          data: {
            result: {
              form: {
                data: {
                  sectionList: null,
                },
              },
            },
          },
        },
      }

      component.ngOnInit()

      expect(component.sectionList).toBeNull()
    })

    it('should handle nwlConfig with null values', () => {
      mockActivatedRoute.snapshot.data = {
        configData: {
          data: {
            nationalLearningWeek: null,
          },
        },
      }

      component.ngOnInit()

      expect(component.nwlConfig).toBeNull()
    })

    it('should preserve sectionList when data structure is partial', () => {
      mockActivatedRoute.snapshot.data = {
        formData: {
          data: {
            result: {
              form: {
                data: {
                  sectionList: [{ id: 'test' }],
                },
              },
            },
          },
        },
      }

      component.ngOnInit()

      expect(component.sectionList).toEqual([{ id: 'test' }])
    })
  })

  describe('Integration Tests', () => {
    it('should complete initialization flow successfully', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      mockActivatedRoute.snapshot.data = {
        formData: {
          data: {
            result: {
              form: {
                data: {
                  sectionList: [{ id: 'section1' }],
                },
              },
            },
          },
        },
        configData: {
          data: {
            nationalLearningWeek: { theme: 'Test' },
          },
        },
      }

      component.ngOnInit()

      expect(component.sectionList).toEqual([{ id: 'section1' }])
      expect(component.nwlConfig).toEqual({ theme: 'Test' })
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })

    it('should handle different configService instances', () => {
      const customConfigService: any = {
        userProfile: { id: 'user123' },
        activeOrg: { id: 'org456' },
      }

      const customComponent = new KarmayogiSaptahComponent(
        mockActivatedRoute,
        customConfigService
      )

      expect(customComponent.configService).toBe(customConfigService)
      expect(customComponent.configService.userProfile).toEqual({ id: 'user123' })
    })
  })
})
