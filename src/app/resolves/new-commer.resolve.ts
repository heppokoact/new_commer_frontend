import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { DataService, UtilService } from '../services';

import { RATING_STATUS } from '../const';

/**
 * 新人一覧を準備する。
 */
@Injectable()
export class NewCommerResolve implements Resolve<Array<any>> {

  /** 新人一覧のキャッシュ */
  private newCommers: Array<any>;

  constructor(
    private dataService: DataService,
  ) {}

  /**
   * 新人一覧を準備する。
   * 
   * @param route 現在のルーティング情報
   */
  resolve(route: ActivatedRouteSnapshot) {
    if (this.newCommers) {
      return this.newCommers;
    }
    return this.dataService.getNewCommers().map(newCommers => {
      this.newCommers = newCommers;
      return newCommers;
    });
  }

}