import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { Geolocation } from '@ionic-native/geolocation';

declare var google;


@Injectable()
export class LocationProvider {
  userLat: any;
  userLng: any;
  loc_info: any;

  constructor(public http: Http, private geolocation: Geolocation) {
  }

  getLocation(){
    console.log("IN getLocation..");
     return new Promise((resolve) => {
      this.geolocation.getCurrentPosition().then((resp) => {
        console.log("GOT location! reverse goecoding...");
       var loc = {
         latitude: resp.coords.latitude,
         longitude: resp.coords.longitude
       }
       resolve(loc);

      }).catch((error) => {
          console.log('Error getting location', error);
          resolve("error");
      });
    });
  }
  // getLocation(){
  //   console.log("IN getLocation..");
  //    return new Promise((resolve) => {
  //     this.geolocation.getCurrentPosition().then((resp) => {
  //       console.log("GOT location! reverse goecoding...");
  //      this.userLat = resp.coords.latitude;
  //      this.userLng = resp.coords.longitude;
  //      //Reverse Geocode
  //      this.reverseGeocoder(this.userLat, this.userLng).then((loc) => {
  //        console.log("GOT reverse geocode! Saving location...");
  //         window.localStorage.setItem('userLocation', JSON.stringify(loc));
  //         console.log("SAVED location! Resolving getLocation()...");
  //        resolve(loc);
  //      });
  //     }).catch((error) => {
  //         console.log('Error getting location', error);
  //         resolve("error");
  //     });
  //   });
  // }



  reverseGeocoder(lat, lng){
    return new Promise((resolve) => {
      console.log("IN REVERSEGEOCODER");
       var geocoder = new google.maps.Geocoder();
       var latlng = new google.maps.LatLng(lat, lng);
       var request = {
         latLng: latlng
       };
       geocoder.geocode(request, function(data, status) {
         var loc_info = <any>{};
         if (status == google.maps.GeocoderStatus.OK) {
           if (data[0] != null) {
             var components = data[0].address_components;
             console.log("address is: " + data[0].formatted_address);
             for(var component of components){
               if(component.types[0] == 'route'){
                 loc_info.street = component.long_name;
               }
               if(component.types[0] == 'street_number'){
                 loc_info.street_num = component.long_name;
               }
               if(component.types[0] == 'locality'){
                 loc_info.city = component.long_name;
               }
               if(component.types[0] == 'administrative_area_level_1'){
                 loc_info.state = component.short_name;
               }
               if(component.types[0] == 'country'){
                 loc_info.country = component.long_name;
                 loc_info.country_short = component.short_name;
               }
               if(component.types[0] == 'postal_code'){
                 loc_info.zip_code = component.long_name;
               }
             }
             loc_info.latitude = lat;
             loc_info.longitude = lng;
             resolve(loc_info);
           } else {
             console.log("No address available");
           }
         }
        //  this.loc_info = [street, street_num, city, state, country, country_short, zip_code];
       });
      });
     }


}
