import { LoginRootComponent } from './login-root.component';
import { LoginRootService } from './login-root.service';
import { ComponentFactoryResolver } from '@angular/core';
import { LoginRootDirective } from './login-root.directive';

describe('LoginRootComponent', () => {
  let component: LoginRootComponent;
  let componentFactoryResolver: ComponentFactoryResolver;
  let loginRootSvc: LoginRootService;
  let wsLoginRoot: LoginRootDirective;

  beforeEach(() => {
    // Mock dependencies
    componentFactoryResolver = {
      resolveComponentFactory: jest.fn(),
    } as any;

    loginRootSvc = {
      getComponent: jest.fn(),
    } as any;

    wsLoginRoot = {
      viewContainerRef: {
        clear: jest.fn(),
        createComponent: jest.fn(),
      },
    } as any;

    // Create the component instance
    component = new LoginRootComponent(componentFactoryResolver, loginRootSvc);
    component.wsLoginRoot = wsLoginRoot;
  });

  it('should create the LoginRootComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadComponent on ngOnInit', () => {
    const loadComponentSpy = jest.spyOn(component, 'loadComponent');
    component.ngOnInit();
    expect(loadComponentSpy).toHaveBeenCalled();
  });

  it('should call loadComponent when manually invoked', () => {
    const componentMock = { component: 'mock' };
   // loginRootSvc.getComponent.mockReturnValue(componentMock);

    const resolveComponentFactoryMock = jest.fn();
    resolveComponentFactoryMock.mockReturnValue({});

    // Test loadComponent directly
    component.loadComponent();

    expect(componentFactoryResolver.resolveComponentFactory).toHaveBeenCalledWith(componentMock);
    expect(wsLoginRoot.viewContainerRef.clear).toHaveBeenCalled();
    expect(wsLoginRoot.viewContainerRef.createComponent).toHaveBeenCalled();
  });
});
