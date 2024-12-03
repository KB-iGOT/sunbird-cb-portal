import { FollowingListComponent } from "./following-list.component";


describe('FollowingListComponent', () => {
    let component: FollowingListComponent;

    

    beforeAll(() => {
        component = new FollowingListComponent(
            
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