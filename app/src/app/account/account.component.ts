import {Component, OnInit, Input} from '@angular/core';
import {AbstractControl, FormGroup, FormBuilder} from "@angular/forms";
import {UserService} from "../services/user.service";
import { UserActivityStream } from "../services/user-activity-stream.service";
import {UserActivity} from "app/models/UserActivity";

@Component({
  selector: 'account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss'],
})
export class AccountComponent implements OnInit {
  accountForm: FormGroup;
  message: AbstractControl;
  messageVal: string;
  error: any = null;
  activities: UserActivity[] = [];

  constructor(private fb: FormBuilder, private userActivityStream: UserActivityStream, private userService: UserService) {}

  ngOnInit() {
    this.accountForm = this.fb.group({
      'message': [""],
    });

    this.message = this.accountForm.controls['message'];
    this.message.valueChanges
    .subscribe((listenerStr: string) => this.messageVal = listenerStr);
  }
}
