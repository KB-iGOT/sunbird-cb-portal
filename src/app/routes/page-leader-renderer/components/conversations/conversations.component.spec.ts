import { ConversationsComponent } from './conversations.component';

describe('ConversationsComponent', () => {
  let component: ConversationsComponent;

  beforeEach(() => {
    // Create an instance of the component
    component = new ConversationsComponent();
  });

  describe('handleNoContent', () => {
    it('should set errorMessageCode to "NO_DATA" when event is "none"', () => {
      component.handleNoContent('none');
      expect(component.errorMessageCode).toBe('NO_DATA');
    });

    it('should set errorMessageCode to "API_FAILURE" when event is "error"', () => {
      component.handleNoContent('error');
      expect(component.errorMessageCode).toBe('API_FAILURE');
    });

    it('should set errorMessageCode to "" when event is anything else', () => {
      component.handleNoContent('other');
      expect(component.errorMessageCode).toBe('');
    });

    it('should set errorMessageCode to "" when event is undefined or null', () => {
      component.handleNoContent(undefined);
      expect(component.errorMessageCode).toBe('');

      component.handleNoContent(null);
      expect(component.errorMessageCode).toBe('');
    });
  });
});
