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
  @Input() topHeading: string;
  @Input() topLinks: Link[];
  @Input() bottomHeading: string;
  @Input() bottomLinks: Link[];

  constructor() {}

  openMenu() {
    if (this.menu) {
      this.menu.open();
    }
  }
}
