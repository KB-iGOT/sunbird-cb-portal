
import { MatDialog } from '@angular/material/dialog';
import { ConfigurationsService } from '@sunbird-cb/utils-v2';
import { BtnKbComponent } from './btn-kb.component';

describe('BtnKbComponent', () => {
    let component: BtnKbComponent;

    const dialog :Partial<MatDialog> ={};
	const configSvc :Partial<ConfigurationsService> ={};

    beforeAll(() => {
        component = new BtnKbComponent(
            dialog as MatDialog,
			configSvc as ConfigurationsService
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