
import { ActivatedRoute } from '@angular/router';
import { InvalidUserComponent } from './invalid-user.component';

describe('InvalidUserComponent', () => {
    let component: InvalidUserComponent;

    const route :Partial<ActivatedRoute> ={};

    beforeAll(() => {
        component = new InvalidUserComponent(
            route as ActivatedRoute
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