import { CbpSideBarComponent } from "./cbp-side-bar.component";

describe('CbpSideBarComponent', () => {
    let component: CbpSideBarComponent;

    

    beforeAll(() => {
        component = new CbpSideBarComponent(
            
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