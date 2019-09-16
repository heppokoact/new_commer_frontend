
import 'rxjs/Rx'

import { Injectable } from '@angular/core';
import { Http, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs';
import { MessageService } from './message.service'
import { Socket } from 'ng2-socket-io';

import { CONTEXT_PATH } from '../const'

/**
 * WebSocketを取り扱うサービス
 */
@Injectable()
export class SocketService {

    constructor(private socket: Socket) {
    }

    /**
     * サーバーから採点依頼の更新情報を受け取る
     * 
     * @return サーバーから送信された採点依頼の更新情報を返すObservable
     */
    onUpdate(): Observable<any> {
        return this.socket.fromEvent('updateRating')
    }

}