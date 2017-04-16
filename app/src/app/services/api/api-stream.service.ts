import {BehaviorSubject, Observable, ReplaySubject, Subject} from "rxjs";
import {UserService} from "../user.service";
import {Http, Response} from "@angular/http";

export class ApiModel {
  public id: string;

  constructor(id: string) {
    this.id = id;
  }
}

export interface IOperation<T> extends Function {
  (data: T[] | any): T[];
}

export abstract class ApiStream<T extends ApiModel> extends BehaviorSubject<T[]> {
  public abstract baseUrl: string;

  public errMessage: string = "";
  public loading: boolean = false;
  protected mainStream: Observable<T[]>;
  protected createStream: Subject<T> = new Subject<T>();
  protected deleteStream: Subject<T> = new Subject<T>();
  protected updateStream: Subject<T> = new Subject<T>();
  private updates: ReplaySubject<IOperation<T>> = new ReplaySubject<IOperation<T>>();

  constructor(protected http: Http, protected userService: UserService) {
    super(null);

    this.mainStream = this.updates
    .scan((categories: T[], operation: IOperation<T>) => {
      return operation(categories);
    }, []);

    this.createStream
    .map((newRumor: T) => {
      return (curRumors: T[]) => {
        return curRumors.concat(newRumor)
      };
    })
    .subscribe(this.updates);

    this.updateStream
    .map((itemToUpdate: T) => {
      console.log('returning updateStream function...');
      return (curItems: T[]) => {
        return curItems.map((item: T) => {
          if (item.id == itemToUpdate.id) {
            return itemToUpdate;
          }
          return item;
        })
      }
    })
    .subscribe(this.updates);

    this.deleteStream
    .map((item: T) => {
      return (curItems: T[]) => {
        console.log('Deleting a category via stream.');
        return curItems.filter(eaItem => {
          return eaItem.id !== item.id;
        });
      }
    })
    .subscribe(this.updates);

    this.mainStream.subscribe(
      items => super.next(items),
      err => this.error(err)
    );
  }

  public createItem(itemToCreate: T) {
    this.loading = true;
    return new Promise<T>((resolve, reject) => {
      if (this.userService.isAuthenticated()) {
        this.http.post(`${this.baseUrl}`, itemToCreate)
        .map(res => res.json())
        .subscribe(
          (createdItem: T) => {
            this.loading = false;
            console.log('Created new rumor');
            console.log(createdItem);
            this.createStream.next(createdItem);
            resolve(createdItem)
          },
          err => {
            this.loading = false;
            this.error(err);
            reject(err);
          }
        )
      }
    })
  }

  public deleteItem(itemToDelete: T) {
    this.loading = true;
    return new Promise<string>((resolve, reject) => {
      if (this.userService.isAuthenticated()) {
        this.http.delete(`${this.baseUrl}/${itemToDelete.id}`)
        .subscribe(
          (res: Response) => {
            if (res.ok) {
              this.deleteStream.next(itemToDelete);
              return resolve("OK")
            }
            this.error("Response was not successful");
            this.loading = false;
            return reject("Response was not successful")
          },
          err => {
            this.error(err);
            this.loading = false;
            return reject(err)
          }
        )
      }
    });
  }

  public updateItem(itemToUpdate: T) {
    this.loading = true;
    return new Promise<T>((resolve, reject) => {
      if (this.userService.isAuthenticated()) {
        this.http.put(`${this.baseUrl}`, itemToUpdate)
        .map(res => res.json())
        .subscribe(
          (updatedItem: T) => {
            console.log('Created new item');
            console.log(updatedItem);
            this.updateStream.next(updatedItem);
            this.loading = false;
            resolve(updatedItem)
          },
          err => {
            this.error(err);
            this.loading = false;
            reject(err);
          }
        )
      }
    })
  }

  public getAll(): Promise<T[]> {
    this.loading = true;
    return new Promise<T[]>((resolve, reject) => {
      console.log('Loading current items');
      if (!this.userService.isAuthenticated()) {
        console.error('User not authenticated');
        super.next([]);
        this.loading = false;
        return reject("User not authenticated");
      }

      this.http.get(`${this.baseUrl}`)
      .map(res => res.json())
      .subscribe(
        (items: T[]) => { // on success
          console.log("Activities receieved");
          console.log(items);
          super.next([]);
          this.loading = false;
          items.forEach(item => {
            this.createStream.next(item);
          });
          resolve(items)
        },
        (err: any) => {
          console.log(err);
          super.error(err);
          this.loading = false;
          reject(err)
        }
      );
    })
  }

  public getById(id: string): Promise<T> {
    this.loading = true;
    return new Promise<T>((resolve, reject) => {
      if (!this.userService.isAuthenticated()) {
        console.error('User not authenticated');
        this.loading = false;
        return reject("User not authenticated");
      }

      this.http.get(`${this.baseUrl}/${id}`)
      .map(res => res.json())
      .subscribe(
        (item: T) => {
          this.loading = false;
          resolve(item)
        },
        err => {
          this.loading = false;
          reject(err)
        }
      )
    })
  }

  public error(message: any) {
    this.errMessage = message.toString()
  }
}
