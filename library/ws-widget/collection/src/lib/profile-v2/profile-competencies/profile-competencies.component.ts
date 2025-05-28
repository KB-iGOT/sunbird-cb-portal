import { Component, HostBinding, Input, OnInit } from '@angular/core'
import { WidgetBaseComponent } from '@sunbird-cb/resolver/src/lib/widget-base.component'
import { NsWidgetResolver } from '@sunbird-cb/resolver/src/lib/widget-resolver.model'

@Component({
  selector: 'ws-widget-profile-v2-competencies',
  templateUrl: './profile-competencies.component.html',
  styleUrls: ['./profile-competencies.component.scss'],
  /* tslint:disable */
  host: { class: 'flex flex-1' },
  /* tslint:enable */
})
export class ProfileCompetenciesComponent extends WidgetBaseComponent implements OnInit, NsWidgetResolver.IWidgetData<any> {
  @Input() widgetData: any
  @HostBinding('id')
  public id = 'profile-comp'
  ngOnInit(): void {
  }

}
