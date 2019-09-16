import { Component, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { MessageService } from '../services'
 
/**
 * 汎用的なメッセージ表示用のモーダルダイアログのコンポーネント。
 */
@Component({
  selector: 'message',
  templateUrl: './message.component.html'
})
export class MessageComponent {

    public title: String
    public body: String

    @ViewChild('messageModal') public messageModal: ModalDirective;

    constructor(public messageService: MessageService ) {
        // MessageServiceのイベントを購読し、内容や表示有無を切り替えられるようにする
        this.messageService.messageChange.subscribe(
            message => {
                this.title = message.title;
                this.body = message.body;
                (message.hidden) ? this.messageModal.hide() : this.messageModal.show();
            }
        )
    }


}