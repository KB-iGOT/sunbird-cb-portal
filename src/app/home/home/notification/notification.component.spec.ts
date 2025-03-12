import { NotificationComponent } from './notification.component';
import { Router } from '@angular/router';
import { MatLegacySnackBarRef as MatSnackBarRef } from '@angular/material/legacy-snack-bar'

// Mock dependencies
jest.mock('@angular/router');
jest.mock('@angular/material/legacy-snack-bar');

describe('NotificationComponent', () => {
  let component: NotificationComponent;
  let mockSnackBarRef: MatSnackBarRef<NotificationComponent>;
  let mockRouter: Router;

  beforeEach(() => {
    // Create mock instances of the dependencies
    mockSnackBarRef = {
      dismiss: jest.fn(),
    } as unknown as MatSnackBarRef<NotificationComponent>;

    mockRouter = {
      navigateByUrl: jest.fn(),
    } as unknown as Router;

    // Create the component instance with mocked dependencies
    component = new NotificationComponent(mockSnackBarRef, { data: {} }, mockRouter);
  });

  it('should create the NotificationComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should call router.navigateByUrl and snackBarRef.dismiss on handleRoute', () => {
    // Call the handleRoute method
    component.handleRoute();

    // Verify that navigateByUrl was called with the correct argument
    expect(mockRouter.navigateByUrl).toHaveBeenCalledWith('app/person-profile/me');

    // Verify that dismiss was called
    expect(mockSnackBarRef.dismiss).toHaveBeenCalled();
  });
});
