import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { DataService, UtilService } from '../services';

import { RATING_STATUS } from '../const';

/**
 * 講師一覧を準備する。
 */
@Injectable()
export class InstructorResolve implements Resolve<Array<any>> {

  /* 講師一覧のキャッシュ */
  private instructors: Array<any>;

  constructor(
    private dataService: DataService,
  ) {}

  /**
   * 講師一覧を取得する。
   * 
   * @param route 現在のルーティング情報
   */
  resolve(route: ActivatedRouteSnapshot) {
    if (this.instructors) {
      return this.instructors;
    }
    return this.dataService.getInstructors().map(instructors => {
      this.instructors = instructors;
      return instructors;
    });
  }

}