import {Component, OnInit, Input} from '@angular/core';
import {AbstractControl, FormGroup, FormBuilder} from "@angular/forms";
import {UserService} from "../services/user.service";
import { UserActivityStream } from "../services/user-activity-stream.service";
import {UserActivity} from "app/models/UserActivity";
import {User} from "../models/User";
import {Router} from "@angular/router";

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

  constructor(private fb: FormBuilder, private userActivityStream: UserActivityStream,
              private userService: UserService, private router: Router) {}

  ngOnInit() {
    this.accountForm = this.fb.group({
      'message': [""],
      'newCategory': [""]
    });

    this.message = this.accountForm.controls['message'];
    this.message.valueChanges
    .subscribe((listenerStr: string) => this.messageVal = listenerStr);

    this.newCategory = this.accountForm.controls['newCategory'];
    this.newCategory.valueChanges.subscribe((val: string) => this.newCategoryVal = val);

    if (!this.userService.isAuthenticated()) {
      this.router.navigate(['/login']);
    }
    this.userService.userStream.subscribe(user => this.user = user);
    this.userService.getUser()
  }

  addCategory(category: string) {
    if (!this.user.categories) {
      this.user.categories = []
    }
    this.user.categories.push(this.newCategoryVal)
  }
}
