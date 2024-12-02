import { LoaderService } from "./loader.service";


describe('LoaderService', () => {
    let component: LoaderService;

    

    beforeAll(() => {
        component = new LoaderService(
            
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