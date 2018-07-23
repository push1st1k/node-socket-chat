import {Injectable} from '@angular/core';
import {of} from 'rxjs/internal/observable/of';
import {Observable} from 'rxjs/internal/Observable';

@Injectable()
export class UserService {
  user: any;
  userNameKey = 'username';

  constructor() {
    this._restore();
  }

  _restore(): void {
    this.user = {
      name: localStorage[this.userNameKey]
    };
  }

  isLoggedIn(): boolean {
    return !!this.user.name;
  }

  getUser(): any {
    return this.user;
  }

  setUser(newUser: any) {
    this.user = newUser;
  }

  login(username: string): Observable<any> {
    this._set(username);
    return of('');
  }

  _set(newValue: string): void {
    this.user.name = localStorage[this.userNameKey] = newValue;
  }

  logout(): Observable<any> {
    this._set('');
    return of('');
  }
}
