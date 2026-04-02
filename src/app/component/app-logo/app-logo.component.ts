import { Component, Input, OnInit } from '@angular/core'
import { ConfigurationsService, DomainConfService } from '@sunbird-cb/utils-v2'

@Component({
  selector: 'ws-app-logo',
  templateUrl: './app-logo.component.html',
  styleUrls: ['./app-logo.component.scss'],
})
export class AppLogoComponent implements OnInit {
  @Input() classList = ''
  @Input() path = ''
  @Input() logoSrc = ''
  constructor(public domainConfSvc: DomainConfService, private configSvc: ConfigurationsService) { }

  ngOnInit() {
    this.domainConfSvc.initFromConfig(this.configSvc.globalConfig.applicationConfig)
    console.log('this.configSvc.globalConfig', this.configSvc.globalConfig)
    console.log('this.logoSrc', this.logoSrc)
  }

}
