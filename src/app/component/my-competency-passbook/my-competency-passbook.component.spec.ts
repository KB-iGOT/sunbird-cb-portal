import { MyCompetencyPassbookComponent } from "./my-competency-passbook.component";


describe('MyCompetencyPassbookComponent', () => {
    let component: MyCompetencyPassbookComponent;

    

    beforeAll(() => {
        component = new MyCompetencyPassbookComponent(
            
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