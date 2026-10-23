import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ActivatedRoute } from '@angular/router'
import { of } from 'rxjs'

import { PostDetailsComponent } from './post-details.component'

describe('PostDetailsComponent', () => {
  let component: PostDetailsComponent
  let fixture: ComponentFixture<PostDetailsComponent>

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation(() => {})
    TestBed.configureTestingModule({
      declarations: [PostDetailsComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { params: of({ discussionId: 'd1' }) } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    fixture = TestBed.createComponent(PostDetailsComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create', () => {
    expect(component).toBeTruthy()
    expect(component.discussionId).toBe('d1')
  })
})
