
import { DomSanitizer } from '@angular/platform-browser';
import { ConfigurationsService } from '@sunbird-cb/utils-v2';
import { BtnFacebookShareComponent } from './btn-facebook-share.component';

describe('BtnFacebookShareComponent', () => {
    let component: BtnFacebookShareComponent;

    const sanitizer :Partial<DomSanitizer> ={};
	const configSvc :Partial<ConfigurationsService> ={};

    beforeAll(() => {
        component = new BtnFacebookShareComponent(
            sanitizer as DomSanitizer,
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