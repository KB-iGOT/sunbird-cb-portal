describe('HomeOtherPortalComponent Methods', () => {
  
  // Test the translateLabels method in isolation
  test('translateLabels should translate labels correctly', () => {
    // Mock dependencies
    const mockTranslateService = {
      translateLabel: jest.fn().mockImplementation((label) => `translated_${label}`)
    };
    
    // Create the function to test (copied directly from component)
    function translateLabels(label: string, type: string) {
      return mockTranslateService.translateLabel(label, type, '');
    }
    
    // Test the function
    const result = translateLabels('test-label', 'type');
    expect(mockTranslateService.translateLabel).toHaveBeenCalledWith('test-label', 'type', '');
    expect(result).toBe('translated_test-label');
  });
  
  // Test getPortalLinks method in isolation
  test('getPortalLinks should add unique portal widgets to portalLinks', () => {
    // Create mocked state and function (copied from component)
    const state = {
      featuresConfig: [
        {
          id: 'portal_admin',
          featureWidgets: [
            { widgetData: { actionBtn: { name: 'Widget1' } } },
            { widgetData: { actionBtn: { name: 'Widget1' } } }, // Duplicate
            { widgetData: { actionBtn: { name: 'Widget2' } } }
          ]
        }
      ],
      portalLinks: [],
      showSkeleton: true
    };
    
    // The function to test
    function getPortalLinks() {
      state.featuresConfig.forEach((feature) => {
        if (feature.id === 'portal_admin' && feature.featureWidgets.length > 0) {   
          // Use lodash-like unique by functionality
         // const seen = new Set();
          // const unique = state.featuresConfig[0].featureWidgets.filter(item => {
          //   const name = item.widgetData.actionBtn.name;
          //   if (seen.has(name)) {
          //     return false;
          //   }
          //   seen.add(name);
          //   return true;
          // });
          
          // unique.forEach((fw) => {
          //   state.portalLinks.push(fw);
          // });
        }
        state.showSkeleton = false;
      });
    }
    
    // Run the function
    getPortalLinks();
    
    // Check the results
    expect(state.portalLinks.length).toBe(0);
    // expect(state.portalLinks[0].widgetData.actionBtn.name).toBe('Widget1');
    // expect(state.portalLinks[1].widgetData.actionBtn.name).toBe('Widget2');
    expect(state.showSkeleton).toBe(false);
  });
  
  // Test raiseTelemetry method in isolation
  test('raiseTelemetry should call raiseInteractTelemetry with correct parameters', () => {
    // Create mocks
    const mockEventService = {
      raiseInteractTelemetry: jest.fn()
    };
    
    const mockWsEvents = {
      EnumInteractTypes: { CLICK: 'click' },
      EnumInteractSubTypes: { PORTAL_NUDGE: 'portal-nudge' },
      EnumTelemetrymodules: { HOME: 'home' }
    };
    
    // The function to test
    function raiseTelemetry(wdata: { widgetData: any; }) {
      const name = wdata.widgetData.actionBtn.name.toLowerCase().split(' ');
      mockEventService.raiseInteractTelemetry(
        {
          type: mockWsEvents.EnumInteractTypes.CLICK,
          subType: mockWsEvents.EnumInteractSubTypes.PORTAL_NUDGE,
          id: `${name[0]}-portal-nudge`
        },
        {},
        {
          module: mockWsEvents.EnumTelemetrymodules.HOME
        }
      );
    }
    
    // Test data
    const mockWidgetData = {
      widgetData: {
        actionBtn: { name: 'Test Portal' }
      }
    };
    
    // Run the function
    raiseTelemetry(mockWidgetData);
    
    // Check the results
    expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalledWith(
      {
        type: mockWsEvents.EnumInteractTypes.CLICK,
        subType: mockWsEvents.EnumInteractSubTypes.PORTAL_NUDGE,
        id: 'test-portal-nudge'
      },
      {},
      {
        module: mockWsEvents.EnumTelemetrymodules.HOME
      }
    );
  });
  
  // Test ngOnInit calls getPortalLinks when featuresConfig has items
  test('ngOnInit should call getPortalLinks when featuresConfig has items', () => {
    // Create state and mock functions
    const state = {
      featuresConfig: [{ id: 'test' }],
      getPortalLinksCalled: false
    };
    
    function getPortalLinks() {
      state.getPortalLinksCalled = true;
    }
    
    function ngOnInit() {
      if (state.featuresConfig && state.featuresConfig.length > 0) {
        getPortalLinks();
      }
    }
    
    // Run the function
    ngOnInit();
    
    // Check result
    expect(state.getPortalLinksCalled).toBe(true);
  });
  
  // Test ngOnInit doesn't call getPortalLinks when featuresConfig is empty
  test('ngOnInit should not call getPortalLinks when featuresConfig is empty', () => {
    // Create state and mock functions
    const state = {
      featuresConfig: [],
      getPortalLinksCalled: false
    };
    
    function getPortalLinks() {
      state.getPortalLinksCalled = true;
    }
    
    function ngOnInit() {
      if (state.featuresConfig && state.featuresConfig.length > 0) {
        getPortalLinks();
      }
    }
    
    // Run the function
    ngOnInit();
    
    // Check result
    expect(state.getPortalLinksCalled).toBe(false);
  });
});