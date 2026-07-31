import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { WsAuthorRootModule } from '@ws/author/src/lib/ws-auth-root.module'
@NgModule({
  declarations: [],
  imports: [CommonModule, WsAuthorRootModule],
  exports: [WsAuthorRootModule],
})
export class AuthoringAppModule { }
