
import { DomSanitizer } from '@angular/platform-browser';
import { ConfigurationsService } from '@sunbird-cb/utils-v2';
import { AppPublicNavBarComponent } from './app-public-nav-bar.component';

describe('AppPublicNavBarComponent', () => {
    let component: AppPublicNavBarComponent;

    const domSanitizer :Partial<DomSanitizer> ={};
	const configSvc :Partial<ConfigurationsService> ={};

    beforeAll(() => {
        component = new AppPublicNavBarComponent(
            domSanitizer as DomSanitizer,
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