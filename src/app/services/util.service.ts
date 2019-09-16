import { Injectable } from '@angular/core';
import { SessionStorageService } from './session-storage.service'

import { RATING_STATUS, EMPLOYEE_TYPE } from '../const';

/**
 * ユーティリティーサービス
 */
@Injectable()
export class UtilService {

  constructor(
    private session: SessionStorageService
  ) { }

  /**
   * ログイン中の社員が講師かどうか調べる
   * 
   * @return 講師ならtrue
   */
  public isInstructor(): Boolean {
    return this.session.getUser().type == EMPLOYEE_TYPE.INSTRUCTOR;
  }

  /**
   * 引数の採点履歴がログイン中のユーザーのものかどうか調べる
   * 
   * @param rating 採点履歴
   * @return 引数の採点履歴がログイン中のユーザーのものならtrue
   */
  public isSelf(rating): Boolean {
    return this.session.getUser().no == rating.requesterNo;
  }

  /**
   * ログイン中の社員が講師であるか、または引数の採点依頼がログイン中の社員の出したものかどうか調べる
   * 
   * @param rating 採点依頼
   * @return ログイン中の社員が講師であるか、または引数の採点依頼がログイン中の社員の出したものであればtrue
   */
  public isInstructorOrSelf(rating) {
    return this.isInstructor() || rating.requesterNo == this.session.getUser().no;
  }

  /**
   * 引数の採点依頼のステータスが「採点中」かどうか調べる
   * 
   * @param rating 採点依頼
   * @return 引数の採点依頼のステータスが「採点中」ならtrue
   */
  public isRating(rating) {
    return rating.statusId == RATING_STATUS.RATING;
  }

  /**
   * 引数の採点依頼のステータスが「削除済」かどうか調べる
   * 
   * @param rating 採点依頼
   * @return 引数の採点依頼のステータスが「削除済」ならtrue
   */
  public isDeleted(rating) {
    return rating.statusId == RATING_STATUS.DELETED;
  }

  /**
   * 引数の採点依頼が最新の依頼かどうかを調べる
   * 
   * @param rating 採点依頼
   * @return 引数の採点依頼が最新の依頼ならtrue
   */
  public isNewest(rating) {
    return rating.newest == '1';
  }

  /**
   * 引数の採点依頼のステータスを「採点待」にできるかどうか調べる
   * 
   * @param rating 採点依頼
   * @return 引数の採点依頼のステータスを「採点待」にできるならtrue
   */
  public canRequest(rating) {
    if (!rating) return false;
    if (!this.isNewest(rating)) return false;

    return this.isInstructor() && (
      rating.statusId == RATING_STATUS.NONE ||
      rating.statusId == RATING_STATUS.RATING ||
      rating.statusId == RATING_STATUS.SUCCESS ||
      rating.statusId == RATING_STATUS.FAIL
    )
  }

  /**
   * 引数の採点依頼の再依頼ができるかどうかを調べる
   * （初回の依頼も再依頼扱い）
   * 
   * @param rating 採点依頼
   * @return 引数の採点依頼の再依頼ができるならtrue
   */
  public canRequestAgain(rating) {
    if (!rating) return false;
    if (!this.isNewest(rating)) return false;

    return (this.isInstructor() && (
          rating.statusId == RATING_STATUS.NONE ||
          rating.statusId == RATING_STATUS.RATING ||
          rating.statusId == RATING_STATUS.SUCCESS ||
          rating.statusId == RATING_STATUS.FAIL
        )
      ) || (
        this.isSelf(rating) && (
          rating.statusId == RATING_STATUS.NONE ||
          rating.statusId == RATING_STATUS.FAIL
        )
      );
  }

  /**
   * 引数の採点依頼のステータスを「採点中」にできるかどうか調べる
   * 
   * @param rating 採点依頼
   * @return 引数の採点依頼のステータスを「採点中」にできるならtrue
   */
  public canRate(rating) {
    if (!rating) return false;
    if (!this.isNewest(rating)) return false;

    return this.isInstructor() && (
      rating.statusId == RATING_STATUS.REQUESTED ||
      rating.statusId == RATING_STATUS.SUCCESS ||
      rating.statusId == RATING_STATUS.FAIL
    );
  }

