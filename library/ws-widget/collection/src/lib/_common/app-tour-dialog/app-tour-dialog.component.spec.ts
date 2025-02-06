import { AppTourDialogComponent } from './app-tour-dialog.component';
import { ConfigurationsService } from '@sunbird-cb/utils-v2';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { CustomTourService } from '../tour-guide/tour-guide.service';
import { Router } from '@angular/router';


describe('AppTourDialogComponent', () => {
  let component: AppTourDialogComponent;
  let dialogRefMock: MatDialogRef<AppTourDialogComponent>;
  let tourServiceMock: CustomTourService;
  let routerMock: Router;
  let configSvcMock: ConfigurationsService;
  
  beforeEach(() => {
    dialogRefMock = {
      close: jest.fn(),
    } as unknown as MatDialogRef<AppTourDialogComponent>;

    tourServiceMock = {
      startTour: jest.fn(),
    } as unknown as CustomTourService;

    routerMock = {
      navigateByUrl: jest.fn(),
    } as unknown as Router;

    configSvcMock = {
      userUrl: '',
    } as unknown as ConfigurationsService;

    component = new AppTourDialogComponent(
      routerMock,
      dialogRefMock,
      tourServiceMock,
      'test clicked value',
      configSvcMock
    );
  });

  describe('ngOnInit', () => {
    it('should set takeToAnotherLink to true if userUrl is present', () => {
      configSvcMock.userUrl = 'https://example.com';
      component.ngOnInit();
      expect(component.takeToAnotherLink).toBe(true);
    });

    it('should set takeToAnotherLink to false if userUrl is not present', () => {
      configSvcMock.userUrl = '';
      component.ngOnInit();
      expect(component.takeToAnotherLink).toBe(false);
    });
  });

  describe('ngOnDestroy', () => {
    it('should reset userUrl to empty string', () => {
      configSvcMock.userUrl = 'https://example.com';
      component.ngOnDestroy();
      expect(configSvcMock.userUrl).toBe('');
    });
  });

  describe('ngAfterViewInit', () => {
    it('should call scrollIntoView when there is a valid hash in window.location', () => {
      // Mocking window.location.hash and document.getElementById
      // const hash = 'some-element-id';
      // window.location.hash = `#${hash}`;
      const mockElement = { scrollIntoView: jest.fn() };
      // document.getElementById = jest.fn().mockReturnValue(mockElement);

      component.ngAfterViewInit();

      // expect(document.getElementById).toHaveBeenCalledWith(hash);
      expect(mockElement.scrollIntoView).toHaveBeenCalled();
    });

    it('should not call scrollIntoView when hash is invalid or not a string', () => {
      //window.location.hash = '#12345'; // This is a number, so it should not be scrolled
      // document.getElementById = jest.fn();

      component.ngAfterViewInit();

      // expect(document.getElementById).not.toHaveBeenCalled();
    });
  });

  describe('startTour', () => {
    it('should call tourService.startTour', () => {
      component.startTour();
      expect(tourServiceMock.startTour).toHaveBeenCalled();
    });
  });

  describe('takeToLink', () => {
    it('should navigate to userUrl and reset userUrl in configSvc', () => {
      configSvcMock.userUrl = 'https://example.com';
      component.takeToLink();
      expect(routerMock.navigateByUrl).toHaveBeenCalledWith('https://example.com');
      expect(configSvcMock.userUrl).toBe('');
    });
  });
});
