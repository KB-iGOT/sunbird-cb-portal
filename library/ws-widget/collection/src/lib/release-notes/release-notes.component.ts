import { Component, Input, OnInit } from '@angular/core'
import { WidgetBaseComponent } from '@sunbird-cb/resolver/src/lib/widget-base.component'
import { NsWidgetResolver } from '@sunbird-cb/resolver/src/lib/widget-resolver.model'
import { IReleaseNotes } from './release-notes.model'
@Component({
  selector: 'ws-widget-release-notes',
  templateUrl: './release-notes.component.html',
  styleUrls: ['./release-notes.component.scss'],
})
export class ReleaseNotesComponent extends WidgetBaseComponent implements OnInit, NsWidgetResolver.IWidgetData<IReleaseNotes> {
  @Input() widgetData!: IReleaseNotes
  constructor() {
    super()
  }

  ngOnInit() {

  }

}
