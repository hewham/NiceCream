import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';

import { LoginPage } from '../login/login';
import { SignupPage } from '../signup/signup';
import { CreateMenuItemPage } from '../create-menu-item/create-menu-item';



@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {

  currentUser: any;
  menuItems: any;
  type: any = '';

  constructor(public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController) {
  }

  ionViewWillEnter() {
    console.log('ionViewDidLoad ProfilePage');
    this.initialize();
  }

  initialize() {
    this.type = this.navParams.get("type");
    if(this.type == "driver"){
      this.currentUser = this.navParams.get('user');
    }else{
    this.currentUser = window.localStorage.getItem("currentUser");
    this.currentUser = JSON.parse(this.currentUser);
    }

    if(this.currentUser){
      this.menuItems = this.currentUser.menuItems;
    }


  }

  createMenuItem() {
    let modal = this.modalCtrl.create(CreateMenuItemPage);
    modal.onDidDismiss(item => {
      if(item){
        this.initialize();
      }
    })
    modal.present();
    }

    login() {
      this.navCtrl.push(LoginPage, {
        from: "landing"
      });
    }

    signup() {
      this.navCtrl.push( SignupPage, {
        from: "landing"
      });
    }

}
