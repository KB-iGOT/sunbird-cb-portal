import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CertificateModuleV2 } from '@ws/app/src/lib/routes/certificate-v2/certificate-v2.module'

@NgModule({
  imports: [CommonModule, CertificateModuleV2],
  exports: [CertificateModuleV2],
})
export class RouteCertificateV2Module {

}
