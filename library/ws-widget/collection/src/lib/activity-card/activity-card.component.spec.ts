
import { ConfigurationsService } from '@sunbird-cb/utils-v2';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivityCardComponent } from './activity-card.component';

describe('ActivityCardComponent', () => {
    let component: ActivityCardComponent;

    const configSvc :Partial<ConfigurationsService> ={};
	const router :Partial<Router> ={};
	const snackBar :Partial<MatSnackBar> ={};

    beforeAll(() => {
        component = new ActivityCardComponent(
            configSvc as ConfigurationsService,
			router as Router,
			snackBar as MatSnackBar
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