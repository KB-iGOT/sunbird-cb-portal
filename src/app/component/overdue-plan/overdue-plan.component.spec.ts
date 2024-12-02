import { OverduePlanComponent } from "./overdue-plan.component";


describe('OverduePlanComponent', () => {
    let component: OverduePlanComponent;

    

    beforeAll(() => {
        component = new OverduePlanComponent(
            
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