
import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Router } from '@angular/router'
import { DomainConfService } from '@sunbird-cb/utils-v2'

@Injectable({
    providedIn: 'root',
})
export class RedirectGuard  {

  constructor(private domainSvc: DomainConfService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if(route.data['externalUrl']) {
      window.location.href =  this.domainSvc.isKbPortal() ? route.data['externalUrl'] : this.domainSvc.getNonLoggedInPageUrl()
      return false
    } else {
      // Redirect to Angular 20 MFE home instead of old page/home
      const path = this.domainSvc.isKbPortal() ? 'home' : this.domainSvc.getDomainRedirectPath()
      this.router.navigateByUrl(path)
      return false
    }
  }
}
