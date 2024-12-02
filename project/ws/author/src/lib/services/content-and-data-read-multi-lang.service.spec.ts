
import { Router } from '@angular/router';
import { ApiService } from '../modules/shared/services/api.service';
import { ContentAndDataReadMultiLangTOCResolver } from './content-and-data-read-multi-lang.service';

describe('ContentAndDataReadMultiLangTOCResolver', () => {
    let component: ContentAndDataReadMultiLangTOCResolver;

    const apiService :Partial<ApiService> ={};
	const router :Partial<Router> ={};

    beforeAll(() => {
        component = new ContentAndDataReadMultiLangTOCResolver(
            apiService as ApiService,
			router as Router
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