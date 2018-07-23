import {async, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import { LoginComponent } from './login.component';
import {
  MatCardModule, MatFormFieldModule, MatGridListModule, MatInputModule,
  MatProgressSpinnerModule
} from "@angular/material";
import {FormsModule} from "@angular/forms";
import {UserService} from "../_services/user.service";
import {Router} from "@angular/router";
import {of} from "rxjs/index";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";

describe('LoginComponent should', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  const userServiceSpy = jasmine.createSpyObj('UserService', ['getUser', 'login']);
  userServiceSpy.getUser.and.returnValue({});

  const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
  routerSpy.navigate.and.returnValue();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoginComponent ],
      imports: [ MatCardModule, MatGridListModule, MatFormFieldModule, FormsModule,
        MatProgressSpinnerModule, MatInputModule, BrowserAnimationsModule ],
      providers: [
        {provide: Router, useValue: routerSpy},
        {provide: UserService, useValue: userServiceSpy}
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  }));

  beforeEach(fakeAsync(()=>{
    component.ngOnInit();
    tick();
    fixture.detectChanges();

    userServiceSpy.login.calls.reset();
    routerSpy.navigate.calls.reset();
  }));

  it('create', () => {
    expect(component).toBeTruthy();
  });

  it('login with correct credentials and open root page', () => {
    userServiceSpy.login.and.returnValue(of(''));
    component.username = 'user';
    component.authenticate();

    expect(userServiceSpy.login).toHaveBeenCalledWith('user');
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/conversation']);
  });

  it('not login with empty name', () => {
    spyOn(window, 'alert').and.callThrough();
    component.username = '   ';
    component.authenticate();

    expect(userServiceSpy.login).not.toHaveBeenCalled();
    expect(routerSpy.navigate).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith('Please provide valid user name!');
  });
});
