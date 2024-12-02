import { LoginRootService } from "./login-root.service";


describe('LoginRootService', () => {
    let component: LoginRootService;

    

    beforeAll(() => {
        component = new LoginRootService(
            
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