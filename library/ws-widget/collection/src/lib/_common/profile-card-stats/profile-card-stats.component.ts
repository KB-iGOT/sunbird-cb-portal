import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { Router } from '@angular/router'
import {
  ConfigurationsService, MultilingualTranslationsService,
  EventService, WsEvents, PipeDurationTransformPipe,
  DomainConfService
} from '@sunbird-cb/utils-v2'
import { InfoDialogComponent } from '../info-dialog/info-dialog.component'
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { HomePageService } from 'src/app/services/home-page.service'
import { PrfileEditV2Component } from '../../../../../../../project/ws/app/src/lib/routes/profile-v2/revamp-dialogs/prfile-edit-v2/prfile-edit-v2.component'
import { ProfileV2RevampService } from '../../../../../../../project/ws/app/src/lib/routes/profile-v2/services/profile-v2-revamp.service'
import * as _ from 'lodash'
import { HttpErrorResponse } from '@angular/common/http'
import { MatLegacySnackBar } from '@angular/material/legacy-snack-bar'
@Component({
  selector: 'ws-widget-profile-card-stats',
  templateUrl: './profile-card-stats.component.html',
  styleUrls: ['./profile-card-stats.component.scss'],
  providers: [PipeDurationTransformPipe],
})
export class ProfileCardStatsComponent implements OnInit {
  @Input() isLoading = false
  @Input() displayStats = false
  @Input() insightsData: any
  @Input() nudgeData: any
  @Input() profileData: any
  @Input() isMobile: any = false
  @Input() hideCollapsible: any = false

  @Output() expandCollapse = new EventEmitter<any>()
  @Output() activity = new EventEmitter<any>()
  collapsed = false
  userInfo: any
  countdata: any
  eventcountdata: any
  mergedCountData: any
  enrollInterval: any
  showrepublicBanner: any = false
  republicDayData: any = {}
  interval = 0
  profileDelay = 0
  userName = ''
  userFullName = ''
  currentUserRank: any
  currentUserId: any
  profileNudgeUsername = ''
  primaryDetails: any
  profileImageUrl = '';
  profesionalDetails: any
  constructor(private configSvc: ConfigurationsService,
    private router: Router,
    private pipDuration: PipeDurationTransformPipe,
    private langtranslations: MultilingualTranslationsService,
    private homePageSvc: HomePageService,
    private eventService: EventService,
    public domainConfService: DomainConfService,
    private profileV2RevampSvc: ProfileV2RevampService,
    private snackBar: MatLegacySnackBar,
    private dialog: MatDialog) { }

