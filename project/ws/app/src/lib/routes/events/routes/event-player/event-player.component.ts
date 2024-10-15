import { Component, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { MatDialog } from '@angular/material/dialog'
/* tslint:disable */
import _ from 'lodash'
import moment from 'moment'
import { EventService } from '../../services/events.service'
import { TranslateService } from '@ngx-translate/core'
import { MultilingualTranslationsService } from '@sunbird-cb/utils-v2'

@Component({
  selector: 'ws-app-event-player',
  templateUrl: './event-player.component.html',
  styleUrls: ['./event-player.component.scss']
})
export class EventPlayerComponent implements OnInit {
  similarPosts!: any
  defaultError = 'Something went wrong, Please try again after sometime!'
  eventId!: any
  fetchSingleCategoryLoader = false
  eventData: any
  currentEvent = false
  pastEvent = false
  videoId = ''
  constructor(
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private eventSvc: EventService,
    private translate: TranslateService,
    private langtranslations: MultilingualTranslationsService,
    // private discussService: DiscussService,
    // private snackBar: MatSnackBar,
  ) {
    if (localStorage.getItem('websiteLanguage')) {
      this.translate.setDefaultLang('en')
      const lang = localStorage.getItem('websiteLanguage')!
      this.translate.use(lang)
    }
    this.langtranslations.languageSelectedObservable.subscribe(() => {
      if (localStorage.getItem('websiteLanguage')) {
        this.translate.setDefaultLang('en')
        const lang = localStorage.getItem('websiteLanguage')!
        this.translate.use(lang)
      }
    })
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      
      this.eventId = params.eventId
     
      // if (this.fetchNewData) {
      //   this.getTIDData()
      // }
      // this.data = this.route.snapshot.data.topic.data
    })
    this.eventSvc.getEventData(this.eventId).subscribe((data: any) => {
      this.eventData = data.result.event
      const creatordata = this.eventData.creatorDetails
      const str = creatordata.replace(/\\/g, '')
      if (str.length > 0) {
        this.eventData.creatorDetails = JSON.parse(str)
      }
      const eventDate = this.customDateFormat(this.eventData.startDate, this.eventData.startTime)
      const eventendDate = this.customDateFormat(this.eventData.endDate, this.eventData.endTime)
      // const isToday = this.compareDate(eventDate, eventendDate, this.eventData)
      // if (isToday) {
      //   this.currentEvent = true
      // }
      const sDate = this.customDateFormat(this.eventData.startDate, this.eventData.startTime)
      const eDate = this.customDateFormat(this.eventData.endDate, this.eventData.endTime)
      const msDate = Math.floor(moment(sDate).valueOf() / 1000)
      const meDate = Math.floor(moment(eDate).valueOf() / 1000)
      const cDate = Math.floor(moment(new Date()).valueOf() / 1000)
      if (cDate >= msDate && cDate <= meDate) {
        this.currentEvent = true
      }
      const now = new Date()
      const today = moment(now).format('YYYY-MM-DD HH:mm')

      if (eventDate < today && eventendDate < today) {
        this.pastEvent = true
      }
    })
  }

  customDateFormat(date: any, time: any) {
    const stime = time.split('+')[0]
    const hour = stime.substr(0, 2)
    const min = stime.substr(2, 3)
    return `${date} ${hour}${min}`
  }

}