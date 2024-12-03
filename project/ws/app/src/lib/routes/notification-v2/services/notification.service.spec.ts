
import { Router } from '@angular/router';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
    let component: NotificationService;

    const router :Partial<Router> ={};

    beforeAll(() => {
        component = new NotificationService(
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