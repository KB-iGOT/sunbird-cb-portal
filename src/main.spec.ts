import { enableProdMode } from '@angular/core'
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'
import { environment } from './environments/environment'
import { AppModule } from './app/app.module'

jest.mock('@angular/core', () => ({
  enableProdMode: jest.fn(),
}));

jest.mock('@angular/platform-browser-dynamic', () => ({
  platformBrowserDynamic: jest.fn().mockReturnValue({
    bootstrapModule: jest.fn().mockResolvedValue(true),
  }),
}));

describe('Angular Main Entry File', () => {
  beforeEach(() => {
    // Reset mocks before each test to ensure they don't affect other tests
    // enableProdMode.mockClear();
    // platformBrowserDynamic().bootstrapModule.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.resetAllMocks();
  });
  
  it('should enable production mode when environment.production is true', () => {
    // Arrange
    environment.production = true;

    // Act
    // The file code is executed here in the test
    require('./main');

    // Assert
    expect(enableProdMode).toHaveBeenCalled();
  });

  it('should not enable production mode when environment.production is false', () => {
    // Arrange
    environment.production = false;

    // Act
    require('./main');

    // Assert
    expect(enableProdMode).not.toHaveBeenCalled();
  });

  it('should bootstrap the AppModule when not in IE', () => {
    // Arrange
    environment.production = false;
    // Mock navigator.userAgent for a non-IE browser (e.g., Chrome)
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
      writable: true,
    });

    // Act
    require('./main');

    // Assert
    expect(platformBrowserDynamic().bootstrapModule).toHaveBeenCalledWith(AppModule);
  });

  it('should display error message when in IE11 or less', () => {
    // Arrange
    environment.production = false;
    // Mock IE11 user agent
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Trident/7.0; ASL 5.0; ASL) like Gecko',
      writable: true,
    });

    // Mock document.body.innerHTML to track changes
    document.body.innerHTML = '';

    // Act
    require('./main');

    // Assert
    expect(document.body.innerHTML).toContain('IE 11 and lesser version browsers are not supported.');
  });

  it('should not display error message for non-IE browsers', () => {
    // Arrange
    environment.production = false;
    // Mock non-IE user agent (Chrome)
    Object.defineProperty(navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
      writable: true,
    });

    // Mock document.body.innerHTML to track changes
    document.body.innerHTML = '';

    // Act
    require('./main');

    // Assert
    expect(document.body.innerHTML).not.toContain('IE 11 and lesser version browsers are not supported.');
  });
});
