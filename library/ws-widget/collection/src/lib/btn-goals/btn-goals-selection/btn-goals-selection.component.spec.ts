
import { EventService } from '@sunbird-cb/utils-v2';
import { BtnGoalsService } from '../btn-goals.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BtnGoalsSelectionComponent } from './btn-goals-selection.component';

describe('BtnGoalsSelectionComponent', () => {
    let component: BtnGoalsSelectionComponent;

    const snackBar :Partial<MatSnackBar> ={};
	const goalsSvc :Partial<BtnGoalsService> ={};
	const eventSvc :Partial<EventService> ={};

    beforeAll(() => {
        component = new BtnGoalsSelectionComponent(
            snackBar as MatSnackBar,
			goalsSvc as BtnGoalsService,
			eventSvc as EventService
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