
import { AppCbpPlansService } from 'src/app/services/app-cbp-plans.service';
import { MultilingualTranslationsService } from '@sunbird-cb/utils-v2';
import { TranslateService } from '@ngx-translate/core';
import { FilterComponent } from './filter.component';
import { of } from 'rxjs';

describe('FilterComponent', () => {
    let component: FilterComponent;

    const appCbpPlansService :Partial<AppCbpPlansService> ={};
	const translate :Partial<TranslateService> ={};
	const langtranslations :Partial<MultilingualTranslationsService> ={
        languageSelectedObservable: of()
    };

    beforeAll(() => {
        component = new FilterComponent(
            appCbpPlansService as AppCbpPlansService,
			translate as TranslateService,
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