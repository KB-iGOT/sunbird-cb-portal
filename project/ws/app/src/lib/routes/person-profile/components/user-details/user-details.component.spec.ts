
import { ConfigurationsService } from '@sunbird-cb/utils-v2';
import { UserDetailsComponent } from './user-details.component';

describe('UserDetailsComponent', () => {
    let component: UserDetailsComponent;

    const configSvc :Partial<ConfigurationsService> ={};

    beforeAll(() => {
        component = new UserDetailsComponent(
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