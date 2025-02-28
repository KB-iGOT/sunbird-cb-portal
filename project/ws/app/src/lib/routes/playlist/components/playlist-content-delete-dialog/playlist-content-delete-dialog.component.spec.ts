import { PlaylistContentDeleteDialogComponent } from './playlist-content-delete-dialog.component';
import { MatLegacyDialogRef as MatDialogRef} from '@angular/material/legacy-dialog'
describe('PlaylistContentDeleteDialogComponent', () => {
  let component: PlaylistContentDeleteDialogComponent;
  let dialogRefMock: MatDialogRef<PlaylistContentDeleteDialogComponent>;
  let playlistTitleMock: string;

  beforeEach(() => {
    // Mock the MatDialogRef and MAT_DIALOG_DATA
    dialogRefMock = {
      close: jest.fn(),
    } as unknown as MatDialogRef<PlaylistContentDeleteDialogComponent>;

    playlistTitleMock = 'Mock Playlist Title';

    // Instantiate the component with mocked dependencies
    component = new PlaylistContentDeleteDialogComponent(dialogRefMock, playlistTitleMock);
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have the correct playlist title injected', () => {
    expect(component.playlistTitle).toBe(playlistTitleMock);
  });

  it('should call dialogRef.close when close method is invoked', () => {
    component.dialogRef.close();
    expect(dialogRefMock.close).toHaveBeenCalled();
  });
});
