import { AppLogoComponent } from "./app-logo.component";



describe('AppLogoComponent', () => {
    let component: AppLogoComponent;

    

    beforeAll(() => {
        component = new AppLogoComponent(
            
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