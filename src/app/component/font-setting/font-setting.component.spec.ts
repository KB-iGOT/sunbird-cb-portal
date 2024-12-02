
import { BtnSettingsService } from '@sunbird-cb/collection';
import { FontSettingComponent } from './font-setting.component';

describe('FontSettingComponent', () => {
    let component: FontSettingComponent;

    const btnSettingsSvc :Partial<BtnSettingsService> ={};

    beforeAll(() => {
        component = new FontSettingComponent(
            btnSettingsSvc as BtnSettingsService
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