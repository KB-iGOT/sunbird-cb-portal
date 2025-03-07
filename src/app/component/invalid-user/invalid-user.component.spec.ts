import { InvalidUserComponent } from './invalid-user.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { Subscription } from 'rxjs';

// Mock ActivatedRoute
const mockActivatedRoute = {
  data: of({
    pageData: {
      data: {
        value: 'Invalid User'
      }
    }
  })
};

describe('InvalidUserComponent', () => {
  let component: InvalidUserComponent;
  let route: ActivatedRoute;

  beforeEach(() => {
    // Manually create the component instance and inject the mock ActivatedRoute
    route = mockActivatedRoute as any; // Casting to the appropriate type
    component = new InvalidUserComponent(route);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize invalidData on ngOnInit', () => {
    component.ngOnInit();
    
    // Check that the value of invalidData is set correctly after ngOnInit
    expect(component.invalidData).toBe('Invalid User');
  });

  it('should unsubscribe on ngOnDestroy when there is a subscription', () => {
    // Manually set up a mock subscription
    const mockSubscription = new Subscription();
    const spyOnUnsubscribe = jest.spyOn(mockSubscription, 'unsubscribe');
    component['subscriptionData'] = mockSubscription;

    // Call ngOnDestroy and check that unsubscribe is called
    component.ngOnDestroy();
    expect(spyOnUnsubscribe).toHaveBeenCalled();
  });

  it('should not attempt to unsubscribe if there is no subscription', () => {
    // Ensure that subscriptionData is null and no unsubscribe is called
    component['subscriptionData'] = null;

    const spyOnUnsubscribe = jest.spyOn(component, 'ngOnDestroy');

    // Call ngOnDestroy and ensure unsubscribe is not called
    component.ngOnDestroy();
    expect(spyOnUnsubscribe).not.toHaveBeenCalled();
  });
});
