import { Component, ViewChild, Input } from '@angular/core'
import { TFetchStatus } from '@sunbird-cb/utils-v2'

import { NSSearch } from '../../_services/widget-search.model'
import { MatMenu, MatMenuTrigger } from '@angular/material/menu'

@Component({
  selector: 'ws-widget-tree-catalog-menu',
  templateUrl: './tree-catalog-menu.component.html',
  styleUrls: ['./tree-catalog-menu.component.scss'],
  standalone: false
})
export class TreeCatalogMenuComponent {

  @ViewChild('childMenu', { static: true, read: MatMenu })
  public childMenu!: MatMenu
  @Input() rootTrigger: MatMenuTrigger | null = null
  @Input() catalogItems: NSSearch.IFilterUnitContent[] | null = null
  @Input() fetchStatus: TFetchStatus = 'none'
  @Input() isRoot = false

}
