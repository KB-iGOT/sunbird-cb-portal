import { DialogBoxComponent } from "./dialog-box.component";


describe('DialogBoxComponent', () => {
    let component: DialogBoxComponent;

    

    beforeAll(() => {
        component = new DialogBoxComponent(
            
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