import { CKEditorResolverService } from "./ckeditor-resolve.service";


describe('CKEditorResolverService', () => {
    let component: CKEditorResolverService;

    

    beforeAll(() => {
        component = new CKEditorResolverService(
            
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