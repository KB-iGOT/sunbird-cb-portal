import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { EventsModule } from '@sunbird-cb/collection'

@NgModule({
  imports: [CommonModule, EventsModule],
  exports: [EventsModule],
})
export class RouteEventsModule {

}
