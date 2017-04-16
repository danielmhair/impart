export class Want {
  public categories: string[];
  public endpoint: string;

  constructor(categories: string[], endpoint: string) {
    this.categories = categories;
    this.endpoint = endpoint;
  }
}