import {
  Component,
  Input,
  ViewChild
} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DataService, UtilService } from '../services'
import { GeneralComponent } from './general.component';

import { RATING_STATUS } from '../const'

/**
 * 採点依頼ダイアログのコンポーネント
 */
@Component({
  selector: 'edit-rating',
  styleUrls: ['edit-rating.component.css'],
  templateUrl: 'edit-rating.component.html'
})
export class EditRatingComponent {

  /* マスタ */
  private newCommer: any
  private unit: any
  private rating: any

  @Input() public general: GeneralComponent;
  @ViewChild('editRatingModal') public editRatingModal: ModalDirective;

  constructor(
    private dataService: DataService,
    private util: UtilService
  ) { }
  
  /**
   * このモーダルダイアログを表示する。
   * 
   * @param newCommer 採点依頼対象社員
   * @param unit 採点依頼対象単元
   * @param rating 現在の採点依頼
   */
  public show(newCommer, unit, rating) {
    this.newCommer = newCommer;
    this.unit = unit;
    this.rating = rating;
    this.editRatingModal.show();
  }

  /**
   * 採点を依頼する（再依頼）。
   */
  request() {
    let newVersion = Number(this.rating.version) + 1;
    this.dataService.requestRating(
      this.newCommer.no, this.unit.id, newVersion).subscribe(res => {
        // 矛盾とか出ると怖いので「全体」すべてをリフレッシュしておく
        this.general.refreshRatings();
        this.editRatingModal.hide();
      })
  }

  /**
   * 採点依頼を取り下げる
   */
  decline() {
    this.dataService.declineRating(
      this.newCommer.no, this.unit.id, this.rating.version).subscribe(res => {
        // 矛盾とか出ると怖いので「全体」すべてをリフレッシュしておく
        this.general.refreshRatings();
        this.editRatingModal.hide();
      })
  }


}