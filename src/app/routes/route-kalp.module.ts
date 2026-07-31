import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { KalpModule } from '@ws/app/src/lib/routes/kalp/kalp.module'

@NgModule({
  imports: [CommonModule, KalpModule],
  exports: [KalpModule],
})
export class RouteKalpModule { }
