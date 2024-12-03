
import { HttpClient } from '@angular/common/http';
import { FeedbackService } from './feedback.service';

describe('FeedbackService', () => {
    let component: FeedbackService;

    const http :Partial<HttpClient> ={};

    beforeAll(() => {
        component = new FeedbackService(
            http as HttpClient
        )
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });
            
    it('should create a instance of component', () => {
        expect(component).toBeTruthy();
    });
});