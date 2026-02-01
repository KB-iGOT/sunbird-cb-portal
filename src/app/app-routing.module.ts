import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { GeneralGuard } from '@ws/app'
// 💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥💥
// Please declare routes in alphabetical order
// 😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵😵

const routes: Routes = [

  { path: '', redirectTo: 'page/home', pathMatch: 'full' },
  { path: 'home', redirectTo: 'page/home', pathMatch: 'full' },
  {
    path: 'page/home',
    loadChildren: () => import('./home/home.module').then(m => m.HomeModule),
    data: {
      pageType: 'page',
      pageKey: 'home',
      pageId: 'page/home',
      module: 'Home',
    },
    resolve: {
      // module: ModuleNameResolve,
      // pageId: PageNameResolve,
    },
    canActivate: [GeneralGuard],
  },

]
@NgModule({
  imports: [
    RouterModule.forRoot(routes),
  ],
  exports: [RouterModule],
  providers: [],
})
export class AppRoutingModule { }