  ngOnInit() {
    this.userInfo = this.configSvc && this.configSvc.userProfile
    this.currentUserId = this.configSvc.unMappedUser.id
    if (this.userInfo) {
      this.userFullName = this.userInfo.firstName
      if (this.userFullName && this.userFullName.length > 18) {
        this.userFullName = `${this.userInfo.firstName.slice(0, 18)}...`
      }
    }
    this.enrollInterval = setInterval(() => {
      this.getCounts()
    }, 1000)
    // this.getCounts()
    const progress = (247 - ((247 * this.userInfo.profileUpdateCompletion) / 100))
    document.documentElement.style.setProperty('--i', String(progress))
    if (this.configSvc.profileTimelyNudges.enable) {
      this.profileDelay = this.configSvc.profileTimelyNudges.profileDelayInSec
    }
    this.showrepublicBanner = false
    this.getTimelyNudge()
    const pDelayTime = this.profileDelay * 1000
    setTimeout(() => {

      // this.getTimelyNudge()
      if (this.domainConfService?.isFeatureByPageEnabled('home', 'profileGreetings')) {
        this.showrepublicBanner = true
      }
    }, pDelayTime)
    const timeInterval = this.configSvc.profileTimelyNudges.nudgeDelayInSec
    setTimeout(() => {
      this.showrepublicBanner = false
    }, ((1000 * timeInterval) + pDelayTime))

    this.homePageSvc.getLearnerLeaderboard().subscribe((res: any) => {
      if (res && res.result && res.result.result) {
        this.currentUserRank = res.result.result.find((rankDetails: any) => rankDetails.userId === this.currentUserId)
      }
    })
    this.profileV2RevampSvc.showUpdatePofileNameAndPic.subscribe((res) => {
      if (res) {
        this.fetchProfileDetails()
      }
    })
    this.fetchAndMergeData()


  }
  getTimelyNudge() {
    if (this.configSvc.profileTimelyNudges.enable) {
      const rand = Math.round(Math.random() * 4)
      const currentDate = new Date()
      // const timeInterval = this.configSvc.profileTimelyNudges.nudgeDelayInSec
      const hours = currentDate.getHours()
      const defaultData = this.configSvc.profileTimelyNudges.data[this.configSvc.profileTimelyNudges.data.length - 1]
      if (defaultData) {
        this.republicDayData['backgroupImage'] = defaultData.backgroupImage
        this.republicDayData['info'] = defaultData['webInfo'][rand]
        this.republicDayData['centerImage'] = defaultData['centerImage'][rand]
        this.republicDayData['textColor'] = defaultData['textColor']
        this.userName = this.userInfo.firstName
        if (this.userName) {
          const userNameFW = this.userName.split(' ')
          if (userNameFW && userNameFW.length && userNameFW[0] && userNameFW[0].length > 2) {
            this.userName = `${userNameFW[0]}`
          }
          if (this.userName.length > 18) {
            this.userName = `${this.userInfo.firstName.slice(0, 18)}...`
          }
          this.republicDayData['greet'] = defaultData['webGreet']
        }

        // this.showrepublicBanner = true
        // setTimeout(() => {
        //   this.showrepublicBanner = false
        // },         (1000 * timeInterval))
      }
      this.configSvc.profileTimelyNudges.data.filter((data: any) => {
        if (hours >= data.startTime && hours < data.endTime) {
          this.republicDayData['backgroupImage'] = data.backgroupImage
          this.republicDayData['info'] = data['webInfo'][rand]
          this.republicDayData['centerImage'] = data['centerImage'][rand]
          this.republicDayData['textColor'] = data['textColor']
          // let userName = this.userInfo.firstName
          // if (userName.length > 18) {
          //   userName = `${this.userInfo.firstName.slice(0, 18)}...`
          // }
          // this.republicDayData['greet'] = data['greet'].replace('<userName>', userName)
          this.userName = this.userInfo.firstName
          if (this.userName) {
            const userNameFW = this.userName.split(' ')
            if (userNameFW && userNameFW.length && userNameFW[0] && userNameFW[0].length > 2) {
              this.userName = `${userNameFW[0]}`
            }
            if (this.userName.length > 18) {
              this.userName = `${this.userInfo.firstName.slice(0, 18)}...`
            }
            this.republicDayData['greet'] = data['webGreet']
          }

          // let userName = this.userInfo.firstName
          // if (userName.length > 18) {
          //   userName = `${this.userInfo.firstName.slice(0, 18)}...`
          // }
          // this.republicDayData['greet'] = data['greet'].replace('<userName>', userName)
          // this.showrepublicBanner = true
        }
        // setTimeout(() => {
        //   this.showrepublicBanner = false
        // },         (1000 * timeInterval))
      })
    }
  }

