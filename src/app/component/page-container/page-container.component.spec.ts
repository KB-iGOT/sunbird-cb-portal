import { PageContainerComponent } from "./page-container.component";


describe('PageContainerComponent', () => {
    let component: PageContainerComponent;

    

    beforeAll(() => {
        component = new PageContainerComponent(
            
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