import { UrlService } from './url.service';

describe('UrlService', () => {
  let service: UrlService;

  beforeEach(() => {
    // Create a new instance of the service for each test
    service = new UrlService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have an empty string as the initial value for previousUrl$', (done) => {
    service.previousUrl$.subscribe(url => {
      expect(url).toBe('');
      done();
    });
  });

  it('should update previousUrl$ when setPreviousUrl is called', (done) => {
    const testUrl = '/test-url';
    
    // First, set the new URL
    service.setPreviousUrl(testUrl);
    
    // Then, subscribe to the observable and check if it emits the correct value
    service.previousUrl$.subscribe(url => {
      expect(url).toBe(testUrl);
      done();
    });
  });

  it('should emit multiple values when setPreviousUrl is called multiple times', (done) => {
    const urls = ['/first-url', '/second-url', '/third-url'];
    const receivedUrls: string[] = [];
    
    // Subscribe to the observable
    const subscription = service.previousUrl$.subscribe(url => {
      receivedUrls.push(url);
      
      // Check if we've received all expected URLs
      if (receivedUrls.length === urls.length + 1) { // +1 for the initial empty string
        expect(receivedUrls).toEqual(['', ...urls]);
        subscription.unsubscribe();
        done();
      }
    });
    
    // Set the URLs one by one
    urls.forEach(url => service.setPreviousUrl(url));
  });
});