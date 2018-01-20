import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';
import { LoginPage } from '../pages/login/login';
import { LandingPage } from '../pages/landing/landing';
import { TrackPage } from '../pages/track/track';
import { SignupPage } from '../pages/signup/signup';
import { Signup1Page } from '../pages/signup1/signup1';
import { Signup2Page } from '../pages/signup2/signup2';
import { ProfilePage } from '../pages/profile/profile';
import { CreateMenuItemPage } from '../pages/create-menu-item/create-menu-item';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

//ionic-native plugins
import { Geolocation } from '@ionic-native/geolocation';
import { Camera } from '@ionic-native/camera';


//Modules for Apollo
import { provideClient } from './client';
import { ApolloModule } from 'apollo-angular';
import { HttpModule } from '@angular/http';
import { LocationProvider } from '../providers/location';
import { UserProvider } from '../providers/user';

@NgModule({
  declarations: [
    MyApp,
    HomePage,
    ListPage,
    LoginPage,
    LandingPage,
    TrackPage,
    SignupPage,
    Signup1Page,
    Signup2Page,
    ProfilePage,
    CreateMenuItemPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    ApolloModule.withClient(provideClient),
    HttpModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    HomePage,
    ListPage,
    LoginPage,
    LandingPage,
    TrackPage,
    SignupPage,
    Signup1Page,
    Signup2Page,
    ProfilePage,
    CreateMenuItemPage
  ],
  providers: [
    StatusBar,
    SplashScreen,
    Geolocation,
    Camera,
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    LocationProvider,
    UserProvider
  ]
})
export class AppModule {}
