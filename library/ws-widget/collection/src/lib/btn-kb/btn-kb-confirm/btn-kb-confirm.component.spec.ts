
import { MatDialogRef } from '@angular/material/dialog';
import { BtnKbConfirmComponent } from './btn-kb-confirm.component';

describe('BtnKbConfirmComponent', () => {
    let component: BtnKbConfirmComponent;

    const contentId : any ={};
	const dialogRef :Partial<MatDialogRef<BtnKbConfirmComponent>> ={};

    beforeAll(() => {
        component = new BtnKbConfirmComponent(
            contentId as any,
			dialogRef as MatDialogRef<BtnKbConfirmComponent>
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