import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { FeedbackV2Module } from '@sunbird-cb/collection'

@NgModule({
  imports: [CommonModule, FeedbackV2Module],
  exports: [FeedbackV2Module],
})
export class RouteFeedbackV2Module { }
