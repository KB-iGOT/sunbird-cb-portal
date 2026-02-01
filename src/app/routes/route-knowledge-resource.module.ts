import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { KnowledgeResourceModule } from '@sunbird-cb/collection'

@NgModule({
  imports: [
    CommonModule, KnowledgeResourceModule],
  exports: [KnowledgeResourceModule],
})
export class RouteKnowledgeResourceModule { }
