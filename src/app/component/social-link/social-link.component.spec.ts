import { SocialLinkComponent } from "./social-link.component";


describe('SocialLinkComponent', () => {
    let component: SocialLinkComponent;

    

    beforeAll(() => {
        component = new SocialLinkComponent(
            
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