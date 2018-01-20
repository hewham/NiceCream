import { Component } from '@angular/core';
import { NavController, ToastController, LoadingController, MenuController } from 'ionic-angular';

import { LocationProvider } from '../../providers/location';

import * as Leaflet from 'leaflet';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})



export class HomePage {

  map: any;

  location: any = {
    latitude: 35,
    longitude: -96
  };
  zoomLevel: any;
  loading: any;
  loadingFlag: boolean = false;
  showImage: boolean = true;


  constructor(public navCtrl: NavController, public locationProvider: LocationProvider, public toastCtrl: ToastController, public loadingCtrl: LoadingController, public menuCtrl: MenuController) {


  }

  ngOnInit() {
    this.menuCtrl.swipeEnable(false);
    this.showImage = true;
    // this.loading = this.loadingCtrl.create();
    // this.loading.present();
    // this.zoomLevel = 3;
    // this.drawMap();
    this.loadingFlag = false;
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
      this.loadingFlag = true;
      this.showImage = false;
      this.zoomLevel = 12;
      // this.loading.dismiss();
      this.drawMap();
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
