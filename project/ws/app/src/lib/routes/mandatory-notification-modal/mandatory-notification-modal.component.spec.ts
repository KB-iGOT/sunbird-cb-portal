import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'
import { EventService } from '@sunbird-cb/utils-v2'

import { MandatoryNotificationModalComponent } from './mandatory-notification-modal.component'

describe('MandatoryNotificationModalComponent', () => {
  let component: MandatoryNotificationModalComponent
  let fixture: ComponentFixture<MandatoryNotificationModalComponent>
  const dialogRefMock: any = { close: jest.fn() }
  const eventServiceMock = { raiseInteractTelemetry: jest.fn() }

  beforeEach(() => {
    jest.clearAllMocks()
    TestBed.configureTestingModule({
      declarations: [MandatoryNotificationModalComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { notification: { message: { data: { assessmentId: 'a1' } } } } },
        { provide: MatDialogRef, useValue: dialogRefMock },
        { provide: EventService, useValue: eventServiceMock },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    fixture = TestBed.createComponent(MandatoryNotificationModalComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
    expect(dialogRefMock.disableClose).toBe(true)
  })

  it('should close with accepted on accept', () => {
    component.onAccept()
    expect(eventServiceMock.raiseInteractTelemetry).toHaveBeenCalledWith(
      { type: 'click', subType: 'accept', id: 'mandatory-notification-modal' },
      { id: 'a1', type: 'Comprehensive Assessment Program' },
      { module: 'mandatory-notification' },
    )
    expect(dialogRefMock.close).toHaveBeenCalledWith('accepted')
  })

  it('should close with rejected on reject', () => {
    component.onReject()
    expect(dialogRefMock.close).toHaveBeenCalledWith('rejected')
  })
})
