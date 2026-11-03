import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ConfigurationsService } from '@sunbird-cb/utils-v2';
import { FormConfigService } from '@sunbird-cb/consumption';

// only the DI token is needed; loading the real library pulls in its whole dependency tree
jest.mock('@sunbird-cb/consumption', () => ({ FormConfigService: class { } }));
import { of, throwError } from 'rxjs';

import { FormConfigResolverService } from './form-config-resolver.service';

describe('FormConfigResolverService', () => {
  let service: FormConfigResolverService;
  let httpMock: HttpTestingController;
  const user = { roles: ['PUBLIC'] };
  const mockConfigSvc = { unMappedUser: user, sitePath: 'assets/configurations' };
  const mockFormConfigSvc = { getForm: jest.fn() };
  const route: any = { data: { pageKey: 'profile-v2', pageSubtype: 'profile', pageType: 'feature' } };

  beforeEach(() => {
    mockFormConfigSvc.getForm.mockReset();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ConfigurationsService, useValue: mockConfigSvc },
        { provide: FormConfigService, useValue: mockFormConfigSvc },
      ],
    });
    service = TestBed.inject(FormConfigResolverService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('picks the form for the current user and route subtype', done => {
    mockFormConfigSvc.getForm.mockReturnValue(of({ result: { data: { sections: [] } } }));
    service.resolve(route, {} as any).subscribe(res => {
      expect(mockFormConfigSvc.getForm).toHaveBeenCalledWith(user, 'portal', 'profile', 1);
      expect(res).toEqual({ data: { sections: [] }, error: null });
      done();
    });
  });

  it('falls back to the local page json when no form is found', done => {
    mockFormConfigSvc.getForm.mockReturnValue(throwError(() => new Error('No form config found')));
    service.resolve(route, {} as any).subscribe(res => {
      expect(res).toEqual({ data: { local: true }, error: null });
      done();
    });
    httpMock.expectOne('assets/configurations/feature/profile-v2.json').flush({ local: true });
  });
});
