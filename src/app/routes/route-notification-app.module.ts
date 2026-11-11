import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { NotificationV2Module } from '@ws/app/src/lib/routes/notification-v2/notification-v2.module'

@NgModule({
  declarations: [],
  imports: [CommonModule, NotificationV2Module],
  exports: [NotificationV2Module],
})
export class RouteNotificationAppModule {}
