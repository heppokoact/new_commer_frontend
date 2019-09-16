import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild
} from '@angular/core';
import {
  ActivatedRoute
} from '@angular/router';
import { Observable, Subscription } from 'rxjs'
import { DataService, SessionStorageService, UtilService, SocketService } from '../services';
import { RATING_STATUS, EMPLOYEE_TYPE } from '../const';
import { EditRequestedComponent } from './edit-requested.component';
import { SearchParamsComponent } from './search-params.component';
import { RequestedResolve } from '../resolves';

/**
 * 採点履歴一覧画面のコンポーネント。
 */
@Component({
  selector: 'requested',
  styleUrls: [ './requested.component.css' ],
  templateUrl: './requested.component.html'
})
export class RequestedComponent implements OnInit, OnDestroy {

  @ViewChild(EditRequestedComponent) editRequsted: EditRequestedComponent;
  @ViewChild(SearchParamsComponent) searchParams: SearchParamsComponent;

  /** ログインユーザ */
  user: any
  /**採点ステータス一覧 */
  statuses: Array<any>
  /** 採点履歴 */
  ratings: Array<any>
  
  /** コンポーネントを破棄するときにWebSocketの購読を止めるためのオブジェクト */
  private socketSubscription: Subscription;

  constructor(
    private dataService: DataService,
    private socketService: SocketService,
    private session: SessionStorageService,
    private route: ActivatedRoute,
    private requestedResolve: RequestedResolve,
    public util: UtilService,
  ) {}

  /**
   * このコンポーネントを初期化する。
   */
  public ngOnInit() {
    // 準備していたデータを取り込む
    let data = this.route.snapshot.data
    this.ratings = data.requesteds;
    this.statuses = data.statusContainer.statuses;
    this.user = this.session.getUser();

    // URLのクエリパラメータが変化した際に採点履歴一覧を更新する。
    this.route.queryParams.flatMap(p => {
      return this.requestedResolve.resolve(this.route.snapshot);
    }).subscribe(requesteds => {
      this.ratings = requesteds;
    })

    // 採点履歴が更新されたときのサーバーからのpush通知を受け取り、一覧を更新する
    this.socketSubscription = this.socketService.onUpdate().subscribe(container => {
      let newRating = container.rating;
      if (newRating.statusId == RATING_STATUS.DELETED) {
        this.deleteRating(container);
      } else {
        this.updateRating(container);
      }
    })
  }

  /**
   * 削除された採点依頼のステータスを「削除済」に変更する。
   * また、削除で最新になった採点履歴の最新フラグを立てる。
   * 
   * @param container 採点履歴の更新情報
   */
  private deleteRating(container) {
    let deletedRating = container.rating;
    let newestRating = container.newestRating;

    this.ratings.forEach((rating, index) => {
      // 複合キーを比較するのではなく、idを比較すれば良いと思うかもしれないが、
      // deletedRatingはidを持っていないためできない（サーバーが送信してこない）
      if (rating.requesterNo == deletedRating.requesterNo &&
        rating.unitId == deletedRating.unitId &&
        rating.version == deletedRating.version) {
        this.ratings[index].statusId = RATING_STATUS.DELETED;
      }

      if (newestRating) {
        if (rating.id == newestRating.id) {
          rating.newest = '1';
        }
      }
    })
  }

  /**
   * 更新情報に該当する採点履歴があれば更新する。
   * それがなければ新規に追加する。
   * 
   * @param container 採点履歴の更新情報
   */
  private updateRating(container) {
    let newRating = container.rating;
    let matched = false;

    // IDが一致する採点履歴を探し、更新する
    this.ratings.forEach((rating, index) => {
      if (rating.id == newRating.id) {
        matched = true;
        this.ratings[index] = newRating;
      }
    })

    // IDが一致する採点履歴がなければ新規追加する。
    // その際、古くなった採点履歴の最新フラグをOFFにする。
    if (!matched) {
      this.ratings.forEach(rating => {
        if (rating.requesterNo == newRating.requesterNo &&
          rating.unitId == newRating.unitId &&
          rating.version < newRating.version) {
          rating.newest = '0'
        }
      })
      this.ratings.push(newRating);
    }
  }

  /**
   * このコンポーネントが破棄されたときの処理。
   * WebSocketを停止する。
   */
  public ngOnDestroy() {
    this.socketSubscription.unsubscribe();
  }

  /**
   * 指定した採点履歴の採点ステータスを「採点待」に変更する。
   * 
   * @param rating 採点履歴
   */
  public request(rating) {
    this.dataService.editRating(rating.requesterNo, rating.unitId, rating.version, {
      statusId: RATING_STATUS.REQUESTED,
      raterNo: null,
    }).subscribe();
  }

  /**
   * 指定した採点履歴の採点ステータスを「採点中」に変更する。
   * 
   * @param rating 採点履歴
   */
  public rate(rating) {
    this.dataService.editRating(rating.requesterNo, rating.unitId, rating.version, {
      statusId: RATING_STATUS.RATING,
      raterNo: this.user.no,
    }).subscribe();
  }

  /**
   * 指定した採点履歴の採点ステータスを「合格」に変更する。
   * 
   * @param rating 採点履歴
   */
  public success(rating) {
    this.dataService.editRating(rating.requesterNo, rating.unitId, rating.version, {
      statusId: RATING_STATUS.SUCCESS,
      raterNo: this.user.no,
    }).subscribe();
  }

  /**
   * 指定した採点履歴の採点ステータスを「不合格」に変更する。
   * 
   * @param rating 採点履歴
   */
  public fail(rating) {
    this.dataService.editRating(rating.requesterNo, rating.unitId, rating.version, {
      statusId: RATING_STATUS.FAIL,
      raterNo: this.user.no,
    }).subscribe();
  }

  /**
   * 指定した採点履歴を表示する詳細画面を開く。
   * 
   * @param rating 採点履歴
   */
  public showDetail(rating) {
    this.editRequsted.show(rating);
  }

  /**
   * 指定した採点履歴を削除する。
   * 
   * @param rating 採点履歴
   */
  public delete(rating) {
    let result = confirm(`
      ${rating.requesterNo} ${rating.requesterName}
      ${rating.majorName} ${rating.minorName}

      削除してよろしいですか？
    `)
    if (!result) return;

    this.dataService.declineRating(rating.requesterNo, rating.unitId, rating.version).subscribe();
  }

  /**
   * 検索条件設定モーダルダイアログを開く。
   */
  public showSearchParams() {
    let params = this.util.buildRequestedParams(this.route.snapshot.queryParams);
    this.searchParams.show(params);
  }

  /**
   * 指定された採点履歴が非活性とみなせるかどうかを調べる。
   * 
   * @param rating 採点履歴
   * @return 非活性とみなせる場合はtrue
   */
  public isInactive(rating) {
    let statusId = rating.statusId;
    return statusId == RATING_STATUS.DELETED ||
      statusId == RATING_STATUS.SUCCESS ||
      statusId == RATING_STATUS.FAIL;
  }

}
