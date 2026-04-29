import { HandsOnDialogComponent } from './hands-on-dialog.component'

function buildComponent(data = 'Test lab URL') {
  const dialogRef: any = { close: jest.fn() }
  const comp = new HandsOnDialogComponent(dialogRef, data)
  return { comp, dialogRef }
}

describe('HandsOnDialogComponent', () => {
  it('should create', () => {
    const { comp } = buildComponent()
    expect(comp).toBeTruthy()
  })

  it('should store injected data', () => {
    const { comp } = buildComponent('http://lab.example.com')
    expect(comp.data).toBe('http://lab.example.com')
  })

  it('ngOnInit should not throw', () => {
    const { comp } = buildComponent()
    expect(() => comp.ngOnInit()).not.toThrow()
  })

  it('submit should close dialog with submit string', () => {
    const { comp, dialogRef } = buildComponent()
    comp.submit()
    expect(dialogRef.close).toHaveBeenCalledWith('submit')
  })

  it('close should close dialog without argument', () => {
    const { comp, dialogRef } = buildComponent()
    comp.close()
    expect(dialogRef.close).toHaveBeenCalledWith()
  })

  it('should have dialogRef set', () => {
    const dialogRef: any = { close: jest.fn() }
    const comp = new HandsOnDialogComponent(dialogRef, 'data')
    expect(comp.dialogRef).toBe(dialogRef)
  })

  it('submit and close call dialogRef.close independently', () => {
    const { comp, dialogRef } = buildComponent()
    comp.submit()
    comp.close()
    expect(dialogRef.close).toHaveBeenCalledTimes(2)
  })
})
