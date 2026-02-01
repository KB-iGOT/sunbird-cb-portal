import { Component, OnInit, Input, Inject } from '@angular/core'
import { BrowseCompetencyService } from '../../services/browse-competency.service'
import { ConfigurationsService } from '@sunbird-cb/utils-v2'
import { NsContent } from '../../../_services/widget-content.model'

@Component({
  selector: 'ws-app-competency-card',
  templateUrl: './competency-card.component.html',
  styleUrls: ['./competency-card.component.scss'],
  standalone: false
})
export class CompetencyCardComponent implements OnInit {
  @Input() competency!: any
  @Input() stateData: any
  public displayLoader = false

  searchReq: any = {}
  compentencyKey!: NsContent.ICompentencyKeys

  constructor(
    @Inject('environment') private environment: any,
    private browseCompServ: BrowseCompetencyService,
    private configService: ConfigurationsService

  ) { }

  ngOnInit() {
    this.compentencyKey = this.configService.compentency[this.environment.compentencyVersionKey]

    this.competency.viewChildren = false
    this.searchReq = {
      request: {
        filters: {
          primaryCategory: [
            'Course',
            'Program',
          ],
          status: [
            'Live',
          ],
          [`${this.compentencyKey.vKey}.${this.compentencyKey.vCompetencySubTheme}`]: [''],
        },
        query: '',
        sort_by: {
          lastUpdatedOn: '',
        },
        fields: [],
        limit: 3,
        offset: 0,
        facets: [
          'primaryCategory',
          'mimeType',
          'source',
          `${this.compentencyKey.vKey}.${this.compentencyKey.vCompetencySubTheme}`,
          // `${this.compentencyKey.vKey}.competencyType`,
          // 'taxonomyPaths_v2.name',
        ],
      },
    }
  }

  getCbps(viewChildren: boolean) {
    if (viewChildren) {
      this.displayLoader = true
      this.searchReq.request.filters[`${this.compentencyKey.vKey}.${this.compentencyKey.vCompetencySubTheme}`]
        .splice(0, 1, this.competency.name)
      this.browseCompServ.fetchSearchData(this.searchReq).subscribe(
        (res: any) => {
          this.displayLoader = false
          if (res && res.result && res.result && res.result.content) {
            this.competency.contentData = res.result.content
          }
        },
        _err => this.displayLoader = false,
        () => this.displayLoader = false
      )
    }
  }
}
