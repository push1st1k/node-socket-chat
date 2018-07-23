import {AfterViewInit, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren} from '@angular/core';
import { Router } from '@angular/router';

import { SocketService } from '../_services/socket.service';
import {map} from 'rxjs/operators';
import {UserService} from '../_services/user.service';
import {SocketEvent} from '../_models/SocketEvent';
import {MatListItem} from "@angular/material";

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.css']
})
export class ConversationComponent implements OnInit, AfterViewInit  {
  conversation: any;
  text: string;
  messages: Array<any> = [];
  roomId = 'general';
  roomNavOpened = false;
  typing = false;
  TYPING_TIMER_LENGTH = 1000;
  lastTypingTime: number;
  user: any;

  @ViewChild('history', { read: ElementRef }) matList: ElementRef;

  @ViewChildren('historyItem', { read: ElementRef }) matListItems: QueryList<MatListItem>;

  constructor(private socketService: SocketService, private userService: UserService, private router: Router) { }

  ngOnInit() {
    if (!this.userService.isLoggedIn()) {
      return this.logout();
    }
    this.user = this.userService.getUser();
    this.initIoConnection();
  }

  ngAfterViewInit(): void {
    // subscribing to any changes in the list of items / messages
    this.matListItems.changes.subscribe(_ => {
      this._scrollToTheLast();
    });
  }

  _convertMessage(msg) {
    (<any>msg).memberIdx = this.conversation.members.findIndex(m => m.name === msg.owner);
    msg.type = 'text';
    return msg;
  }

  initIoConnection(): void {
    this.socketService.initSocket();

    this.socketService.onEvent(SocketEvent.CONNECT)
      .subscribe(_ => {
        this.socketService.emit(SocketEvent.USER_ADD, this.user.name);

        this.socketService.joinRoom(this.roomId)
          .pipe(map(_ => {
            this.conversation = {
              display_name: 'General',
              members: []
            };
            this.conversation.me = this.user;
          }))
          .subscribe();
      });

    this.socketService.onEvent(SocketEvent.LOGIN)
      .subscribe(res => {
        this.userService.setUser(res.user); //with logo

        this.conversation.members = res.activeUsers;

        this.messages = res.messages.map(this._convertMessage.bind(this));
      });

    this.socketService.onMessage()
      .subscribe(newMsg => {
        this.messages.push(this._convertMessage.call(this, newMsg));
      });

    this.socketService.onEvent(SocketEvent.USER_JOINED)
      .subscribe(user => {
        this.conversation.members.push(user);
        this.messages.push({
          type: 'member:joined',
          owner: user.name
        });
      });

    this.socketService.onEvent(SocketEvent.USER_LEFT)
      .subscribe(user => {
        const idx = this.conversation.members.findIndex(m => {
          return m.name === user.name;
        });
        this.conversation.members.splice(idx, 1);
        this.messages.push({
          type: 'member:left',
          owner: user.name
        });
      });

    this.socketService.onEvent(SocketEvent.START_TYPING)
      .subscribe(user => {
        this.messages.push({
          type: 'member:typing',
          owner: user.name
        });
      });

    this.socketService.onEvent(SocketEvent.STOP_TYPING)
      .subscribe(user => {
        this.messages = this.messages.filter(msg => {
          return !(msg.type === 'member:typing' && msg.owner === user.name);
        });
      });
  };

  _scrollToTheLast() {
    try {
      this.matList.nativeElement.scrollTop = this.matList.nativeElement.scrollHeight;
    } catch (err) {
    }
  }

  sendText(text: string) {
    if (!text || text.trim().length === 0) {
      return;
    }
    this.socketService.send({room: this.roomId, value: text}).subscribe(
      () => {
        this.text = '';
        this.messages.push(this._convertMessage({
          value: text,
          owner: this.user.name,
          room: this.roomId
        }));
      });
  }

  detectTyping() {
    if (!this.typing) {
      this.typing = true;
      this.socketService.emit(SocketEvent.START_TYPING);
    }
    this.lastTypingTime = Date.now();

    setTimeout(() => {
      const typingTimer = Date.now();
      const timeDiff = typingTimer - this.lastTypingTime;
      if (timeDiff >= this.TYPING_TIMER_LENGTH && this.typing) {
        this.socketService.emit(SocketEvent.STOP_TYPING);
        this.typing = false;
      }
    }, this.TYPING_TIMER_LENGTH);
  }

  logout() {
    this.userService.logout();
    this.socketService.disconnect();
    this.router.navigate(['/']);
  }
}
