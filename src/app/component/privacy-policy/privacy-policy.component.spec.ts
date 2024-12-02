
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { PrivacyPolicyComponent } from './privacy-policy.component';

describe('PrivacyPolicyComponent', () => {
    let component: PrivacyPolicyComponent;

    const translate :Partial<TranslateService> ={};
	const activatedRoute :Partial<ActivatedRoute> ={};

    beforeAll(() => {
        component = new PrivacyPolicyComponent(
            translate as TranslateService,
			activatedRoute as ActivatedRoute
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