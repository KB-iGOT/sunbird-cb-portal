import { Component, OnDestroy, OnInit } from '@angular/core'

@Component({
  selector: 'ws-auth-base',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss'],
  standalone: false
})
export class BaseComponent implements OnInit, OnDestroy {
  ngOnInit() { }
  ngOnDestroy() { }
}
