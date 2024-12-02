
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MultilingualTranslationsService } from '@sunbird-cb/utils-v2';
import { UpcomingTimelineComponent } from './upcoming-timeline.component';
import { of } from 'rxjs';

describe('UpcomingTimelineComponent', () => {
    let component: UpcomingTimelineComponent;

    const activatedRoute :Partial<ActivatedRoute> ={};
	const translate :Partial<TranslateService> ={};
	const langtranslations :Partial<MultilingualTranslationsService> ={
        languageSelectedObservable: of()
    };

    beforeAll(() => {
        component = new UpcomingTimelineComponent(
            activatedRoute as ActivatedRoute,
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