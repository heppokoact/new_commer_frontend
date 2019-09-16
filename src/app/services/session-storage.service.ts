import { Injectable } from '@angular/core';

/**
 * セッションストレージにアクセスするサービス
 */
@Injectable()
export class SessionStorageService {

    /** ログインしている社員情報のキャッシュ */
    private user: any

    constructor() {
    }

    /**
     * ログインしている社員の情報を取得する。
     * 
     * @return ログインしている社員の情報
     */
    public getUser() {
        return this.user || JSON.parse(sessionStorage.getItem('user'));
    }

    /**
     * ログインしている社員の情報をセットする。
     * 
     * @param user ログインしてる社員の除法
     */
    public setUser(user) {
        this.user = user
        sessionStorage.setItem('user', JSON.stringify(user));
    }
}