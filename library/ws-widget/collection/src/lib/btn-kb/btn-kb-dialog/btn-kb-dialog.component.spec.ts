
import { ConfigurationsService } from '@sunbird-cb/utils-v2';
import { BtnKbService } from '../btn-kb.service';
import { Router } from '@angular/router';
import { MatDialog,MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BtnKbDialogComponent } from './btn-kb-dialog.component';

describe('BtnKbDialogComponent', () => {
    let component: BtnKbDialogComponent;

    const matDialog :Partial<MatDialog> ={};
	const dialog :Partial<MatDialogRef<BtnKbDialogComponent>> ={};
	const snackbar :Partial<MatSnackBar> ={};
	const configSvc :Partial<ConfigurationsService> ={};
	const kbSvc :Partial<BtnKbService> ={};
	const router :Partial<Router> ={};
	const data :any ={};

    beforeAll(() => {
        component = new BtnKbDialogComponent(
            matDialog as MatDialog,
			dialog as MatDialogRef<BtnKbDialogComponent>,
			snackbar as MatSnackBar,
			configSvc as ConfigurationsService,
			kbSvc as BtnKbService,
			router as Router,
			data as undefined
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