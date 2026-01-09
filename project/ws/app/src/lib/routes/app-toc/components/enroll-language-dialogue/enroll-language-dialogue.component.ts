import { Component, Inject, OnInit } from '@angular/core'
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog'

@Component({
  selector: 'ws-app-enroll-language-dialogue',
  templateUrl: './enroll-language-dialogue.component.html',
  styleUrls: ['./enroll-language-dialogue.component.scss'],
  standalone: false
})
export class EnrollLanguageDialogueComponent implements OnInit {
  selectedLanguage: any
  languageList: any = []
  constructor(
    public dialogRef: MatDialogRef<EnrollLanguageDialogueComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,

  ) { }


  ngOnInit() {
    this.languageList = this.data.languageList || []
    if (this.data.preSelect) {
      const preSelectIndex = this.languageList.findIndex((lang: any) => lang.langId === this.data.preSelect.langId)
      this.selectedLanguage = preSelectIndex !== -1 ? this.languageList[preSelectIndex] : null
    } else {
      this.selectedLanguage = this.languageList.length > 0 ? this.languageList[0] : null
    }
  }

  onLanguageChange($event: any) {
    console.log('Selected Language $event:', $event)
  }
  onSubmit() {
    if (this.selectedLanguage) {
      this.dialogRef.close(this.selectedLanguage) // Pass selected object to parent
    }
  }
}
