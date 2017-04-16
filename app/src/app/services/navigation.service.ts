import { Injectable } from "@angular/core";
import {Router, NavigationEnd} from "@angular/router";

export interface RouteEvent {
  showNext?: boolean,
  showPrev?: boolean,
  disableNext?: boolean,
  disablePrev?: boolean,
  nextRoute?: string,
  prevRoute?: string,
  nextNum?: number|string,
  prevNum?: number|string,
}

const routeEvents: { [key: string]: RouteEvent } = {
  '/categories': { showNext: false, showPrev: false,
    disablePrev: true, disableNext: true,
    nextRoute: 'activities' },
  '/activities': { showNext: false, showPrev: true,
    disablePrev: false, disableNext: true,
    nextNum: "", prevNum: "",
    nextRoute: 'activities', prevRoute: 'categories' },
};

@Injectable()
export class Navigation {
  public curRoute: RouteEvent;

  constructor(private router: Router) {
    this.router.events
    .filter(val => val instanceof NavigationEnd)
    .subscribe((nav: NavigationEnd) => {
      console.log("Route changed!");
      console.log(nav);
      this.curRoute = routeEvents[nav.url];
      if (!this.curRoute) {
        this.curRoute = { showNext: false, showPrev: false, nextNum: "", prevNum: "" }
      }
    })
  }

  navigateNext() {
    console.log("Routing to " + this.curRoute.nextRoute);
    if (this.curRoute) {
      if (this.curRoute.nextRoute) {
        this.router.navigate([this.curRoute.nextRoute])
      }
    }
  }

  navigatePrev() {
    if (this.curRoute) {
      this.router.navigate([this.curRoute.prevRoute])
    }
  }
}
