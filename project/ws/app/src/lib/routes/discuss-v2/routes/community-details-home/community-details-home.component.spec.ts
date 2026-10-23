import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ActivatedRoute, Router } from '@angular/router'
import { of } from 'rxjs'

import { CommunityDetailsHomeComponent } from './community-details-home.component'

describe('CommunityDetailsHomeComponent', () => {
  let component: CommunityDetailsHomeComponent
  let fixture: ComponentFixture<CommunityDetailsHomeComponent>
  const routerMock = { navigate: jest.fn() }

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CommunityDetailsHomeComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ communityId: 'c1', discussionId: 'd1' }),
            snapshot: { data: { pageData: { data: { feedsWidgetData: { a: 1 }, communityWidgetData: { b: 2 } } } } },
          },
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    fixture = TestBed.createComponent(CommunityDetailsHomeComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
    expect(component.communityId).toBe('c1')
    expect(component.discussionId).toBe('d1')
    expect(component.communityWidgetData).toEqual({ b: 2 })
  })

  it('should navigate on community change', () => {
    component.communityChange({ communityId: 'c2' })
    expect(routerMock.navigate).toHaveBeenCalledWith(['/app/discussion-forum-v2/community', 'c2'])
  })
})
