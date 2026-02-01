import { Component, Input } from '@angular/core'
import { NsContent } from '../../_services/widget-content.model'

@Component({
  selector: 'viewer-certification-container',
  templateUrl: './certification.component.html',
  styleUrls: ['./certification.component.scss'],
  standalone: false
})
export class CertificationComponent {
  @Input() isFetchingDataComplete = false
  @Input() forPreview = false
  @Input() certificationData: NsContent.IContent | null = null
  constructor() { }
}
