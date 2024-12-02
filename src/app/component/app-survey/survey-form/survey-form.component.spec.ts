
import { ActivatedRoute } from '@angular/router';
import { ConfigurationsService } from '@sunbird-cb/utils-v2';
import { SurveyFormComponent } from './survey-form.component';

describe('SurveyFormComponent', () => {
    let component: SurveyFormComponent;

    const activatedRoute :Partial<ActivatedRoute> ={};
	const configSvc :Partial<ConfigurationsService> ={};

    beforeAll(() => {
        component = new SurveyFormComponent(
            activatedRoute as ActivatedRoute,
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