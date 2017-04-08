import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'dmh-button-icon',
  templateUrl: './dmh-button-icon.component.html',
  styleUrls: ['./dmh-button-icon.component.css']
})
export class DmhButtonIconComponent {
  @Input() name: string;
  @Input() size: string;
  @Input() iconOnly: boolean;

  constructor() {}

  contains(sub: string) {
    return this.name.indexOf(sub) >= 0;
  }
}
