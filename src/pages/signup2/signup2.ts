import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ActionSheetController, LoadingController, AlertController } from 'ionic-angular';
import { FormBuilder, Validators } from '@angular/forms';
import { Camera, CameraOptions } from '@ionic-native/camera';

import { HomePage } from '../home/home';

import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';




@IonicPage()
@Component({
  selector: 'page-signup2',
  templateUrl: 'signup2.html',
})
export class Signup2Page {

  id: any;
  profileImageChanged: boolean = false;
  profileImageSrc: any;
  loading: any;

  form: any;
  constructor(public navCtrl: NavController, public navParams: NavParams, public formBuilder: FormBuilder, public actionSheetCtrl: ActionSheetController, public camera: Camera, public loadingCtrl: LoadingController, public apollo: Apollo, public alertCtrl: AlertController) {

    this.id = navParams.get("id");
    console.log("id: ",this.id);

    this.form = formBuilder.group({
      name: ['', Validators.compose([Validators.required])],
      bio: ['', Validators.compose([Validators.required])]
    });

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad Signup2Page');
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
    this.profileImageChanged = true;
    this.profileImageSrc = base64Image;
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
    this.profileImageChanged = true;
    this.profileImageSrc = base64Image;
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
        // this.profileImageSrc = this.cameraProvider.getPhoto();
        this.getPhoto();
      }
    },{
      text: 'Take Photo',
      handler: () => {
        console.log('Take Photo clicked');
        // this.profileImageSrc = this.cameraProvider.takePhoto();
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

saveProfileMutation = gql`
  mutation updateUser(
    $id: ID!,
    $name: String!,
    $bio: String!,
    $profilePhoto: String!) {
      updateUser(
        id: $id,
        name: $name,
        bio: $bio,
        profilePhoto: $profilePhoto) {
          id
        }
      }
    `;

    saveProfile() {
      console.log('saveProfile()');
      if (this.form.valid){
        this.loading = this.loadingCtrl.create({
          dismissOnPageChange: true,
          content: 'Creating Profile...'
        });
        this.loading.present();

        if(!this.profileImageChanged){
          this.profileImageSrc = 'http://i.imgur.com/THZaDRZ.jpg';
        }

        this.apollo.mutate ({
          mutation: this.saveProfileMutation,
          variables: {
            id: this.id,
            name: this.form.value.name,
            bio: this.form.value.bio,
            profilePhoto: this.profileImageSrc
          }
        }).toPromise().then(()=>{
          this.navCtrl.push(HomePage);
        });
      }
      if (!this.form.valid){
        let alert = this.alertCtrl.create({
          title: '',
          message: 'Please complete all aspects of profile'
        });
        alert.present();
      }
    }

}
