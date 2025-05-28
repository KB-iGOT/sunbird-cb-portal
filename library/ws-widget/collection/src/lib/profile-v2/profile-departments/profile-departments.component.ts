import { Component, HostBinding, Input, OnInit } from '@angular/core'
import { WidgetBaseComponent } from '@sunbird-cb/resolver/src/lib/widget-base.component'
import { NsWidgetResolver } from '@sunbird-cb/resolver/src/lib/widget-resolver.model'

@Component({
  selector: 'ws-widget-profile-v2-departments',
  templateUrl: './profile-departments.component.html',
  styleUrls: ['./profile-departments.component.scss'],
  /* tslint:disable */
  host: { class: 'flex flex-1' },
  /* tslint:enable */
})
export class ProfileDepartmentsComponent extends WidgetBaseComponent implements OnInit, NsWidgetResolver.IWidgetData<any> {
  @Input() widgetData: any
  @HostBinding('id')
  public id = 'profile-department'
  ngOnInit(): void {
  }

}
