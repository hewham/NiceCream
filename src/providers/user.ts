import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import 'rxjs/add/operator/toPromise';


@Injectable()
export class UserProvider {

  constructor(public http: Http, public apollo: Apollo) {
    console.log('Hello UserProvider Provider');
  }

  getCurrentUserInfo(){
    return this.apollo.watchQuery({
      query: gql`
        query{
          user{
            id
            name
            driver
            bio
            profilePhoto
            menuItems {
              id
              name
              description
              photo
              price
            }
            _menuItemsMeta {
              count
            }
          }
        }
      `
    })
  }


  getUserList(rangeLatLngs) {
    return this.apollo.watchQuery({
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
              driver
              bio
              profilePhoto
              menuItems {
                id
                name
                description
                photo
                price
              }
              _menuItemsMeta {
                count
              }
          }
        }
      `,
      variables: {
        minLat: rangeLatLngs.minLat,
        maxLat: rangeLatLngs.maxLat,
        minLng: rangeLatLngs.minLng,
        maxLng: rangeLatLngs.maxLng
      }
    })
  }

}
