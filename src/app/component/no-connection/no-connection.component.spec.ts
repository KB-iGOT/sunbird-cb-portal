import { NoConnectionComponent } from "./no-connection.component";


describe('NoConnectionComponent', () => {
    let component: NoConnectionComponent;

    

    beforeAll(() => {
        component = new NoConnectionComponent(
            
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