import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { DataService, UtilService } from '../services';

import { RATING_STATUS } from '../const';

/**
 * YP一覧を準備する。
 */
@Injectable()
export class YpResolve implements Resolve<Array<any>> {

  constructor(
    private dataService: DataService,
  ) {}

  /**
   * YP一覧を準備する。
   * 
   * @param route 現在のルーティング情報
   */
  resolve(route: ActivatedRouteSnapshot) {
    return this.dataService.getYps();
  }

}