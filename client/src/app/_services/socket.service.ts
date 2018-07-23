import {Injectable} from '@angular/core';
import {of} from 'rxjs/internal/observable/of';
import * as socketIo from 'socket.io-client';
import {Observable} from "rxjs/index";
import {Message} from "../_models/Message";
import {SocketEvent} from "../_models/SocketEvent";
import {environment} from '../../environments/environment';

@Injectable()
export class SocketService {

  constructor(private socketIo: socketIo) {
  }

  private socket;

  joinRoom(room: string) {
    return of('');
  }

  public initSocket(): void {
    this.socket = this.socketIo(environment.socketUrl);
  }

  public disconnect(): void {
    this.socket && this.socket.disconnect();
  }

  public send(message: Message): Observable<any> {
    return new Observable<SocketEvent>(observer => {
      this.socket.emit('message', message);
      observer.next();
    });
  }

  public onMessage(): Observable<Message> {
    return new Observable<Message>(observer => {
      this.socket.on('message', (data: Message) => observer.next(data));
    });
  }

  public onEvent(event: SocketEvent): Observable<any> {
    return new Observable<SocketEvent>(observer => {
      this.socket.on(event, res => observer.next(res));
    });
  }

  public emit(event: SocketEvent, ...params: any[]): void {
    this.socket.emit(event, ...params);
  }
}
