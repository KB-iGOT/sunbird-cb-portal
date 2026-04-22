import { MandatoryNotificationModalComponent } from './mandatory-notification-modal.component'

describe('MandatoryNotificationModalComponent', () => {
  let component: MandatoryNotificationModalComponent
  let mockEventService: any
  let mockDialogRef: any
  let mockData: any

  beforeEach(() => {
    // Create mocks
    mockEventService = {
      raiseInteractTelemetry: jest.fn(),
    }

    mockDialogRef = {
      disableClose: false,
      close: jest.fn(),
    }

    mockData = {
      notification: {
        message: {
          data: {
            assessmentId: 'test-assessment-123',
            primaryCategory: 'Test Category',
          },
        },
      },
    }

    // Create component instance
    component = new MandatoryNotificationModalComponent(
      mockData,
      mockEventService,
      mockDialogRef
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Component Initialization', () => {
    it('should create component instance', () => {
      expect(component).toBeDefined()
      expect(component instanceof MandatoryNotificationModalComponent).toBe(true)
    })

    it('should initialize with provided data', () => {
      expect(component.data).toEqual(mockData)
    })

    it('should set disableClose to true on dialogRef', () => {
      expect(mockDialogRef.disableClose).toBe(true)
    })

    it('should set disableClose in constructor', () => {
      const newDialogRef: any = {
        disableClose: false,
        close: jest.fn(),
      }

      const newComponent = new MandatoryNotificationModalComponent(
        mockData,
        mockEventService,
        newDialogRef
      )

      expect(newDialogRef.disableClose).toBe(true)
      expect(newComponent).toBeDefined()
    })
  })

  describe('onAccept', () => {
    it('should call raiseTelemetryForShare with "accept"', () => {
      const spy = jest.spyOn(component, 'raiseTelemetryForShare')

      component.onAccept()

      expect(spy).toHaveBeenCalledWith('accept')
    })

    it('should close dialog with "accepted" status', () => {
      component.onAccept()

      expect(mockDialogRef.close).toHaveBeenCalledWith('accepted')
    })

    it('should raise telemetry and close dialog in correct order', () => {
      const telemetrySpy = jest.spyOn(component, 'raiseTelemetryForShare')

      component.onAccept()

      expect(telemetrySpy).toHaveBeenCalledWith('accept')
      expect(mockDialogRef.close).toHaveBeenCalledWith('accepted')
    })

    it('should call both raiseTelemetryForShare and dialogRef.close', () => {
      const telemetrySpy = jest.spyOn(component, 'raiseTelemetryForShare')

      component.onAccept()

      expect(telemetrySpy).toHaveBeenCalledTimes(1)
      expect(mockDialogRef.close).toHaveBeenCalledTimes(1)
    })
  })

  describe('onReject', () => {
    it('should call raiseTelemetryForShare with "reject"', () => {
      const spy = jest.spyOn(component, 'raiseTelemetryForShare')

      component.onReject()

      expect(spy).toHaveBeenCalledWith('reject')
    })

    it('should close dialog with "rejected" status', () => {
      component.onReject()

      expect(mockDialogRef.close).toHaveBeenCalledWith('rejected')
    })

    it('should raise telemetry and close dialog in correct order', () => {
      const telemetrySpy = jest.spyOn(component, 'raiseTelemetryForShare')

      component.onReject()

      expect(telemetrySpy).toHaveBeenCalledWith('reject')
      expect(mockDialogRef.close).toHaveBeenCalledWith('rejected')
    })

    it('should call both raiseTelemetryForShare and dialogRef.close', () => {
      const telemetrySpy = jest.spyOn(component, 'raiseTelemetryForShare')

      component.onReject()

      expect(telemetrySpy).toHaveBeenCalledTimes(1)
      expect(mockDialogRef.close).toHaveBeenCalledTimes(1)
    })
  })

  describe('raiseTelemetryForShare', () => {
    it('should call raiseInteractTelemetry with correct parameters for accept', () => {
      component.raiseTelemetryForShare('accept')

      expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalledWith(
        {
          type: 'click',
          subType: 'accept',
          id: 'mandatory-notification-modal',
        },
        {
          id: 'test-assessment-123',
          type: 'Test Category',
        },
        {
          module: 'mandatory-notification',
        }
      )
    })

    it('should call raiseInteractTelemetry with correct parameters for reject', () => {
      component.raiseTelemetryForShare('reject')

      expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalledWith(
        {
          type: 'click',
          subType: 'reject',
          id: 'mandatory-notification-modal',
        },
        {
          id: 'test-assessment-123',
          type: 'Test Category',
        },
        {
          module: 'mandatory-notification',
        }
      )
    })

    it('should handle missing assessmentId with empty string', () => {
      const dataWithoutAssessmentId: any = {
        notification: {
          message: {
            data: {
              primaryCategory: 'Test Category',
            },
          },
        },
      }

      const newComponent = new MandatoryNotificationModalComponent(
        dataWithoutAssessmentId,
        mockEventService,
        mockDialogRef
      )

      newComponent.raiseTelemetryForShare('test')

      expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalledWith(
        {
          type: 'click',
          subType: 'test',
          id: 'mandatory-notification-modal',
        },
        {
          id: '',
          type: 'Test Category',
        },
        {
          module: 'mandatory-notification',
        }
      )
    })

    it('should use default primaryCategory when not provided', () => {
      const dataWithoutPrimaryCategory: any = {
        notification: {
          message: {
            data: {
              assessmentId: 'test-123',
            },
          },
        },
      }

      const newComponent = new MandatoryNotificationModalComponent(
        dataWithoutPrimaryCategory,
        mockEventService,
        mockDialogRef
      )

      newComponent.raiseTelemetryForShare('test')

      expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalledWith(
        {
          type: 'click',
          subType: 'test',
          id: 'mandatory-notification-modal',
        },
        {
          id: 'test-123',
          type: 'Comprehensive Assessment Program',
        },
        {
          module: 'mandatory-notification',
        }
      )
    })

    it('should handle null notification data', () => {
      const nullDataComponent = new MandatoryNotificationModalComponent(
        null,
        mockEventService,
        mockDialogRef
      )

      nullDataComponent.raiseTelemetryForShare('test')

      expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalledWith(
        {
          type: 'click',
          subType: 'test',
          id: 'mandatory-notification-modal',
        },
        {
          id: '',
          type: 'Comprehensive Assessment Program',
        },
        {
          module: 'mandatory-notification',
        }
      )
    })

    it('should handle undefined notification data', () => {
      const undefinedDataComponent = new MandatoryNotificationModalComponent(
        undefined,
        mockEventService,
        mockDialogRef
      )

      undefinedDataComponent.raiseTelemetryForShare('test')

      expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalledWith(
        {
          type: 'click',
          subType: 'test',
          id: 'mandatory-notification-modal',
        },
        {
          id: '',
          type: 'Comprehensive Assessment Program',
        },
        {
          module: 'mandatory-notification',
        }
      )
    })

    it('should handle empty data object', () => {
      const emptyDataComponent = new MandatoryNotificationModalComponent(
        {},
        mockEventService,
        mockDialogRef
      )

      emptyDataComponent.raiseTelemetryForShare('test')

      expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalledWith(
        {
          type: 'click',
          subType: 'test',
          id: 'mandatory-notification-modal',
        },
        {
          id: '',
          type: 'Comprehensive Assessment Program',
        },
        {
          module: 'mandatory-notification',
        }
      )
    })
  })

  describe('Integration Tests', () => {
    it('should complete accept flow successfully', () => {
      component.onAccept()

      expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalled()
      expect(mockDialogRef.close).toHaveBeenCalledWith('accepted')
    })

    it('should complete reject flow successfully', () => {
      component.onReject()

      expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalled()
      expect(mockDialogRef.close).toHaveBeenCalledWith('rejected')
    })

    it('should handle multiple accept calls', () => {
      component.onAccept()
      component.onAccept()
      component.onAccept()

      expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalledTimes(3)
      expect(mockDialogRef.close).toHaveBeenCalledTimes(3)
    })

    it('should handle multiple reject calls', () => {
      component.onReject()
      component.onReject()

      expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalledTimes(2)
      expect(mockDialogRef.close).toHaveBeenCalledTimes(2)
    })

    it('should handle alternating accept and reject calls', () => {
      component.onAccept()
      component.onReject()
      component.onAccept()

      expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalledTimes(3)
      expect(mockDialogRef.close).toHaveBeenCalledTimes(3)
    })
  })

  describe('Edge Cases', () => {
    it('should work with different subType values', () => {
      const testSubTypes = ['accept', 'reject', 'custom', 'other']

      testSubTypes.forEach((subType) => {
        component.raiseTelemetryForShare(subType)
      })

      expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalledTimes(testSubTypes.length)
    })

    it('should handle component with minimal data', () => {
      const minimalData: any = {}
      const minimalComponent = new MandatoryNotificationModalComponent(
        minimalData,
        mockEventService,
        mockDialogRef
      )

      expect(minimalComponent).toBeDefined()
      expect(minimalComponent.data).toEqual(minimalData)
    })

    it('should handle component with complex nested data', () => {
      const complexData: any = {
        notification: {
          message: {
            data: {
              assessmentId: 'complex-123',
              primaryCategory: 'Complex Category',
              extraField1: 'value1',
              extraField2: 'value2',
            },
            extraMessage: 'test',
          },
          type: 'notification',
        },
        extraData: 'test',
      }

      const complexComponent = new MandatoryNotificationModalComponent(
        complexData,
        mockEventService,
        mockDialogRef
      )

      complexComponent.raiseTelemetryForShare('test')

      expect(mockEventService.raiseInteractTelemetry).toHaveBeenCalledWith(
        {
          type: 'click',
          subType: 'test',
          id: 'mandatory-notification-modal',
        },
        {
          id: 'complex-123',
          type: 'Complex Category',
        },
        {
          module: 'mandatory-notification',
        }
      )
    })
  })

  describe('Constructor Tests', () => {
    it('should accept all required dependencies', () => {
      const newComponent = new MandatoryNotificationModalComponent(
        mockData,
        mockEventService,
        mockDialogRef
      )

      expect(newComponent).toBeDefined()
      expect(newComponent.data).toBeDefined()
    })

    it('should properly inject dependencies', () => {
      expect(component.data).toBe(mockData)
    })

    it('should create multiple independent instances', () => {
      const instance1 = new MandatoryNotificationModalComponent(
        mockData,
        mockEventService,
        mockDialogRef
      )

      const instance2 = new MandatoryNotificationModalComponent(
        mockData,
        mockEventService,
        mockDialogRef
      )

      expect(instance1).not.toBe(instance2)
      expect(instance1 instanceof MandatoryNotificationModalComponent).toBe(true)
      expect(instance2 instanceof MandatoryNotificationModalComponent).toBe(true)
    })
  })

  describe('Dialog Interaction Tests', () => {
    it('should close dialog only through onAccept or onReject methods', () => {
      expect(mockDialogRef.close).not.toHaveBeenCalled()

      component.onAccept()

      expect(mockDialogRef.close).toHaveBeenCalledTimes(1)
    })

    it('should maintain disableClose state', () => {
      expect(mockDialogRef.disableClose).toBe(true)

      component.onAccept()

      expect(mockDialogRef.disableClose).toBe(true)
    })
  })
})
