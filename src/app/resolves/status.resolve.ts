import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { DataService, UtilService } from '../services';

import { RATING_STATUS } from '../const';

/**
 * 採点ステータス一覧を準備する。
 */
@Injectable()
export class StatusResolve implements Resolve<Array<any>> {

  /**
   * 採点ステータス一覧のキャッシュ。
   * 2種類の採点ステータス一覧を保持している。
   * 
   * ・採点ステータスのリスト
   * ・採点ステータスIDをキーとした採点ステータスの一覧
   */
  private statusContainer: any;

  constructor(
    private dataService: DataService,
    private util: UtilService
  ) {}

  /**
   * 採点ステータス一覧を準備する。
   * 2種類の採点ステータス一覧を返却する。
   * 
   * @param route 現在のルーティング情報
   * @return 採点ステータス一覧
   */
  resolve(route: ActivatedRouteSnapshot) {
    if (this.statusContainer) {
      return this.statusContainer;
    }

    return this.dataService.getStatuses().map(statuses => {
      let marged = this.buildStatuses(statuses);
      let keyed = this.toKeyedStatuses(marged);
      this.statusContainer = {
        statuses: marged,
        keyedStatuses: keyed,
      }
      return this.statusContainer;
    });
  }

  /**
   * DBから取得した採点ステータス一覧に、下記の情報を付け加える。
   * 
   * ・当該ステータスのときに使用するbootstrapのクラス名
   * ・当該ステータスに変化させることが可能かどうかを判定するロジック
   * 
   * @param statuses WebAPIから取得した採点ステータス一覧
   * @return 付加情報を追加した採点ステータス一覧
   */
  private buildStatuses(statuses) {
    let localData = {
      [RATING_STATUS.NONE]: { 
          id: RATING_STATUS.NONE, 
          style: "secondary",   // ボタン等に適用するスタイル
          isAble: () => false,  // ボタン等を活性に指定医かどうかの判定ロジック
      },
      [RATING_STATUS.REQUESTED]: { 
          id: RATING_STATUS.REQUESTED,
          style: "success", 
          isAble: this.util.canRequest.bind(this.util) 
      },
      [RATING_STATUS.RATING]: { 
          id: RATING_STATUS.RATING, 
          style: "warning",
          isAble: this.util.canRate.bind(this.util) 
      },
      [RATING_STATUS.SUCCESS]: { 
          id: RATING_STATUS.SUCCESS, 
          style: "primary",
          isAble: this.util.canSuccess.bind(this.util) 
      },
      [RATING_STATUS.FAIL]: { 
          id: RATING_STATUS.FAIL, 
          style: "danger",
          isAble: this.util.canFail.bind(this.util) 
      },
      [RATING_STATUS.DELETED]: { 
          id: RATING_STATUS.DELETED, 
          style: "secondary",
          isAble: this.util.canDecline.bind(this.util) 
      },
    }

    return statuses.map(status => {
      return Object.assign({}, localData[status.id], status);
    });
  }

  private toKeyedStatuses(statuses) {
    return statuses.reduce((obj, status) => {
      obj[status.id] = status;
      return obj;
    }, {})
  }

}