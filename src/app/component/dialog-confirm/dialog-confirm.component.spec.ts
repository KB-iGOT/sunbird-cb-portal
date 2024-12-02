
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { DialogConfirmComponent } from './dialog-confirm.component';

describe('DialogConfirmComponent', () => {
    let component: DialogConfirmComponent;

    const data :any ={};
	const dialogRef :Partial<MatDialogRef<DialogConfirmComponent>> ={};
	const translate :Partial<TranslateService> ={};

    beforeAll(() => {
        component = new DialogConfirmComponent(
            data as any,
			dialogRef as MatDialogRef<DialogConfirmComponent>,
			translate as TranslateService
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