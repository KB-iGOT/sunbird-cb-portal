import { AppIntroComponent } from './app-intro.component';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';
import { RootService } from '../root/root.service';

describe('AppIntroComponent', () => {
  let component: AppIntroComponent;
  let dialogRefMock: jest.Mocked<MatDialogRef<AppIntroComponent>>;
  let rootSvcMock: jest.Mocked<RootService>;

  beforeEach(() => {
    // Mock the dependencies
    dialogRefMock = {
      close: jest.fn(),
    } as unknown as jest.Mocked<MatDialogRef<AppIntroComponent>>;

    rootSvcMock = {
      setCookie: jest.fn(),
    } as unknown as jest.Mocked<RootService>;

    // Create an instance of the component with the mocked dependencies
    component = new AppIntroComponent(dialogRefMock, rootSvcMock);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('confirmed', () => {
    it('should call rootSvc.setCookie when checked is true', () => {
      // Arrange
      component.checked = true;

      // Act
      component.confirmed();

      // Assert
      expect(rootSvcMock.setCookie).toHaveBeenCalledWith('intro', 'false', 365);
      expect(dialogRefMock.close).toHaveBeenCalled();
    });

    it('should not call rootSvc.setCookie when checked is false', () => {
      // Arrange
      component.checked = false;

      // Act
      component.confirmed();

      // Assert
      expect(rootSvcMock.setCookie).not.toHaveBeenCalled();
      expect(dialogRefMock.close).toHaveBeenCalled();
    });
  });
});
