import { NoDataComponent } from "./no-data.component";


describe('NoDataComponent', () => {
    let component: NoDataComponent;

    

    beforeAll(() => {
        component = new NoDataComponent(
            
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