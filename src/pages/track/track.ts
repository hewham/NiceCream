import { Component } from '@angular/core';
import { NavController, ToastController, LoadingController, MenuController, AlertController } from 'ionic-angular';

import { LocationProvider } from '../../providers/location';
import { UserProvider } from '../../providers/user';

import { Geolocation } from '@ionic-native/geolocation';

//Apollo connection
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';


import * as Leaflet from 'leaflet';
declare var navagator: any;

@Component({
  selector: 'page-track',
  templateUrl: 'track.html',
})
export class TrackPage {

    currentUser: any;
    map: any;
    watch: any;

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
    markerGroup = Leaflet.layerGroup();


    constructor(public navCtrl: NavController, public locationProvider: LocationProvider, public userProvider: UserProvider, public toastCtrl: ToastController, public loadingCtrl: LoadingController, public menuCtrl: MenuController, public geolocation: Geolocation, public apollo: Apollo, public alertCtrl: AlertController) {


    }

    ionViewDidLoad() {
      this.menuCtrl.swipeEnable(false);
      this.showImage = true;
      this.tracking = false;
      this.loadingFlag = false;
      this.userProvider.getCurrentUserInfo().subscribe(({data}) => {

        console.log("GOT current user info, getting location...");
        this.currentUser = data;
        this.currentUser = this.currentUser.user;
        window.localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        console.log("currentUser: ",this.currentUser);
        this.showButton = true;

      });

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
          }
        });

    }

    ionViewWillLeave() {
      this.menuCtrl.swipeEnable(true);
      navigator.geolocation.clearWatch(this.watch);
      this.tracking = false;
      this.showButton = true;
    }

    stopTracking() {
      console.log("stopTracking()");
      navigator.geolocation.clearWatch(this.watch);
      this.tracking = false;
      this.showButton = true;
    }


    startTracking() {
      if(!this.tracking){
        this.tracking = true;
        this.showButton = false;
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

          this.loadingFlag = true;
          this.showImage = false;
          this.zoomLevel = 13;
          this.drawMap();
          this.track();
        }
      });



      }else{
        this.tracking = false;
      }
    }

    track() {
      console.log("in track")
      var options = {
        timeout : 10000,
        enableHighAccuracy: true
      }
      this.watch = navigator.geolocation.watchPosition((data) => {
      // this.watch.subscribe((data) => {
       // data can be a set of coordinates, or an error (if an error occurred).
       console.log("IN geo watch, lat: ",data.coords.latitude,", lng: ",data.coords.longitude);
       this.location.latitude = data.coords.latitude
       this.location.longitude = data.coords.longitude

       this.map.setView([this.location.latitude, this.location.longitude], this.zoomLevel);
       var iceCreamIcon: any;
       iceCreamIcon = Leaflet.icon ({
         iconUrl: "assets/icon/ice-cream.png",
         iconSize:     [45, 45], // size of the icon
         iconAnchor:   [20, 57] // point of the icon which will correspond to marker's location
       });
       var customOptions = ({
         className: 'custom',
         closeOnClick: true,
         closeButton: false
       });

       this.markerGroup.clearLayers();
       this.markerGroup = Leaflet.layerGroup().addTo(this.map);

       Leaflet.marker([this.location.latitude, this.location.longitude], {icon:iceCreamIcon}).addTo(this.markerGroup).bindPopup("Look. It's you.", customOptions);

       this.apollo.mutate ({
         mutation: gql`
           mutation updateUser(
             $id: ID!,
             $lat: Float,
             $lng: Float) {
               updateUser(
                 id: $id,
                 lat: $lat,
                 lng: $lng) {
                   id
                 }
               }
             `,
         variables: {
           id: this.currentUser.id,
           lat: this.location.latitude,
           lng: +this.location.longitude,
         }
       }).toPromise().then(({data})=>{
         console.log("uploaded location to graph.cool!")
       });

      });

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

    drawMap() {
      if (this.map != undefined){
        this.map.remove();
        this.map = Leaflet.map('trackMap');
      }else{
        this.map = Leaflet.map('trackMap');
      }
      Leaflet.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGV3aGFtIiwiYSI6ImNqNWl5dzRrNzJoZWgyd25xemNycHd4cmEifQ.Y6GymqkSWKSy60flBLgKpQ', {
        maxZoom: 16
      }).addTo(this.map);
      this.map.setView([this.location.latitude, this.location.longitude], this.zoomLevel);

      var iceCreamIcon: any;
      iceCreamIcon = Leaflet.icon ({
        iconUrl: "assets/icon/ice-cream.png",
        iconSize:     [45, 45], // size of the icon
        iconAnchor:   [20, 57] // point of the icon which will correspond to marker's location
      });

      var customOptions = ({
        className: 'custom',
        closeOnClick: true,
        closeButton: false
      });

      Leaflet.marker([this.location.latitude, this.location.longitude], {icon:iceCreamIcon}).addTo(this.map).bindPopup("Look. it's you.", customOptions);
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
  }
