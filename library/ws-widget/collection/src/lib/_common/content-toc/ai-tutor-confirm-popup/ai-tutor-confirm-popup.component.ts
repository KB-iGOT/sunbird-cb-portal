import { Component, Inject } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'

@Component({
    selector: 'ws-widget-ai-tutor-confirm-popup',
    templateUrl: './ai-tutor-confirm-popup.component.html',
    styleUrls: ['./ai-tutor-confirm-popup.component.scss'],
    standalone: false
})
export class AiTutorConfirmPopupComponent {
  constructor(public dialogRef: MatDialogRef<AiTutorConfirmPopupComponent>, @Inject(MAT_DIALOG_DATA) public data: any,) {

  }

  close(): void {
    this.dialogRef.close()
  }

  enrollNow() {
    if (this.data.enroll) {
      this.dialogRef.close('enroll')
    } else {
      this.dialogRef.close('needToEnroll')
    }

  }
}
