import {Component, OnInit, ChangeDetectionStrategy, ContentChild, ViewChild} from '@angular/core';
import {ActivityStream} from "../services/activity-stream.service";
import {UserService} from "../services/user.service";
import {User} from "../models/User";
import {Activity, Address} from "../models/activity.model";
import {FormGroup, FormBuilder, AbstractControl} from "@angular/forms";
import {EventfulCategory} from "../models/EventfulCategory";
import {Observable} from "rxjs";
import {Eventful} from "../services/eventful.service";
import {MdAutocomplete} from "@angular/material/autocomplete";
import {ActivityUser} from "../models/activity-user.model";

@Component({
  selector: 'app-activities',
  templateUrl: './activities.component.html',
  styleUrls: ['./activities.component.scss'],
})
export class ActivitiesComponent implements OnInit {
  public accountForm: FormGroup;
  public activities: Activity[] = [];

  public activityName: AbstractControl;
  public activityDescription: AbstractControl;
  public activityCategories: AbstractControl;
  public activityCategoriesList: EventfulCategory[] = [];
  public activityStreet: AbstractControl;
  public activityCity: AbstractControl;
  public activityZip: AbstractControl;
  public user: User = null;
  public category_map = {};

  public activity: Activity = new Activity("", "", {street: "", city: "", zip: ""}, "", [], {});
  public filteredCategories: Observable<EventfulCategory[]>;

  public categories: EventfulCategory[] = [];

  constructor(private userService: UserService, public eventful: Eventful,
              public activitiesStream: ActivityStream, public fb: FormBuilder) {
  }

  ngOnInit() {
    console.log("On init");
    this.accountForm = this.fb.group({
      'activityName': [""],
      'activityDescription': [""],
      'activityCategories': [""],
    });

    this.activityName = this.accountForm.controls['activityName'];
    this.activityName.valueChanges
    .subscribe((val: string) => this.activity.name = val);

    this.activityDescription = this.accountForm.controls['activityDescription'];
    this.activityDescription.valueChanges
    .subscribe((val: string) => this.activity.description = val);

    this.activityCategories = this.accountForm.controls['activityCategories'];
    this.filteredCategories = this.activityCategories.valueChanges.startWith([]).map((name: string) => {
      return this.filterCategories(name)
    });

    this.userService.userStream.subscribe(user => {
      this.user = user;
      if (user && user._id) {
        this.category_map = {};
        this.activitiesStream.getActivitiesByUserId(user._id)
        .subscribe(activities => {
          this.activities = activities;
        });
        this.eventful.categories.subscribe((categories: EventfulCategory[]) => {
          if (this.user) {
            categories = categories.map(category => {
              category.selected = user.categories.indexOf(category.id) >= 0;
              return category
            });
          }
          categories.forEach((category: EventfulCategory) => {
            this.category_map[category.id] = category;
            this.category_map[category.name] = category;
          });
          this.categories = categories
        });
        this.eventful.getCategories().then(console.log).catch(console.error);
      }
    });

    this.userService.getUser().then(console.log).catch(console.error);
  }

  public addCategoryToActivity(chip: { source: any, isUserInput: boolean }) {
    const selection = chip.source.value;
    const id = this.category_map[selection];
    this.activityCategoriesList.push(id);
    this.activityCategories.setValue("");
  }

  public removeCategoryFromActivity(index: number) {
    this.activityCategoriesList.splice(index, 1);
  }

  public createActivity() {
    this.activity.originalUser = this.user._id;
    this.activity.categories = this.activityCategoriesList.map(cat => cat.name);
    this.activitiesStream.create(this.activity)
    .then((result: { activity: Activity, activityUser: ActivityUser }) => {
      this.activities.push(result.activity);
      this.activityCategories.setValue([]);
      this.activityName.setValue("");
      this.activityDescription.setValue("");
    })
    .catch(console.error)
  }

  public followerUser(activity: Activity) {
    this.activitiesStream.followUser(activity, this.user).then(console.log).catch(console.error)
  }

  private filterCategories(val: string) {
    return val && this.categories ? this.categories.filter(
        (s: EventfulCategory) => new RegExp(`^${val}`, 'gi').test(s.name) && this.activityCategoriesList.indexOf(s) < 0
      ) : this.categories;
  }
}

