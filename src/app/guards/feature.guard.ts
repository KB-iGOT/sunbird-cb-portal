import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router'
import { DomainConfService } from '@sunbird-cb/utils-v2'

/**
 * FeatureGuard
 *
 * Route guard that checks whether a feature is enabled for the current tenant.
 * Usage in routes:
 *
 * {
 *   path: 'discuss',
 *   loadChildren: () => import(...),
 *   canActivate: [FeatureGuard],
 *   data: { feature: 'discussion' }
 * }
 *
 * If the feature is disabled, the user is redirected to /page/home.
 */
@Injectable({
  providedIn: 'root',
})
export class FeatureGuard {
  constructor(
    private domainConfSvc: DomainConfService,
    private router: Router,
  ) {}

  canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree {
    const feature = route.data && route.data.feature
    if (!feature) {
      // No feature guard configured — allow access
      return true
    }

    if (this.domainConfSvc.isFeatureRoutesEnabled(feature)) {
      return true
    }

    // Feature is disabled for this tenant — redirect to home
    return this.router.createUrlTree(['/page/home'])
  }
}
