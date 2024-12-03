import { BtnGoalsErrorComponent, IData } from "./btn-goals-error.component";


describe('BtnGoalsErrorComponent', () => {
    let component: BtnGoalsErrorComponent;

    const data :Partial<IData> ={};

    beforeAll(() => {
        component = new BtnGoalsErrorComponent(
            data as IData
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