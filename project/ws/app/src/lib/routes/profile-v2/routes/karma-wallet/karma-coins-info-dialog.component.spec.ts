import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { MatDialogRef } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'

import { KarmaCoinsInfoDialogComponent } from './karma-coins-info-dialog.component'

describe('KarmaCoinsInfoDialogComponent', () => {
  let component: KarmaCoinsInfoDialogComponent
  let fixture: ComponentFixture<KarmaCoinsInfoDialogComponent>
  const dialogRefStub = { close: jest.fn() }

  beforeEach(async () => {
    dialogRefStub.close.mockClear()
    await TestBed.configureTestingModule({
      declarations: [KarmaCoinsInfoDialogComponent],
      imports: [MatIconModule],
      providers: [{ provide: MatDialogRef, useValue: dialogRefStub }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents()

    fixture = TestBed.createComponent(KarmaCoinsInfoDialogComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  it('should describe the four steps of the worked example in order', () => {
    expect(component.flowSteps.length).toBe(4)
    expect(component.flowSteps.map(s => s.value)).toEqual(['100', '+100', '−20', '80'])
    expect(component.flowSteps.map(s => s.caption)).toEqual([
      'Karma Points earned',
      'Karma Coins received',
      'Redeemed for a course',
      'Coins left 100 points stay',
    ])
  })

  it('should source every step badge from the karmawallet-v2 asset folder', () => {
    expect(component.flowSteps.map(s => s.icon)).toEqual([
      '/assets/icons/karmawallet-v2/badgekarmapoints.svg',
      '/assets/icons/karmawallet-v2/badgekarmacoin.svg',
      '/assets/icons/karmawallet-v2/badgeredeem.svg',
      '/assets/icons/karmawallet-v2/badgekarmawallet.svg',
    ])
  })

  it('should source the plain coin and the explainer bell from karmawallet-v2', () => {
    expect(component.icons.karmaCoin).toBe('/assets/icons/karmawallet-v2/karmacoin.svg')
    expect(component.icons.bell).toBe('/assets/icons/karmawallet-v2/bell.svg')
  })

  it('should report which control dismissed it, for telemetry', () => {
    component.close('i-understand')
    expect(dialogRefStub.close).toHaveBeenCalledWith('i-understand')

    component.close('close-icon')
    expect(dialogRefStub.close).toHaveBeenCalledWith('close-icon')
  })

  it('should default to the close icon when no control is named', () => {
    component.close()
    expect(dialogRefStub.close).toHaveBeenCalledWith('close-icon')
  })
})
