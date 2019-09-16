import groupBy from 'group-by'
import {
  Component,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subscription } from 'rxjs'
import { MessageService, DataService, SocketService, UtilService, LocalStorageService } from '../services'
import { GeneralRatingHistoryResolve } from '../resolves';

import { RATING_STATUS } from '../const';

/**
 * 「全体」画面のコンポーネント。
 */
@Component({
  selector: 'general',
  styleUrls: ['./general.component.css'],
  templateUrl: './general.component.html'
})
export class GeneralComponent implements OnInit, OnDestroy {

  /* マスタ */
  public majors: Array<any>
  public newCommers: Array<any>

  /* 表示する値 */
  public keyedRatings: any
  public yps: any

  /** コンポーネント破棄時にWebSocketの購読を停止するためのオブジェクト */
  private socketSubscription: Subscription;
  /** 単元の表示・非表示設定の変更イベント購読を停止するためのオブジェクト */
  private majorDisplaySubscription: Subscription;

  constructor(
    public route: ActivatedRoute,
    private messageService: MessageService,
    private dataService: DataService,
    private socket: SocketService,
    private util: UtilService,
    private local: LocalStorageService,
    private generalResolve: GeneralRatingHistoryResolve,
  ) {}

  /**
   * このコンポーネントを初期化する。
   */
  public ngOnInit() {
    // マスタデータおよび表示するデータを取得
    let data = this.route.snapshot.data;
    this.majors = data.unitContainer.majors;
    this.initMajorDisplay(this.local.getMajorDisplay());
    this.newCommers = data.newCommers;
    this.keyedRatings = data.generals;
    this.yps = data.yps;

    // WebSocketを購読し、採点依頼の更新情報を取得する
    this.socketSubscription = this.socket.onUpdate().subscribe(container => {
      // 採点依頼が更新された場合、YPも更新する
      this.dataService.getYps().subscribe(yps => {
        this.yps = yps;
      })
      // 採点依頼の更新情報を反映する
      this.updateRating(container);
    })

    // 単元ごとの表示・非表示の設定が変更された場合、それを反映する
    this.majorDisplaySubscription = this.local.majorDisplayChanged.subscribe(majorDisplay => {
      this.setMajorDisplay(majorDisplay);
    })
  }

  /**
   * ローカルで保持している採点依頼の情報を更新する
   * 
   * @param container 採点依頼の更新情報
   */
  private updateRating(container) {
    // 更新後の採点情報を取得
    let newRating = container.rating;
    let requesterNo = newRating.requesterNo;
    let unitId = newRating.unitId;

    // 採点依頼全体と、更新対象となっている採点依頼を保持している
    // 依頼者別のオブジェクトをコピーし、新しいオブジェクトを作成する。
    // オブジェクト自体を変更しないとAngular側にデータの更新が伝わらないため。
    let newKeyedRatings = Object.assign({}, this.keyedRatings);
    let indiviRatings = Object.assign({}, this.keyedRatings[requesterNo]);

    if (newRating.statusId == RATING_STATUS.DELETED) {
      /* 採点依頼が削除された場合 */
      // 前回の採点依頼（削除後の最新の採点依頼）が送られてきていればそれを表示する。
      // そうでなければ未着手の状態に戻す。
      let newestRating = container.newestRating;
      if (newestRating) {
        indiviRatings[unitId] = newestRating;
      } else {
        delete indiviRatings[unitId];
      }
    } else {
      /* 採点依頼が更新された場合 */
      // 変更した採点依頼が最新のものでなかった場合は何もしない。
      if (newRating.newest != '1') return;
      // 最新のものだった場合はそれを表示する。
      indiviRatings[unitId] = newRating;
    }

    // 新しく作成したオブジェクトをセットして表示させる
    newKeyedRatings[requesterNo] = indiviRatings;
    this.keyedRatings = newKeyedRatings;
  }

  /**
   * このコンポーネントが破棄されたときの処理。
   * WebSocketと単元ごとの表示・非表示の変更イベントの購読を停止する。
   */
  ngOnDestroy() {
    this.socketSubscription.unsubscribe();
    this.majorDisplaySubscription.unsubscribe();
  }

  /**
   * 採点依頼を再取得する。
   */
  public refreshRatings() {
    this.generalResolve.resolve(this.route.snapshot).subscribe(ratings => {
      this.keyedRatings = ratings;
    })
  }

  /**
   * 単元ごとに表示する・しないのフラグを設定する。
   * 設定はローカルストレージに保存されており、それを単元情報に適用する。
   * 
   * @param majorDisplay 単元の表示設定
   */
  private initMajorDisplay(majorDisplay) {
    /* フラグを立てる前の準備 */
    if (Object.keys(majorDisplay).length == 0) {
      /* 単元情報がローカルストレージに存在しない場合 */
      // 全ての単元を表示するように準備
      majorDisplay = this.majors.reduce((obj, major) => {
        obj[major.name] = true;
        return obj;
      }, {});

    } else {
      /* 単元情報がローカルストレージに存在する場合 */
      // ローカルストレージの設定に加え、新規追加された単元があればそれも表示するように準備
      // majorDisplay[major.name]がundefinedな画面は新規追加画面とみなしている
      this.majors.forEach(major => {
        if (majorDisplay[major.name] === undefined) {
          majorDisplay[major.name] = true;
        } 
      })
    }

    /* フラグを立てる */
    this.setMajorDisplay(majorDisplay);

    // 設定をローカルストレージに保存
    this.local.setMajorDisplay(majorDisplay);
  }

  /**
   * 引数の設定をローカルで保持している単元マスタの情報に適用する
   * 
   * @param majorDisplay 単元ごとの表示・非表示の設定
   */
  private setMajorDisplay(majorDisplay) {
    this.majors.forEach(major => {
      let display = majorDisplay[major.name];
      major.display = display;
    })
  }

  /**
   * 引数の条件で採点依頼を取得する。
   * 
   * @param newCommer 新人の社員情報
   * @param unit 単元情報
   */
  getRatings(newCommer, unit) {
    if (!this.keyedRatings) return null
    let newCommersRating = this.keyedRatings[newCommer.no];
    if (!newCommersRating) return null
    let rating = newCommersRating[unit.id];
    return (rating) ? rating : null
  }

  /**
   * 引数の条件でYPを取得する。
   * 
   * @param majorName 単元名
   * @param employeeNo 社員No
   * @return YP
   */
  getYp(majorName, employeeNo) {
    let major = this.yps[majorName];
    if (!major) return 0;
    let yp = major[employeeNo];
    return yp ? yp : 0;
  }

}
