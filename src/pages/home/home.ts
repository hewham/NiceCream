import { Component } from '@angular/core';
import { NavController, ToastController, LoadingController, MenuController, AlertController } from 'ionic-angular';

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
  showSpinner: boolean = true;
  showButton: boolean = false;
  tracking: boolean = false;
  rangeLatLngs: any;
  interval: any;


  constructor(public navCtrl: NavController, public locationProvider: LocationProvider, public userProvider: UserProvider, public toastCtrl: ToastController, public loadingCtrl: LoadingController, public menuCtrl: MenuController, public geolocation: Geolocation, public apollo: Apollo, public alertCtrl: AlertController) {


  }

  ionViewDidLoad() {
    this.menuCtrl.swipeEnable(false);
    this.showImage = true;
    this.showSpinner = true;
    this.loadingFlag = false;

    this.locationProvider.getLocation().then((data) => {
      console.log("GOT location!");
      if (data == "error"){
        //Error detecting current location
        console.log("ERROR GETTING LOCATION.....");
        this.loadingFlag = true;
        this.showSpinner = false;
        this.couldNotLocate();
      }else{
        //No error detecting current location
        this.location = data;

        this.rangeLatLngs = this.rangeLatLngsCalc(this.location, 50);
        console.log("rangelatlngs: ",this.rangeLatLngs);
        window.localStorage.setItem('rangeLatLngs', JSON.stringify(this.rangeLatLngs));


        this.loadingFlag = true;
        this.showImage = false;
        this.showSpinner = false;
        this.zoomLevel = 12;
        // this.loading.dismiss();
        this.drawMap();
        this.track();
        this.start();
      }
    });


  }

  ionViewWillLeave() {
    this.menuCtrl.swipeEnable(true);
    clearInterval(this.interval);
  }

  start() {
    this.interval = setInterval(
      (function(self) {
         return function() {
            self.track();
        }
      })(this), 4000);
  }

  track(){
    console.log("track()");
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
      var iceCream: any;
      iceCream = Leaflet.icon ({
        iconUrl: "assets/icon/ice-cream.png",
        iconSize:     [65, 65], // size of the icon
        iconAnchor:   [20, 57] // point of the icon which will correspond to marker's location
      });
      var customOptions = ({
        className: 'custom',
        closeOnClick: true,
        closeButton: false
      });
      this.drivers = data;
      this.drivers = this.drivers.allUsers;
      console.log("DRIVERS: ",this.drivers);
      for(let driver of this.drivers){
          Leaflet.marker([driver.lat, driver.lng], {icon:iceCream}).addTo(this.map).bindPopup("Ice Cream!!!", customOptions);
      }
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

    Leaflet.marker([this.location.latitude, this.location.longitude], {icon:pin}).addTo(this.map).bindPopup("You", customOptions);
  }

  couldNotLocate() {
    console.log("couldNotLocate()")
    let alert = this.alertCtrl.create({
      title: "Couldn't Find You",
      message: '<p>NiceCream relies on using your location to find that sweet, sweet cream.</p> <p>Show yourself!</p>',
      buttons: [
        {
          text: 'Try Again',
          handler: () => {
            console.log('Try Again clicked');
            this.ionViewDidLoad();
          }
        }
      ]
    });
    alert.present();

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
