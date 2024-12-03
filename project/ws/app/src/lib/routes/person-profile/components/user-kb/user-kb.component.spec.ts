
import { ConfigurationsService} from '@sunbird-cb/utils-v2';
import { PersonProfileService } from '../../services/person-profile.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserKbComponent } from './user-kb.component';

describe('UserKbComponent', () => {
    let component: UserKbComponent;

    const configSvc :Partial<ConfigurationsService> ={};
	const personProfileSvc :Partial<PersonProfileService> ={};
	const dialog :Partial<MatDialog> ={};
	const matSnackBar :Partial<MatSnackBar> ={};

    beforeAll(() => {
        component = new UserKbComponent(
            configSvc as ConfigurationsService,
			personProfileSvc as PersonProfileService,
			dialog as MatDialog,
			matSnackBar as MatSnackBar
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