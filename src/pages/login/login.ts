import {
  NavController,
  LoadingController,
  AlertController,
  ToastController,
  Keyboard } from 'ionic-angular';
import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { HomePage } from '../home/home';


//Apollo connection
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import 'rxjs/add/operator/toPromise';



@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  public loginForm;
  emailChanged: boolean = false;
  passwordChanged: boolean = false;
  submitAttempt: boolean = false;
  loading: any;
  toast: any;

  constructor(public nav: NavController, public formBuilder: FormBuilder,
              public alertCtrl: AlertController, public loadingCtrl: LoadingController, public toastCtrl: ToastController, private apollo: Apollo, public keyboard: Keyboard) {

    this.loginForm = formBuilder.group({
      email: ['', Validators.compose([Validators.required])],
      password: ['', Validators.compose([Validators.minLength(6),
        Validators.required])]
    });
  }

  elementChanged(input){
    // let field = input.inputControl.name;
    // this[field + "Changed"] = true;
  }


  submit() {
    this.loading = this.loadingCtrl.create({
      dismissOnPageChange: true,
      content: 'Logging in...'
    });
    this.loading.present();
    let userInfo = <any>{};
    this.signIn().then(({data}) =>{
      if (data && this.loginForm.valid) {
        userInfo.data = data;
        // console.log(userInfo.data.signinUser.token);
        window.localStorage.setItem('graphcoolToken', userInfo.data.signinUser.token);
        console.log("SET graphcool token: ",userInfo.data.signinUser.token);
      }

    }).then(() => {
      this.loading.dismiss();
      this.nav.setRoot(HomePage);
    }).catch( (err) => {
      this.loading.dismiss();
      let alert = this.alertCtrl.create({
        title: '',
        message: 'Incorrect Email or Password. Please check and try again'
      });
      alert.present();
    });

  }

  closeKeyboard() {
    this.keyboard.close();
  }


  signIn() {
    return this.apollo.mutate({
      mutation: gql`
      mutation signinUser($email: String!, $password: String!){
        signinUser(email: {email: $email, password: $password}){
          token
        }
      }
      `,
      variables: {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      }
    }).toPromise();
  }

  forgotPassword(){
    let alert = this.alertCtrl.create({
      title: '',
      message: "Unfortunately, password recovery hasn't been developed yet. Check back in a future update!"
    });
    alert.present();
  }

}
