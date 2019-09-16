import 'rxjs/Rx'

import groupBy from 'group-by';
import { Injectable } from '@angular/core';
import { Http, URLSearchParams, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs';
import { MessageService } from './message.service'

import { CONTEXT_PATH } from '../const'

/**
 * WebAPIからデータを取得するサービス
 */
@Injectable()
export class DataService {

    constructor(private http: Http,
        private messageService: MessageService
    ) { }

    /**
     * WebAPIにログインする。
     * 
     * @param employeeNo 社員番号
     * @param password パスワード
     * @return ログインが成功した場合ユーザー情報。失敗した場合nullを返すObservable
     */
    login(employeeNo, password) {
        return this.http.post(CONTEXT_PATH + 'login', {employeeNo, password}).map(
            res =>  {
                let array = res.json();
                return array.length ? array[0] : null;
            }
        ).catch(this.handleError.bind(this));
    }

    /**
     * 「全体」画面に表示するための採点履歴を取得する。
     * 
     * ＜データ構造＞
     * {
     *     社員番号: [
     *         採点履歴
     *     ]
     * }
     * 
     * @return 「全体」画面に表示するための採点履歴を返すObservable
     */
    getGeneralRatingHistories(): Observable<Array<any>> {
        return this.http.get(CONTEXT_PATH + 'ratingHistories/general').map(
            res => res.json()
        ).catch(this.handleError.bind(this));
    }

    /**
     * 「依頼済」「履歴」画面に表示するための採点履歴を取得する。
     * 
     * ＜データ構造＞
     * [
     *     採点履歴
     * ]
     * 
     * @param params 抽出条件
     * @return 「依頼済」「履歴」画面に表示するための採点履歴を返すObservable
     */
    getRatingHistories(params: any = {}): Observable<Array<any>> {
        let search = this.buildParams(params);
        return this.http.get(CONTEXT_PATH + 'ratingHistories', { search }).map(
            res => res.json()
        ).catch(this.handleError.bind(this));
    }

    /**
     * 単元を取得する。
     * 
     * ＜データ構造＞
     * [
     *     単元情報
     * ]
     * 
     * @param params 抽出条件
     * @return 単元を返すObservable
     */
    getUnits(params: any = {}): Observable<Array<any>> {
        let search = this.buildParams(params);
        return this.http.get(CONTEXT_PATH + 'units', { search }).map(
            res => res.json()
        ).catch(this.handleError.bind(this));
    }

    /**
     * 全ての新人を取得する。
     * 
     * @return 全ての新人を返すObservable
     */
    getNewCommers(): Observable<Array<any>> {
        return this.getEmployees({ type: '1'});
    }

    /**
     * 全ての講師を取得する。
     * 
     * @return 全ての講師を返すObservable
     */
    getInstructors(): Observable<Array<any>> {
        return this.getEmployees({ type: '2'});
    }

    /**
     * 社員を取得する。
     * 
     * ＜データ構造＞
     * [
     *     社員情報
     * ]
     * 
     * @param params 抽出条件
     * @return 社員を返すObservable
     */
    getEmployees(params): Observable<Array<any>> {
        let search = this.buildParams(params);
        return this.http.get(CONTEXT_PATH + 'employees', { search }).map(
            res => res.json()
        ).catch(this.handleError.bind(this));
    }

    /**
     * 採点依頼を登録する。
     * 
     * @param requesterNo 依頼者の社員No
     * @param unitId 単元ID
     * @param version 依頼回数
     * @return 処理結果を返すObservable
     */
    requestRating(requesterNo, unitId, version) {
        let url = CONTEXT_PATH + `ratingHistories/${requesterNo}/${unitId}/${version}`
        return this.http.put(url, {}).map(
            res => res.json()
        ).catch(this.handleError.bind(this));
    }

    /**
     * 採点依頼を編集する。
     * 
     * @param requesterNo 依頼者の社員No
     * @param unitId 単元ID
     * @param version 採点回数
     * @param params 編集条件
     * @return 処理結果を返すObservable
     */
    editRating(requesterNo, unitId, version, params) {
        let url = CONTEXT_PATH + `ratingHistories/${requesterNo}/${unitId}/${version}`
        return this.http.put(url, params).map(
            res => res.json()
        ).catch(this.handleError.bind(this));
    }

    /**
     * 採点依頼を取り下げる。
     * 
     * @param requesterNo 依頼者の社員No
     * @param unitId 単元ID
     * @param version 採点回数
     * @return 処理結果を返すObservable
     */
    declineRating(requesterNo, unitId, version) {
        let url = CONTEXT_PATH + `ratingHistories/${requesterNo}/${unitId}/${version}`
        return this.http.delete(url).map(
            res => res.json()
        ).catch(this.handleError.bind(this));
    }

    /**
     * 採点ステータスを取得する。
     * 
     * ＜データ構造＞
     * [
     *     ステータス情報
     * ]
     * 
     * @return 採点ステータスを返すObservable
     */
    getStatuses() {
        return this.http.get(CONTEXT_PATH + 'statuses').map(
            res => res.json()
        ).catch(this.handleError.bind(this));
    }

    /**
     * 「全体」画面に表示するYPの一覧を取得する。
     * 
     * ＜データ構造＞
     * {
     *     単元名: {
     *         社員番号: YP
     *     }
     * }
     * 
     * @return 「全体」画面に表示するYPの一覧を返すObservable
     */
    getYps() {
        return this.http.get(CONTEXT_PATH + 'ratingHistories/yp').map(
            res => res.json()
        ).catch(this.handleError.bind(this));
    }

    /**
     * HTTP通信およびサーバーで発生したエラーの内容を画面に表示する。
     * 
     * @param err 発生したエラー
     * @param caught エラーの発生源になったObservable
     * @return 受け取ったエラーをそのまま返す（発生させる）Observable
     */
    handleError(err: any, caught: Observable<any>) {
        this.messageService.showMessage("サーバーでエラーが発生しました", JSON.stringify(err))
        return Observable.throw(err)
    }

    /**
     * リクエストパラメータに使用するURLSearchParamsオブジェクトを組み立てる。
     * 新しくURLSearchParamsを生成し、引数のオブジェクトが持つ要素を全てセットする。
     * 要素が配列である場合、サーバー側に配列として受け取ってもらうため、要素名の末尾に"[]"を付ける。
     * 
     * @param params リクエストパラメータ
     * @return 組み立てたURLSearchParams
     */
    private buildParams(params): URLSearchParams {
        let searchParams = new URLSearchParams()
        Object.keys(params).forEach(key => {
            let value = params[key];
            if (Array.isArray(value)) {
                value.forEach(v => {
                    searchParams.append(`${key}[]`, v);
                })
            } else {
                searchParams.set(key, value);
            }
        })
        
        return searchParams;
    }

}