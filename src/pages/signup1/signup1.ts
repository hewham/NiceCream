import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { Signup2Page } from '../signup2/signup2';


@IonicPage()
@Component({
  selector: 'page-signup1',
  templateUrl: 'signup1.html',
})
export class Signup1Page {

  id: any;

  constructor(public navCtrl: NavController, public navParams: NavParams) {

    this.id = navParams.get("id");
    console.log("id: ",this.id);

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Signup1Page');
  }

  next(driver){
    this.navCtrl.push(Signup2Page, {
      id: this.id,
      driver: driver
    })
  }

}
