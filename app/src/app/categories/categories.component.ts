import {Component, OnInit, Input} from '@angular/core';
import {AbstractControl, FormGroup, FormBuilder} from "@angular/forms";
import {UserService} from "../services/user.service";
import { UserActivityStream } from "../services/user-activity-stream.service";
import {User} from "../models/User";
import {Router} from "@angular/router";
import {EventfulCategory} from "../models/EventfulCategory";
import {Observable, BehaviorSubject} from "rxjs";
import {Eventful} from "../services/eventful.service";
import {Navigation} from "../services/navigation.service";

@Component({
  selector: 'account',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss'],
})
export class CategoriesComponent implements OnInit {
  public accountForm: FormGroup;
  public message: AbstractControl;
  public messageVal: string;
  public newCategory: AbstractControl;
  public newCategoryVal: string;
  public error: any = null;
  public user: User;
  public categories: EventfulCategory[] = null;
  public filteredCategories: Observable<EventfulCategory[]>;

  constructor(private fb: FormBuilder, public eventful: Eventful,
              private userService: UserService, private router: Router,
              private nav: Navigation) {}

  ngOnInit() {
    this.accountForm = this.fb.group({
      'message': [""],
      'newCategory': [""]
    });

    this.eventful.getCategories()
    .then(console.log)
    .catch(console.error);

    this.eventful.categories.subscribe((categories: EventfulCategory[]) => {
      if (this.user) {
        categories = categories.map(category => {
          category.selected = this.user.categories.indexOf(category.id) >= 0;
          return category
        });
      }
      this.categories = categories
    });

    this.message = this.accountForm.controls['message'];
    this.message.valueChanges
    .subscribe((listenerStr: string) => this.messageVal = listenerStr);

    this.newCategory = this.accountForm.controls['newCategory'];
    this.filteredCategories = this.newCategory.valueChanges.startWith(null).map((name: string) => {
      this.newCategoryVal = name;
      return this.filterCategories(name)
    });

    if (!this.userService.isAuthenticated()) {
      this.router.navigate(['/login']);
    }
    this.userService.userStream.subscribe(user => {
      this.user = user;
      if (this.user && this.user.categories && this.categories) {
        this.categories = this.categories.map(category => {
          category.selected = this.user.categories.indexOf(category.id) >= 0;
          return category
        });
        const amtSelected = this.categories.filter(cat => cat.selected).length;
        this.nav.curRoute.showNext = amtSelected >= 0;
        this.nav.curRoute.nextNum = amtSelected >= 3 ? 0 : 3 - amtSelected;
        this.nav.curRoute.disableNext = amtSelected < 3;
      }
    });
    this.userService.getUser().then(console.log).catch(console.error);
  }

  private filterCategories(val: string) {
    return val ? this.categories.filter(
      (s: EventfulCategory) => new RegExp(`^${val}`, 'gi').test(s.name)
    ) : this.categories;
  }

  public updateCategories(category: EventfulCategory) {
    const idx = this.user.categories.indexOf(category.id)
    if (idx >= 0) {
      this.user.categories.splice(idx, 1);
    } else {
      this.user.categories.push(category.id)
    }
    this.userService.updateUser(this.user)
    .then(console.log).catch(console.error);
  }
}
