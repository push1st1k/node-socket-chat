import {async, ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import { ConversationComponent } from './conversation.component';
import {
  MatCardModule, MatDividerModule, MatFormFieldModule, MatIconModule, MatInputModule,
  MatListModule, MatSidenavModule, MatTabsModule, MatTooltipModule
} from "@angular/material";
import {FormsModule} from "@angular/forms";
import {SocketService} from "../_services/socket.service";
import {UserService} from "../_services/user.service";
import {Router} from "@angular/router";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {Observable, of} from "rxjs/index";
import {SocketEvent} from "../_models/SocketEvent";

describe('ConversationComponent should', () => {
  let component: ConversationComponent;
  let fixture: ComponentFixture<ConversationComponent>;
  const userServiceSpy = jasmine.createSpyObj('UserService',
    ['getUser', 'setUser', 'isLoggedIn', 'logout']);

  const user = {name: 'test'};
  userServiceSpy.getUser.and.returnValue(user);
  userServiceSpy.isLoggedIn.and.returnValue(true);

  const socketServiceSpy = jasmine.createSpyObj('SocketService',
    ['initSocket', 'onEvent', 'emit', 'onMessage', 'disconnect', 'joinRoom', 'send']);
  socketServiceSpy.initSocket.and.returnValue();
  socketServiceSpy.onEvent.and.callFake((event) => {
    return new Observable<any>(observer => {
      if (event === SocketEvent.LOGIN) {
        return observer.next({
          user: user,
          activeUsers: [],
          messages: []
        });
      }

      if (event === SocketEvent.CONNECT) {
        return observer.next();
      }

      observer.next(user);
    });
  });
  socketServiceSpy.onMessage.and.returnValue(of({
    owner: user.name,
    value: '123'
  }));
  socketServiceSpy.joinRoom.and.returnValue(of(''));

  const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
  routerSpy.navigate.and.returnValue();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConversationComponent ],
      imports: [ MatSidenavModule, MatListModule,
        MatIconModule, MatTooltipModule,
        MatDividerModule, MatTabsModule,
        MatFormFieldModule, MatCardModule,
        MatInputModule,
        FormsModule, BrowserAnimationsModule ],
      providers: [
        {provide: Router, useValue: routerSpy},
        {provide: UserService, useValue: userServiceSpy},
        {provide: SocketService, useValue: socketServiceSpy}
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConversationComponent);
    component = fixture.componentInstance;
  }));

  beforeEach(fakeAsync(()=>{
    component.ngOnInit();
    // component.ngAfterViewInit();
    tick();
    fixture.detectChanges();

    routerSpy.navigate.calls.reset();
  }));

  it('create', () => {
    expect(component).toBeTruthy();
  });

  it('init socket connection', () => {
    socketServiceSpy.onEvent.calls.reset();
    socketServiceSpy.onMessage.calls.reset();

    component.initIoConnection();

    expect(socketServiceSpy.initSocket).toHaveBeenCalled();
    expect(socketServiceSpy.onEvent).toHaveBeenCalledWith(SocketEvent.CONNECT);
    expect(socketServiceSpy.onEvent).toHaveBeenCalledWith(SocketEvent.LOGIN);
    expect(socketServiceSpy.onEvent).toHaveBeenCalledWith(SocketEvent.USER_JOINED);
    expect(socketServiceSpy.onEvent).toHaveBeenCalledWith(SocketEvent.USER_LEFT);
    expect(socketServiceSpy.onEvent).toHaveBeenCalledWith(SocketEvent.START_TYPING);
    expect(socketServiceSpy.onEvent).toHaveBeenCalledWith(SocketEvent.STOP_TYPING);
    expect(socketServiceSpy.onMessage).toHaveBeenCalled();
  });

  it('convert message', () => {
    const msg = {
      value: '123',
      owner: 'test',
      room: 'room'
    };
    component.conversation.members = [{name: 'test'}];
    const actual = component._convertMessage(msg);

    expect(actual.memberIdx).toEqual(0);
    expect(actual.type).toEqual('text');
  });

  it('send message', () => {
    const text = '123';
    const initMessagesLength = component.messages.length;
    socketServiceSpy.send.and.returnValue(of(''));
    spyOn(component, '_convertMessage').and.callThrough();

    component.sendText(text);

    expect(component.text).toEqual('');
    expect(component.messages.length).toEqual(initMessagesLength + 1);
    expect(socketServiceSpy.send).toHaveBeenCalledWith({room: component.roomId, value: text});
    expect(component._convertMessage).toHaveBeenCalled();
  });

  it('not send empty message', () => {
    socketServiceSpy.send.calls.reset();

    component.sendText('   ');

    expect(socketServiceSpy.send).not.toHaveBeenCalled();
  });

  it('handle typing', fakeAsync(() => {
    component.detectTyping();

    expect(component.typing).toEqual(true);
    expect(socketServiceSpy.emit).toHaveBeenCalledWith(SocketEvent.START_TYPING);

    tick(component.TYPING_TIMER_LENGTH);

    expect(component.typing).toEqual(false);
    expect(socketServiceSpy.emit).toHaveBeenCalledWith(SocketEvent.STOP_TYPING);
  }));

  it('logout', () => {
    userServiceSpy.logout.and.returnValue();
    socketServiceSpy.disconnect.and.returnValue();

    component.logout();

    expect(userServiceSpy.logout).toHaveBeenCalled();
    expect(socketServiceSpy.disconnect).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });
});
