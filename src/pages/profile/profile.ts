import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, LoadingController, AlertController } from 'ionic-angular';

import { LoginPage } from '../login/login';
import { SignupPage } from '../signup/signup';
import { CreateMenuItemPage } from '../create-menu-item/create-menu-item';

//Apollo connection
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

@IonicPage()
@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html',
})
export class ProfilePage {

  currentUser: any;
  menuItems: any;
  type: any = '';

  constructor(public navCtrl: NavController, public navParams: NavParams, public modalCtrl: ModalController, public apollo: Apollo, public loadingCtrl: LoadingController, public alertCtrl: AlertController) {
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

    deleteItem(item) {
      let confirm = this.alertCtrl.create({
        title: 'Confirm Delete',
        message: 'Are you sure you want to remove the menu item "' + item.name + '"?',
        buttons: [
          {
            text: 'Cancel',
            handler: () => {
              console.log('Cancel clicked');
            }
          },
          {
            text: 'Delete',
            handler: () => {
              console.log('OK clicked');
              this.delete(item);
            }
          }
        ]
      });
    confirm.present();
    }

    delete(item) {
      this.apollo.mutate({
        mutation: gql`
        mutation deleteMenuItem(
          $id: ID! ) {
            deleteMenuItem(
              id: $id ) {
                id
            }
          }
        `,
        variables: {
          id: item.id,
        }
      }).toPromise().then(() => {
        var i=0;
        for(let menuItem of this.menuItems){
          if(item.id==menuItem.id){
            this.menuItems.splice(i, 1);
          }
          i++;
        }
        this.currentUser.menuItems = this.menuItems;
        this.currentUser._menuItemsMeta.count = this.currentUser._menuItemsMeta.count-1;
        window.localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    });
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

    logout() {
      console.log("logout()");
      let loading = this.loadingCtrl.create({
        dismissOnPageChange: true,
        content: 'Logging Out...'
      });
      loading.present().then(()=>{
        this.removeToken();
      });
    }

    removeToken(){
      window.localStorage.removeItem('graphcoolToken');
      location.reload();
    }

}
