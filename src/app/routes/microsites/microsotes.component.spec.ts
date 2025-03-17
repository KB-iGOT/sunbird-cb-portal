import { MicrosotesComponent } from './microsotes.component';
import { of, throwError } from 'rxjs';

// Mock the global objects needed for the component
//global.window = Object.create(window);
//Object.defineProperty(window, 'scrollTo', { value: jest.fn() });
//global.document = Object.create(document);
//Object.defineProperty(document, 'getElementById', { value: jest.fn() });

describe('MicrosotesComponent', () => {
  let component: MicrosotesComponent;
  let micrositeServiceMock: any;
  let commonMethodsServiceMock: any;

  beforeEach(() => {
    // Set the Jest timeout higher for async tests
    jest.setTimeout(10000);
    
    // Create mocks for the services
    micrositeServiceMock = {
      searchV6: jest.fn()
    };

    commonMethodsServiceMock = {
      transformContentsToWidgets: jest.fn(),
      transformSkeletonToWidgets: jest.fn()
    };

    // Initialize component with mocked services
    component = new MicrosotesComponent(
      micrositeServiceMock,
      commonMethodsServiceMock
    );

    // Mock component methods that interact with services 
    // to prevent actual service calls during initialization
    jest.spyOn(component, 'getDataFromSearch').mockImplementation(() => Promise.resolve());
    
    // Mock DOM methods
    document.getElementById = jest.fn();
    window.scrollTo = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call getNavitems and getDataFromSearch on initialization', () => {
      // Create fresh spies that don't have previous mock implementations
      const getNavitemsSpy = jest.spyOn(component, 'getNavitems').mockImplementation(() => {});
      const getDataFromSearchSpy = jest.spyOn(component, 'getDataFromSearch')
        .mockImplementation(() => Promise.resolve());
      
      // Call ngOnInit
      component.ngOnInit();
      
      // Verify that both methods were called
      expect(getNavitemsSpy).toHaveBeenCalled();
      expect(getDataFromSearchSpy).toHaveBeenCalled();
    });
  });

  describe('getNavitems', () => {
    it('should filter and sort navigation items by navOrder', () => {
      // Setup test data
      component.sectionList = [
        { enabled: true, navigation: true, navOrder: 2, title: 'Second' },
        { enabled: true, navigation: true, navOrder: 1, title: 'First' },
        { enabled: false, navigation: true, navOrder: 3, title: 'Disabled' },
        { enabled: true, navigation: false, navOrder: 4, title: 'No Navigation' },
        { enabled: true, navigation: true, title: 'No Order' }
      ];
      
      // Call the method
      component.getNavitems();
      
      // Verify the results
      expect(component.navList).toEqual([
        { enabled: true, navigation: true, navOrder: 1, title: 'First' },
        { enabled: true, navigation: true, navOrder: 2, title: 'Second' }
      ]);
    });
  });

  describe('scrollToSection', () => {
    it('should scroll to the section with the given name', () => {
      // Setup mock element
      const mockElement = { offsetTop: 500 };
      document.getElementById = jest.fn().mockReturnValue(mockElement);
      window.scrollTo = jest.fn();
      
      // Call the method
      component.scrollToSection('testSection');
      
      // Verify getElementById was called with the correct name
      expect(document.getElementById).toHaveBeenCalledWith('testSection');
      
      // Verify scrollTo was called with the correct parameters
      expect(window.scrollTo).toHaveBeenCalledWith({
        top: 379, // 500 - 121
        behavior: 'smooth'
      });
    });

    it('should not attempt to scroll if the section is not found', () => {
      // Setup mock to return null
      document.getElementById = jest.fn().mockReturnValue(null);
      window.scrollTo = jest.fn();
      
      // Call the method
      component.scrollToSection('nonExistentSection');
      
      // Verify scrollTo was not called
      expect(window.scrollTo).not.toHaveBeenCalled();
    });
  });

  describe('getDataFromSearch', () => {
    beforeEach(() => {
      // Setup default test data
      component.sectionList = [
        {
          key: 'contentSearch',
          column: [
            {
              data: {
                strips: [
                  { key: 'topContents' }
                ]
              }
            }
          ]
        }
      ];
      
      // Mock formRequest to return a test request
      jest.spyOn(component, 'formRequest').mockReturnValue({ request: { filters: {} } });
      
      // Mock loadCardSkeletonLoader
      jest.spyOn(component, 'loadCardSkeletonLoader').mockImplementation(() => {});
      
      // Mock fetchFromSearchV6 with default implementation
      jest.spyOn(component, 'fetchFromSearchV6').mockImplementation(() => 
        Promise.resolve({ results: { result: { content: [] } } })
      );
    });

    it('should fetch data successfully and transform contents', async () => {
      // Mock successful response
      const mockResponse = {
        results: {
          result: {
            content: [{ id: '1', name: 'Test Content' }]
          }
        }
      };
      
      const transformedData = [{ widgetData: { id: '1', name: 'Test Content' } }];
      
      // Configure mocks
      component.fetchFromSearchV6 = jest.fn().mockResolvedValue(mockResponse);
      commonMethodsServiceMock.transformContentsToWidgets.mockReturnValue(transformedData);
      
      // Call the method with timeout protection
      await Promise.race([
        component.getDataFromSearch(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Test timeout')), 1000))
      ]);
      
      // Verify results
      expect(component.fetchFromSearchV6).toHaveBeenCalled();
      expect(commonMethodsServiceMock.transformContentsToWidgets).toHaveBeenCalledWith(
        mockResponse.results.result.content,
        { key: 'topContents' }
      );
      expect(component.contentDataList).toEqual(transformedData);
      expect(component.loadContentSearch).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      // Mock error response
      component.fetchFromSearchV6 = jest.fn().mockRejectedValue(new Error('Test error'));
      
      // Call the method with timeout protection
      await Promise.race([
        component.getDataFromSearch(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Test timeout')), 1000))
      ]);
      
      // No assertions needed other than that it completes without throwing
    });

    it('should do nothing if no content search section exists', async () => {
      // Setup without content search section
      component.sectionList = [{ key: 'otherSection' }];
      
      // Create a new spy for fetchFromSearchV6 to ensure it's fresh
      component.fetchFromSearchV6 = jest.fn();
      
      // Call the method with timeout protection
      await Promise.race([
        component.getDataFromSearch(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Test timeout')), 1000))
      ]);
      
      // Verify fetchFromSearchV6 was not called
      expect(component.fetchFromSearchV6).not.toHaveBeenCalled();
    });
  });

  describe('fetchFromSearchV6', () => {
    it('should resolve with results on successful API call', async () => {
      // Mock successful API response
      const mockResponse = { result: { content: [] } };
      micrositeServiceMock.searchV6.mockReturnValue(of(mockResponse));
      
      // Call the method with a timeout to prevent hanging
      const result = await Promise.race([
        component.fetchFromSearchV6({ request: {} }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Test timeout')), 1000))
      ]);
      
      // Verify results
      expect(result).toEqual({ results: mockResponse });
      expect(micrositeServiceMock.searchV6).toHaveBeenCalledWith({ request: {} });
    });

    it('should reject on API error', async () => {
      // Mock API error
      const mockError = new Error('API error');
      micrositeServiceMock.searchV6.mockReturnValue(throwError(mockError));
      
      // Test with proper assertion and timeout
      await expect(Promise.race([
        component.fetchFromSearchV6({ request: {} }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Test timeout')), 1000))
      ])).rejects.toEqual(mockError);
    });

    // it('should not call API if request is falsy', async () => {
    //   // Call with falsy request - use done callback to avoid timeout
    //   let result;
    //   try {
    //     result = await component.fetchFromSearchV6(null);
    //   } catch (error) {
    //     // Handle any unexpected errors
    //     fail(error);
    //   }
      
    //   // Verify API was not called
    //   expect(micrositeServiceMock.searchV6).not.toHaveBeenCalled();
    //   expect(result).toBeUndefined();
    // });
  });

  describe('handleSearchQuery', () => {
    it('should call getDataFromSearch with query if value exists', () => {
      // Mock event
      const mockEvent = { target: { value: 'test query' } };
      
      // Mock formRequest
      const mockRequest = { request: { query: 'test query' } };
      component.formRequest = jest.fn().mockReturnValue(mockRequest);
      
      // Spy on getDataFromSearch with implementation to prevent actual API calls
      component.getDataFromSearch = jest.fn().mockResolvedValue(undefined);
      
      // Call the method
      component.handleSearchQuery(mockEvent);
      
      // Verify formRequest and getDataFromSearch were called
      expect(component.formRequest).toHaveBeenCalledWith('test query');
      expect(component.getDataFromSearch).toHaveBeenCalledWith(mockRequest);
    });

    it('should not call getDataFromSearch if value is empty', () => {
      // Mock event with empty value
      const mockEvent = { target: { value: '' } };
      
      // Spy on methods
      component.formRequest = jest.fn();
      component.getDataFromSearch = jest.fn();
      
      // Call the method
      component.handleSearchQuery(mockEvent);
      
      // Verify methods were not called
      expect(component.formRequest).not.toHaveBeenCalled();
      expect(component.getDataFromSearch).not.toHaveBeenCalled();
    });
  });

  describe('formRequest', () => {
    beforeEach(() => {
      // Spy on loadCardSkeletonLoader
      jest.spyOn(component, 'loadCardSkeletonLoader');
    });

    it('should return a properly formatted request with query text', () => {
      const result = component.formRequest('test query');
      
      expect(component.loadCardSkeletonLoader).toHaveBeenCalled();
      expect(result).toEqual({
        request: {
          query: 'test query',
          filters: {
            contentType: 'Course',
            status: ['Live']
          },
          sort_by: {
            lastUpdatedOn: 'desc'
          },
          offset: 0,
          fields: []
        }
      });
    });

    it('should include additional filters if provided', () => {
      const additionalFilter = { category: 'test category' };
      const result = component.formRequest('', additionalFilter);
      
      expect(result.request.filters).toEqual({
        contentType: 'Course',
        category: 'test category',
        status: ['Live']
      });
    });

    it('should use empty string for query if not provided', () => {
      const result = component.formRequest();
      
      expect(result.request.query).toBe('');
    });
  });

  describe('loadCardSkeletonLoader', () => {
    it('should transform skeleton to widgets for content search section', () => {
      // Setup test data
      const mockStrip = { key: 'topContents' };
      const mockSkeletonWidgets = [{ type: 'skeleton' }];
      
      component.sectionList = [
        {
          key: 'contentSearch',
          column: [{ data: { strips: [mockStrip] } }]
        }
      ];
      
      commonMethodsServiceMock.transformSkeletonToWidgets.mockReturnValue(mockSkeletonWidgets);
      
      // Call the method
      component.loadCardSkeletonLoader();
      
      // Verify transformSkeletonToWidgets was called with the strip
      expect(commonMethodsServiceMock.transformSkeletonToWidgets).toHaveBeenCalledWith(mockStrip);
      
      // Verify contentDataList was updated
      expect(component.contentDataList).toEqual(mockSkeletonWidgets);
    });

    it('should do nothing if no content search section exists', () => {
      // Setup without content search section
      component.sectionList = [{ key: 'otherSection' }];
      
      // Call the method
      component.loadCardSkeletonLoader();
      
      // Verify transformSkeletonToWidgets was not called
      expect(commonMethodsServiceMock.transformSkeletonToWidgets).not.toHaveBeenCalled();
    });
  });
});
