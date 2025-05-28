import { Component, OnInit, Input, HostBinding } from '@angular/core'
import { WidgetBaseComponent } from '@sunbird-cb/resolver/src/lib/widget-base.component'
import { NsWidgetResolver } from '@sunbird-cb/resolver/src/lib/widget-resolver.model'

@Component({
  selector: 'ws-widget-home-component',
  templateUrl: './card-home-top.component.html',
  styleUrls: ['./card-home-top.component.scss'],
})
export class CardHomeTopComponent extends WidgetBaseComponent implements OnInit, NsWidgetResolver.IWidgetData<any> {
  items = ['1', '2', '3', '4']
  @Input() widgetData: any
  @HostBinding('id')
  public id = `ws-home-card_${Math.random()}`
  constructor() {
    super()

  }
  ngOnInit(): void {
    if (!this.id) {
      this.id = `ws-home-card_${Math.random()}`
    }
  }

}
