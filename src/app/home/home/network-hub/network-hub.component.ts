import { Component, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ConfigurationsService } from '@sunbird-cb/utils'
import { MatSnackBar } from '@angular/material';

import { HomePageService } from 'src/app/services/home-page.service';

@Component({
  selector: 'ws-network-hub',
  templateUrl: './network-hub.component.html',
  styleUrls: ['./network-hub.component.scss']
})

export class NetworkHubComponent implements OnInit {

  networkRecommended: any[] = [];
  userInfo: any;
  suggestionsLoader: any;
  recentRequests = {
    data: undefined,
    error: false,
    loadSkeleton: false,
  }

  constructor(
    private configService: ConfigurationsService,
    private homePageService: HomePageService,
    private matSnackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.userInfo =  this.configService && this.configService.userProfile;
    console.log("this.userInfo - ", this.userInfo);
    this.fetchNetworkRecommendations();
    this.fetchRecentRequests();
  }

  fetchNetworkRecommendations(): void {
    const payload = {
      "size" : 2,
      "offset": 0,
      "search":[
        {
          "field": "employmentDetails.departmentName",
          "values": [this.userInfo.departmentName]
        }
      ]
    };

    this.suggestionsLoader = true;
    this.homePageService.getNetworkRecommendations(payload).subscribe(
      (res: any) => {
        this.suggestionsLoader = false;
        this.networkRecommended = res.result.data[0].results;
        if (this.networkRecommended.length) {
          this.networkRecommended = this.networkRecommended.map((obj: any) => {
            obj.fullName = this.createInititals(obj.personalDetails.firstname);
            obj.connecting = false;
            return obj;
          });
          console.log('this.networkRecommended',this.networkRecommended);
        }
      }
    );
    
  }

  fetchRecentRequests(): void {
    this.recentRequests.loadSkeleton = true;
    this.homePageService.getRecentRequests().subscribe(
      (res: any) => {
        console.log("res - ", res);
        this.recentRequests.loadSkeleton = false;
        this.recentRequests.data = res.result.data && res.result.data.map((elem: any) => {
          elem.fullName = elem.fullName.charAt(0).toUpperCase() + elem.fullName.slice(1)
          elem.connecting = false;
          return elem;
        });
      }, (error: HttpErrorResponse) => {
        if (!error.ok) {
          this.recentRequests.loadSkeleton = false;
        }
      }
    );
  }

  handleRequest(reqObject: any, action: string): void {
    const payload = {
      "userIdFrom": this.userInfo.userId,
      "userNameFrom": this.userInfo.userId,
      "userDepartmentFrom": this.userInfo.departmentName,
      "userIdTo": reqObject.id,
      "userNameTo": reqObject.id,
      "userDepartmentTo": reqObject.departmentName,
      "status": action
    };

    reqObject.connecting = true;

    this.homePageService.updateConnection(payload).subscribe(
      (_res: any) => {
        if (action === 'Approved') {
          this.matSnackBar.open("Request accepted successfully");
        } else {
          this.matSnackBar.open("Rejected the request");
        }
        reqObject.connecting = false;
        this.fetchRecentRequests();
      }, (error: HttpErrorResponse) => {
        if (!error.ok) {
          this.matSnackBar.open("Unable to update connection, due to some error!");
        }
        reqObject.connecting = false;
      }
    )
  }

  handleConnect(obj: any): void {
    const payload = {
      "connectionId": obj.userId,
      "userIdFrom": this.userInfo.userId,
      "userNameFrom": this.userInfo.userId,
      "userDepartmentFrom": this.userInfo.departmentName,
      "userIdTo": obj.userId,
      "userNameTo": obj.userId,
      "userDepartmentTo": obj.employmentDetails.departmentName
    };

    console.log("payload - ", payload);
    obj.connecting = true;
    this.homePageService.connectToNetwork(payload).subscribe(
      (_res: any) => {
        this.fetchNetworkRecommendations();
        obj.connecting = false;
        this.matSnackBar.open("Connection request sent successfully!");
      },
      (error: HttpErrorResponse) => {
        if (!error.ok) {
          obj.connecting = true;
          this.matSnackBar.open("Unable to connect due to some error!");
        }
      }
    );
  }

  createInititals(fname:string): string {
    let initials = ''
    const array = `${fname} `.toString().split(' ')
    if (array[0] !== 'undefined' && typeof array[1] !== 'undefined') {
      initials += array[0].charAt(0) 
      initials += array[1].charAt(0)
    } else {
      for (let i = 0; i < fname.length; i += 1) {
        if (fname.charAt(i) === ' ') {
          continue
        }

        if (fname.charAt(i) === fname.charAt(i)) {
          initials += fname.charAt(i)

          if (initials.length === 2) {
            break
          }
        }
      }
    }
    return initials.toUpperCase()
  }

}
