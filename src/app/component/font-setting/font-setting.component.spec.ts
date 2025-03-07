import { FontSettingComponent } from './font-setting.component';
import { BtnSettingsService } from '@sunbird-cb/collection';

// Mock the BtnSettingsService
jest.mock('@sunbird-cb/collection', () => ({
  BtnSettingsService: jest.fn().mockImplementation(() => ({
    changeFont: jest.fn()
  }))
}));

describe('FontSettingComponent', () => {
  let component: FontSettingComponent;
  let btnSettingsSvcMock: BtnSettingsService;
  let localStorageMock: any;

  beforeEach(() => {
    // Initialize the mock service
    btnSettingsSvcMock = new BtnSettingsService(null as any, null as any, null as any, );

    // Mocking the localStorage object
    localStorageMock = {
      getItem: jest.fn(),
      setItem: jest.fn(),
    };

    // Mocking global localStorage to use the localStorageMock
    // global.localStorage = localStorageMock;

    // Create the component instance
    component = new FontSettingComponent(btnSettingsSvcMock);
  });

  describe('ngOnInit', () => {
    it('should set fontValue to 14 when localStorage returns "normal-typography"', () => {
      // Arrange
      localStorageMock.getItem.mockReturnValue('normal-typography');

      // Act
      component.ngOnInit();

      // Assert
      expect(component.fontValue).toBe(14);
    });

    it('should set fontValue to 10 when localStorage returns "x-small-typography"', () => {
      // Arrange
      localStorageMock.getItem.mockReturnValue('x-small-typography');

      // Act
      component.ngOnInit();

      // Assert
      expect(component.fontValue).toBe(10);
    });

    it('should set fontValue to 12 when localStorage returns "small-typography"', () => {
      // Arrange
      localStorageMock.getItem.mockReturnValue('small-typography');

      // Act
      component.ngOnInit();

      // Assert
      expect(component.fontValue).toBe(12);
    });

    it('should set fontValue to 16 when localStorage returns "large-typography"', () => {
      // Arrange
      localStorageMock.getItem.mockReturnValue('large-typography');

      // Act
      component.ngOnInit();

      // Assert
      expect(component.fontValue).toBe(16);
    });

    it('should set fontValue to 18 when localStorage returns "x-large-typography"', () => {
      // Arrange
      localStorageMock.getItem.mockReturnValue('x-large-typography');

      // Act
      component.ngOnInit();

      // Assert
      expect(component.fontValue).toBe(18);
    });

    it('should set fontValue to 14 when localStorage returns null', () => {
      // Arrange
      localStorageMock.getItem.mockReturnValue(null);

      // Act
      component.ngOnInit();

      // Assert
      expect(component.fontValue).toBe(14);
    });
  });

  describe('changeFont', () => {
    it('should change font and set localStorage for font size 10', () => {
      // Arrange
      const fontSize = { value: 10 };

      // Act
      component.changeFont(fontSize);

      // Assert
      expect(localStorageMock.setItem).toHaveBeenCalledWith('setting', 'x-small-typography');
      expect(btnSettingsSvcMock.changeFont).toHaveBeenCalledWith('x-small-typography');
    });

    it('should change font and set localStorage for font size 12', () => {
      // Arrange
      const fontSize = { value: 12 };

      // Act
      component.changeFont(fontSize);

      // Assert
      expect(localStorageMock.setItem).toHaveBeenCalledWith('setting', 'small-typography');
      expect(btnSettingsSvcMock.changeFont).toHaveBeenCalledWith('small-typography');
    });

    it('should change font and set localStorage for font size 14', () => {
      // Arrange
      const fontSize = { value: 14 };

      // Act
      component.changeFont(fontSize);

      // Assert
      expect(localStorageMock.setItem).toHaveBeenCalledWith('setting', 'normal-typography');
      expect(btnSettingsSvcMock.changeFont).toHaveBeenCalledWith('normal-typography');
    });

    it('should change font and set localStorage for font size 16', () => {
      // Arrange
      const fontSize = { value: 16 };

      // Act
      component.changeFont(fontSize);

      // Assert
      expect(localStorageMock.setItem).toHaveBeenCalledWith('setting', 'large-typography');
      expect(btnSettingsSvcMock.changeFont).toHaveBeenCalledWith('large-typography');
    });

    it('should change font and set localStorage for font size 18', () => {
      // Arrange
      const fontSize = { value: 18 };

      // Act
      component.changeFont(fontSize);

      // Assert
      expect(localStorageMock.setItem).toHaveBeenCalledWith('setting', 'x-large-typography');
      expect(btnSettingsSvcMock.changeFont).toHaveBeenCalledWith('x-large-typography');
    });
  });
});
