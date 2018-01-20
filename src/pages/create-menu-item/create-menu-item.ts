import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, ViewController, LoadingController, AlertController } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';
import { Camera, CameraOptions } from '@ionic-native/camera';

import { HomePage } from '../home/home';

import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

@IonicPage()
@Component({
  selector: 'page-create-menu-item',
  templateUrl: 'create-menu-item.html',
})
export class CreateMenuItemPage {

  currentUser: any;
  ImageChanged: boolean = false;
  ImageSrc: any;
  loading: any;
  form: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController, public formBuilder: FormBuilder, public actionSheetCtrl: ActionSheetController, public camera: Camera, public loadingCtrl: LoadingController, public apollo: Apollo, public alertCtrl: AlertController) {

    this.currentUser = localStorage.getItem("currentUser");
    this.currentUser = JSON.parse(this.currentUser);

    this.ImageSrc = "../../assets/imgs/icon.png";

    this.form = formBuilder.group({
      name: ['', Validators.compose([Validators.required])],
      price: ['', Validators.compose([Validators.required])],
      description: ['', Validators.compose([Validators.required])]
    });

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad CreateMenuItemPage');
  }

  cancel() {
    this.viewCtrl.dismiss();
  }

  //////////// PHOTO ACCESS ////////////////////
getPhoto() {
  let options: CameraOptions = {
    quality: 50,
    destinationType: 0,
    targetWidth: 500,
    targetHeight: 500,
    encodingType: 0,
    sourceType: 0,
    correctOrientation: true,
    allowEdit: true

  };
  this.camera.getPicture(options).then((ImageData) => {
    let base64Image = "data:image/jpeg;base64," + ImageData;
    this.ImageChanged = true;
    this.ImageSrc = base64Image;
  }).catch( (err) => {
    console.log(err);
  });
}

takePhoto() {
  let options: CameraOptions = {
    quality: 50,
    destinationType: 0,
    targetWidth: 500,
    targetHeight: 500,
    encodingType: 0,
    correctOrientation: true,
    allowEdit: true
  };
  this.camera.getPicture(options).then((ImageData) => {
    let base64Image = "data:image/jpeg;base64," + ImageData;
    this.ImageChanged = true;
    this.ImageSrc = base64Image;
  }).catch( (err) => {
    console.log(err);
  });
}

editPhoto(){
  let actionSheet = this.actionSheetCtrl.create({
  buttons: [
    {
      text: 'From Gallery',
      handler: () => {
        console.log('Gallery clicked');
        // this.ImageSrc = this.cameraProvider.getPhoto();
        this.getPhoto();
      }
    },{
      text: 'Take Photo',
      handler: () => {
        console.log('Take Photo clicked');
        // this.ImageSrc = this.cameraProvider.takePhoto();
        this.takePhoto();
      }
    },{
      text: 'Cancel',
      role: 'cancel',
      handler: () => {
        console.log('Cancel clicked');
      }
    }
  ]
});
actionSheet.present();
}

//////////// END PHOTO ACCESS ////////////////////


createMenuItemMutation = gql`
  mutation createMenuItem(
    $userId: ID!,
    $name: String,
    $price: Float,
    $description: String,
    $photo: String) {
      createMenuItem(
        userId: $userId,
        name: $name,
        price: $price,
        description: $description,
        photo: $photo) {
          id
        }
      }
    `;

    saveMenuItem() {
      console.log('saveMenuItem()');
      if (this.form.valid){
        this.loading = this.loadingCtrl.create({
          dismissOnPageChange: true,
          content: 'Creating Item...'
        });
        this.loading.present();


        this.apollo.mutate ({
          mutation: this.createMenuItemMutation,
          variables: {
            userId: this.currentUser.id,
            name: this.form.value.name,
            price: +this.form.value.price,
            description: this.form.value.description,
            photo: this.ImageSrc
          }
        }).toPromise().then(({data})=>{
          var id: any;
          id = data;
          id = id.createMenuItem.id;

          var menuItem = {
            id: id,
            name: this.form.value.name,
            description: this.form.value.description,
            photo: this.ImageSrc,
            price: +this.form.value.price,
          };
          console.log("menuItem: ",menuItem);
          this.currentUser.menuItems.push(menuItem);
          this.currentUser._menuItemsMeta.count = this.currentUser._menuItemsMeta.count+1;
          console.log("currentUser.menuItems: ",this.currentUser.menuItems);
          window.localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
          this.loading.dismiss();
          this.viewCtrl.dismiss(true);
        });
      }
      if (!this.form.valid){
        let alert = this.alertCtrl.create({
          title: '',
          message: 'Please complete all aspects of Menu Item'
        });
        alert.present();
      }
    }

}
