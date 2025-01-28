import { EventSessionsComponent } from './event-sessions.component';
import { EventService } from '../../services/event.service';
import { ActivatedRoute } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';

jest.mock('../../services/event.service');
jest.mock('@angular/router');
jest.mock('@angular/core');

describe('EventSessionsComponent', () => {
  let component: EventSessionsComponent;
  let activatedRouteMock: any;
  let eventServiceMock: any;
  let changeDetectorMock: any;

  beforeEach(() => {
    

    eventServiceMock = new EventService(null as any);
    eventServiceMock.bannerisEnabled = { next: jest.fn() };

    changeDetectorMock = {
      detectChanges: jest.fn(),
    };

    component = new EventSessionsComponent(
      activatedRouteMock as ActivatedRoute,
      eventServiceMock as EventService,
      changeDetectorMock as ChangeDetectorRef
    );
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize component and load session data on ngOnInit', () => {
    // Call ngOnInit
    component.ngOnInit();

    // Check that bannerisEnabled was set to true
    expect(eventServiceMock.bannerisEnabled.next).toHaveBeenCalledWith(true);

    // Check if session data is populated correctly
    expect(component.data.length).toBe(2);
    expect(component.data[0].sessionID).toBe('Session1');
    expect(component.data[0].speakerName).toBe('Speaker 1');
    expect(component.data[1].speakerName).toBe('Speaker 2');
  });

  it('should calculate remaining time correctly', () => {
    component.data = [
      {
        startTime: '2025-01-23T09:00:00',
        endTime: '2025-01-23T10:00:00',
      } as any,
    ];
    component.calculateTime();

    expect(component.sessionStartTime.length).toBe(1);
    expect(component.sessionEndTime.length).toBe(1);
  });

  it('should subscribe to timer and update live sessions on ngOnInit', () => {
    jest.useFakeTimers();
    const liveSessionPushSpy = jest.spyOn(component, 'calculateTime');
    component.ngOnInit();

    // Simulate a timer tick
    jest.advanceTimersByTime(60000);

    // The timer subscription should have updated the live sessions
    expect(liveSessionPushSpy).toHaveBeenCalled();
    jest.useRealTimers();
  });

  it('should cleanup subscription on ngOnDestroy', () => {
    // component.currentSubscription = {
    //   unsubscribe: jest.fn(),
    // } as any;

    // component.ngOnDestroy();

    // expect(component.currentSubscription.unsubscribe).toHaveBeenCalled();
  });

  it('should handle empty session data gracefully', () => {
    // Provide empty session data
    
  });
});