  /**
   * 引数の採点依頼のステータスを「合格」にできるかどうか調べる
   * 
   * @param rating 採点依頼
   * @return 引数の採点依頼のステータスを「合格」にできるならtrue
   */
  public canSuccess(rating) {
    if (!rating) return false;
    if (!this.isNewest(rating)) return false;

    return this.isInstructor() && (
      rating.statusId == RATING_STATUS.RATING ||
      rating.statusId == RATING_STATUS.FAIL
    );
  }
  
  /**
   * 引数の採点依頼のステータスを「不合格」にできるかどうか調べる
   * 
   * @param rating 採点依頼
   * @return 引数の採点依頼のステータスを「不合格」にできるならtrue
   */
  public canFail(rating) {
    if (!rating) return false;
    if (!this.isNewest(rating)) return false;

    return this.isInstructor() && (
      rating.statusId == RATING_STATUS.RATING ||
      rating.statusId == RATING_STATUS.SUCCESS
    );
  }

  /**
   * 引数の採点依頼を取消できるかどうか調べる
   * 
   * @param rating 採点依頼
   * @return 引数の採点依頼を取り消しできるならtrue
   */
  public canDecline(rating) {
    if (!rating) return false;
    if (!this.isNewest(rating)) return false;

    return (this.isInstructor() && rating.statusId == RATING_STATUS.RATING) ||
      (this.isInstructorOrSelf(rating) && rating.statusId == RATING_STATUS.REQUESTED);
  }

  /**
   * 引数の採点依頼の詳細画面を開いて良いかどうか調べる
   * @param rating 採点依頼
   * @return 引数の採点依頼の詳細画面を開いて良いならtrue
   */
  public canShowDetail(rating) {
    return this.isInstructor() && rating.statusId != RATING_STATUS.DELETED;
  }

  /**
   * 引数のパラメータを元に、採点依頼一覧を取得するためのクエリーパラメーターの元を組み立てる。
   * 引数のparamsに入っている余計なパラメータを除外するためのメソッド。
   * 
   * @param params 採点依頼一覧を取得するためのクエリーパラメーター 
   * @return 採点依頼一覧を取得するためのクエリーパラメーター（余計なパラメータは除外済)
   */
  public buildRequestedParams(params) {
    return {
      statusId: params.statusId || [],
      raterNo: params.raterNo,
      requesterNo: params.requesterNo,
      order: params.order,
      majorName: params.majorName,
      minorName: params.minorName,
      requestDtFrom: params.requestDtFrom,
      requestDtTo: params.requestDtTo,
      completeDtFrom: params.completeDtFrom,
      completeDtTo: params.completeDtTo,
    };
  }

  /**
   * 引数の日付オブジェクトを"yyyy-MM-ddThh:mm"形式の文字列に変換する。
   * 
   * @param date 文字列化する日付
   * @return 日付文字列
   */
  public toDateString(date) {
    return (date.getFullYear().toString() + '-'
      + ("0" + (date.getMonth() + 1)).slice(-2) + '-'
      + ("0" + (date.getDate())).slice(-2))
      + 'T' + date.toTimeString().slice(0, 5);
  }

  /**
   * 引数の新人の採点履歴を取得するためのパラメータを組み立てる。
   * 
   * @param newCommerNo 新人の社員No
   * @return 組み立てたパラメータ
   */
  public buildNewCommerParams(newCommerNo) {
    let now = new Date();
    let aMonthBefore = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30);
    return {
      requesterNo: newCommerNo,
      requestDtFrom: this.toDateString(aMonthBefore),
      order: 'requestDt:desc'
    }
  }

  /**
   * 引数の講師の採点履歴を取得するためのパラメータを組み立てる。
   * 
   * @param newCommerNo 講師の社員No
   * @return 組み立てたパラメータ
   */
  public buildInstructorParams(instructorNo) {
    let now = new Date();
    let aWeekBefore = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    return {
      raterNo: instructorNo,
      requestDtFrom: this.toDateString(aWeekBefore),
      order: 'requestDt:desc'
    }
  }

  /**
   * 引数の単元の採点履歴を取得するためのパラメータを組み立てる。
   * 
   * @param majorName 単元名
   * @param minorName 章名
   * @return 組み立てたパラメータ
   */
  public buildUnitParams(majorName, minorName) {
    return {
      majorName,
      minorName,
      order: 'requestDt:desc'
    }
  }

}