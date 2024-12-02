
import { LoggerService } from '@sunbird-cb/utils-v2';
import { LoaderService } from './loader.service';
import { AuthoringErrorHandler } from './error-handler.service';

describe('AuthoringErrorHandler', () => {
    let component: AuthoringErrorHandler;

    const loaderService :Partial<LoaderService> ={};
	const loggerService :Partial<LoggerService> ={};

    beforeAll(() => {
        component = new AuthoringErrorHandler(
            loaderService as LoaderService,
			loggerService as LoggerService
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