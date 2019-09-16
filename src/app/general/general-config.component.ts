import {
  Component,
  Input,
  ViewChild,
  OnInit,
} from '@angular/core';
import {
  ActivatedRoute,
} from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DataService, UtilService, LocalStorageService } from '../services'
import { GeneralComponent } from './general.component';

import { RATING_STATUS } from '../const'

/**
 * 「全体」画面の設定を行うコンポーネント
 */
@Component({
  selector: 'general-config',
  styleUrls: ['general-config.component.css'],
  templateUrl: 'general-config.component.html'
})
export class GeneralConfigComponent implements OnInit {

  /* マスタ */
  public majors: Array<any>

  @ViewChild('generalConfigModal') public generalConfigModal: ModalDirective;

  /** 設定値 */
  public majorDisplay = {};

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private util: UtilService,
    private local: LocalStorageService,
  ) { }

  /**
   * このコンポーネントの初期化を行う。
   */
  public ngOnInit() {
    this.majors = this.route.snapshot.data.unitContainer.majors;
  }
  
  /**
   * このモーダルダイアログを表示する。
   */
  public show() {
    // ローカルストレージに保持している設定値を反映する
    this.majorDisplay = this.local.getMajorDisplay();

    this.generalConfigModal.show();
  }
  
  /**
   * 単元の選択・未選択を切り替える。
   * 
   * @param majorName 変更する単元の名前
   */
  public toggleMajorDisplay(majorName) {
    this.majorDisplay[majorName] = !this.majorDisplay[majorName];
  }

  /**
   * 設定を「全体」画面に適用する。
   */
  public apply() {
    // 一度も選択されなかった単元はundefinedになるので、falseに直す
    // GeneralComponentではundefinedの単元を新規追加単元とみなし表示対象とするため
    // falseに置き換えて非表示とする
    this.majors.forEach(major => {
      if (this.majorDisplay[major.name] === undefined) {
        this.majorDisplay[major.name] = false;
      }
    })

    // ローカルストレージに保存
    this.local.setMajorDisplay(this.majorDisplay);

    this.generalConfigModal.hide();
  }

}