import {Component, OnInit, Input} from '@angular/core';
import {AbstractControl, FormGroup, FormBuilder} from "@angular/forms";
import {UserService} from "../services/user.service";
import { RumorsObservable } from "../services/rumors.service";
import {Rumor} from "../models/Rumor";
import {User} from "../models/User";

@Component({
  selector: 'rumors',
  templateUrl: './rumors.component.html',
  styleUrls: ['./rumors.component.scss'],
})
export class RumorsComponent implements OnInit {
  rumorsForm: FormGroup;
  message: AbstractControl;
  anonymousOriginator: AbstractControl;
  anonymousEndpoint: AbstractControl;
  messageVal: string;
  anonymousOriginatorVal: string;
  anonymousEndpointVal: string;
  error: any = null;

  constructor(private fb: FormBuilder, private rumorsResult: RumorsObservable, private userService: UserService) {}

  ngOnInit() {
    this.rumorsForm = this.fb.group({
      'message': [""],
      'anonymousOriginator': [""],
      'anonymousEndpoint': [""],
    });

    this.message = this.rumorsForm.controls['message'];
    this.message.valueChanges
    .subscribe((listenerStr: string) => this.messageVal = listenerStr);

    this.anonymousOriginator = this.rumorsForm.controls['anonymousOriginator'];
    this.anonymousOriginator.valueChanges
    .subscribe((listenerStr: string) => this.anonymousOriginatorVal = listenerStr);

    this.anonymousEndpoint = this.rumorsForm.controls['anonymousEndpoint'];
    this.anonymousEndpoint.valueChanges
    .subscribe((listenerStr: string) => this.anonymousEndpointVal = listenerStr);
  }

  addAnonymousUser() {
    if (this.anonymousEndpointVal && this.anonymousOriginatorVal) {
      console.log(this.anonymousEndpointVal);
      this.userService.createAnonymousUser(this.anonymousOriginatorVal, this.anonymousEndpointVal)
      .subscribe(
        (user: User) => {
          console.log("Anonymous User Created");
          console.log(user);
        },
        err => {
          console.error(err);
        }
      )
    }
  }

  sendMessage() {
    if (this.messageVal) {
      this.rumorsResult.createRumor(this.messageVal)
      .subscribe(
        (rumor: Rumor) => {
          console.log("Created rumor");
          console.log(rumor);
          this.message.reset("");
        },
        err => {
          console.error(err.json().message);
          this.error = "Message from Server: " + err.json().message;
        }
      );
    }
  }
}
