import {
  Component,
  OnInit,
  Input,
  ViewChild
} from '@angular/core';
import {
  ActivatedRoute
} from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { UtilService, DataService, SessionStorageService } from '../services'
import { RequestedComponent } from './requested.component';

import { RATING_STATUS } from '../const';

/**
 * 採点履歴編集モーダルダイアログのコンポーネント。
 */
@Component({
  selector: 'edit-requested',
  styleUrls: [ './edit-requested.component.css' ],
  templateUrl: './edit-requested.component.html'
})
export class EditRequestedComponent implements OnInit {

  /* マスタ */
  statuses: Array<any>

  @ViewChild('editRequestedModal') public editRequestedModal: ModalDirective;

  /* 画面入力値 */
  rating: any
  statusId: any
  memo: string
  yp: number
  ypMemo: string

  constructor(
    private dataService: DataService,
    private session: SessionStorageService,
    private route: ActivatedRoute,
    private util: UtilService
  ) {}

  /**
   * このコンポーネントを初期化する。
   */
  public ngOnInit() {
    this.statuses = this.route.snapshot.data.statusContainer.statuses.filter(status => {
      return status.id != RATING_STATUS.DELETED &&
          status.id != RATING_STATUS.NONE;
    });
  }

  /**
   * このコンポーネントを表示する。
   * 
   * @param rating 初期表示する採点履歴
   */
  public show(rating) {
    this.rating = rating
    this.statusId = rating.statusId
    this.memo = rating.memo;
    this.yp = Number(rating.yp);
    this.ypMemo = rating.ypMemo;
    this.editRequestedModal.show();
  }

  /**
   * 引数のステータスを画面入力値としてセットする。
   * ステータスボタン押下時に使用される。
   *
   * @param statusId ステータスのID
   */
  public setStatusId(statusId) {
    this.statusId = statusId
  }

  /**
   * YPを加算する。
   *
   * @param additional 加算する点数
   */
  public addYp(additional) {
    this.yp += additional;
  }

  /**
   * 採点履歴の編集を確定し、DBに反映する。
   */
  public register() {
    // 採点待ちに戻す場合は採点者を消す。
    // それ以外は編集している社員を採点者とする。
    let raterNo = this.rating.raterNo;
    if (this.statusId == RATING_STATUS.REQUESTED) {
      raterNo = null;
    } else {
      raterNo = this.session.getUser().no;
    }

    // DBに編集内容を反映
    this.dataService.editRating(this.rating.requesterNo, this.rating.unitId, this.rating.version, {
      statusId: this.statusId,
      raterNo,
      memo: this.memo,
      yp: this.yp,
      ypMemo: this.ypMemo,
    }).subscribe(() => {
      // 反映完了したらこのモーダルダイアログを閉じる
      this.editRequestedModal.hide();
    })
  }

}