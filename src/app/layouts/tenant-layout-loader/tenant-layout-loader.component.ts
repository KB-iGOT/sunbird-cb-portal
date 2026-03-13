import { Component, OnInit } from '@angular/core'
import { DomainConfService } from '@sunbird-cb/utils-v2'

/**
 * TenantLayoutLoaderComponent
 *
 * Dynamically switches between layout components based on the
 * current tenant's configured layout. Acts as the layout router
 * in the root component template.
 */
@Component({
  selector: 'app-tenant-layout-loader',
  templateUrl: './tenant-layout-loader.component.html',
})
export class TenantLayoutLoaderComponent implements OnInit {
  layout = 'default'

  constructor(private domainConfSvc: DomainConfService) {}

  ngOnInit(): void {
    console.log('TenantLayoutLoaderComponent initialized. Determining layout...')
    this.layout = this.domainConfSvc.getLayout()
    console.log(`Layout determined: ${this.layout}`)
  }
}
