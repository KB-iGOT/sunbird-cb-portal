
import { HttpClient } from '@angular/common/http';
import { NotificationApiService } from './notification-api.service';

describe('NotificationApiService', () => {
    let component: NotificationApiService;

    const http :Partial<HttpClient> ={};

    beforeAll(() => {
        component = new NotificationApiService(
            http as HttpClient
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