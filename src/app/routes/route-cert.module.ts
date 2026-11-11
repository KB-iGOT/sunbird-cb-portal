import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { CertificateModule } from '@ws/app/src/lib/routes/certificate/certificate.module'

@NgModule({
  imports: [CommonModule, CertificateModule],
  exports: [CertificateModule],
})
export class RouteCertificateModule {

}
