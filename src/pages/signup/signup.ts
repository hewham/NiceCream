import {
  IonicPage,
  NavController,
  LoadingController,
  NavParams,
  AlertController,
  Keyboard } from 'ionic-angular';
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { Signup2Page } from '../signup2/signup2';


//Register to graphcool
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

@IonicPage()
@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
})
export class SignupPage {
  public loginForm;
emailChanged: boolean = false;
passwordChanged: boolean = false;
submitAttempt: boolean = false;
loading: any;
id: any;
showEmailSpinner: boolean = false;
nameTaken: any;
emailTaken: any;
from: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public formBuilder: FormBuilder, public alertCtrl: AlertController, public loadingCtrl: LoadingController, private apollo: Apollo, public keyboard: Keyboard) {

    this.from = navParams.get("from");

    this.loginForm = formBuilder.group({
      email: ['', Validators.compose([Validators.email])],
      password: ['', Validators.compose([Validators.minLength(6), Validators.required])]
    });
  }

  createUserMutation = gql`
    mutation createUser(
      $email: String!,
      $password: String!,
      $profilePhoto: String!) {
      createUser(authProvider: { email: {email: $email, password: $password}},
        profilePhoto: $profilePhoto) {
        id
      }
    }
  `;

  loginUserMutation = gql`
      mutation signinUser($email: String!, $password: String!) {
        signinUser( email: {email: $email, password: $password }) {
          token
        }
      }
  `;


  elementChanged(input){
    // let field = input.inputControl.name;
    console.log('inputcontrol: '+input.inputControl);
    let field = input;
    this[field + "Changed"] = true;
  }

  closeKeyboard() {
    this.keyboard.close();
  }

  gotosignup2() {
    if (this.loginForm.valid){
      if(this.emailTaken == true){
        let alert = this.alertCtrl.create({
          title: '',
          message: 'Email is already used'
        });
        alert.present();
      }
      else {
        this.loading = this.loadingCtrl.create({
          dismissOnPageChange: true,
          content: 'Creating Account...'
        });
        this.loading.present();

        this.apollo.mutate ({
          mutation: this.createUserMutation,
          variables: {
            email: this.loginForm.value.email,
            password: this.loginForm.value.password,
            profilePhoto: 'https://i.imgur.com/WbMydG3.jpg'
          }
        }).toPromise().then( ({data}) => {
          this.id = data;
          this.id = this.id.createUser.id;

          // Sign in user after register and set token to localstorage
          let userInfo = <any>{};
          this.signIn().then(({data}) => {
            if (data && this.loginForm.valid) {
              userInfo.data = data;
              window.localStorage.setItem('graphcoolToken', userInfo.data.signinUser.token);
              console.log("SET graphcool token: ",userInfo.data.signinUser.token);
            }
          }).then(() => {
            //Create and save currentUser object, then push to edit-location-map
            var currentUser = {
              id: this.id,
              email: this.loginForm.value.email,
              profilePhoto: 'https://i.imgur.com/WbMydG3.jpg'
            }
            window.localStorage.setItem('currentUser', JSON.stringify(currentUser));
            this.navCtrl.push(Signup2Page,{
              id: this.id
            });
          });
        }).catch( (err) => {
          //CATCH GRAPHQL ERROR, USER ALREADY EXISTS, SHOULD NEVER GET HERE
          console.log("ERROR: ",err);
          this.loading.dismiss();
          let alert = this.alertCtrl.create({
            title: '',
            message: 'User already exists, check email'
          });
          alert.present();
        });
      }
    }
    //ERROR CATCHING
    if(!this.loginForm.valid){
      if(this.loginForm.controls.email.valid == false){
        let alert = this.alertCtrl.create({
          title: '',
          message: 'Please enter a valid email'
        });
        alert.present();
      }
      else if(this.loginForm.controls.password.valid == false){
        let alert = this.alertCtrl.create({
          title: '',
          message: 'Password must be at least 6 characters'
        });
        alert.present();
      }
    }
  }

  signIn() {
    console.log("SIGNIN EMAIL: " + this.loginForm.value.email);
    console.log("SIGNIN PASSWORD: " + this.loginForm.value.password);
    return this.apollo.mutate({
      mutation: this.loginUserMutation,
      variables: {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      }
    }).toPromise();
  }

  checkEmail(){
    console.log('check email');
    console.log('check valid: '+this.loginForm.controls.email.valid);
    if(this.loginForm.controls.email.valid == true){
      this.emailTaken = undefined;
      this.showEmailSpinner = true;
      this.apollo.query({
        query: gql`
          query allUsers($email: String) {
            allUsers(filter:{email: $email} ) {
              id
            }
          }
        `,
        variables: {
          email: this.loginForm.value.email
        }
      }).toPromise().then(({data}) => {
        var emailCheck: any;
        emailCheck = data;
        emailCheck = emailCheck.allUsers[0];
        this.showEmailSpinner = false;
        if(emailCheck != undefined){
          this.emailTaken = true;
        }
        if(emailCheck == undefined){
          this.emailTaken = false;
        }
      });
    }
  }
}
