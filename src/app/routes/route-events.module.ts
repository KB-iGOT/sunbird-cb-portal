import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { EventsModule } from '@ws/app/src/lib/routes/events/events.module'

@NgModule({
  imports: [CommonModule, EventsModule],
  exports: [EventsModule],
})
export class RouteEventsModule {

}
