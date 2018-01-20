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
  selector: 'page-track',
  templateUrl: 'track.html',
})
export class TrackPage {

    currentUser: any;
    map: any;

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
      this.userProvider.getCurrentUserInfo().subscribe(({data}) => {

        console.log("GOT current user info, getting location...");
        this.currentUser = data;
        this.currentUser = this.currentUser.user;
        window.localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        console.log("currentUser: ",this.currentUser);

        if(!this.currentUser.driver || this.currentUser == null){
          this.locationProvider.getLocation().then((data) => {
            console.log("GOT location, getting events...");
            console.log("LOCATION DATA RETURNED IS: ",data);
            if (data == "error"){
              //Error detecting current location
              console.log("ERROR GETTING LOCATION.....");
              this.setUserLocationBasedOffCurrentUser();
            }else{
              //No error detecting current location
              this.location = window.localStorage.getItem('userLocation');
              if (this.location != undefined){
                this.location = JSON.parse(this.location);
              }else{
                this.setUserLocationBasedOffCurrentUser();
              }
            }

            this.rangeLatLngs = this.rangeLatLngsCalc(this.location, 50);
            console.log("rangelatlngs: ",this.rangeLatLngs);

            this.loadingFlag = true;
            this.showImage = false;
            this.zoomLevel = 12;
            // this.loading.dismiss();
            this.drawMap();
          });
        }//CREAMERS
        else if(this.currentUser.driver){
        this.showImage = false;
        this.showButton = true;

        }

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

    startTracking() {
      if(!this.tracking){
        this.tracking = true;
        this.showButton = false;
        this.locationProvider.getLocation().then((data) => {
          console.log("GOT location, getting events...");
          console.log("LOCATION DATA RETURNED IS: ",data);
          if (data == "error"){
            //Error detecting current location
            console.log("ERROR GETTING LOCATION.....");
            // this.setUserLocationBasedOffCurrentUser();
          }else{
            //No error detecting current location
            this.location = window.localStorage.getItem('userLocation');
            this.location = JSON.parse(this.location);
          }
          this.loadingFlag = true;
          this.showImage = false;
          this.zoomLevel = 12;
          this.drawMap();
          this.track();
        });

      }else{
        this.tracking = false;
      }
    }

    track() {
      console.log("in track")
      let watch = this.geolocation.watchPosition();
      watch.subscribe((data) => {
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

       Leaflet.marker([this.location.latitude, this.location.longitude], {icon:iceCreamIcon}).addTo(this.map).bindPopup("Ice Cream!!!", customOptions);

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
        this.map = Leaflet.map('map');
      }else{
        this.map = Leaflet.map('map');
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

      Leaflet.marker([this.location.latitude, this.location.longitude], {icon:iceCreamIcon}).addTo(this.map).bindPopup("Ice Cream!!!", customOptions);
    }
  }
