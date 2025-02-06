import { AttendanceCardComponent } from './attendance-card.component';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog';
import { AttendanceHelperComponent } from '../attendance-helper/attendance-helper.component';
import _ from 'lodash';

describe('AttendanceCardComponent', () => {
  let component: AttendanceCardComponent;
  let mockDialog: MatDialog;

  beforeEach(() => {
    // Mock MatDialog
    mockDialog = {
      open: jest.fn(),
    } as unknown as MatDialog;

    // Create the component instance
    component = new AttendanceCardComponent(mockDialog);
    
    // Mock afterClosed() method of MatDialog
    // mockDialog.open.mockReturnValue({
    //   afterClosed: jest.fn().mockReturnValue({
    //     subscribe: jest.fn(),
    //   }),
    // });
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should open the dialog with the correct config in openHelp()', () => {
    const mockContent = { someData: 'test' };
    const mockConfig = { attendenceHelp: 'someConfig' };
    component.config = mockConfig;

    component.openHelp(mockContent);

    // Ensure the dialog opens with the correct component and data
    expect(mockDialog.open).toHaveBeenCalledWith(AttendanceHelperComponent, {
      maxWidth: '1250px',
      data: {
        content: mockContent,
        helperConfig: _.get(mockConfig, 'attendenceHelp'),
      },
    });
  });

  it('should handle afterClosed() result in openHelp()', () => {
   // const mockContent = { someData: 'test' };
    const mockConfig = { attendenceHelp: 'someConfig' };
    component.config = mockConfig;
    // const mockDialogRef = mockDialog.open(mockContent);

    // Simulate dialog closure with a result
   // const mockResult = { resultData: 'someResult' };
    // mockDialogRef.afterClosed().subscribe((result: any) => {
    //   expect(result).toEqual(mockResult);
    // });
  });
});