  getCounts() {
    let enrollList: any
    if (localStorage.getItem('userEnrollmentCount')) {
      enrollList = JSON.parse(localStorage.getItem('userEnrollmentCount') || '')
      clearInterval(this.enrollInterval)
    }

    this.countdata = {
      certificate: 0,
      inProgress: 0,
      learningHours: 0,
    }
    if (enrollList && enrollList.userCourseEnrolmentInfo) {
      this.countdata = {
        certificate: enrollList.userCourseEnrolmentInfo.certificatesIssued,
        inProgress: enrollList.userCourseEnrolmentInfo.coursesInProgress,
        karmaPoints: enrollList.userCourseEnrolmentInfo.karmaPoints,
        badgeCount: enrollList.userCourseEnrolmentInfo.badgeCount,
        learningHours: enrollList.userCourseEnrolmentInfo.timeSpentOnCompletedCourses,
      }
    }
  }
  async getEventEnrollData(): Promise<void> {
    try {
      const res: any = await this.homePageSvc.geteventsHoursData().toPromise()
      const resdata = res?.result?.userEventEnrolmentInfo || {}
      this.eventcountdata = {
        certificate: resdata.eventsAttended ?? 0,
        inProgress: (resdata.eventsEnrolled ?? 0) - (resdata.eventsAttended ?? 0),
        learningHours: resdata.hoursSpentOnEvents ?? 0,
      }
    } catch (error) {
      /* tslint:disable */
      console.error('Error fetching event data:', error)
      this.eventcountdata = { certificate: 0, inProgress: 0, learningHours: 0 }
    }
  }

  mergeCounts(): void {
    this.mergedCountData = {
      certificate: (this.countdata?.certificate ?? 0) + (this.eventcountdata?.certificate ?? 0),
      inProgress: (this.countdata?.inProgress ?? 0) + (this.eventcountdata?.inProgress ?? 0),
      learningHours: this.pipDuration.transform(
        (parseFloat(this.countdata?.learningHours) || 0) + (parseFloat(this.eventcountdata?.learningHours) || 0),
        'hms'
      ),
    }
  }
  async fetchAndMergeData(): Promise<void> {
    await this.getEventEnrollData()
    await this.getCounts()
    this.mergeCounts()
  }

  gotoUserProfile() {
    // this.router.navigate(['/app/person-profile/me'])
    this.eventService.raiseInteractTelemetry(
      {
        type: WsEvents.EnumInteractTypes.CLICK,
        subType: WsEvents.EnumInteractSubTypes.PROFILE,
        id: 'profile-icon',
      },
      {},
      {
        module: WsEvents.EnumTelemetrymodules.HOME,
      }
    )
    if (!(this.domainConfService?.isFeatureByPageEnabled('home', 'profileCompletionPercentage'))) {
      this.navigateToProfile('Profile')
    } else {
      this.router.navigate(['/app/person-profile/me'])
    }
  }

