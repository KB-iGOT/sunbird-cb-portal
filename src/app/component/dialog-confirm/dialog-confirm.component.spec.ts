import { DialogConfirmComponent } from './dialog-confirm.component';
import { MatLegacyDialogRef as MatDialogRef } from '@angular/material/legacy-dialog';

// Mock MatLegacyDialogRef with the correct type
const dialogRefMock: Partial<MatDialogRef<DialogConfirmComponent>> = {
  close: jest.fn(),
};

// Mock TranslateService
const translateMock = {
  setDefaultLang: jest.fn(),
  use: jest.fn(),
};

// Mock MAT_DIALOG_DATA
const matDialogDataMock = {
  title: 'Test Title',
  body: 'Test Body',
};

describe('DialogConfirmComponent', () => {
  let component: DialogConfirmComponent;

  beforeEach(() => {
    // Instantiate the component with mocks
    component = new DialogConfirmComponent(
      matDialogDataMock,
      dialogRefMock as MatDialogRef<DialogConfirmComponent>, // Type assertion to correct type
      translateMock as any // Type assertion to mock TranslateService
    );
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should set default language and use language from localStorage if available', () => {
    // Mock the localStorage.getItem
    // const localStorageMock = {
    //   getItem: jest.fn().mockReturnValue('en'),
    // };

    //global.localStorage = localStorageMock as any; // Type assertion to override localStorage

    // Call the component constructor

    // Check if translate.setDefaultLang and translate.use were called
    expect(translateMock.setDefaultLang).toHaveBeenCalledWith('en');
    expect(translateMock.use).toHaveBeenCalledWith('en');
  });

  it('should call dialogRef.close with true when confirmed is called', () => {
    component.confirmed();
    expect(dialogRefMock.close).toHaveBeenCalledWith(true);
  });
});
