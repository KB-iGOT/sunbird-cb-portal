import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { GoalsModule } from '@sunbird-cb/collection'

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    GoalsModule,
  ],
  exports: [
    GoalsModule,
  ],
})
export class RouteGoalsAppModule { }
