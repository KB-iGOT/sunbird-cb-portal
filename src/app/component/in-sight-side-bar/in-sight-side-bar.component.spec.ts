
import { HomePageService } from 'src/app/services/home-page.service';
import { ConfigurationsService,EventService,MultilingualTranslationsService } from '@sunbird-cb/utils-v2';
import { ActivatedRoute,Router } from '@angular/router';
import { DiscussUtilsService } from '@ws/app/src/lib/routes/discuss/services/discuss-utils.service';
import { TranslateService } from '@ngx-translate/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { InsightSideBarComponent } from './in-sight-side-bar.component';
import { of } from 'rxjs';

describe('InsightSideBarComponent', () => {
    let component: InsightSideBarComponent;

    const homePageSvc :Partial<HomePageService> ={};
	const configSvc :Partial<ConfigurationsService> ={};
	const activatedRoute :Partial<ActivatedRoute> ={};
	const discussUtilitySvc :Partial<DiscussUtilsService> ={};
	const translate :Partial<TranslateService> ={};
	const events :Partial<EventService> ={};
	const snackBar :Partial<MatSnackBar> ={};
	const router :Partial<Router> ={};
	const langtranslations :Partial<MultilingualTranslationsService> ={
		languageSelectedObservable: of()
	};

    beforeAll(() => {
        component = new InsightSideBarComponent(
            homePageSvc as HomePageService,
			configSvc as ConfigurationsService,
			activatedRoute as ActivatedRoute,
			discussUtilitySvc as DiscussUtilsService,
			translate as TranslateService,
			events as EventService,
			snackBar as MatSnackBar,
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