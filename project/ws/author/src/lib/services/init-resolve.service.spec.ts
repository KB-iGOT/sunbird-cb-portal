
import { ZipJSResolverService } from './zip-js-resolve.service';
import { Router } from '@angular/router';
import { ConfigurationsService } from '@sunbird-cb/utils-v2';
import { ApiService } from '../modules/shared/services/api.service';
import { AccessControlService } from './../modules/shared/services/access-control.service';
import { CKEditorResolverService } from './ckeditor-resolve.service';
import { AuthInitService } from './init.service';
import { InitResolver } from './init-resolve.service';

describe('InitResolver', () => {
    let component: InitResolver;

    const apiService :Partial<ApiService> ={};
	const router :Partial<Router> ={};
	const ckEditorInject :Partial<CKEditorResolverService> ={};
	const configurationsService :Partial<ConfigurationsService> ={};
	const accessService :Partial<AccessControlService> ={};
	const authInitService :Partial<AuthInitService> ={};
	const zipJSInject :Partial<ZipJSResolverService> ={};

    beforeAll(() => {
        component = new InitResolver(
            apiService as ApiService,
			router as Router,
			ckEditorInject as CKEditorResolverService,
			configurationsService as ConfigurationsService,
			accessService as AccessControlService,
			authInitService as AuthInitService,
			zipJSInject as ZipJSResolverService
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