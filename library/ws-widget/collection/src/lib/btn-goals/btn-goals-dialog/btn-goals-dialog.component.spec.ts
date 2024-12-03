
import { MatDialogRef } from '@angular/material/dialog';
import { BtnGoalsDialogComponent } from './btn-goals-dialog.component';

describe('BtnGoalsDialogComponent', () => {
    let component: BtnGoalsDialogComponent;

    const dialogRef :Partial<MatDialogRef<BtnGoalsDialogComponent>> ={};
	const data :any ={};

    beforeAll(() => {
        component = new BtnGoalsDialogComponent(
            dialogRef as MatDialogRef<BtnGoalsDialogComponent>,
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