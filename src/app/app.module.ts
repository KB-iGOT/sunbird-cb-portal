import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { RootComponent } from './component/root/root.component'

@NgModule({
  declarations: [RootComponent],
  imports: [BrowserModule],
  bootstrap: [RootComponent],
})
export class AppModule { }