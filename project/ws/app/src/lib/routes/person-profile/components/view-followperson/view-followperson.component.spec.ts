
import { BtnFollowService } from '@sunbird-cb/collection';
import { ConfigurationsService } from '@sunbird-cb/utils-v2';
import { PersonProfileService } from '../../services/person-profile.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ViewFollowpersonComponent } from './view-followperson.component';

describe('ViewFollowpersonComponent', () => {
    let component: ViewFollowpersonComponent;

    const followSvc :Partial<BtnFollowService> ={};
	const personprofileSvc :Partial<PersonProfileService> ={};
	const router :Partial<Router> ={};
	const matSnackBar :Partial<MatSnackBar> ={};
	const configSvc :Partial<ConfigurationsService> ={};

    beforeAll(() => {
        component = new ViewFollowpersonComponent(
            followSvc as BtnFollowService,
			personprofileSvc as PersonProfileService,
			router as Router,
			matSnackBar as MatSnackBar,
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