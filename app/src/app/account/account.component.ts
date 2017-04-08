import {Component, OnInit, Input} from '@angular/core';
import {AbstractControl, FormGroup, FormBuilder} from "@angular/forms";
import {UserService} from "../services/user.service";
import { UserActivityStream } from "../services/user-activity-stream.service";
import {User} from "../models/User";
import {Router} from "@angular/router";
import {EventfulCategory} from "../models/EventfulCategory";
import {Observable} from "rxjs";

@Component({
  selector: 'account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit {
  public accountForm: FormGroup;
  public message: AbstractControl;
  public messageVal: string;
  public newCategory: AbstractControl;
  public newCategoryVal: string;
  public error: any = null;
  public user: User;
  public categories: EventfulCategory[] = [];
  public filteredCategories: Observable<EventfulCategory[]>

  constructor(private fb: FormBuilder, public userActivityStream: UserActivityStream,
              private userService: UserService, private router: Router) {}

  ngOnInit() {
    this.accountForm = this.fb.group({
      'message': [""],
      'newCategory': [""]
    });

    this.userActivityStream.getCategories().then(categories => this.categories = categories);

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
    this.userService.userStream.subscribe(user => this.user = user);
    this.userService.getUser()
  }

  private filterCategories(val: string) {
    return val ? this.categories.filter((s: EventfulCategory) => new RegExp(`^${val}`, 'gi').test(s.name)) : this.categories;
  }


  addCategory(category: string) {
    if (!this.user.categories) {
      this.user.categories = []
    }
    this.user.categories.push(this.newCategoryVal)
  }
}
