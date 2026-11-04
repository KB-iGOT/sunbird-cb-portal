import { TestBed } from '@angular/core/testing'
import { Router } from '@angular/router'
import { TranslateModule } from '@ngx-translate/core'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { CommonDataService } from '../../../services/common-data.service'
import {
  CAMPAIGN_POPUP_MOCK,
  CampaignPopupComponent,
} from './campaign-popup.component'

jest.mock('../../../services/common-data.service', () => ({ CommonDataService: class { } }))

describe('CampaignPopupComponent', () => {
  const router = { navigateByUrl: jest.fn() }
  let dialogs: Record<string, boolean>
  let profileDetails: any

  function create() {
    TestBed.configureTestingModule({
      imports: [CampaignPopupComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Router, useValue: router },
        { provide: ConfigurationsService, useValue: { unMappedUser: { id: 'u1', profileDetails } } },
        { provide: CommonDataService, useValue: { isDialogEnabled: (key: string) => dialogs[key] !== false } },
      ],
    })
    const fixture = TestBed.createComponent(CampaignPopupComponent)
    fixture.detectChanges()
    return { fixture, component: fixture.componentInstance, el: fixture.nativeElement as HTMLElement }
  }

  beforeEach(() => {
    localStorage.clear()
    router.navigateByUrl.mockClear()
    dialogs = { tour: false }
    profileDetails = {}
  })

  it('should open with the mock content', () => {
    const { component, el } = create()
    expect(component.isOpen()).toBe(true)
    expect(el.querySelector('[role="dialog"]')).not.toBeNull()
    expect(el.querySelector('#cp-title')?.textContent).toContain(CAMPAIGN_POPUP_MOCK.title)
  })

  it('should stay closed when switched off in global config', () => {
    dialogs.milestoneCampaign = false
    expect(create().component.isOpen()).toBe(false)
  })

  it('should close on dismiss', () => {
    const { component, fixture, el } = create()
    component.close()
    fixture.detectChanges()
    expect(component.isOpen()).toBe(false)
    expect(el.querySelector('[role="dialog"]')).toBeNull()
    expect(router.navigateByUrl).not.toHaveBeenCalled()
  })

  it('should open again on the next homepage visit after a dismiss', () => {
    create().component.close()
    TestBed.resetTestingModule()
    expect(create().component.isOpen()).toBe(true)
  })

  it('should close on Escape', () => {
    const { component } = create()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(component.isOpen()).toBe(false)
  })

  it('should open the microsite from the CTA', () => {
    const { component, el } = create()
    el.querySelector<HTMLButtonElement>('.cp-cta')?.click()
    expect(router.navigateByUrl).toHaveBeenCalledWith(CAMPAIGN_POPUP_MOCK.redirectUrl)
    expect(component.isOpen()).toBe(false)
  })

  it('should not close when clicking inside the dialog, only the backdrop', () => {
    const { component, el } = create()
    el.querySelector<HTMLElement>('.cp-dialog')?.click()
    expect(component.isOpen()).toBe(true)
    el.querySelector<HTMLElement>('.cp-backdrop')?.click()
    expect(component.isOpen()).toBe(false)
  })

  describe('with the home tour enabled', () => {
    beforeEach(() => {
      dialogs.tour = true
    })

    it('should wait while the get-started tour is pending', () => {
      profileDetails = { karma_wallet_tour: { visited: true, video_visited: true } }
      expect(create().component.isOpen()).toBe(false)
    })

    it('should wait while the Karma Wallet video is pending', () => {
      profileDetails = { get_started_tour_v2: { visited: true }, karma_wallet_tour: { visited: true } }
      expect(create().component.isOpen()).toBe(false)
    })

    it('should open once both tours are done', () => {
      profileDetails = { get_started_tour_v2: { skipped: true }, karma_wallet_tour: { visited: true, video_visited: true } }
      expect(create().component.isOpen()).toBe(true)
    })

    it('should open when the Karma Wallet tour is snoozed', () => {
      localStorage.setItem('karmaWalletTourSnoozed', 'u1')
      profileDetails = { get_started_tour_v2: { visited: true } }
      expect(create().component.isOpen()).toBe(true)
    })
  })
})
