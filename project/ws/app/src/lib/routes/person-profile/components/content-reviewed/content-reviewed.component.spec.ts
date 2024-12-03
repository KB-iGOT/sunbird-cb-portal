
import { ConfigurationsService } from '@sunbird-cb/utils-v2';
import { ContentReviewedComponent } from './content-reviewed.component';

describe('ContentReviewedComponent', () => {
    let component: ContentReviewedComponent;

    const configSvc :Partial<ConfigurationsService> ={};

    beforeAll(() => {
        component = new ContentReviewedComponent(
            configSvc as ConfigurationsService
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