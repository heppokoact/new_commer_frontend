import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { Observable } from 'rxjs'
import { DataService, UtilService } from '../services';

import { RATING_STATUS } from '../const';

/**
 * 「全体」画面の表示に必要な採点履歴を準備する。
 */
@Injectable()
export class GeneralRatingHistoryResolve implements Resolve<Array<any>> {

  constructor(
    private dataService: DataService,
  ) {}

  /**
   * 「全体」画面の表示に必要な採点履歴を準備する。
   * 
   * @param route 現在のルーティング情報
   * @return 「全体」画面の表示に必要な採点履歴
   */
  resolve(route: ActivatedRouteSnapshot) {
    return this.dataService.getGeneralRatingHistories().map(ratings => {
      this.setNewest(ratings);
      return this.toKeyedRatings(ratings);
    });
  }

  /**
   * WebAPIから取得した採点履歴の最新フラグをONにセットする。
   * WebAPIは最新の採点履歴を返すが、データの中に最新フラグは含まれていないため、
   * ここで全ての採点履歴についてONにする。
   * 
   * @param ratings 採点履歴
   */
  private setNewest(ratings) {
    Object.keys(ratings).forEach(key => {
      ratings[key].forEach(rating => rating.newest = '1');
    })
  }

  /**
   * 引数の採点履歴のデータ構造を変換し、単元IDで採点履歴が引けるようにする。
   * 
   * ＜変換後のデータ構造＞
   * {
   *     社員番号: {
   *         単元ID: 採点履歴
   *     }
   * }
   * 
   * @param ratings 変換前の採点履歴
   * @return 変換後の採点履歴
   */
  private toKeyedRatings(ratings) {
    let keyedRatings = {}
    Object.keys(ratings).forEach(key => {
      let value = ratings[key];
      let indivRatings = {}
      value.forEach(rating => {
        indivRatings[rating.unitId] = rating
      })
      keyedRatings[key] = indivRatings;
    })
    return keyedRatings;
  }


}