import { SignupAutoComponent } from './signup-auto.component';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { SignupAutoService } from './signup-auto.service';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

describe('SignupAutoComponent', () => {
  let component: SignupAutoComponent;
  let mockSnackBar: MatSnackBar;
  let mockSignupAutoService: jest.Mocked<SignupAutoService>;
  let mockActivatedRoute: any;

  beforeEach(() => {
    // Mock MatSnackBar
    mockSnackBar = {
      open: jest.fn(),
    } as unknown as MatSnackBar;

    // Mock SignupAutoService and its signup method
    mockSignupAutoService = {
      signup: jest.fn(),
    } as unknown as jest.Mocked<SignupAutoService>;

    // Mock ActivatedRoute
    mockActivatedRoute = {
      paramMap: of({ get: jest.fn().mockReturnValue('uniqueId123') }),
    } as unknown as ActivatedRoute;

    // Create the component
    component = new SignupAutoComponent(
      mockSnackBar,
      mockSignupAutoService,
      mockActivatedRoute,
    );
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct values and trigger signup on ngOnInit', () => {
    // Mock the signupAutoService.signup method
    const signupResponse = { msg: '1001:Some error', email: 'test@example.com' };
    mockSignupAutoService.signup.mockReturnValue(of(signupResponse));

    // Call ngOnInit
    component.ngOnInit();

    expect(component.uniqueId).toBe('uniqueId123');
    expect(mockSignupAutoService.signup).toHaveBeenCalledWith('uniqueId123');
    expect(component.fetching).toBe(false);
    expect(component.msg).toBe('Something went wrong, please contact administrator');
    expect(mockSnackBar.open).toHaveBeenCalledWith(
      'Something went wrong, please contact administrator',
      'X',
      { duration: 5000 }
    );
  });

  it('should handle error in signup and show error message', () => {
    const errorResponse = { error: { msg: 'Some error occurred' } };
    mockSignupAutoService.signup.mockReturnValue(throwError(errorResponse));

    // Call ngOnInit
    component.ngOnInit();

    expect(component.fetching).toBe(false);
    expect(component.msg).toBe('Something went wrong please try again later!!');
    expect(mockSnackBar.open).toHaveBeenCalledWith('Some error occurred', 'X', {
      duration: 5000,
    });
  });

  it('should process the response and set the correct message for each response code', () => {
    const responseTests = [
      { code: '1001', expectedMsg: 'Something went wrong, please contact administrator' },
      { code: '1002', expectedMsg: 'Registered email address is not valid, so please contact administrator' },
      { code: '1003', expectedMsg: 'You have been already registered successfully on the platform with email test@example.com. Please check your email' },
      { code: '1004', expectedMsg: 'You have been already registered successfully on the platform. If you have trouble logging in please contact administrator' },
      { code: '1005', expectedMsg: 'You have been registered successfully on the platform with email test@example.com. Please check your email' },
      { code: '9999', expectedMsg: 'Something went wrong, please contact administrator' },
    ];

    responseTests.forEach(test => {
      const signupResponse = { msg: `${test.code}:Some message`, email: 'test@example.com' };
      mockSignupAutoService.signup.mockReturnValue(of(signupResponse));

      component.signup('uniqueId123');
      expect(component.msg).toBe(test.expectedMsg);
      expect(mockSnackBar.open).toHaveBeenCalledWith(test.expectedMsg, 'X', { duration: 5000 });
    });
  });

  it('should call openSnackbar with the correct message', () => {
    const message = 'Test message';
    // component.openSnackbar(message);

    expect(mockSnackBar.open).toHaveBeenCalledWith(message, 'X', { duration: 5000 });
  });
});
