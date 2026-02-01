import { Component, Inject } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { ConfigurationsService, EventService, MultilingualTranslationsService } from '@sunbird-cb/utils-v2'
import { MatSnackBar } from '@angular/material/snack-bar'
import { MatDialog } from '@angular/material/dialog'
import { LibNotificationsService } from '@sunbird-cb/notification'
import { ActivatedRoute } from '@angular/router'
import { NotificationsService } from '../../../services/notifications.service'
import { ConfirmDialogComponent } from '../../../_common/confirm-dialog/confirm-dialog.component'
@Component({
  selector: 'ws-app-my-notifications',
  templateUrl: './my-notifications.component.html',
  styleUrls: ['./my-notifications.component.scss'],
  standalone: false
})
export class MyNotificationsComponent {
  selectedLanguage = 'en'
  roles: string[] = []
  fragment: string = ''
  constructor(
    @Inject('environment') public environment: any,
    private translate: TranslateService,
    private langtranslations: MultilingualTranslationsService,
    private notificationsService: NotificationsService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private configService: ConfigurationsService,
    private events: EventService,
    private libNotificationsService: LibNotificationsService,
    private route: ActivatedRoute) {
    if (localStorage.getItem('websiteLanguage')) {
      this.translate.setDefaultLang('en')
      let lang = JSON.stringify(localStorage.getItem('websiteLanguage'))
      lang = lang.replace(/\"/g, '')
      this.selectedLanguage = lang
      this.translate.use(lang)
    }

    this.langtranslations.languageSelectedObservable.subscribe(() => {
      if (localStorage.getItem('websiteLanguage')) {
        this.translate.setDefaultLang('en')
        const lang = localStorage.getItem('websiteLanguage')!
        this.translate.use(lang)
        this.selectedLanguage = lang
      }
    })
    if (this.configService && this.configService.unMappedUser && this.configService.unMappedUser.roles) {
      this.roles = this.configService.unMappedUser.roles
    }
    this.libNotificationsService._handleClick.subscribe((content: any) => {
      if (content && content.identifier) {
        this.notificationsService.handleConetentRedirection(content)
      }
    })
    this.route.fragment.subscribe((fragment: any) => {
      if (fragment) {
        this.fragment = fragment
      }
    })
  }


  redirectTo(notification: any) {
    this.raiseTelemetryEventForNotification(notification)
    this.notificationsService.handleRedirection(notification, this.environment, this.roles, this.snackBar)
  }

  showDialog(data: any, url: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, data)
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        window.open(url, '_blank')
      }
    })
  }

  raiseTelemetryEventForNotification(notification: any) {
    this.events.raiseInteractTelemetry(
      {
        type: 'click',
        subType: 'notification-engine',
        id: notification.notification_id,
      },
      {},
      {
        module: 'Home',
      }
    )
  }

}
