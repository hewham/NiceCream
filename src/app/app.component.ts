import { Component, ViewChild } from '@angular/core';
import { Nav, Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import { LoginPage } from '../pages/login/login';
import { ProfilePage } from '../pages/profile/profile';

import { LandingPage } from '../pages/landing/landing';
import { Signup2Page } from '../pages/signup2/signup2';
import { Signup1Page } from '../pages/signup1/signup1';


@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = LandingPage;

  pages: Array<{title: string, component: any}>;

  constructor(public platform: Platform, public statusBar: StatusBar, public splashScreen: SplashScreen) {
    this.initializeApp();

    if (window.localStorage.getItem('graphcoolToken') != null) {
      this.rootPage = HomePage;
      // this.rootPage = Signup1Page;
      // this.rootPage = ProfilePage;
      this.pages = [
        { title: 'Home', component: HomePage },
        { title: 'Profile', component: ProfilePage },
      ];
    } else {
      this.rootPage = LandingPage;
      this.pages = [
        { title: 'Home', component: HomePage },
        { title: 'Log In', component: LoginPage }
      ];
    }

    // used for an example of ngFor and navigation
    // this.pages = [
    //   { title: 'Home', component: HomePage },
    //   { title: 'List', component: ListPage },
    //   { title: 'Profile', component: ProfilePage },
    //   { title: 'Log In', component: LoginPage }
    // ];

  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.splashScreen.hide();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }
}
