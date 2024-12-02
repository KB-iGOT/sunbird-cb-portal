
import { HomePageService } from '../../services/home-page.service';
import { TranslateService } from '@ngx-translate/core';
import { DownloadAppComponent } from './download-app.component';

describe('DownloadAppComponent', () => {
    let component: DownloadAppComponent;

    const homePageService :Partial<HomePageService> ={};
	const translate :Partial<TranslateService> ={};

    beforeAll(() => {
        component = new DownloadAppComponent(
            homePageService as HomePageService,
			translate as TranslateService
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