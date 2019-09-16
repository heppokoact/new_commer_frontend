import { Injectable, Inject } from '@angular/core';
import { BaseRequestOptions, RequestOptions, Headers, RequestOptionsArgs } from '@angular/http';

/**
 * XHRに毎回適用するリクエストオプション
 */
@Injectable()
export class AppRequestOptions extends BaseRequestOptions {

  /**
   * 毎回適用するリクエストヘッダー
   * XHRがキャッシュされないようにする
   */
  headers: Headers = new Headers({
    'Pragma': 'no-cache',
    'Cache-Control': 'no-cache',
    'If-Modified-Since': 'Thu, 01 Jun 1970 00:00:00 GMT',
  })

  /** CORSのときにクッキーが使えるようにする（認証有りでもCORSできるようにする） */
  withCredentials: boolean = true;
  
}