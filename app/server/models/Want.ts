export class Want {
  public categories: string[];
  public userId: string;

  constructor(categories: string[], userId: string) {
    this.categories = categories;
    this.userId = userId;
  }
}