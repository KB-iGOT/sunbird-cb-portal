
import { HttpClient } from '@angular/common/http';
import { BtnFeatureService } from './btn-feature.service';

describe('BtnFeatureService', () => {
    let component: BtnFeatureService;

    const http :Partial<HttpClient> ={};

    beforeAll(() => {
        component = new BtnFeatureService(
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