import { Component } from '@angular/core';
import { NavController, ToastController, LoadingController, MenuController } from 'ionic-angular';

import { LocationProvider } from '../../providers/location';
import { UserProvider } from '../../providers/user';

import { Geolocation } from '@ionic-native/geolocation';

//Apollo connection
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';


import * as Leaflet from 'leaflet';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})



export class HomePage {

  currentUser: any;
  map: any;
  drivers: any;

  location: any = {
    latitude: 35,
    longitude: -96
  };
  zoomLevel: any;
  loading: any;
  loadingFlag: boolean = false;
  showImage: boolean = true;
  showButton: boolean = false;
  tracking: boolean = false;
  rangeLatLngs: any;


  constructor(public navCtrl: NavController, public locationProvider: LocationProvider, public userProvider: UserProvider, public toastCtrl: ToastController, public loadingCtrl: LoadingController, public menuCtrl: MenuController, public geolocation: Geolocation, public apollo: Apollo) {


  }

  ionViewDidLoad() {
    this.menuCtrl.swipeEnable(false);
    this.showImage = true;
    this.loadingFlag = false;

    this.locationProvider.getLocation().then((data) => {
      console.log("GOT location...");
      console.log("LOCATION DATA RETURNED IS: ",data);
      if (data == "error"){
        //Error detecting current location
        console.log("ERROR GETTING LOCATION.....");
        this.setUserLocationBasedOffCurrentUser();
      }else{
        //No error detecting current location
        this.location = data;
      }

      this.rangeLatLngs = this.rangeLatLngsCalc(this.location, 50);
      console.log("rangelatlngs: ",this.rangeLatLngs);

      this.loadingFlag = true;
      this.showImage = false;
      this.zoomLevel = 12;
      // this.loading.dismiss();
      this.drawMap();
      this.start();
    });


  }

  ionViewWillLeave() {
    this.menuCtrl.swipeEnable(true);
  }

  setUserLocationBasedOffCurrentUser() {
    let toast = this.toastCtrl.create({
      message: 'Unable to get Location, Using Home City',
      duration: 4000,
      position: 'top'
    });
    toast.present();
    // this.location.latitude = this.currentUser.latitude;
    // this.location.longitude = this.currentUser.longitude;
    // this.location.city = this.currentUser.city;
    // this.location.state = this.currentUser.state;
    window.localStorage.setItem('userLocation', JSON.stringify(this.location));
  }

  start() {
    setInterval(this.track(), 3000);
  }

  track(){
    this.apollo.watchQuery({
      query: gql`
        query allUsers(
         $minLat: Float
         $maxLat: Float
         $minLng: Float
         $maxLng: Float) {
          allUsers(
            filter:{
              lat_gte: $minLat
              lat_lte: $maxLat
              lng_gte: $minLng
              lng_lte: $maxLng
            }
            ) {
            id
            name
            lat
            lng
          }
        }
      `,
      variables: {
        minLat: this.rangeLatLngs.minLat,
        maxLat: this.rangeLatLngs.maxLat,
        minLng: this.rangeLatLngs.minLng,
        maxLng: this.rangeLatLngs.maxLng
      }
    }).subscribe(({data}) => {
      this.drivers = data;
      this.drivers = this.drivers.allUsers;
      console.log("DRIVERS: ",this.drivers);
    });
  }



  drawMap() {
    if (this.map != undefined){
      this.map.remove();
      this.map = Leaflet.map('map');
    }else{
      this.map = Leaflet.map('map');
    }
    Leaflet.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGV3aGFtIiwiYSI6ImNqNWl5dzRrNzJoZWgyd25xemNycHd4cmEifQ.Y6GymqkSWKSy60flBLgKpQ', {
      maxZoom: 16
    }).addTo(this.map);
    this.map.setView([this.location.latitude, this.location.longitude], this.zoomLevel);

    // var iceCreamIcon: any;
    // iceCreamIcon = Leaflet.icon ({
    //   iconUrl: "assets/icon/ice-cream.png",
    //   iconSize:     [45, 45], // size of the icon
    //   iconAnchor:   [20, 57] // point of the icon which will correspond to marker's location
    // });
    var pin: any;
    pin = Leaflet.icon ({
      iconUrl: "assets/icon/pin.png",
      iconSize:     [65, 65], // size of the icon
      iconAnchor:   [20, 57] // point of the icon which will correspond to marker's location
    });

    var customOptions = ({
      className: 'custom',
      closeOnClick: true,
      closeButton: false
    });

    Leaflet.marker([this.location.latitude, this.location.longitude], {icon:pin}).addTo(this.map).bindPopup("Ice Cream!!!", customOptions);
  }


  rangeLatLngsCalc(LatLng, range){
    //RETURNS MIN AND MAX LATS AND LNGS TO FORM SQUARE AROUND LATLNG POINT, WITH RANGE IN MILES
    var rangeLatLngs = {
      minLat: 0,
      maxLat: 0,
      minLng: 0,
      maxLng: 0
    }
    var changeInLat = this.changeInLat(range);
    var changeInLng = this.changeInLng(LatLng, range);
    rangeLatLngs.minLat = LatLng.latitude - changeInLat;
    rangeLatLngs.maxLat = LatLng.latitude + changeInLat;
    rangeLatLngs.minLng = LatLng.longitude - changeInLng;
    rangeLatLngs.maxLng = LatLng.longitude + changeInLng;
    return rangeLatLngs
  }

  changeInLat(range){
    // 3960 is radius of earth in miles
    var radians_to_degrees = (180.0 / Math.PI);
    return (range/3960.0)*radians_to_degrees

  }

  changeInLng(LatLng, range){
    var radians_to_degrees = (180.0 / Math.PI);
    var degrees_to_radians = (Math.PI / 180.0);
    var r = 3960.0*Math.cos(LatLng.latitude*degrees_to_radians);
    return (range/r)*radians_to_degrees
  }

}
