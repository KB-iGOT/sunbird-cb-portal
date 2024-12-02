import { HomeContainerComponent } from "./home-container.component";


describe('HomeContainerComponent', () => {
    let component: HomeContainerComponent;

    

    beforeAll(() => {
        component = new HomeContainerComponent(
            
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