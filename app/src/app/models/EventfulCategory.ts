export class EventfulCategory {
  id: string;
  event_count: number;
  name: string;
  selected?: boolean;

  constructor(id: string, event_count: number, name: string, selected: boolean) {
    this.id = id;
    this.event_count = event_count;
    this.name = name;
    this.selected = selected;
  }
}
