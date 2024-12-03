
import { BtnFollowService,UserAutocompleteService } from '@sunbird-cb/collection';
import { PersonProfileService } from '../../services/person-profile.service';
import { ActivatedRoute,Router } from '@angular/router';
import { ConfigurationsService,ValueService} from '@sunbird-cb/utils-v2';
import { ProfileService } from '../../../profile/services/profile.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { PersonProfileComponent } from './person-profile.component';
import { of } from 'rxjs';

describe('PersonProfileComponent', () => {
    let component: PersonProfileComponent;

    const followSvc :Partial<BtnFollowService> ={};
	const personprofileSvc :Partial<PersonProfileService> ={};
	const fetchUser :Partial<UserAutocompleteService> ={};
	const route :Partial<ActivatedRoute> ={
		queryParams: of({})
	};
	const router :Partial<Router> ={};
	const profileSvc :Partial<ProfileService> ={};
	const configSvc :Partial<ConfigurationsService> ={};
	const valueSvc :Partial<ValueService> ={};
	const matSnackBar :Partial<MatSnackBar> ={};

    beforeAll(() => {
        component = new PersonProfileComponent(
            followSvc as BtnFollowService,
			personprofileSvc as PersonProfileService,
			fetchUser as UserAutocompleteService,
			route as ActivatedRoute,
			router as Router,
			profileSvc as ProfileService,
			configSvc as ConfigurationsService,
			valueSvc as ValueService,
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