import { DiscussionInfoComponent } from "./discussion-info.component";


describe('DiscussionInfoComponent', () => {
    let component: DiscussionInfoComponent;

    

    beforeAll(() => {
        component = new DiscussionInfoComponent(
            
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