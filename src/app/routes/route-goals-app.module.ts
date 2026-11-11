import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { GoalsModule } from '@ws/app/src/lib/routes/goals/goals.module'

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
