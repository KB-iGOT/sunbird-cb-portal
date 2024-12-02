import { AuthInitService } from "./init.service";


describe('AuthInitService', () => {
    let component: AuthInitService;

    

    beforeAll(() => {
        component = new AuthInitService(
            
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