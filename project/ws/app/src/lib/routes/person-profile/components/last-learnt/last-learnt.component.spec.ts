
import { PersonProfileService } from '../../services/person-profile.service';
import { LastLearntComponent } from './last-learnt.component';

describe('LastLearntComponent', () => {
    let component: LastLearntComponent;

    const profileSvc :Partial<PersonProfileService> ={};

    beforeAll(() => {
        component = new LastLearntComponent(
            profileSvc as PersonProfileService
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