  navigateToProfile(header: string): void {
    // this.router.navigate(['/app/person-profile', 'me'])
    console.log(this.configSvc.userProfile)
    let data = this.configSvc.userProfile
    this.profesionalDetails = _.merge(_.get(data, 'profiledetails', _.get(data, 'profileDetails', _.get(data, 'profile.data', {}))), {
      professionalDetails: _.get(data, 'professionalDetails', {})
    })
    // this.profileData = _.get(data, 'firstName', '')
    this.profesionalDetails['userId'] = _.get(data, 'userId', '')

    this.profileImageUrl = _.get(data, 'profileImageUrl', '')

    this.primaryDetails = {
      firstname: this.configSvc.userProfile?.firstName
    }

    const dialogDetails: any = {
      header: header,
      profileDetails: this.primaryDetails,
    }
    if (header === 'Profile') {
      dialogDetails.profileDetails = {
        profileImage: this.profileImageUrl,
        firstname: _.get(this.primaryDetails, 'firstname', ''),
      }
    }

    // For mandatorySection, wrap dialogDetails and include approval fields
    let dialogData: any

    dialogData = dialogDetails

    const dialogRef = this.dialog.open(PrfileEditV2Component, {
      data: dialogData,
      disableClose: true,
      panelClass: 'dialog_sidenav',
      autoFocus: false,
      width: "400px"
    })

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.generateBasicProfileFormBody(result)
      }
    })

  }

  fetchProfileDetails() {
    let userId: any = this.configSvc.userProfile?.userId
    this.profileV2RevampSvc.fetchUserProfile(userId).subscribe({
      next: (response: any) => {
        if (response) {
          console.log('response--', response)
          this.profesionalDetails = _.get(response, 'result.response.profiledetails', _.get(response, 'result.response.profileDetails', _.get(response, 'result', {})))
          // this.userName = `${this.configSvc.userProfile.firstName || ''} ${this.configSvc.userProfile.lastName || ''}`.trim()
          let userPidProfile = response?.result?.response
          this.configSvc.unMappedUser = userPidProfile
          const profileV2 = _.get(userPidProfile, 'profileDetails')
          this.configSvc.userProfile = {
            country: _.get(profileV2, 'personalDetails.countryCode') || null,
            email: _.get(profileV2, 'profileDetails.officialEmail') || userPidProfile.email,
            givenName: userPidProfile.firstName,
            userId: userPidProfile.userId,
            firstName: userPidProfile.firstName,
            lastName: userPidProfile.lastName,
            rootOrgId: userPidProfile.rootOrgId,
            rootOrgName: userPidProfile.channel,
            // tslint:disable-next-line: max-line-length
            // userName: `${userPidProfile.firstName ? userPidProfile.firstName : ' '}${userPidProfile.lastName ? userPidProfile.lastName : ' '}`,
            userName: userPidProfile.userName,
            profileImage: userPidProfile.thumbnail,
            departmentName: userPidProfile.channel,
            dealerCode: null,
            isManager: false,
            profileUpdateCompletion: _.get(userPidProfile, 'profileUpdateCompletion') || 0,
            profileImageUrl: _.get(userPidProfile, 'profileDetails.profileImageUrl') || '',
            professionalDetails: _.get(userPidProfile, 'profileDetails.professionalDetails') || [],
            userRootOrg: _.get(userPidProfile, 'rootOrg') || null
          }
          console.log('this.configSvc.userProfile=--', this.configSvc.userProfile)

          this.configSvc.userProfileV2 = {
            userId: _.get(profileV2, 'userId') || userPidProfile.userId,
            email: _.get(profileV2, 'personalDetails.officialEmail') || userPidProfile.email,
            firstName: _.get(profileV2, 'personalDetails.firstname') || userPidProfile.firstName,
            surName: _.get(profileV2, 'personalDetails.surname') || userPidProfile.lastName,
            middleName: _.get(profileV2, 'personalDetails.middlename') || '',
            departmentName: _.get(profileV2, 'employmentDetails.departmentName') || userPidProfile.channel,
            givenName: _.get(userPidProfile, 'userName'),
            // tslint:disable-next-line: max-line-length
            userName: `${_.get(profileV2, 'personalDetails.firstname') ? _.get(profileV2, 'personalDetails.firstname') : ''}${_.get(profileV2, 'personalDetails.surname') ? _.get(profileV2, 'personalDetails.surname') : ''}`,
            profileImage: _.get(profileV2, 'photo') || userPidProfile.thumbnail,
            profileImageUrl: _.get(userPidProfile, 'profileDetails.profileImageUrl') || '',
            dealerCode: null,
            isManager: false,
            competencies: _.get(profileV2, 'competencies') || [],
            desiredCompetencies: _.get(profileV2, 'desiredCompetencies') || [],
            systemTopics: _.get(profileV2, 'systemTopics') || [],
            desiredTopics: _.get(profileV2, 'desiredTopics') || [],
            userRoles: _.get(profileV2, 'userRoles') || [],
            webPortalLang: _.get(profileV2, 'additionalProperties.webPortalLang') || '',
          }

          this.userFullName = `${this.configSvc.userProfile.firstName || ''}`
        }
      },
      error: (error: HttpErrorResponse) => {
        if (error) {
          this.openSnackbar('Something went wrong please try again')
        }
      }
    })
  }

  generateBasicProfileFormBody(result: any): any {
    if (result) {
      const formBody: any = {
        request: {
          userId: this.configSvc.userProfile?.userId,
          profileDetails: {}
        }
      }

      // Define field mappings with their paths in the API response and form body
      const fieldMappings: {
        formField: string,
        resultPath: string,
        formBodyPath: string,
        isCader?: boolean
      }[] = [
          {
            formField: 'profileImageUrl',
            resultPath: 'profileImageUrl',
            formBodyPath: 'profileDetails.profileImageUrl'
          },
          {
            formField: 'firstname',
            resultPath: 'firstname',
            formBodyPath: 'profileDetails.personalDetails.firstname'
          }
        ]

      let hasChanges = false

      // Compare each field and add to form body if changed
      fieldMappings.forEach(mapping => {
        const currentValue = _.get(result, mapping.resultPath, null)
        let formValue = this.primaryDetails[mapping.formField]
        if ((
          (formValue !== currentValue && currentValue !== null) &&
          (
            (formValue === 'NA' && currentValue !== '') ||
            formValue !== 'NA'
          )
        )
          || mapping.isCader
        ) {
          const pathParts = mapping.formBodyPath.split('.')
          let current = formBody.request

          for (let i = 0; i < pathParts.length - 1; i++) {
            const part = pathParts[i]
            if (part.includes('[0]')) {
              const arrayKey = part.replace('[0]', '')
              if (!current[arrayKey]) current[arrayKey] = [{}]
              current = current[arrayKey][0]
            } else {
              if (!current[part]) current[part] = {}
              current = current[part]
            }
          }

          // Set the final value
          const finalKey = pathParts[pathParts.length - 1]
          current[finalKey] = currentValue
          hasChanges = true
        }
      })

      if (hasChanges) {
        this.updateProfileDetails(formBody)
      }
    }
  }

  updateProfileDetails(formBody: any) {
    this.profileV2RevampSvc.updateProfileDetailsV3(formBody).subscribe({
      next: (response: any) => {
        if (response) {
          this.fetchProfileDetails()


          this.openSnackbar('Updated Successfully')
        }
      },
      error: (error: HttpErrorResponse) => {
        if (error) {
          const errorMessage = this.getErrorMessage(error)
          this.openSnackbar(errorMessage)
        }
      }
    })
  }

  getErrorMessage(error: HttpErrorResponse): string {
    const errorMsg = _.get(error, 'error.params.errmsg', '') || _.get(error, 'error.message', '')
    // Return specific error message if available, otherwise return generic message
    return errorMsg || 'Something went wrong please try again'
  }

  private openSnackbar(primaryMsg: string, duration: number = 5000) {
    this.snackBar.open(primaryMsg, 'X', {
      duration,
    })
  }

  toggle() {
    this.collapsed = !this.collapsed
    this.expandCollapse.emit(this.collapsed)
  }

  myActivity() {
    this.activity.emit(true)
  }

  translateLabels(label: string, type: any) {
    return this.langtranslations.translateActualLabel(label, type, '')
  }

  openInfo(myDialog: any) {
    const confirmDialog = this.dialog.open(InfoDialogComponent, {
      width: '613px',
      panelClass: 'custom-info-dialog',
      backdropClass: 'info-dialog-backdrop',
      data: { template: myDialog },
    })
    confirmDialog.afterClosed().subscribe((result: any) => {
      if (result) {
      }
    })
  }

  redirectTo(name: string) {
    this.router.navigateByUrl(`app / person - profile / me ? tab = 1#${name} `)
  }

  showMyActivities(): void {
    const element = document.getElementById('user-leaderboard')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  showWeeklyClapsSection() {
    const element = document.getElementById('weekly-wrapper')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  redirectToContent(stats: any) {
    if (stats?.key === 'karmaPoints') {
      this.router.navigate(['/app/person-profile/karma-points'])
    } else {
      this.router.navigate(['/app/seeAll/new'], { queryParams: { key: 'continueLearning' } })
    }
  }
}
