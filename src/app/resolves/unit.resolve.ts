import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { DataService, UtilService } from '../services';

import { RATING_STATUS } from '../const';

/**
 * 単元一覧を準備する。
 */
@Injectable()
export class UnitResolve implements Resolve<Array<any>> {

  /**
   * 単元一覧のキャッシュ。
   * 3種類の単元一覧を保持している。
   * 
   * ・WebAPIから取得した単元一覧
   * ・単元（major）ごとにまとめた単元一覧
   * ・単元名（major）で単元を引けるようにした単元一覧
   */
  private unitConainer: any;

  constructor(
    private dataService: DataService,
  ) {}

  /**
   * 単元一覧を準備する。
   * 保持している3種類の単元一覧をまとめて返す。
   * 
   * @param route 現在のルーティング情報
   * @return 単元一覧
   */
  resolve(route: ActivatedRouteSnapshot) {
    if (this.unitConainer) {
      return this.unitConainer;
    }
    return this.dataService.getUnits().map(units => {
      let majors = this.unitsToMajors(units);
      let keyedMajors = this.toKeyedMajors(majors);
      this.unitConainer = { units, majors, keyedMajors };
      return this.unitConainer;
    });
  }

  /**
   * WebAPIから取得した単元一覧を、単元（major）ごとにまとめる。
   * 
   * ＜戻り値のデータ構造＞
   * [
   *     {
   *         name: 単元名,
   *         count: その単元の章（minor）の数,
   *         minors: [章（minor）一覧]
   *     }
   * ]
   * 
   * @param units WebAPIから取得した単元一覧
   * @return 単元（major）ごとにまとまった単元一覧
   */
  private unitsToMajors(units) {
    let majors = []
    let major = null;
    // 新しいmajorオブジェクトを作成するための関数
    let newMajor = unit => {
        return {
          name: unit.majorName,
          count: 1,
          minors: [unit]
        }
    }

    units.forEach(unit => {
      // 初回ループ時の初期化
      if (!major) {
        major = newMajor(unit);
        return;
      }

      if (major.name == unit.majorName) {
        // 前の単元と単元名（major）が同じ場合
        major.count++;
        major.minors.push(unit)
      } else {
        // キーブレイク処理
        majors.push(major);
        major = newMajor(unit);
      }
    })
    majors.push(major);

    return majors;
  }

  /**
   * 単元名（major）で単元を引けるよう、データ構造を変換する。
   * 
   * ＜戻り値のデータ構造＞
   * {
   *     単元名: {
   *         name: 単元名,
   *         count: その単元の章（minor）の数,
   *         minors: [章（minor）一覧]
   *     }
   * }
   * 
   * @param majors 単元一覧
   * @return 単元名（major）で単元を引ける単元一覧
   */
  private toKeyedMajors(majors) {
    return majors.reduce((obj, major) => {
      obj[major.name] = major;
      return obj;
    }, {});
  }

}