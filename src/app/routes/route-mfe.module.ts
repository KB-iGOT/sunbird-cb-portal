import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { MfeModule } from '../mfe/mfe.module'
import { MfeWrapperComponent } from '../mfe/mfe-wrapper.component'

/**
 * Remote entry URL — the Angular 20 portal's Module Federation entry point.
 * Change this to the deployed URL in production.
 */
const REMOTE_ENTRY = 'http://localhost:4200/remoteEntry.js'
const REMOTE_NAME = 'igotLearnerPortal'

/**
 * MFE feature routes — each route loads a Web Component from the
 * Angular 20 remote portal into the Angular 16 host.
 *
 * These are top-level routes — the old portal shell (header/footer/navbar)
 * is automatically hidden when any of these routes is active.
 *
 * Route mapping (host path → remote feature → custom element):
 *
 * | Host Route   | Remote Module        | Custom Element          |
 * |--------------|----------------------|-------------------------|
 * | /home        | ./HomeFeature        | igot-mfe-home           |
 * | /search      | ./SearchFeature      | igot-mfe-search         |
 * | /profile     | ./ProfileFeature     | igot-mfe-profile        |
 * | /my-learning | ./MyLearningFeature  | igot-mfe-my-learning    |
 * | /toc         | ./TocFeature         | igot-mfe-toc            |
 */
const mfeRoutes: Routes = [
  {
    path: 'home',
    component: MfeWrapperComponent,
    data: {
      remoteEntry: REMOTE_ENTRY,
      remoteName: REMOTE_NAME,
      exposedModule: './HomeFeature',
      elementName: 'igot-mfe-home',
      pageId: 'home',
      module: 'Home',
    },
  },
  {
    path: 'search',
    component: MfeWrapperComponent,
    data: {
      remoteEntry: REMOTE_ENTRY,
      remoteName: REMOTE_NAME,
      exposedModule: './SearchFeature',
      elementName: 'igot-mfe-search',
      pageId: 'search',
      module: 'Search',
    },
  },
  {
    path: 'profile',
    component: MfeWrapperComponent,
    data: {
      remoteEntry: REMOTE_ENTRY,
      remoteName: REMOTE_NAME,
      exposedModule: './ProfileFeature',
      elementName: 'igot-mfe-profile',
      pageId: 'profile',
      module: 'Profile',
    },
  },
  {
    path: 'my-learning',
    component: MfeWrapperComponent,
    data: {
      remoteEntry: REMOTE_ENTRY,
      remoteName: REMOTE_NAME,
      exposedModule: './MyLearningFeature',
      elementName: 'igot-mfe-my-learning',
      pageId: 'my-learning',
      module: 'Profile',
    },
  },
  {
    path: 'toc',
    component: MfeWrapperComponent,
    data: {
      remoteEntry: REMOTE_ENTRY,
      remoteName: REMOTE_NAME,
      exposedModule: './TocFeature',
      elementName: 'igot-mfe-toc',
      pageId: 'toc',
      module: 'Learn',
    },
  },
  {
    path: '**',
    redirectTo: 'home',
    pathMatch: 'full',
  },
]

@NgModule({
  imports: [MfeModule, RouterModule.forChild(mfeRoutes)],
  exports: [RouterModule],
})
export class RouteMfeModule {}
