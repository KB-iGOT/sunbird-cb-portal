jest.mock('@ws/app', () => ({
  UserProfileService: class { },
  DialogBoxComponent: class { },
}), { virtual: true })

import { DOCUMENT } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { ActivatedRoute, Router } from '@angular/router'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { TranslateService } from '@ngx-translate/core'
import { ReCaptchaV3Service } from 'ng-recaptcha'
import { of } from 'rxjs'
import {
  ConfigurationsService,
  EventService,
  LoggerService,
  MultilingualTranslationsService,
  TelemetryService,
} from '@sunbird-cb/utils-v2'
import { UserProfileService } from '@ws/app'
import { autoMock } from 'src/testing/auto-mock'
import { SignupService } from './signup.service'
import { ZohoSupportService } from '../../../services/zoho-support.service'
import { PublicSignupComponent } from './public-signup.component'

describe('PublicSignupComponent', () => {
  let component: PublicSignupComponent
  let signupSvc: any

  beforeEach(() => {
    signupSvc = autoMock()
    signupSvc.updateSignupDataObservable = of({})

    TestBed.configureTestingModule({
      providers: [
        PublicSignupComponent,
        { provide: SignupService, useValue: signupSvc },
        { provide: UserProfileService, useValue: autoMock() },
        { provide: LoggerService, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: autoMock() },
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: MatDialog, useValue: autoMock() },
        { provide: ActivatedRoute, useValue: autoMock() },
        { provide: ReCaptchaV3Service, useValue: autoMock() },
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: DOCUMENT, useValue: document },
        { provide: TranslateService, useValue: { setDefaultLang: jest.fn(), use: jest.fn() } },
        { provide: MultilingualTranslationsService, useValue: autoMock() },
        { provide: ZohoSupportService, useValue: autoMock() },
        { provide: EventService, useValue: autoMock() },
        { provide: TelemetryService, useValue: autoMock() },
      ],
    })
    component = TestBed.inject(PublicSignupComponent)
  })

  describe('navigateTo', () => {
    const router = () => TestBed.inject(Router) as any

    it('passes the typed search text as the organisation name when no org was selected', () => {
      component.registrationFormStepOne.get('searchOrganisation')!.setValue('Acme Corp')
      component.registrationFormStepOne.get('organisation')!.setValue('')

      component.navigateTo('Organisation')

      expect(router().navigate).toHaveBeenCalledWith(
        ['/public/request'],
        expect.objectContaining({
          queryParams: { type: 'Organisation' },
          state: expect.objectContaining({
            userform: expect.objectContaining({ organisation: 'Acme Corp' }),
          }),
        }),
      )
    })

    it('resolves the selected organisation id to its name, not the id itself', () => {
      component.masterData.organisation = [{ identifier: 'org-123', orgName: 'Acme Corp' }]
      component.registrationFormStepOne.get('searchOrganisation')!.setValue('')
      component.registrationFormStepOne.get('organisation')!.setValue('org-123')

      component.navigateTo('Organisation')

      const state = router().navigate.mock.calls[0][1].state
      expect(state.userform.organisation).toBe('Acme Corp')
    })

    it('falls back to an empty string when the organisation cannot be resolved', () => {
      component.masterData.organisation = []
      component.registrationFormStepOne.get('searchOrganisation')!.setValue('')
      component.registrationFormStepOne.get('organisation')!.setValue('org-unknown')

      component.navigateTo('Organisation')

      const state = router().navigate.mock.calls[0][1].state
      expect(state.userform.organisation).toBe('')
    })

    it('leaves other request types untouched', () => {
      component.registrationFormStepOne.get('position')!.setValue('Manager')

      component.navigateTo('Position')

      const state = router().navigate.mock.calls[0][1].state
      expect(state.userform.position).toBe('Manager')
    })
  })
})
