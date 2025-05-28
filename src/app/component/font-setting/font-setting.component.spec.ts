import { FontSettingComponent } from './font-setting.component';
import { BtnSettingsService } from '@sunbird-cb/collection';

describe('FontSettingComponent', () => {
  let component: FontSettingComponent;
  let mockBtnSettingsService: jest.Mocked<BtnSettingsService>;

  beforeEach(() => {
    // Mock the BtnSettingsService
    mockBtnSettingsService = {
      changeFont: jest.fn()
    } as any;

    // Create component instance with mocked service
    component = new FontSettingComponent(mockBtnSettingsService);

    // Clear localStorage before each test
    localStorage.clear();
    
    // Clear all mocks
    jest.clearAllMocks();
  });

  afterEach(() => {
    // Clean up localStorage after each test
    localStorage.clear();
  });

  describe('Component Initialization', () => {
    it('should create component with default fontValue', () => {
      expect(component).toBeTruthy();
      expect(component.fontValue).toBe(14);
    });

    it('should have btnSettingsSvc injected', () => {
      expect(component.btnSettingsSvc).toBe(mockBtnSettingsService);
    });
  });

  describe('ngOnInit', () => {
    it('should set fontValue to 14 when no setting in localStorage', () => {
      component.ngOnInit();
      expect(component.fontValue).toBe(14);
    });

    it('should set fontValue to 10 for x-small-typography', () => {
      localStorage.setItem('setting', 'x-small-typography');
      component.ngOnInit();
      expect(component.fontValue).toBe(10);
    });

    it('should set fontValue to 12 for small-typography', () => {
      localStorage.setItem('setting', 'small-typography');
      component.ngOnInit();
      expect(component.fontValue).toBe(12);
    });

    it('should set fontValue to 14 for normal-typography', () => {
      localStorage.setItem('setting', 'normal-typography');
      component.ngOnInit();
      expect(component.fontValue).toBe(14);
    });

    it('should set fontValue to 16 for large-typography', () => {
      localStorage.setItem('setting', 'large-typography');
      component.ngOnInit();
      expect(component.fontValue).toBe(16);
    });

    it('should set fontValue to 18 for x-large-typography', () => {
      localStorage.setItem('setting', 'x-large-typography');
      component.ngOnInit();
      expect(component.fontValue).toBe(18);
    });

    it('should keep default fontValue for unknown setting', () => {
      localStorage.setItem('setting', 'unknown-typography');
      component.ngOnInit();
      expect(component.fontValue).toBe(14);
    });
  });

  describe('changeFont', () => {
    it('should handle fontSize 10 (x-small)', () => {
      const fontSize = { value: 10 };
      
      component.changeFont(fontSize);
      
      expect(localStorage.getItem('setting')).toBe('x-small-typography');
      expect(mockBtnSettingsService.changeFont).toHaveBeenCalledWith('x-small-typography');
      expect(mockBtnSettingsService.changeFont).toHaveBeenCalledTimes(1);
    });

    it('should handle fontSize 12 (small)', () => {
      const fontSize = { value: 12 };
      
      component.changeFont(fontSize);
      
      expect(localStorage.getItem('setting')).toBe('small-typography');
      expect(mockBtnSettingsService.changeFont).toHaveBeenCalledWith('small-typography');
      expect(mockBtnSettingsService.changeFont).toHaveBeenCalledTimes(1);
    });

    it('should handle fontSize 14 (normal)', () => {
      const fontSize = { value: 14 };
      
      component.changeFont(fontSize);
      
      expect(localStorage.getItem('setting')).toBe('normal-typography');
      expect(mockBtnSettingsService.changeFont).toHaveBeenCalledWith('normal-typography');
      expect(mockBtnSettingsService.changeFont).toHaveBeenCalledTimes(1);
    });

    it('should handle fontSize 16 (large)', () => {
      const fontSize = { value: 16 };
      
      component.changeFont(fontSize);
      
      expect(localStorage.getItem('setting')).toBe('large-typography');
      expect(mockBtnSettingsService.changeFont).toHaveBeenCalledWith('large-typography');
      expect(mockBtnSettingsService.changeFont).toHaveBeenCalledTimes(1);
    });

    it('should handle fontSize 18 (x-large)', () => {
      const fontSize = { value: 18 };
      
      component.changeFont(fontSize);
      
      expect(localStorage.getItem('setting')).toBe('x-large-typography');
      expect(mockBtnSettingsService.changeFont).toHaveBeenCalledWith('x-large-typography');
      expect(mockBtnSettingsService.changeFont).toHaveBeenCalledTimes(1);
    });

    it('should not call service or set localStorage for unsupported fontSize', () => {
      const fontSize = { value: 20 };
      
      component.changeFont(fontSize);
      
      expect(localStorage.getItem('setting')).toBeNull();
      expect(mockBtnSettingsService.changeFont).not.toHaveBeenCalled();
    });

    it('should handle null fontSize object gracefully', () => {
      const fontSize = null;
      
      expect(() => component.changeFont(fontSize)).not.toThrow();
      expect(mockBtnSettingsService.changeFont).not.toHaveBeenCalled();
    });

    it('should handle fontSize object without value property', () => {
      const fontSize = {};
      
      component.changeFont(fontSize);
      
      expect(mockBtnSettingsService.changeFont).not.toHaveBeenCalled();
    });
  });

  describe('Integration Tests', () => {
    it('should initialize with saved setting and then change font', () => {
      // Setup initial state
      localStorage.setItem('setting', 'large-typography');
      component.ngOnInit();
      expect(component.fontValue).toBe(16);

      // Change font
      const fontSize = { value: 10 };
      component.changeFont(fontSize);
      
      expect(localStorage.getItem('setting')).toBe('x-small-typography');
      expect(mockBtnSettingsService.changeFont).toHaveBeenCalledWith('x-small-typography');
    });

    it('should handle multiple font changes in sequence', () => {
      // First change
      component.changeFont({ value: 10 });
      expect(localStorage.getItem('setting')).toBe('x-small-typography');
      
      // Second change
      component.changeFont({ value: 18 });
      expect(localStorage.getItem('setting')).toBe('x-large-typography');
      
      // Third change
      component.changeFont({ value: 14 });
      expect(localStorage.getItem('setting')).toBe('normal-typography');
      
      expect(mockBtnSettingsService.changeFont).toHaveBeenCalledTimes(3);
    });
  });

  describe('Edge Cases', () => {
    it('should handle string fontSize values', () => {
      const fontSize = { value: '12' };
      
      component.changeFont(fontSize);
      
      // String '12' should match case 12 due to loose equality
      expect(localStorage.getItem('setting')).toBe('small-typography');
      expect(mockBtnSettingsService.changeFont).toHaveBeenCalledWith('small-typography');
    });

    it('should handle negative fontSize values', () => {
      const fontSize = { value: -10 };
      
      component.changeFont(fontSize);
      
      expect(localStorage.getItem('setting')).toBeNull();
      expect(mockBtnSettingsService.changeFont).not.toHaveBeenCalled();
    });

    it('should handle decimal fontSize values', () => {
      const fontSize = { value: 14.5 };
      
      component.changeFont(fontSize);
      
      expect(localStorage.getItem('setting')).toBeNull();
      expect(mockBtnSettingsService.changeFont).not.toHaveBeenCalled();
    });
  });
});