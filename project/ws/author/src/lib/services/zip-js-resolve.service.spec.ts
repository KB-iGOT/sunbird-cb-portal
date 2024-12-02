import { ZipJSResolverService } from "./zip-js-resolve.service";


describe('ZipJSResolverService', () => {
    let component: ZipJSResolverService;

    

    beforeAll(() => {
        component = new ZipJSResolverService(
            
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