import { Component, OnInit, Input } from '@angular/core'
import { NsWidgetResolver } from '../widget-resolver.model'
import { WidgetBaseComponent } from '../widget-base.component'
@Component({
  selector: 'ws-resolver-invalid-permission',
  templateUrl: './invalid-permission.component.html',
  styleUrls: ['./invalid-permission.component.scss'],
  standalone: false
})
export class InvalidPermissionComponent extends WidgetBaseComponent
  implements OnInit, NsWidgetResolver.IWidgetData<any> {
  @Input() widgetData!: any
  showData = true

  ngOnInit() { }
}
