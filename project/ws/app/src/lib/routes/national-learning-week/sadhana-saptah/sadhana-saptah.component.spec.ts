/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { SadhanaSaptahComponent } from './sadhana-saptah.component'

describe('SadhanaSaptahComponent', () => {
  let component: SadhanaSaptahComponent
  let mockActivatedRoute: any
  let mockConfigService: any

  const mockFormData = {
    data: {
      result: {
        form: {
          data: {
            sectionList: [
              {
                id: 'section1',
                title: 'Introduction',
                description: 'Introduction section',
                order: 1,
              },
              {
                id: 'section2',
                title: 'Activities',
                description: 'Activities section',
                order: 2,
              },
              {
                id: 'section3',
                title: 'Resources',
                description: 'Resources section',
                order: 3,
              },
            ],
            individualSection: {
              enabled: true,
              title: 'Individual Progress',
              description: 'Track your individual progress',
            },
            nlwConfig: {
              startDate: '2024-04-01',
              endDate: '2024-04-07',
              theme: 'Learning Excellence',
              bannerUrl: '/assets/banner.png',
            },
          },
        },
      },
    },
  }

  beforeEach(() => {
    mockActivatedRoute = {
      snapshot: {
        data: {
          formData: mockFormData,
        },
      },
    }

    mockConfigService = {
      instanceConfig: {
        logo: '/assets/logo.png',
      },
      userProfile: {
        userId: 'user-123',
      },
    }

    component = new SadhanaSaptahComponent(mockActivatedRoute, mockConfigService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('constructor', () => {
    it('should create the component', () => {
      expect(component).toBeDefined()
    })

    it('should initialize with default values', () => {
      expect(component.sectionList).toEqual([])
      expect(component.individualSection).toEqual({})
      expect(component.indivisualSection).toEqual({})
      expect(component.phoneNumber).toBe('+91 9990141256')
      expect(component.supportHours).toBe('8:00 AM – 8:00 PM IST')
    })

    it('should inject ActivatedRoute', () => {
      expect(mockActivatedRoute).toBeDefined()
    })

    it('should inject ConfigurationsService', () => {
      expect(mockConfigService).toBeDefined()
    })
  })

  describe('ngOnInit', () => {
    it('should populate sectionList from route data', () => {
      component.ngOnInit()

      expect(component.sectionList).toEqual(mockFormData.data.result.form.data.sectionList)
      expect(component.sectionList.length).toBe(3)
    })

    it('should populate individualSection from route data', () => {
      component.ngOnInit()

      expect(component.individualSection).toEqual(
        mockFormData.data.result.form.data.individualSection
      )
      expect(component.individualSection.enabled).toBe(true)
    })

    it('should populate nlwConfig from route data', () => {
      component.ngOnInit()

      expect(component.nlwConfig).toEqual(mockFormData.data.result.form.data.nlwConfig)
      expect(component.nlwConfig.theme).toBe('Learning Excellence')
    })

    it('should handle missing route data gracefully', () => {
      mockActivatedRoute.snapshot.data = null

      component.ngOnInit()

      expect(component.sectionList).toEqual([])
      expect(component.individualSection).toEqual({})
      expect(component.nlwConfig).toBeUndefined()
    })

    it('should handle missing formData', () => {
      mockActivatedRoute.snapshot.data = {}

      component.ngOnInit()

      expect(component.sectionList).toEqual([])
      expect(component.individualSection).toEqual({})
    })

    it('should handle missing formData.data', () => {
      mockActivatedRoute.snapshot.data = {
        formData: {},
      }

      component.ngOnInit()

      expect(component.sectionList).toEqual([])
    })

    it('should handle missing formData.data.result', () => {
      mockActivatedRoute.snapshot.data = {
        formData: {
          data: {},
        },
      }

      component.ngOnInit()

      expect(component.sectionList).toEqual([])
    })

    it('should handle missing formData.data.result.form', () => {
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

    it('should handle missing formData.data.result.form.data', () => {
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

    it('should handle missing sectionList', () => {
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

    it('should default to empty object when individualSection is missing', () => {
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

      expect(component.individualSection).toEqual({})
    })

    it('should default to empty object when nlwConfig is missing', () => {
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

      expect(component.nlwConfig).toEqual({})
    })

    it('should handle empty sectionList array', () => {
      mockActivatedRoute.snapshot.data = {
        formData: {
          data: {
            result: {
              form: {
                data: {
                  sectionList: [],
                  individualSection: { enabled: false },
                  nlwConfig: { theme: 'Default' },
                },
              },
            },
          },
        },
      }

      component.ngOnInit()

      expect(component.sectionList).toEqual([])
      expect(component.individualSection).toEqual({ enabled: false })
      expect(component.nlwConfig).toEqual({ theme: 'Default' })
    })

    it('should preserve section order', () => {
      component.ngOnInit()

      expect(component.sectionList[0].order).toBe(1)
      expect(component.sectionList[1].order).toBe(2)
      expect(component.sectionList[2].order).toBe(3)
    })

    it('should handle sections with all properties', () => {
      component.ngOnInit()

      const firstSection = component.sectionList[0]
      expect(firstSection.id).toBe('section1')
      expect(firstSection.title).toBe('Introduction')
      expect(firstSection.description).toBe('Introduction section')
      expect(firstSection.order).toBe(1)
    })

    it('should handle null individualSection', () => {
      mockActivatedRoute.snapshot.data = {
        formData: {
          data: {
            result: {
              form: {
                data: {
                  sectionList: [],
                  individualSection: null,
                },
              },
            },
          },
        },
      }

      component.ngOnInit()

      expect(component.individualSection).toEqual({})
    })

    it('should handle null nlwConfig', () => {
      mockActivatedRoute.snapshot.data = {
        formData: {
          data: {
            result: {
              form: {
                data: {
                  sectionList: [],
                  nlwConfig: null,
                },
              },
            },
          },
        },
      }

      component.ngOnInit()

      expect(component.nlwConfig).toEqual({})
    })

    it('should handle undefined individualSection', () => {
      mockActivatedRoute.snapshot.data = {
        formData: {
          data: {
            result: {
              form: {
                data: {
                  sectionList: [],
                  individualSection: undefined,
                },
              },
            },
          },
        },
      }

      component.ngOnInit()

      expect(component.individualSection).toEqual({})
    })

    it('should handle undefined nlwConfig', () => {
      mockActivatedRoute.snapshot.data = {
        formData: {
          data: {
            result: {
              form: {
                data: {
                  sectionList: [],
                  nlwConfig: undefined,
                },
              },
            },
          },
        },
      }

      component.ngOnInit()

      expect(component.nlwConfig).toEqual({})
    })
  })

  describe('phone number and support hours', () => {
    it('should have correct phone number format', () => {
      expect(component.phoneNumber).toBe('+91 9990141256')
      expect(component.phoneNumber).toContain('+91')
    })

    it('should have correct support hours', () => {
      expect(component.supportHours).toBe('8:00 AM – 8:00 PM IST')
      expect(component.supportHours).toContain('IST')
    })

    it('should not change phone number after initialization', () => {
      const initialPhone = component.phoneNumber

      component.ngOnInit()

      expect(component.phoneNumber).toBe(initialPhone)
    })

    it('should not change support hours after initialization', () => {
      const initialHours = component.supportHours

      component.ngOnInit()

      expect(component.supportHours).toBe(initialHours)
    })
  })

  describe('edge cases', () => {
    it('should handle malformed route snapshot', () => {
      mockActivatedRoute.snapshot = null

      expect(() => component.ngOnInit()).toThrow()
    })

    it('should handle large sectionList', () => {
      const largeSectionList = Array.from({ length: 100 }, (_, i) => ({
        id: `section${i}`,
        title: `Section ${i}`,
        order: i,
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

      expect(component.sectionList.length).toBe(100)
      expect(component.sectionList[99].id).toBe('section99')
    })

    it('should handle sections with special characters', () => {
      mockActivatedRoute.snapshot.data = {
        formData: {
          data: {
            result: {
              form: {
                data: {
                  sectionList: [
                    {
                      id: 'section@#$%',
                      title: 'Title with special chars: <>&"',
                      description: "Description with quotes ' and \"",
                    },
                  ],
                },
              },
            },
          },
        },
      }

      component.ngOnInit()

      expect(component.sectionList[0].id).toBe('section@#$%')
      expect(component.sectionList[0].title).toContain('<>&"')
    })

    it('should handle sections with empty strings', () => {
      mockActivatedRoute.snapshot.data = {
        formData: {
          data: {
            result: {
              form: {
                data: {
                  sectionList: [
                    {
                      id: '',
                      title: '',
                      description: '',
                    },
                  ],
                },
              },
            },
          },
        },
      }

      component.ngOnInit()

      expect(component.sectionList[0].id).toBe('')
      expect(component.sectionList[0].title).toBe('')
      expect(component.sectionList[0].description).toBe('')
    })

    it('should handle complex nlwConfig object', () => {
      mockActivatedRoute.snapshot.data = {
        formData: {
          data: {
            result: {
              form: {
                data: {
                  sectionList: [],
                  nlwConfig: {
                    startDate: '2024-04-01',
                    endDate: '2024-04-07',
                    theme: 'Learning Excellence',
                    bannerUrl: '/assets/banner.png',
                    metadata: {
                      version: '1.0',
                      lastUpdated: '2024-03-01',
                    },
                    features: ['feature1', 'feature2'],
                  },
                },
              },
            },
          },
        },
      }

      component.ngOnInit()

      expect(component.nlwConfig.metadata).toBeDefined()
      expect(component.nlwConfig.features).toEqual(['feature1', 'feature2'])
    })

    it('should handle complex individualSection object', () => {
      mockActivatedRoute.snapshot.data = {
        formData: {
          data: {
            result: {
              form: {
                data: {
                  sectionList: [],
                  individualSection: {
                    enabled: true,
                    title: 'Individual Progress',
                    description: 'Track your individual progress',
                    settings: {
                      notifications: true,
                      publicProfile: false,
                    },
                    milestones: [
                      { id: 1, name: 'First Step' },
                      { id: 2, name: 'Second Step' },
                    ],
                  },
                },
              },
            },
          },
        },
      }

      component.ngOnInit()

      expect(component.individualSection.settings).toBeDefined()
      expect(component.individualSection.milestones).toHaveLength(2)
    })

    it('should not modify original route data', () => {
      const originalData = JSON.parse(JSON.stringify(mockFormData))

      component.ngOnInit()
      component.sectionList.push({ id: 'new-section' })

      expect(mockActivatedRoute.snapshot.data.formData).toEqual(originalData)
    })
  })

  describe('multiple initializations', () => {
    it('should handle calling ngOnInit multiple times', () => {
      component.ngOnInit()
      const firstSectionList = component.sectionList

      component.ngOnInit()
      const secondSectionList = component.sectionList

      expect(firstSectionList).toEqual(secondSectionList)
    })

    it('should overwrite previous data on reinitialization', () => {
      component.ngOnInit()
      component.sectionList = [{ id: 'custom' }]

      component.ngOnInit()

      expect(component.sectionList).not.toEqual([{ id: 'custom' }])
      expect(component.sectionList).toEqual(mockFormData.data.result.form.data.sectionList)
    })
  })
})
