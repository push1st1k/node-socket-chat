import {async, fakeAsync, TestBed, tick} from "@angular/core/testing";
import {CommonModule} from "@angular/common";
import {SocketService} from "./socket.service";
import * as socketIo from 'socket.io-client';
import {SocketEvent} from "../_models/SocketEvent";

describe('Socket Service', () => {
  let service: SocketService;
  const socketIoSpy = jasmine.createSpyObj('SocketIo', ['emit', 'disconnect', 'on']);

  const socketIoFn = () => {
    return socketIoSpy;
  };

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CommonModule],
      providers: [
        SocketService,
        {provide: socketIo, useValue: socketIoFn}
      ]
    })
      .compileComponents();
    service = TestBed.get(SocketService);
  }));

  it('be initialized', () => {
    expect(service).toBeDefined();
  });

  xit('init', () => {
    //spyOn(socketIoFn, '').and.callThrough();
    service.initSocket();

    expect(socketIoFn).toHaveBeenCalledWith('http://localhost:3000');
  });

  it('disconnect', () => {
    service.initSocket();
    service.disconnect();

    expect(socketIoSpy.disconnect).toHaveBeenCalled();
  });

  it('send message', fakeAsync(() => {
    service.initSocket();
    const msg = {room: 'test', value: '123'};

    service.send(msg).subscribe();

    tick();
    expect(socketIoSpy.emit).toHaveBeenCalledWith('message', msg);
  }));

  it('add listener on message event', fakeAsync(() => {
    service.initSocket();

    service.onMessage().subscribe();

    tick();
    expect(socketIoSpy.on).toHaveBeenCalledWith('message', jasmine.any(Function));
  }));

  it('add listener on event', fakeAsync(() => {
    service.initSocket();

    service.onEvent(SocketEvent.START_TYPING).subscribe();

    tick();
    expect(socketIoSpy.on).toHaveBeenCalledWith(SocketEvent.START_TYPING, jasmine.any(Function));
  }));

  it('emit', () => {
    service.initSocket();

    service.emit(SocketEvent.USER_LEFT, 'test');

    expect(socketIoSpy.emit).toHaveBeenCalledWith(SocketEvent.USER_LEFT, 'test');
  });

});
