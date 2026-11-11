import { NgModule } from '@angular/core'
import { PeerValidationModule } from '@ws/app/src/lib/routes/peer-validation/peer-validation.module'

@NgModule({
  imports: [PeerValidationModule],
  exports: [PeerValidationModule],
})
export class RoutePeerValidationModule { }
