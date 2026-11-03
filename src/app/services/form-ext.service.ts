import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { FormConfigService } from '@sunbird-cb/consumption'
import { Observable, of } from 'rxjs'
import { catchError, map } from 'rxjs/operators'

const API_END_POINTS = {
  FORM_READ: '/apis/v1/form/read',
}
@Injectable({
  providedIn: 'root',
})
export class FormExtService {

  constructor(
    private http: HttpClient,
    public configSvc: ConfigurationsService,
    private formConfigSvc: FormConfigService,
  ) {

  }

  formReadData(request: any): Observable<any> {
    return this.http.post<any>(API_END_POINTS.FORM_READ, request)
  }

  homeFormReadData(request: any): Observable<any> {
    return this.formReadData(request).pipe(
      map((rData: any) => {
        const finalData = rData && rData.result.form.data
        return (finalData)
      }),
      catchError((_error: any) => {
        const baseUrl = this.configSvc.sitePath
        return this.http.get(`${baseUrl}/page/home.json`).pipe(
          map(data => (data)),
          catchError(err => of({ data: null, error: err })),
        )
      }
      ),
      )
  }


  // form is picked on the client from the user read response, then read by id
  formConfigReadData(request: any): Observable<any> {
    const { portal, subType, clientVersion } = request.request
    return this.formConfigSvc.getForm(this.configSvc.unMappedUser, portal || 'portal', subType, clientVersion || 1)
  }
}
