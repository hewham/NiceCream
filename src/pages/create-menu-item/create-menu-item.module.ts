import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CreateMenuItemPage } from './create-menu-item';

@NgModule({
  declarations: [
    CreateMenuItemPage,
  ],
  imports: [
    IonicPageModule.forChild(CreateMenuItemPage),
  ],
})
export class CreateMenuItemPageModule {}
