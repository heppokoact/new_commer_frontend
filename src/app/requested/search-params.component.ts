import {
  Component,
  OnInit,
  Input,
  ViewChild
} from '@angular/core';
import {
  ActivatedRoute,
  Router,
} from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { UtilService, DataService, SessionStorageService } from '../services'
import { RequestedComponent } from './requested.component';

import { RATING_STATUS } from '../const';

/**
 * 採点履歴の抽出条件を入力するモーダル画面のコンポーネント。
 */
@Component({
  selector: 'search-params',
  styleUrls: [ './search-params.component.css' ],
  templateUrl: './search-params.component.html'
})
export class SearchParamsComponent implements OnInit {

  /* マスター */
  RatingStatus = RATING_STATUS;
  newCommers: Array<any>;
  orders: Array<any>;
  majors: Array<any>;
  keyedMajors: any;
  minors: Array<any>;
  instructors: Array<any>;
  statuses: Array<any>;

  @ViewChild('searchParamsModal') public searchParamsModal: ModalDirective;

  /** 抽出条件パラメーター */
  public params: any = {statusId: []};
  /** 画面上で選択されているソート条件 */
  public selectedOrders = [];

  constructor(
    public route: ActivatedRoute,
    public util: UtilService,
    private dataService: DataService,
    private session: SessionStorageService,
    private router: Router,
  ) {}

  /**
   * コンポーネントの初期化処理
   */
  public ngOnInit() {
    // 準備しておいたマスタデータを取り込む
    let data = this.route.snapshot.data;
    this.newCommers = data.newCommers;
    this.orders = [
      {value: 'requestDt:asc', name: '提出日時△'},
      {value: 'requestDt:desc', name: '提出日時▼'},
      {value: 'completeDt:asc', name: '採点日時△'},
      {value: 'completeDt:desc', name: '採点日時▼'},
      {value: 'requesterNo:asc', name: '社員No△'},
      {value: 'requesterNo:desc', name: '社員No▼'},
    ]
    this.majors = data.unitContainer.majors;
    this.keyedMajors = data.unitContainer.keyedMajors;
    this.minors = [];
    this.instructors = data.instructors;
    this.statuses = data.statusContainer.statuses;
  }

  /**
   * このコンポーネントを表示する。
   * 
   * @param params 初期表示する検索条件パラメータ
   */
  public show(params) {
    this.params = params;
    this.changeMajor();
    this.searchParamsModal.show();
  }

  /**
   * 画面で指定した検索条件パラメータを採点履歴一覧画面に適用する。
   * その後、このコンポーネントを非表示にする。
   */
  public configure() {
    // this.paramsのパラメータのうち、undefinedやnullでないパラメータのみを選別
    let params = Object.keys(this.params).reduce((obj, key) => {
      let p = this.params[key];
      if (p) obj[key] = p;
      return obj;
    }, {})
    // パラメータを適用
    this.router.navigate([], {queryParams: params});

    this.searchParamsModal.hide();
  }

  /**
   * 単元名（major）を変化させたときに、章名（minor）をリセットする。
   */
  public changeMajor() {
    let major = this.keyedMajors[this.params.majorName];
    this.minors = (major) ? major.minors : [];
    // this.paramsにminorNameが設定されており、それが現在選択されている単元のものでない限り、
    // 章名（minor）をリセットする。
    if (this.minors.every(minor => minor.minorName != this.params.minorName)) {
      this.params.minorName = null;
    }
  }

  /**
   * 採点ステータスのボタンをクリックした場合の処理。
   * すでに選択されていれば見選択に戻し、未選択であれば選択にする。
   * 
   * @param statusId 変化させた採点ステータスのID
   */
  public changeStatus(statusId) {
    if (this.isSelectedStatus(statusId)) {
      this.params.statusId = this.params.statusId.filter(s => s != statusId)
    } else {
      this.params.statusId = [statusId].concat(this.params.statusId)
    }
  }

  /**
   * 並び替え条件を変化させたときの処理。
   * this.paramsの並び替え条件パラメータを更新する。
   */
  public changeOrder() {
    this.params.order = this.selectedOrders.filter(order => order).join();
  }

  /**
   * 引数で指定した採点ステータスIDが選択されているかどうかを調べる。
   * 
   * @param statusId 採点ステータスID
   * @return 選択されていればtrue
   */
  public isSelectedStatus(statusId) {
    return this.params.statusId.indexOf(statusId) >= 0;
  }

}