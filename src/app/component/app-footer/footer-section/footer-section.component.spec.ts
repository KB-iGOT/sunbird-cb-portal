
import { ConfigurationsService,MultilingualTranslationsService } from '@sunbird-cb/utils-v2';
import { Router } from '@angular/router';
import { DiscussUtilsService } from '@ws/app/src/lib/routes/discuss/services/discuss-utils.service';
import { FooterSectionComponent } from './footer-section.component';

describe('FooterSectionComponent', () => {
    let component: FooterSectionComponent;

    const configSvc :Partial<ConfigurationsService> ={};
	const discussUtilitySvc :Partial<DiscussUtilsService> ={};
	const router :Partial<Router> ={};
	const langtranslations :Partial<MultilingualTranslationsService> ={};

    beforeAll(() => {
        component = new FooterSectionComponent(
            configSvc as ConfigurationsService,
			discussUtilitySvc as DiscussUtilsService,
			router as Router,
			langtranslations as MultilingualTranslationsService
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