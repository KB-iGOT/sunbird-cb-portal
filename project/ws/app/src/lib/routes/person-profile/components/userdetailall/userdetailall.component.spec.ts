
import { MatDialogRef } from '@angular/material/dialog';
import { UserdetailallComponent } from './userdetailall.component';

describe('UserdetailallComponent', () => {
    let component: UserdetailallComponent;

    const dialogRef :Partial<MatDialogRef<UserdetailallComponent>> ={};
	const data :any ={};

    beforeAll(() => {
        component = new UserdetailallComponent(
            dialogRef as MatDialogRef<UserdetailallComponent>,
			data as any
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