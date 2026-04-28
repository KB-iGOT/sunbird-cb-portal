import { UntypedFormBuilder } from '@angular/forms'
import { of, throwError } from 'rxjs'
import { ImageMapComponent } from './image-map.component'

describe('ImageMapComponent', () => {
  let component: ImageMapComponent
  let uploadService: any
  let snackBar: any
  let loader: any
  let context: any

  beforeEach(() => {
    jest.useFakeTimers()
    uploadService = { upload: jest.fn(() => of({ code: 'ok', artifactURL: '/content/path/assets/image.png' })) }
    snackBar = { openFromComponent: jest.fn() }
    loader = { changeLoad: { next: jest.fn() } }
    context = {
      clearRect: jest.fn(),
      fillRect: jest.fn(),
      strokeRect: jest.fn(),
      setLineDash: jest.fn(),
      globalAlpha: 0,
      fillStyle: '',
    }
    component = new ImageMapComponent(uploadService, snackBar, new UntypedFormBuilder(), loader)
    component.identifier = 'module.img'
    component.content = {
      imageHeight: 0,
      imageWidth: 0,
      imageSrc: '',
      mapName: '',
      map: [],
    } as any
    component.canvas = {
      nativeElement: {
        width: 100,
        height: 100,
        getContext: jest.fn(() => context),
        getBoundingClientRect: jest.fn(() => ({ top: 10, left: 20 })),
        scrollIntoView: jest.fn(),
      },
    } as any
    component.title = { filter: jest.fn(() => [{ nativeElement: { focus: jest.fn() } }]) } as any
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('initializes form, existing maps and emits changes', () => {
    const emit = jest.spyOn(component.data, 'emit')
    component.content = {
      imageHeight: 10,
      imageWidth: 20,
      imageSrc: 'image.png',
      mapName: 'map',
      map: [{ coords: [1, 2, 3, 4], alt: 'Alt', title: 'Title', link: 'link', target: '_blank' }],
    } as any

    component.ngOnInit()
    component.form.controls.mapName.setValue('updated')
    jest.advanceTimersByTime(101)

    expect(component.paths.length).toBe(1)
    expect(component.imageAvailable).toBe(true)
    expect(emit).toHaveBeenCalledWith({ content: component.form.value, isValid: true })
  })

  it('sets links and target values', () => {
    component.initializeForm()
    component.addImageMapToForm()

    component.setLinkValue(0, 'topic')
    component.selectionChange({ value: 'url' }, 0)
    expect(component.paths.at(0).get('link')?.value).toBe('./page/module#topic')
    expect(component.paths.at(0).get('target')?.value).toBe('_blank')

    component.selectionChange({ value: 'anchor' }, 0)
    expect(component.paths.at(0).get('target')?.value).toBe('_self')
  })

  it('clears and removes map entries while preserving one empty form', () => {
    component.initializeForm()
    component.addImageMapToForm({ coords: [1, 2, 3, 4] } as any)
    component.addImageMapToForm({ coords: [5, 6, 7, 8] } as any)
    component.clearImagMapForm()
    expect(component.paths.length).toBe(0)

    component.addImageMapToForm({ coords: [1, 2, 3, 4] } as any)
    component.removeButtonClick(0)
    expect(component.paths.length).toBe(1)
    expect(component.selectedRadio).toBe(0)
    expect(context.clearRect).toHaveBeenCalled()
    expect(context.strokeRect).not.toHaveBeenCalled()
  })

  it('validates upload type and size before calling upload service', () => {
    component.initializeForm()
    component.upload({ name: 'file.txt', type: 'text/plain', size: 1 } as File)
    expect(snackBar.openFromComponent).toHaveBeenCalled()
    expect(uploadService.upload).not.toHaveBeenCalled()

    snackBar.openFromComponent.mockClear()
    component.upload({ name: 'large.png', type: 'image/png', size: Number.MAX_SAFE_INTEGER } as File)
    expect(snackBar.openFromComponent).toHaveBeenCalled()
    expect(uploadService.upload).not.toHaveBeenCalled()
  })

  it('uploads image, sets form values and handles upload failure', () => {
    component.initializeForm()
    jest.spyOn(component, 'initializeCanvas').mockImplementation()
    jest.spyOn(component, 'addImageMapForm').mockImplementation()

    component.upload(new File(['x'], 'My Image.png', { type: 'image/png' }))

    expect(loader.changeLoad.next).toHaveBeenCalledWith(true)
    expect(uploadService.upload).toHaveBeenCalled()
    expect(component.form.controls.mapName.value).toBe('MyImage')
    expect(component.form.controls.imageSrc.value).toContain('assets%2Fimage.png')
    expect(snackBar.openFromComponent).toHaveBeenCalled()

    uploadService.upload.mockReturnValueOnce(throwError(() => new Error('fail')))
    component.upload(new File(['x'], 'image.png', { type: 'image/png' }))
    expect(loader.changeLoad.next).toHaveBeenCalledWith(false)
  })

  it('handles mouse drawing workflow and coordinates', () => {
    component.initializeForm()
    component.addImageMapToForm()
    component.enableMouseClick = true

    component.mouseDownEvent({ clientX: 30, clientY: 40, target: { style: {} } })
    component.mouseMoveEvent({ clientX: 50, clientY: 70, target: { style: {} } })
    component.mouseUpEvent({ clientX: 50, clientY: 70, target: { style: {} } })
    jest.advanceTimersByTime(401)

    expect(component.paths.at(0).get('coords')?.value).toEqual([10, 30, 30, 60])
    expect(context.strokeRect).toHaveBeenCalled()
  })

  it('detects shapes, handles drag state and right click', () => {
    component.initializeForm()
    component.addImageMapToForm({ coords: [30, 40, 10, 20] } as any)
    const event = { preventDefault: jest.fn(), stopPropagation: jest.fn(), clientX: 35, clientY: 45 }

    expect(component.isMouseInShape(20, 30, component.paths.value[0])).toBe(true)
    expect(component.isMouseInShape(100, 100, component.paths.value[0])).toBe(false)

    component.handleMouseDown(event)
    expect(component.selectedShapeIndex).toBe(0)
    expect(component.isDragging).toBe(true)

    component.handleMouseUp(event)
    expect(component.isDragging).toBe(false)
    component.isDragging = true
    component.mouseOutEvent(event)
    expect(component.isDragging).toBe(false)
    expect(component.onRightClick(event)).toBe(false)
  })

  it('draws filled maps and selected borders based on coordinates', () => {
    component.initializeForm()
    component.addImageMapToForm({ coords: [10, 20, 40, 60] } as any)

    component.drawAll(context)
    expect(context.fillRect).toHaveBeenCalledWith(10, 20, 30, 40)
    expect(component.checkCoordsValue(0)).toBe(true)
    component.drawOutsideBorder(0)
    expect(component.enableMouseClick).toBe(false)
    expect(context.strokeRect).toHaveBeenCalledWith(10, 20, 30, 40)

    component.clearImagMapForm()
    component.addImageMapToForm()
    component.drawOutsideBorder(0)
    expect(component.enableMouseClick).toBe(true)
  })

  it('adds a new image map form and clears previous drawing for multiple entries', () => {
    component.initializeForm()
    component.addImageMapForm()
    component.addImageMapForm()

    expect(component.paths.length).toBe(2)
    expect(component.selectedRadio).toBe(1)
    expect(component.enableMouseClick).toBe(true)
    expect(context.clearRect).toHaveBeenCalled()
  })
})
