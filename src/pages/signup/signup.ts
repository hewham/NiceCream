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
type: any;
id: any;
showUsernameSpinner: boolean = false;
showEmailSpinner: boolean = false;
nameTaken: any;
emailTaken: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, public formBuilder: FormBuilder, public alertCtrl: AlertController, public loadingCtrl: LoadingController, private apollo: Apollo, public keyboard: Keyboard) {
    this.type = navParams.get('type');
    console.log('type: ' + this.type);

    this.loginForm = formBuilder.group({
      username: ['', Validators.compose([Validators.minLength(1), Validators.required])],
      email: ['', Validators.compose([Validators.email])],
      password: ['', Validators.compose([Validators.minLength(6), Validators.required])]
    });
  }

  createUserMutation = gql`
    mutation createUser(
      $email: String!,
      $password: String!,
      $username: String!,
      $type: String!,
      $profilePhoto: String!,
      $coverPhoto: String!) {
      createUser(authProvider: { email: {email: $email, password: $password}},
        username: $username,
        type: $type,
        profilePhoto:
        $profilePhoto,
        coverPhoto: $coverPhoto) {
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

  gotoRegisterThird() {
    if (this.loginForm.valid){
      if(this.nameTaken == true){
        let alert = this.alertCtrl.create({
          title: '',
          message: 'Username is taken'
        });
        alert.present();
      }
      else if(this.emailTaken == true){
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
            username: this.loginForm.value.username,
            type: this.type,
            profilePhoto: 'http://i.imgur.com/THZaDRZ.jpg',
            coverPhoto: 'https://i.imgur.com/66TBTmd.jpg'
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
            }
          }).then(() => {
            //Create and save currentUser object, then push to edit-location-map
            var currentUser = {
              id: this.id,
              email: this.loginForm.value.email,
              username: this.loginForm.value.password,
              type: this.type,
              range: 100,
              gigRange: 75,
              profilePhoto: 'http://i.imgur.com/THZaDRZ.jpg',
              coverPhoto: 'https://i.imgur.com/66TBTmd.jpg'
            }
            window.localStorage.setItem('currentUser', JSON.stringify(currentUser));
            this.navCtrl.push(Signup2Page,{
              id: this.id,
              mapType: 'register'
            });
          });
        }).catch( (err) => {
          //CATCH GRAPHQL ERROR, USER ALREADY EXISTS, SHOULD NEVER GET HERE
          this.loading.dismiss();
          let alert = this.alertCtrl.create({
            title: '',
            message: 'User already exists, check username and email'
          });
          alert.present();
        });
      }
    }
    //ERROR CATCHING
    if(!this.loginForm.valid){
      if(this.loginForm.controls.username.valid == false){
        let alert = this.alertCtrl.create({
          title: '',
          message: 'Please enter a Username'
        });
        alert.present();
      }
      else if(this.loginForm.controls.email.valid == false){
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

  checkUsername(){
    console.log('check username');
    this.nameTaken = undefined;
    this.showUsernameSpinner = true;
    this.apollo.query({
      query: gql`
        query allUsers($username: String) {
          allUsers(filter:{username: $username} ) {
            id
          }
        }
      `,
      variables: {
        username: this.loginForm.value.username
      }
    }).toPromise().then(({data}) => {
      var nameCheck: any;
      nameCheck = data;
      nameCheck = nameCheck.allUsers[0];
      this.showUsernameSpinner = false;
      if(nameCheck != undefined){
        this.nameTaken = true;
      }
      if(nameCheck == undefined){
        this.nameTaken = false;
      }
    });
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
