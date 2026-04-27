import { SignupSuccessDialogueComponent } from './signup-success-dialogue.component'

describe('SignupSuccessDialogueComponent', () => {
  let component: SignupSuccessDialogueComponent
  let dialogRefMock: any
  let routerMock: any

  beforeEach(() => {
    dialogRefMock = {
      close: jest.fn(),
    }
    routerMock = {
      navigate: jest.fn(),
    }
    component = new SignupSuccessDialogueComponent(dialogRefMock, routerMock)
  })

  it('should create the component', () => {
    expect(component).toBeTruthy()
  })

  describe('ngOnInit', () => {
    it('should execute without errors', () => {
      expect(() => component.ngOnInit()).not.toThrow()
    })
  })

  describe('closeDialog', () => {
    it('should call dialogRef.close()', () => {
      component.closeDialog()
      expect(dialogRefMock.close).toHaveBeenCalledTimes(1)
    })

    it('should navigate to /static-home', () => {
      component.closeDialog()
      expect(routerMock.navigate).toHaveBeenCalledWith(['/static-home'])
    })

    it('should close dialog before navigating', () => {
      const callOrder: string[] = []
      dialogRefMock.close.mockImplementation(() => callOrder.push('close'))
      routerMock.navigate.mockImplementation(() => callOrder.push('navigate'))

      component.closeDialog()

      expect(callOrder).toEqual(['close', 'navigate'])
    })
  })
})
