import { SignupComponent } from './signup.component';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar'
import { SignupService } from './signup.service';
import { UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { of, throwError } from 'rxjs';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let mockSnackBar: jest.Mocked<MatSnackBar>;
  let mockSignupService: jest.Mocked<SignupService>;

  beforeEach(() => {
    // Mock MatSnackBar
    mockSnackBar = {
      open: jest.fn(),
    } as unknown as jest.Mocked<MatSnackBar>;

    // Mock SignupService
    mockSignupService = {
      signup: jest.fn(),
    } as unknown as jest.Mocked<SignupService>;

    // Create instance of the component
    component = new SignupComponent(mockSnackBar, mockSignupService);

    // Initialize the form with required controls
    component.signupForm = new UntypedFormGroup({
      fname: new UntypedFormControl('John', []),
      lname: new UntypedFormControl('Doe', []),
      email: new UntypedFormControl('test@example.com', []),
      code: new UntypedFormControl('1234', []),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  it('should create the component and initialize the form', () => {
    expect(component).toBeTruthy();
    expect(component.signupForm instanceof UntypedFormGroup).toBe(true);
    expect(component.signupForm.controls.fname.value).toBe('John');
  });

  it('should call signup service on form submit with valid data', () => {
    // Arrange
    const formData = { value: { fname: 'John', lname: 'Doe', email: 'test@example.com', code: '1234' } };
    mockSignupService.signup.mockReturnValue(of({})); // Simulate successful response

    // Act
    component.onSubmit(formData);

    // Assert
    expect(mockSignupService.signup).toHaveBeenCalledWith(formData.value);
    expect(component.uploadSaveData).toBe(false);
    expect(mockSnackBar.open).toHaveBeenCalled();
  });

  it('should show error snackbar when signup fails', () => {
    // Arrange
    const formData = { value: { fname: 'John', lname: 'Doe', email: 'test@example.com', code: '1234' } };
    const errorResponse = { error: 'error: Invalid data' };
    mockSignupService.signup.mockReturnValue(throwError(() => errorResponse)); // Simulate error response

    // Act
    component.onSubmit(formData);

    // Assert
    expect(mockSignupService.signup).toHaveBeenCalledWith(formData.value);
    expect(component.uploadSaveData).toBe(false);
    expect(mockSnackBar.open).toHaveBeenCalledWith('Invalid data', 'X', { duration: 5000 });
  });

  it('should unsubscribe from the unseenCtrlSub on destroy', () => {
    // Arrange
    component.unseenCtrlSub = { unsubscribe: jest.fn(), closed: false } as any;

    // Act
    component.ngOnDestroy();

    // Assert
    expect(component.unseenCtrlSub.unsubscribe).toHaveBeenCalled();
  });

  it('should handle case where unseenCtrlSub is already closed', () => {
    // Arrange
    component.unseenCtrlSub = { unsubscribe: jest.fn(), closed: true } as any;

    // Act
    component.ngOnDestroy();

    // Assert
    expect(component.unseenCtrlSub.unsubscribe).not.toHaveBeenCalled();
  });
});
