import { Component, OnInit, Inject } from '@angular/core'
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog'
import { NsWidgetResolver } from '@sunbird-cb/resolver-v2'
import { ROOT_WIDGET_CONFIG } from '../../../collection.config'

@Component({
  selector: 'ws-app-app-toc-dialog-intro-video',
  templateUrl: './app-toc-dialog-intro-video.component.html',
  styleUrls: ['./app-toc-dialog-intro-video.component.scss'],
  standalone: false
})
export class AppTocDialogIntroVideoComponent implements OnInit {
  introVideoRenderConfig: NsWidgetResolver.IRenderConfigWithTypedData<any> | null = null
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: string,
    public dialogRef: MatDialogRef<AppTocDialogIntroVideoComponent>,
  ) { }

  ngOnInit() {
    this.introVideoRenderConfig = {
      widgetData: {
        url: this.data,
        autoplay: true,
      },
      widgetSubType: ROOT_WIDGET_CONFIG.player.video,
      widgetType: ROOT_WIDGET_CONFIG.player._type,
      widgetHostClass: 'video-full block',
      widgetHostStyle: {
        height: '350px',
      },
    }
  }

  closeDialog() {
    this.dialogRef.close()
  }
}
