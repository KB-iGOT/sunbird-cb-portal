import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { AnalyticsComponent } from './analytics.component'
import { AnalyticsRoutingModule } from './analytics-routing.module'

import { BtnPageBackModule, PageModule } from '@sunbird-cb/collection'

import { LinePlusBarChartComponent } from './components/line-plus-bar-chart/line-plus-bar-chart.component'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatToolbarModule } from '@angular/material/toolbar'

@NgModule({
  declarations: [AnalyticsComponent, LinePlusBarChartComponent],
  imports: [
    AnalyticsRoutingModule,
    BtnPageBackModule,
    PageModule,
    MatToolbarModule,
    CommonModule,
    MatButtonModule,
    MatIconModule,
  ],
  exports: [AnalyticsComponent],
})
export class AnalyticsModule { }
