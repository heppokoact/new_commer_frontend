import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { DataService, UtilService } from '../services';

/**
 * 採点履歴一覧用のデータを準備する。
 */
@Injectable()
export class RequestedResolve implements Resolve<Array<any>> {

  constructor(
    private dataService: DataService,
    private util: UtilService,
  ) {}

  /**
   * 採点履歴一覧用のデータを準備する。
   * 
   * @param route 現在のルーティング情報
   */
  resolve(route: ActivatedRouteSnapshot) {
    // route.queryParamsには余計な情報が含まれておりそのままWebAPIに送る
    // クエリーパラメータとしては使えないため、クレンジングを行う
    let params = this.util.buildRequestedParams(route.queryParams);

    return this.dataService.getRatingHistories(params);
  }

}