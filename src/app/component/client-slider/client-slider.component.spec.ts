
import { TranslateService } from '@ngx-translate/core';
import { ClientSliderComponent } from './client-slider.component';

describe('ClientSliderComponent', () => {
    let component: ClientSliderComponent;

    const translate :Partial<TranslateService> ={};

    beforeAll(() => {
        component = new ClientSliderComponent(
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