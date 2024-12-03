
import { MatSnackBar } from '@angular/material/snack-bar';
import { EventService } from '@sunbird-cb/utils-v2';
import { BtnCallDialogComponent, IWidgetBtnCallDialogData } from './btn-call-dialog.component';

describe('BtnCallDialogComponent', () => {
    let component: BtnCallDialogComponent;

    const snackBar :Partial<MatSnackBar> ={};
	const events :Partial<EventService> ={};
	const data :Partial<IWidgetBtnCallDialogData> ={};

    beforeAll(() => {
        component = new BtnCallDialogComponent(
            snackBar as MatSnackBar,
			events as EventService,
			data as IWidgetBtnCallDialogData
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