import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { WsAuthorRootModule } from '@sunbird-cb/collection'
@NgModule({
  declarations: [],
  imports: [CommonModule, WsAuthorRootModule],
  exports: [WsAuthorRootModule],
})
export class AuthoringAppModule { }
