import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { InfoModule } from '@ws/app/src/lib/routes/info/info.module'

@NgModule({
  declarations: [],
  imports: [CommonModule, InfoModule],
  exports: [InfoModule],
})
export class RouteInfoAppModule {}
