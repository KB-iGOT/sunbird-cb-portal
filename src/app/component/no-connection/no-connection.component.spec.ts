import { NoConnectionComponent } from './no-connection.component';


describe('NoConnectionComponent', () => {
  let component: NoConnectionComponent;
  
  beforeEach(() => {
    // Create the component instance
    component = new NoConnectionComponent();
    
    // Mock navigator.onLine
  //  global.navigator.onLine = true; // simulate online status by default

    // Mock setTimeout for immediate execution
    //jest.spyOn(global, 'setTimeout').mockImplementation((cb: Function) => cb());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should initialize with online status', () => {
    expect(component.isOnline).toBe(true);
    expect(component.display).toBe(true);
  });

  it('should update isOnline to false and set display to true when offline event is fired', () => {
    // Simulate offline event
    const offlineEvent = new Event('offline');
    component.online$.subscribe(() => {
      // Trigger the offline event manually
      window.dispatchEvent(offlineEvent);
      
      expect(component.isOnline).toBe(false);
      expect(component.display).toBe(true);
    });
  });

  it('should update isOnline to true and set display to true when online event is fired', () => {
    // Simulate online event
    const onlineEvent = new Event('online');
    component.online$.subscribe(() => {
      // Trigger the online event manually
      window.dispatchEvent(onlineEvent);
      
      expect(component.isOnline).toBe(true);
      expect(component.display).toBe(true);
    });
  });

  it('should set display to false after 3 seconds of online status', () => {
    // Simulate online event
    const onlineEvent = new Event('online');
    
    // Trigger the online event
    window.dispatchEvent(onlineEvent);
    
    // Check that display is initially true
    expect(component.display).toBe(true);
    
    // After the timeout, the display should be set to false
    setTimeout(() => {
      expect(component.display).toBe(false);
    }, 3000);
  });

  it('should handle the navigator.onLine status change properly', () => {
    // Manually change navigator.onLine value and fire the online event
   // global.navigator.onLine = false;
    component.online$.subscribe(value => {
      expect(value).toBe(false);
    });
    
    // Simulate offline event
    const offlineEvent = new Event('offline');
    window.dispatchEvent(offlineEvent);
  });

});
