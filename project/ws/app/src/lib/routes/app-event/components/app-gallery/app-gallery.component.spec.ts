import { NO_ERRORS_SCHEMA } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { ActivatedRoute } from '@angular/router'
import { ValueService } from '@sunbird-cb/utils-v2'
import { of } from 'rxjs'

import { AppGalleryComponent } from './app-gallery.component'

describe('AppGalleryComponent', () => {
  let component: AppGalleryComponent
  let fixture: ComponentFixture<AppGalleryComponent>
  const gallery = [['img1.webp', 'img2.webp']]

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AppGalleryComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { data: of({ eventdata: { data: { Home: { a: 1 }, Gallery: gallery } } }) } },
        { provide: ValueService, useValue: { isLtMedium$: of(true) } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
    .overrideTemplate(AppGalleryComponent, '')
    fixture = TestBed.createComponent(AppGalleryComponent)
    component = fixture.componentInstance
    fixture.detectChanges()
  })

  it('should create and read route data', () => {
    expect(component).toBeTruthy()
    expect(component.noOfCol).toBe(1)
    expect(component.data).toEqual({ a: 1 })
    expect(component.imageData).toEqual(gallery)
    expect(component.error).toBe(false)
  })

  it('should open gallery and slide between images', () => {
    component.openGallery(true, ['a', 'b', 'c'])
    expect(component.isOpened).toBe(true)
    expect(component.imageGallery).toEqual(['a', 'b', 'c'])
    component.slideTo(1)
    expect(component.currentIndex).toBe(1)
    component.slideTo(3)
    expect(component.currentIndex).toBe(0)
    component.slideTo(-1)
    expect(component.currentIndex).toBe(2)
  })
})
