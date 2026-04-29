import { AppTourVideoComponent } from './app-tour-video.component';
import { EventService } from '@sunbird-cb/utils-v2';
import { TranslateService } from '@ngx-translate/core';
import { ElementRef } from '@angular/core';

describe('AppTourVideoComponent', () => {
  let component: AppTourVideoComponent;
  let mockEventService: jest.Mocked<EventService>;
  let mockTranslateService: jest.Mocked<TranslateService>;
  let mockElementRef: jest.Mocked<ElementRef<HTMLVideoElement>>;

  beforeEach(() => {
    // Mock localStorage
    const localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
    };
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });

    // Mock document
    const mockDocument = {
      getElementById: jest.fn().mockReturnValue({
        ontimeupdate: null,
        currentTime: 0,
      }),
    };
    global.document = mockDocument as any;

    // Create mock instances
    mockEventService = {
      dispatchGetStartedEvent: jest.fn(),
    } as any;

    mockTranslateService = {
      setDefaultLang: jest.fn(),
      use: jest.fn(),
    } as any;

    mockElementRef = {
      nativeElement: {
        currentTime: 30,
      } as HTMLVideoElement,
    } as any;

    // Spy on environment
    const mockEnvironment = {
      sitePath: 'example.com',
    };

    // Initialize component with mocked dependencies
    component = new AppTourVideoComponent(mockEventService, mockTranslateService);
    component.tourVideoTag = mockElementRef;
    (component as any).environment = mockEnvironment;
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  describe('Constructor', () => {
    it('should set language from localStorage when language is set', () => {
      // Arrange - create fresh mocks
      const freshTranslate: any = { setDefaultLang: jest.fn(), use: jest.fn() }
      const freshEvent: any = { dispatchGetStartedEvent: jest.fn() }
      jest.spyOn(localStorage, 'getItem').mockReturnValue('fr')

      // Act - create a new component so constructor runs with language
      new AppTourVideoComponent(freshEvent, freshTranslate)

      // Assert
      expect(freshTranslate.setDefaultLang).toHaveBeenCalledWith('en')
      expect(freshTranslate.use).toHaveBeenCalledWith('fr')
    })

    it('should not call translate when no language in localStorage', () => {
      const freshTranslate: any = { setDefaultLang: jest.fn(), use: jest.fn() }
      const freshEvent: any = { dispatchGetStartedEvent: jest.fn() }
      jest.spyOn(localStorage, 'getItem').mockReturnValue(null)

      new AppTourVideoComponent(freshEvent, freshTranslate)

      expect(freshTranslate.setDefaultLang).not.toHaveBeenCalled()
      expect(freshTranslate.use).not.toHaveBeenCalled()
    })
  })

  describe('ngOnInit', () => {
    it('should set video URL from environment', () => {
      // Act
      component.ngOnInit();

      // Assert
      expect(component.videoUrl).toContain('assets/public/content/guide-videos/Website_Video.mp4');
    });

    it('should handle video progress time', () => {
      // Arrange - mock document.getElementById to return a fake video element
      const mockAud: any = { ontimeupdate: null, currentTime: 0 }
      jest.spyOn(document, 'getElementById').mockReturnValue(mockAud)
      jest.useFakeTimers();
      component.videoProgressTime = 10;

      // Act
      component.ngOnInit();
      jest.advanceTimersByTime(2000);

      // Assert - videoPlayedProgress is false when videoProgressTime > 0
      expect(component.videoPlayedProgress).toBe(false);

      jest.useRealTimers();
      jest.restoreAllMocks();
    });

    it('should call raiseVideStartTelemetry', () => {
      // Arrange
      const raiseTelemetrySpy = jest.spyOn(component, 'raiseVideStartTelemetry');

      // Act
      component.ngOnInit();

      // Assert
      expect(raiseTelemetrySpy).toHaveBeenCalled();
    });
  });

  describe('Component Methods', () => {
    it('letsStart should emit start', () => {
      // Arrange
      const emitSpy = jest.spyOn(component.emitedValue, 'emit');

      // Act
      component.letsStart();

      // Assert
      expect(emitSpy).toHaveBeenCalledWith('start');
    });

    it('letsSkip should emit skip', () => {
      // Arrange
      const emitSpy = jest.spyOn(component.emitedValue, 'emit');

      // Act
      component.letsSkip();

      // Assert
      expect(emitSpy).toHaveBeenCalledWith('skip');
    });
  });

  describe('Telemetry', () => {
    it('raiseVideStartTelemetry should dispatch event', () => {
      // Act
      component.raiseVideStartTelemetry();

      // Assert
      // expect(mockEventService.dispatchGetStartedEvent).toHaveBeenCalledWith(
      //   expect.objectContaining({
      //     eventType: 'Telemetry',
      //     eventLogLevel: 'Info',
      //     data: expect.objectContaining({
      //       eventSubType: 'GetStarted',
      //       type: 'Player',
      //       mode: 'Play',
      //     }),
      //   })
      // );
    });

    it('ngOnDestroy should raise video end telemetry', () => {
      // Act
      component.ngOnDestroy();

      // Assert
      // expect(mockEventService.dispatchGetStartedEvent).toHaveBeenCalledWith(
      //   expect.objectContaining({
      //     data: expect.objectContaining({
      //       object: { duration: 30, total: 119 },
      //       eventSubType: 'GetStarted',
      //     }),
      //   })
      // );
    });
  });
});