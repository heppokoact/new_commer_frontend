import { Injectable, Output, EventEmitter } from '@angular/core';

/**
 * 汎用メッセージ代ログ用のサービス
 */
@Injectable()
export class MessageService {

    /**
     * メッセージを表示するコンポーネントにイベントを伝達する
     */
    @Output() messageChange = new EventEmitter<any>();

    constructor() {}

    /**
     * メッセージダイアログを表示する
     * 
     * @param title ダイアログに表示するタイトル
     * @param body ダイアログに表示するメッセージ
     */
    showMessage(title: String, body: String) {
        this.messageChange.emit({
            title,
            body,
            hidden: false
        })
    }

    /**
     * メッセージダイアログを非表示にする
     */
    hideMessage() {
        this.messageChange.emit({
            title: '',
            body: '',
            hidden: true
        })
    }

}