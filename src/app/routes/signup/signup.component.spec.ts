import { SignupComponent } from './signup.component'
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar'
import { SignupService } from './signup.service'
import { UntypedFormGroup } from '@angular/forms'
import { of, throwError } from 'rxjs'
import { ElementRef } from '@angular/core'

describe('SignupComponent', () => {
  let component: SignupComponent
  let mockSnackBar: jest.Mocked<MatSnackBar>
  let mockSignupService: jest.Mocked<SignupService>

  beforeEach(() => {
    // Mock MatSnackBar
    mockSnackBar = {
      open: jest.fn(),
    } as unknown as jest.Mocked<MatSnackBar>

    // Mock SignupService
    mockSignupService = {
      signup: jest.fn(),
    } as unknown as jest.Mocked<SignupService>

    // Create instance of the component
    component = new SignupComponent(mockSnackBar, mockSignupService)

    // Mock ViewChild elements
    component.toastSuccess = {
      nativeElement: { value: 'Signup successful!' }
    } as ElementRef

    component.toastError = {
      nativeElement: { value: 'Signup failed!' }
    } as ElementRef
  })

  afterEach(() => {
    jest.clearAllMocks()
    jest.resetAllMocks()
  })

  describe('Constructor and Initialization', () => {
    it('should create the component', () => {
      expect(component).toBeTruthy()
    })

    it('should initialize signupForm with all required controls', () => {
      expect(component.signupForm instanceof UntypedFormGroup).toBe(true)
      expect(component.signupForm.controls['fname']).toBeDefined()
      expect(component.signupForm.controls['lname']).toBeDefined()
      expect(component.signupForm.controls['email']).toBeDefined()
      expect(component.signupForm.controls['code']).toBeDefined()
    })

    it('should have required validators on fname control', () => {
      const fnameControl = component.signupForm.controls['fname']
      expect(fnameControl.hasError('required')).toBe(true)

      fnameControl.setValue('John')
      expect(fnameControl.hasError('required')).toBe(false)
    })

    it('should have required validators on lname control', () => {
      const lnameControl = component.signupForm.controls['lname']
      expect(lnameControl.hasError('required')).toBe(true)

      lnameControl.setValue('Doe')
      expect(lnameControl.hasError('required')).toBe(false)
    })

    it('should have required and email validators on email control', () => {
      const emailControl = component.signupForm.controls['email']
      expect(emailControl.hasError('required')).toBe(true)

      emailControl.setValue('invalid-email')
      expect(emailControl.hasError('email')).toBe(true)

      emailControl.setValue('valid@example.com')
      expect(emailControl.hasError('email')).toBe(false)
      expect(emailControl.hasError('required')).toBe(false)
    })

    it('should have required validators on code control', () => {
      const codeControl = component.signupForm.controls['code']
      expect(codeControl.hasError('required')).toBe(true)

      codeControl.setValue('1234')
      expect(codeControl.hasError('required')).toBe(false)
    })

    it('should initialize uploadSaveData as false', () => {
      expect(component.uploadSaveData).toBe(false)
    })
  })

  describe('ngOnInit', () => {
    it('should execute without errors', () => {
      expect(() => component.ngOnInit()).not.toThrow()
    })
  })

  describe('ngOnDestroy', () => {
    it('should unsubscribe from unseenCtrlSub if subscription exists and is not closed', () => {
      component.unseenCtrlSub = { unsubscribe: jest.fn(), closed: false } as any

      component.ngOnDestroy()

      expect(component.unseenCtrlSub.unsubscribe).toHaveBeenCalled()
    })

    it('should not unsubscribe if unseenCtrlSub is already closed', () => {
      component.unseenCtrlSub = { unsubscribe: jest.fn(), closed: true } as any

      component.ngOnDestroy()

      expect(component.unseenCtrlSub.unsubscribe).not.toHaveBeenCalled()
    })

    it('should not throw error if unseenCtrlSub is undefined', () => {
      component.unseenCtrlSub = undefined as any

      expect(() => component.ngOnDestroy()).not.toThrow()
    })

    it('should not throw error if unseenCtrlSub is null', () => {
      component.unseenCtrlSub = null as any

      expect(() => component.ngOnDestroy()).not.toThrow()
    })
  })

  describe('onSubmit', () => {
    it('should call signup service with form values and complete successfully', () => {
      const formData = {
        value: { fname: 'John', lname: 'Doe', email: 'test@example.com', code: '1234' },
        reset: jest.fn()
      }
      mockSignupService.signup.mockReturnValue(of({}))

      component.onSubmit(formData)

      expect(mockSignupService.signup).toHaveBeenCalledWith(formData.value)
      expect(formData.reset).toHaveBeenCalled()
      expect(component.uploadSaveData).toBe(false)
    })

    it('should call signup service with form values', () => {
      const formData = {
        value: { fname: 'John', lname: 'Doe', email: 'test@example.com', code: '1234' },
        reset: jest.fn()
      }
      mockSignupService.signup.mockReturnValue(of({}))

      component.onSubmit(formData)

      expect(mockSignupService.signup).toHaveBeenCalledWith(formData.value)
    })

    it('should reset form on successful signup', () => {
      const formData = {
        value: { fname: 'John', lname: 'Doe', email: 'test@example.com', code: '1234' },
        reset: jest.fn()
      }
      mockSignupService.signup.mockReturnValue(of({}))

      component.onSubmit(formData)

      expect(formData.reset).toHaveBeenCalled()
    })

    it('should set uploadSaveData to false on signup error and show error message', () => {
      const formData = {
        value: { fname: 'John', lname: 'Doe', email: 'test@example.com', code: '1234' },
        reset: jest.fn()
      }
      const errorResponse = { error: 'error: Invalid data' }
      mockSignupService.signup.mockReturnValue(throwError(errorResponse))

      component.onSubmit(formData)

      expect(component.uploadSaveData).toBe(false)
      expect(mockSnackBar.open).toHaveBeenCalledWith(' Invalid data', 'X', { duration: 5000 })
    })

    it('should show success snackbar with toastSuccess value on successful signup', () => {
      const formData = {
        value: { fname: 'John', lname: 'Doe', email: 'test@example.com', code: '1234' },
        reset: jest.fn()
      }
      mockSignupService.signup.mockReturnValue(of({}))

      component.onSubmit(formData)

      expect(mockSnackBar.open).toHaveBeenCalledWith('Signup successful!', 'X', { duration: 5000 })
    })

    it('should set uploadSaveData to false and not reset form on error', () => {
      const formData = {
        value: { fname: 'John', lname: 'Doe', email: 'test@example.com', code: '1234' },
        reset: jest.fn()
      }
      const errorResponse = { error: 'error: Server error' }
      mockSignupService.signup.mockReturnValue(throwError(errorResponse))

      component.onSubmit(formData)

      expect(component.uploadSaveData).toBe(false)
      expect(formData.reset).not.toHaveBeenCalled()
    })

    it('should show error snackbar with parsed error message on signup failure', () => {
      const formData = {
        value: { fname: 'John', lname: 'Doe', email: 'test@example.com', code: '1234' },
        reset: jest.fn()
      }
      const errorResponse = { error: 'error: Invalid email format' }
      mockSignupService.signup.mockReturnValue(throwError(errorResponse))

      component.onSubmit(formData)

      expect(mockSnackBar.open).toHaveBeenCalledWith(' Invalid email format', 'X', { duration: 5000 })
    })

    it('should handle error with multiple colons in error message', () => {
      const formData = {
        value: { fname: 'John', lname: 'Doe', email: 'test@example.com', code: '1234' },
        reset: jest.fn()
      }
      const errorResponse = { error: 'error: User: already exists' }
      mockSignupService.signup.mockReturnValue(throwError(errorResponse))

      component.onSubmit(formData)

      // split(':')[1] returns ' User' (only the 2nd element)
      expect(mockSnackBar.open).toHaveBeenCalledWith(' User', 'X', { duration: 5000 })
    })

    it('should not reset form on signup error', () => {
      const formData = {
        value: { fname: 'John', lname: 'Doe', email: 'test@example.com', code: '1234' },
        reset: jest.fn()
      }
      const errorResponse = { error: 'error: Server error' }
      mockSignupService.signup.mockReturnValue(throwError(errorResponse))

      component.onSubmit(formData)

      expect(formData.reset).not.toHaveBeenCalled()
    })

    it('should handle empty form data', () => {
      const formData = {
        value: {},
        reset: jest.fn()
      }
      mockSignupService.signup.mockReturnValue(of({}))

      component.onSubmit(formData)

      expect(mockSignupService.signup).toHaveBeenCalledWith({})
    })

    it('should handle form data with extra fields', () => {
      const formData = {
        value: {
          fname: 'John',
          lname: 'Doe',
          email: 'test@example.com',
          code: '1234',
          extraField: 'extra'
        },
        reset: jest.fn()
      }
      mockSignupService.signup.mockReturnValue(of({}))

      component.onSubmit(formData)

      expect(mockSignupService.signup).toHaveBeenCalledWith(formData.value)
    })
  })

  describe('openSnackbar (private method tested through onSubmit)', () => {
    it('should open snackbar with default duration of 5000ms on success', () => {
      const formData = {
        value: { fname: 'John', lname: 'Doe', email: 'test@example.com', code: '1234' },
        reset: jest.fn()
      }
      mockSignupService.signup.mockReturnValue(of({}))

      component.onSubmit(formData)

      expect(mockSnackBar.open).toHaveBeenCalledWith(
        'Signup successful!',
        'X',
        { duration: 5000 }
      )
    })

    it('should open snackbar with custom message', () => {
      const formData = {
        value: { fname: 'John', lname: 'Doe', email: 'test@example.com', code: '1234' },
        reset: jest.fn()
      }
      component.toastSuccess = {
        nativeElement: { value: 'Custom success message!' }
      } as ElementRef
      mockSignupService.signup.mockReturnValue(of({}))

      component.onSubmit(formData)

      expect(mockSnackBar.open).toHaveBeenCalledWith('Custom success message!', 'X', { duration: 5000 })
    })
  })

  describe('Form Validation Integration', () => {
    it('should have invalid form when all fields are empty', () => {
      component.signupForm.controls['fname'].setValue('')
      component.signupForm.controls['lname'].setValue('')
      component.signupForm.controls['email'].setValue('')
      component.signupForm.controls['code'].setValue('')

      expect(component.signupForm.valid).toBe(false)
    })

    it('should have invalid form when email is invalid', () => {
      component.signupForm.controls['fname'].setValue('John')
      component.signupForm.controls['lname'].setValue('Doe')
      component.signupForm.controls['email'].setValue('invalid-email')
      component.signupForm.controls['code'].setValue('1234')

      expect(component.signupForm.valid).toBe(false)
      expect(component.signupForm.controls['email'].hasError('email')).toBe(true)
    })

    it('should have valid form when all fields are properly filled', () => {
      component.signupForm.controls['fname'].setValue('John')
      component.signupForm.controls['lname'].setValue('Doe')
      component.signupForm.controls['email'].setValue('john.doe@example.com')
      component.signupForm.controls['code'].setValue('1234')

      expect(component.signupForm.valid).toBe(true)
    })

    it('should have invalid form when fname is missing', () => {
      component.signupForm.controls['fname'].setValue('')
      component.signupForm.controls['lname'].setValue('Doe')
      component.signupForm.controls['email'].setValue('test@example.com')
      component.signupForm.controls['code'].setValue('1234')

      expect(component.signupForm.valid).toBe(false)
    })

    it('should have invalid form when lname is missing', () => {
      component.signupForm.controls['fname'].setValue('John')
      component.signupForm.controls['lname'].setValue('')
      component.signupForm.controls['email'].setValue('test@example.com')
      component.signupForm.controls['code'].setValue('1234')

      expect(component.signupForm.valid).toBe(false)
    })

    it('should have invalid form when code is missing', () => {
      component.signupForm.controls['fname'].setValue('John')
      component.signupForm.controls['lname'].setValue('Doe')
      component.signupForm.controls['email'].setValue('test@example.com')
      component.signupForm.controls['code'].setValue('')

      expect(component.signupForm.valid).toBe(false)
    })
  })

  describe('Edge Cases', () => {
    it('should handle error without colon separator', () => {
      const formData = {
        value: { fname: 'John', lname: 'Doe', email: 'test@example.com', code: '1234' },
        reset: jest.fn()
      }
      const errorResponse = { error: 'Simple error message' }
      mockSignupService.signup.mockReturnValue(throwError(errorResponse))

      // This test expects the error handling to try to split by colon
      // When there's no colon, split returns array with one element at index 0
      // Accessing index [1] returns undefined
      component.onSubmit(formData)

      // The component will try to show undefined or empty string
      expect(component.uploadSaveData).toBe(false)
      expect(formData.reset).not.toHaveBeenCalled()
    })

    it('should handle null error response - throws error', () => {
      const formData = {
        value: { fname: 'John', lname: 'Doe', email: 'test@example.com', code: '1234' },
        reset: jest.fn()
      }
      // Simulate error where error.error is null/undefined
      const errorResponse = { error: null }
      mockSignupService.signup.mockReturnValue(throwError(() => errorResponse))

      // When err.error is null, calling .split() throws an error
      // This means uploadSaveData = false line never executes
      component.onSubmit(formData)

      // uploadSaveData remains true because error callback throws before reaching the assignment
      expect(component.uploadSaveData).toBe(true)
    })

    it('should handle successful response with data', () => {
      const formData = {
        value: { fname: 'John', lname: 'Doe', email: 'test@example.com', code: '1234' },
        reset: jest.fn()
      }
      const successResponse = { userId: 'user123', message: 'Account created' }
      mockSignupService.signup.mockReturnValue(of(successResponse))

      component.onSubmit(formData)

      expect(mockSnackBar.open).toHaveBeenCalled()
      expect(component.uploadSaveData).toBe(false)
    })
  })
})
