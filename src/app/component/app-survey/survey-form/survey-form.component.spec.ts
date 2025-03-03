import { SurveyFormComponent } from './survey-form.component';

describe('SurveyFormComponent', () => {
  let component: SurveyFormComponent;
  let activatedRouteMock: any;
  let configSvcMock: any;

  beforeEach(() => {
    // Mocking ActivatedRoute
    activatedRouteMock = {
      snapshot: {
        data: {
          pageData: {
            data: {
              surveyPopup: {
                banners: 'bannersData',
                someOtherProperty: 'someValue'
              }
            }
          }
        }
      }
    };

    // Mocking ConfigurationsService
    configSvcMock = {
      unMappedUser: {
        profileDetails: {
          get_started_tour: {
            skipped: false,
            visited: false
          }
        }
      }
    };

    // Initialize the component
    component = new SurveyFormComponent(activatedRouteMock, configSvcMock);
  });

  it('should initialize the component correctly', () => {
    // Trigger ngOnInit
    component.ngOnInit();

    // Test that surveyPopupData, surveyPopup, and widgetData are set correctly
    expect(component.surveyPopupData).toBe('bannersData');
    expect(component.surveyPopup.someOtherProperty).toBe('someValue');
    expect(component.widgetData).toBe(component.surveyPopup);

    // Test that userRead is assigned correctly
    expect(component.userRead).toEqual(configSvcMock.unMappedUser);

    // Test that isTourDone is calculated correctly
    expect(component.isTourDone).toBe(false);

    // Test that localStorageFlag and languageFlag are handled
    localStorage.setItem('surveyPopup', 'true');
    localStorage.setItem('websiteLanguage', 'en');

    component.ngOnInit();

    expect(component.localStorageFlag).toBe(true);
    expect(component.languageFlag).toBe(true);
  });

  it('should close the survey popup and update localStorage', () => {
    // Mock localStorage.getItem to return a value
    localStorage.setItem('surveyPopup', 'true');
    
    // Simulate closing the popup
    component.closeCard();

    // Verify that the popup is closed
    expect(component.isSurveyPopup).toBe(false);

    // Verify localStorage is updated
    expect(localStorage.getItem('surveyPopup')).toBe('false');
    expect(component.localStorageFlag).toBe(false);
  });

  it('should not update localStorage if localStorageFlag is false', () => {
    // Set initial localStorage value to false
    localStorage.setItem('surveyPopup', 'false');
    component.ngOnInit();

    // Simulate closing the popup
    component.closeCard();

    // Verify that the popup is closed, but localStorage is not updated
    expect(component.isSurveyPopup).toBe(false);
    expect(localStorage.getItem('surveyPopup')).toBe('false');
  });
});
