
import { ConfigurationsService,EventService } from '@sunbird-cb/utils-v2';
import { WidgetContentShareService } from '../../_services/widget-content-share.service';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BtnContentShareDialogComponent, IContentShareData } from './btn-content-share-dialog.component';

describe('BtnContentShareDialogComponent', () => {
    let component: BtnContentShareDialogComponent;

    const events :Partial<EventService> ={};
	const snackBar :Partial<MatSnackBar> ={};
	const dialogRef :Partial<MatDialogRef<BtnContentShareDialogComponent>> ={};
	const data :Partial<IContentShareData> ={};
	const shareSvc :Partial<WidgetContentShareService> ={};
	const configSvc :Partial<ConfigurationsService> ={};

    beforeAll(() => {
        component = new BtnContentShareDialogComponent(
            events as EventService,
			snackBar as MatSnackBar,
			dialogRef as MatDialogRef<BtnContentShareDialogComponent>,
			data as IContentShareData,
			shareSvc as WidgetContentShareService,
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