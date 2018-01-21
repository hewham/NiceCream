import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

import { ProfilePage } from '../profile/profile';
import { UserProvider } from '../../providers/user';


@Component({
  selector: 'page-list',
  templateUrl: 'list.html'
})
export class ListPage {

  drivers: any;
  rangeLatLngs: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public userProvider: UserProvider) {
    // If we navigated to this page, we will have an item available as a nav param
    this.rangeLatLngs = window.localStorage.getItem("rangeLatLngs");
    this.rangeLatLngs = JSON.parse(this.rangeLatLngs);

    console.log("rangeLatLngs: ",this.rangeLatLngs);
    this.userProvider.getUserList(this.rangeLatLngs).subscribe(({data}) => {
      this.drivers = data;
      this.drivers = this.drivers.allUsers;
      console.log("drivers: ",this.drivers);
    });
  }

  viewDriver(driver){
    this.navCtrl.push(ProfilePage, {
      user: driver,
      type: 'driver'
    })
  }

  ////////////////////REFRESHER/////////////////////////
  doRefresh(refresher) {
    console.log('DOREFRESH');
    this.userProvider.getUserList(this.rangeLatLngs).refetch(({data}) => {
      this.drivers = data;
      this.drivers = this.drivers.allUsers;
    }).then(() => {
      refresher.complete();
    });
  }
  /////////////////////////////////////////////////////
}
