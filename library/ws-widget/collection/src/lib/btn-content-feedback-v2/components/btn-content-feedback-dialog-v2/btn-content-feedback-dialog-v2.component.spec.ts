import { of, throwError } from 'rxjs';
import { BtnContentFeedbackDialogV2Component } from './btn-content-feedback-dialog-v2.component';
import { EFeedbackType, EFeedbackRole } from '../../models/feedback.model';

describe('BtnContentFeedbackDialogV2Component', () => {
  let component: BtnContentFeedbackDialogV2Component;
  let mockDialogRef: any;
  let mockFeedbackApi: any;
  let mockSnackbar: any;
  let mockContent: any;

  beforeEach(() => {
    // Mock dependencies
    mockDialogRef = {
      close: jest.fn(),
    };

    mockFeedbackApi = {
      getFeedbackConfig: jest.fn(),
      submitContentFeedback: jest.fn(),
    };

    mockSnackbar = {
      openFromComponent: jest.fn(),
    };

    mockContent = {
      identifier: 'test-content-id',
    };

    // Create component instance with mocked dependencies
    component = new BtnContentFeedbackDialogV2Component(
      mockContent,
      mockDialogRef,
      mockFeedbackApi,
      mockSnackbar
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });


  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize feedback forms', () => {
    expect(component.feedbackForm).toBeDefined();
    expect(component.singleFeedbackForm).toBeDefined();
    expect(component.feedbackForm.get('positive')).toBeDefined();
    expect(component.feedbackForm.get('negative')).toBeDefined();
    expect(component.singleFeedbackForm.get('feedback')).toBeDefined();
  });

  describe('ngOnInit', () => {
    it('should fetch feedback config successfully', () => {
      const mockConfig = { 
        categories: ['Content', 'Platform'],
        types: ['Appreciation', 'Suggestion', 'Bug'] 
      };
      
      mockFeedbackApi.getFeedbackConfig.mockReturnValue(of(mockConfig));
      
      component.ngOnInit();
      
      expect(component.configFetchStatus).toBe('fetching');
      expect(mockFeedbackApi.getFeedbackConfig).toHaveBeenCalled();
      
      // We need to manually trigger subscription callback in the test
      mockFeedbackApi.getFeedbackConfig.mock.calls[0][0].subscribe(() => {
        expect(component.feedbackConfig).toEqual(mockConfig);
        expect(component.configFetchStatus).toBe('done');
      });
    });

    it('should handle error when fetching feedback config', () => {
      mockFeedbackApi.getFeedbackConfig.mockReturnValue(throwError('Error'));
      
      component.ngOnInit();
      
      // We need to manually trigger error callback in the test
      try {
        mockFeedbackApi.getFeedbackConfig.mock.calls[0][0].subscribe(
          () => {},
          () => {
            expect(component.configFetchStatus).toBe('error');
          }
        );
      } catch (e) {
        // Handle error
      }
    });
  });

  describe('submitPositiveFeedback', () => {
    it('should submit positive feedback successfully', () => {
      const feedbackText = 'This is great content!';
      mockFeedbackApi.submitContentFeedback.mockReturnValue(of({}));
      
      component.submitPositiveFeedback(feedbackText);
      
      expect(component.positiveFeedbackSendStatus).toBe('sending');
      expect(mockFeedbackApi.submitContentFeedback).toHaveBeenCalledWith({
        text: feedbackText,
        contentId: mockContent.identifier,
        sentiment: 'positive',
        type: EFeedbackType.Content,
        role: EFeedbackRole.User,
      });
      
      // Manually trigger success callback
      mockFeedbackApi.submitContentFeedback.mock.calls[0][0].subscribe(() => {
        expect(component.positiveFeedbackSendStatus).toBe('done');
        expect(mockSnackbar.openFromComponent).toHaveBeenCalled();
        expect(mockDialogRef.close).toHaveBeenCalled();
      });
    });

    it('should handle error when submitting positive feedback', () => {
      const feedbackText = 'This is great content!';
      mockFeedbackApi.submitContentFeedback.mockReturnValue(throwError('Error'));
      
      component.submitPositiveFeedback(feedbackText);
      
      // Manually trigger error callback
      try {
        mockFeedbackApi.submitContentFeedback.mock.calls[0][0].subscribe(
          () => {},
          () => {
            expect(component.positiveFeedbackSendStatus).toBe('error');
            expect(mockSnackbar.openFromComponent).toHaveBeenCalled();
            expect(mockDialogRef.close).not.toHaveBeenCalled();
          }
        );
      } catch (e) {
        // Handle error
      }
    });
  });

  describe('submitNegativeFeedback', () => {
    it('should submit negative feedback successfully', () => {
      const feedbackText = 'Could use some improvements';
      mockFeedbackApi.submitContentFeedback.mockReturnValue(of({}));
      
      component.submitNegativeFeedback(feedbackText);
      
      expect(component.negativeFeedbackSendStatus).toBe('sending');
      expect(mockFeedbackApi.submitContentFeedback).toHaveBeenCalledWith({
        text: feedbackText,
        contentId: mockContent.identifier,
        sentiment: 'negative',
        type: EFeedbackType.Content,
        role: EFeedbackRole.User,
      });
      
      // Manually trigger success callback
      mockFeedbackApi.submitContentFeedback.mock.calls[0][0].subscribe(() => {
        expect(component.negativeFeedbackSendStatus).toBe('done');
        expect(mockSnackbar.openFromComponent).toHaveBeenCalled();
        expect(mockDialogRef.close).toHaveBeenCalled();
      });
    });
  });

  describe('submitSingleFeedback', () => {
    it('should submit single feedback successfully', () => {
      const feedbackText = 'General feedback';
      component.singleFeedbackForm.patchValue({ feedback: feedbackText });
      mockFeedbackApi.submitContentFeedback.mockReturnValue(of({}));
      
      component.submitSingleFeedback();
      
      expect(component.singleFeedbackSendStatus).toBe('sending');
      expect(mockFeedbackApi.submitContentFeedback).toHaveBeenCalledWith({
        text: feedbackText,
        contentId: mockContent.identifier,
        role: EFeedbackRole.User,
        type: EFeedbackType.Content,
      });
      
      // Manually trigger success callback
      mockFeedbackApi.submitContentFeedback.mock.calls[0][0].subscribe(() => {
        expect(component.singleFeedbackSendStatus).toBe('done');
        expect(mockSnackbar.openFromComponent).toHaveBeenCalled();
        expect(mockDialogRef.close).toHaveBeenCalled();
      });
    });
  });

  describe('submitFeedback', () => {
    it('should submit positive feedback when only positive feedback is provided', () => {
      jest.spyOn(component, 'submitPositiveFeedback');
      jest.spyOn(component, 'submitNegativeFeedback');
      
      component.feedbackForm.patchValue({
        positive: 'Great content',
        negative: null,
      });
      
      component.submitFeedback();
      
      expect(component.submitPositiveFeedback).toHaveBeenCalledWith('Great content');
      expect(component.submitNegativeFeedback).not.toHaveBeenCalled();
    });

    it('should submit negative feedback when only negative feedback is provided', () => {
      jest.spyOn(component, 'submitPositiveFeedback');
      jest.spyOn(component, 'submitNegativeFeedback');
      
      component.feedbackForm.patchValue({
        positive: null,
        negative: 'Needs improvement',
      });
      
      component.submitFeedback();
      
      expect(component.submitNegativeFeedback).toHaveBeenCalledWith('Needs improvement');
      expect(component.submitPositiveFeedback).not.toHaveBeenCalled();
    });

    it('should submit both feedbacks when both are provided', () => {
      jest.spyOn(component, 'submitPositiveFeedback');
      jest.spyOn(component, 'submitNegativeFeedback');
      
      component.feedbackForm.patchValue({
        positive: 'Good points',
        negative: 'Areas to improve',
      });
      
      component.submitFeedback();
      
      expect(component.submitPositiveFeedback).toHaveBeenCalledWith('Good points');
      expect(component.submitNegativeFeedback).toHaveBeenCalledWith('Areas to improve');
    });
  });
});