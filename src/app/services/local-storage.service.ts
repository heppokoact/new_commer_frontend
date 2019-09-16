import { Injectable, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * ローカルストレージにアクセスするサービス
 */
@Injectable()
export class LocalStorageService {

    /** MajorDisplay（単元ごとの画面表示有無）のキャッシュ */
    private majorDisplay: any

    /** MajorDisplayが変更されたときのイベント */
    public majorDisplayChanged = new EventEmitter();

    constructor() {
    }

    /**
     * 単元ごとの画面表示有無設定を取得する。
     * 
     * ＜データ構造＞
     * {
     *     単元名: Boolean
     * }
     * 
     * @return 単元ごとの画面表示有無
     */
    public getMajorDisplay() {
        return this.majorDisplay || JSON.parse(localStorage.getItem('majorDisplay')) || {};
    }

    /**
     * 単元ごとの画面表示有無設定を保存する。
     * 
     * @param majorDisplay 単元ごとの画面表示有無
     * @param emit 単元ごとの画面表示有無を変更したときのイベントを発火させるかどうか
     */
    public setMajorDisplay(majorDisplay, emit = true) {
        this.majorDisplay = majorDisplay;
        localStorage.setItem('majorDisplay', JSON.stringify(majorDisplay));
        if (emit) this.majorDisplayChanged.emit(majorDisplay);
    }

}