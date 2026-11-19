import { Location } from '@angular/common'
import { TestBed } from '@angular/core/testing'
import { MatDialog } from '@angular/material/dialog'
import { MatSnackBar } from '@angular/material/snack-bar'
import { ActivatedRoute, Router } from '@angular/router'
import { TranslateService } from '@ngx-translate/core'
import { ConfigurationsService, MultilingualTranslationsService } from '@sunbird-cb/utils-v2'
import { of, throwError } from 'rxjs'
import { autoMock } from 'src/testing/auto-mock'
import { SignupService } from '../public-signup/signup.service'
import { PublicRequestComponent } from './public-request.component'
import { RequestService } from './request.service'

describe('PublicRequestComponent', () => {
  let component: PublicRequestComponent
  let requestSvc: { createOrg: jest.Mock }

  beforeEach(() => {
    requestSvc = { createOrg: jest.fn() }

    TestBed.configureTestingModule({
      providers: [
        PublicRequestComponent,
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: { type: 'Organisation' } } } },
        { provide: Router, useValue: { getCurrentNavigation: jest.fn().mockReturnValue(null) } },
        { provide: MatSnackBar, useValue: autoMock() },
        { provide: SignupService, useValue: autoMock() },
        { provide: MatDialog, useValue: autoMock() },
        { provide: RequestService, useValue: requestSvc },
        { provide: Location, useValue: autoMock() },
        { provide: ConfigurationsService, useValue: {} },
        { provide: MultilingualTranslationsService, useValue: autoMock() },
        { provide: TranslateService, useValue: { setDefaultLang: jest.fn(), use: jest.fn() } },
      ],
    })

    component = TestBed.inject(PublicRequestComponent)
  })

  describe('submitRequest for Organisation', () => {
    it('opens the success dialog and clears the form when result data is returned', () => {
      const response = { result: { data: { requestId: 'request-1' } } }
      requestSvc.createOrg.mockReturnValue(of(response))
      const openDialog = jest.spyOn(component, 'openDialog').mockImplementation()
      const clearForm = jest.spyOn(component, 'clearForm').mockImplementation()

      component.disableBtn = true
      component.isMobileVerified = false
      component.submitRequest()

      expect(openDialog).toHaveBeenCalledWith('Organisation', response)
      expect(clearForm).toHaveBeenCalled()
      expect(component.isMobileVerified).toBe(true)
      expect(component.disableBtn).toBe(false)
    })

    it('shows only the API error when result errmsg is returned', () => {
      const response = { result: { errmsg: 'Organisation already exists' } }
      requestSvc.createOrg.mockReturnValue(of(response))
      const openDialog = jest.spyOn(component, 'openDialog').mockImplementation()
      const clearForm = jest.spyOn(component, 'clearForm').mockImplementation()
      const openSnackbar = jest.spyOn(component as any, 'openSnackbar').mockImplementation()

      component.disableBtn = true
      component.isMobileVerified = false
      component.submitRequest()

      expect(openSnackbar).toHaveBeenCalledWith('Organisation already exists')
      expect(openDialog).not.toHaveBeenCalled()
      expect(clearForm).not.toHaveBeenCalled()
      expect(component.isMobileVerified).toBe(false)
      expect(component.disableBtn).toBe(false)
    })

    it('keeps the existing HTTP error handling unchanged', () => {
      const error = { error: { params: { errmsg: 'Unable to create organisation' } } }
      requestSvc.createOrg.mockReturnValue(throwError(() => error))
      const openDialog = jest.spyOn(component, 'openDialog').mockImplementation()
      const openSnackbar = jest.spyOn(component as any, 'openSnackbar').mockImplementation()

      component.disableBtn = true
      component.submitRequest()

      expect(openSnackbar).toHaveBeenCalledWith('Unable to create organisation')
      expect(openDialog).not.toHaveBeenCalled()
      expect(component.disableBtn).toBe(false)
    })
  })
})
