
import { AuthKeycloakService } from '@sunbird-cb/utils-v2';
import { NavigationExternalService } from './navigation-external.service';
import { MobileAppsService } from './mobile-apps.service';

describe('MobileAppsService', () => {
    let component: MobileAppsService;

    const authSvc :Partial<AuthKeycloakService> ={};
	const navigateSvc :Partial<NavigationExternalService> ={};

    beforeAll(() => {
        component = new MobileAppsService(
            authSvc as AuthKeycloakService,
			navigateSvc as NavigationExternalService
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