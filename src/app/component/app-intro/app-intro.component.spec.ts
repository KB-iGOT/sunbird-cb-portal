
import { MatDialogRef } from '@angular/material/dialog';
import { RootService } from '../root/root.service';
import { AppIntroComponent } from './app-intro.component';

describe('AppIntroComponent', () => {
    let component: AppIntroComponent;

    const dialogRef :Partial<MatDialogRef<AppIntroComponent>> ={};
	const rootSvc :Partial<RootService> ={};

    beforeAll(() => {
        component = new AppIntroComponent(
            dialogRef as MatDialogRef<AppIntroComponent>,
			rootSvc as RootService
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