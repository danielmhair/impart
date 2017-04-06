import {Component, ViewChild, Input} from '@angular/core';
import {Link} from "../models/Link";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  @ViewChild('menuRight') menu: any;
  @Input() brand: Link;
  @Input() leftLinks: Link[];
  @Input() rightLinks: Link[];

  constructor() {}

  openMenu() {
    if (this.menu) {
      this.menu.open();
    }
  }
}
