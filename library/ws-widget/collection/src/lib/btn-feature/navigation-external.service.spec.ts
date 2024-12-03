
import { Router } from '@angular/router';
import { NavigationExternalService } from './navigation-external.service';

describe('NavigationExternalService', () => {
    let component: NavigationExternalService;

    const router :Partial<Router> ={};

    beforeAll(() => {
        component = new NavigationExternalService(
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