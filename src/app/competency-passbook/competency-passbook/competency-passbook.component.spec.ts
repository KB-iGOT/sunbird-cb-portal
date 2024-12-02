import { CompetencyPassbookComponent } from "./competency-passbook.component";


describe('CompetencyPassbookComponent', () => {
    let component: CompetencyPassbookComponent;

    

    beforeAll(() => {
        component = new CompetencyPassbookComponent(
            
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