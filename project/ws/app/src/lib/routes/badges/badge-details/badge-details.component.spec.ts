import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { Router } from '@angular/router'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { of } from 'rxjs'

import { BadgeService } from './../../services/badge.service'
import { BadgeDetailsComponent } from './badge-details.component'

describe('BadgeDetailsComponent', () => {
  let component: BadgeDetailsComponent
  let fixture: ComponentFixture<BadgeDetailsComponent>
  const badgeServiceMock = {
    fetchBadgeDetails: jest.fn().mockReturnValue(of({ result: {} })),
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BadgeDetailsComponent],
      providers: [
        { provide: BadgeService, useValue: badgeServiceMock },
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: ConfigurationsService, useValue: { userProfile: {} } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    fixture = TestBed.createComponent(BadgeDetailsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
    expect(badgeServiceMock.fetchBadgeDetails).toHaveBeenCalledWith({ request: { status: 'Completed' } })
  })
})
