import { Component } from '@angular/core';
import { NavController, ToastController } from 'ionic-angular';

import { LocationProvider } from '../../providers/location';

import * as Leaflet from 'leaflet';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})



export class HomePage {

  map: any;

  location: any;


  constructor(public navCtrl: NavController, public locationProvider: LocationProvider, public toastCtrl: ToastController) {

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
    });

  }

  ionViewDidLoad() {
    this.drawMap();

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
    this.map = Leaflet.map('map');
    Leaflet.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiaGV3aGFtIiwiYSI6ImNqNWl5dzRrNzJoZWgyd25xemNycHd4cmEifQ.Y6GymqkSWKSy60flBLgKpQ', {
      maxZoom: 16
    }).addTo(this.map);
    this.map.setView([42.7018, -84.4822], 12);

    var iceCreamIcon: any;
    iceCreamIcon = Leaflet.icon ({
      iconUrl: "assets/icon/ice-cream.png",
      iconSize:     [50, 45], // size of the icon
      iconAnchor:   [20, 57] // point of the icon which will correspond to marker's location
    });

    var customOptions = ({
      className: 'custom',
      closeOnClick: true,
      closeButton: false
    });

    Leaflet.marker([42.7018, -84.4822], {icon:iceCreamIcon}).addTo(this.map).bindPopup("Ice Cream!!!", customOptions);
  }

}
