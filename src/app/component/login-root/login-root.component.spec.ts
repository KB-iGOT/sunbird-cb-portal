
import { ComponentFactoryResolver } from '@angular/core';
import { LoginRootService } from './login-root.service';
import { LoginRootComponent } from './login-root.component';

describe('LoginRootComponent', () => {
    let component: LoginRootComponent;

    const componentFactoryResolver :Partial<ComponentFactoryResolver> ={};
	const loginRootSvc :Partial<LoginRootService> ={};

    beforeAll(() => {
        component = new LoginRootComponent(
            componentFactoryResolver as ComponentFactoryResolver,
			loginRootSvc as LoginRootService
        )
    });

    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });
            
    it('should create a instance of component', () => {
        expect(component).toBeTruthy();
    });
});