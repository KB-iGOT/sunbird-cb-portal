

import { ConfigurationsService } from '@sunbird-cb/utils-v2';
import { ContentAuthoredComponent } from './content-authored.component';


describe('ContentAuthoredComponent', () => {
    let component: ContentAuthoredComponent;

    const configSvc :Partial<ConfigurationsService> ={};

    beforeAll(() => {
        component = new ContentAuthoredComponent(
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