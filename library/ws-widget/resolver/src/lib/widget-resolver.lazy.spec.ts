import { Component, ErrorHandler, Inject, InjectionToken, Input, NgModule } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { LoggerService } from '@sunbird-cb/utils-v2'
import { WidgetBaseComponent } from './widget-base.component'
import { WidgetResolverModule } from './widget-resolver.module'
import { NsWidgetResolver } from './widget-resolver.model'
import { WidgetResolverService } from './widget-resolver.service'

const FROM_WIDGET_MODULE = new InjectionToken<string>('provided by the lazy widget module')

@Component({
  selector: 'ws-test-eager-widget',
  template: '<span class="eager">eager:{{ widgetData }}</span>',
  standalone: false,
})
class EagerWidgetComponent extends WidgetBaseComponent implements NsWidgetResolver.IWidgetData<string> {
  @Input() widgetData = ''
}

@Component({
  selector: 'ws-test-lazy-widget',
  template: '<span class="lazy">lazy:{{ widgetData }}:{{ fromModule }}</span>',
  standalone: false,
})
class LazyWidgetComponent extends WidgetBaseComponent implements NsWidgetResolver.IWidgetData<string> {
  @Input() widgetData = ''
  constructor(@Inject(FROM_WIDGET_MODULE) public fromModule: string) {
    super()
  }
}

@NgModule({
  declarations: [LazyWidgetComponent],
  providers: [{ provide: FROM_WIDGET_MODULE, useValue: 'module-provider' }],
})
class LazyWidgetModule { }

@Component({
  selector: 'ws-test-host',
  template: '<ng-container [wsResolverWidget]="config"></ng-container>',
  standalone: false,
})
class HostComponent {
  config: NsWidgetResolver.IRenderConfigWithAnyData | null = null
}

function render(widgetSubType: string, widgetData: string): NsWidgetResolver.IRenderConfigWithAnyData {
  return { widgetType: 'test', widgetSubType, widgetData }
}

/** A loader whose promise the test settles by hand. */
function controllableLoader() {
  const calls: { resolve: (v: NsWidgetResolver.ILazyWidget) => void, reject: (e: any) => void }[] = []
  const load = jest.fn(() => new Promise<NsWidgetResolver.ILazyWidget>((resolve, reject) => calls.push({ resolve, reject })))
  return { load, calls }
}

describe('WidgetResolver lazy widgets', () => {
  let fixture: ComponentFixture<HostComponent>
  let errorHandler: { handleError: jest.Mock }
  let loader: ReturnType<typeof controllableLoader>

  const flush = async () => {
    // let the loader promise and the resolver's .then() callbacks run
    for (let i = 0; i < 5; i += 1) {
      await Promise.resolve()
    }
    fixture.detectChanges()
  }
  const text = () => (fixture.nativeElement as HTMLElement).textContent!.trim()

  beforeEach(() => {
    loader = controllableLoader()
    errorHandler = { handleError: jest.fn() }
    TestBed.configureTestingModule({
      declarations: [HostComponent, EagerWidgetComponent],
      imports: [
        WidgetResolverModule.forRoot([
          { widgetType: 'test', widgetSubType: 'eager', component: EagerWidgetComponent },
          { widgetType: 'test', widgetSubType: 'lazy', loadComponent: loader.load },
        ]),
      ],
      providers: [
        { provide: LoggerService, useValue: { error: jest.fn(), log: jest.fn() } },
        { provide: ErrorHandler, useValue: errorHandler },
      ],
    })
    TestBed.inject(WidgetResolverService).initialize(null, null, null, null)
    fixture = TestBed.createComponent(HostComponent)
  })

  it('renders a `component` widget synchronously, as before', () => {
    fixture.componentInstance.config = render('eager', 'a')
    fixture.detectChanges()
    expect(text()).toBe('eager:a')
    expect(loader.load).not.toHaveBeenCalled()
  })

  it('renders a `loadComponent` widget once it loads, with its NgModule providers', async () => {
    fixture.componentInstance.config = render('lazy', 'a')
    fixture.detectChanges()
    expect(text()).toBe('')

    loader.calls[0].resolve({ ngModule: LazyWidgetModule, component: LazyWidgetComponent })
    await flush()
    expect(text()).toBe('lazy:a:module-provider')
  })

  it('loads each lazy widget type once, however many times it renders', async () => {
    fixture.componentInstance.config = render('lazy', 'a')
    fixture.detectChanges()
    loader.calls[0].resolve({ ngModule: LazyWidgetModule, component: LazyWidgetComponent })
    await flush()

    fixture.componentInstance.config = render('lazy', 'b')
    fixture.detectChanges()
    await flush()
    expect(text()).toBe('lazy:b:module-provider')
    expect(loader.load).toHaveBeenCalledTimes(1)
  })

  it('drops a lazy widget that finishes loading after the input moved on', async () => {
    fixture.componentInstance.config = render('lazy', 'stale')
    fixture.detectChanges()
    fixture.componentInstance.config = render('eager', 'current')
    fixture.detectChanges()
    expect(text()).toBe('eager:current')

    loader.calls[0].resolve({ ngModule: LazyWidgetModule, component: LazyWidgetComponent })
    await flush()
    expect(text()).toBe('eager:current')
  })

  it('reports a failed load to the ErrorHandler and retries on the next render', async () => {
    const failure = new Error('Failed to fetch dynamically imported module: chunk-X.js')
    fixture.componentInstance.config = render('lazy', 'a')
    fixture.detectChanges()
    loader.calls[0].reject(failure)
    await flush()
    expect(errorHandler.handleError).toHaveBeenCalledWith(failure)
    expect(text()).toBe('')

    fixture.componentInstance.config = render('lazy', 'b')
    fixture.detectChanges()
    expect(loader.load).toHaveBeenCalledTimes(2)
    loader.calls[1].resolve({ ngModule: LazyWidgetModule, component: LazyWidgetComponent })
    await flush()
    expect(text()).toBe('lazy:b:module-provider')
  })
})
