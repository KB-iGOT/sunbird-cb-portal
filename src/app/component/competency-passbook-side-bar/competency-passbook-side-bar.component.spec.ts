import { CompetencyPassbookSideBarComponent } from "./competency-passbook-side-bar.component";


describe('CompetencyPassbookSideBarComponent', () => {
    let component: CompetencyPassbookSideBarComponent;

    

    beforeAll(() => {
        component = new CompetencyPassbookSideBarComponent(
            
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