import groupBy from 'group-by'
import {
  Component,
  OnInit,
  OnChanges,
  Input
} from '@angular/core';
import { ActivatedRoute } from '@angular/router'
import { ModalDirective } from 'ngx-bootstrap/modal';
import { MessageService, DataService } from '../services'
import { EditRatingComponent } from './edit-rating.component'

import { RATING_STATUS } from '../const';

/**
 * 採点状況を表示したり、押下することで採点依頼を行ったりするボタン
 */
@Component({
  selector: 'rating-button',
  templateUrl: './rating-button.component.html',
  styleUrls: ['./rating-button.component.css'],
})
export class RatingButtonComponent implements OnInit {

  /* マスタ */
  RatingStatus = RATING_STATUS;
  keyedStatuses: any;

  @Input() newCommer: any
  @Input() unit: any
  @Input() rating: any
  @Input() editRating: EditRatingComponent

  constructor(private route: ActivatedRoute) {
  }

  /**
   * このコンポーネントを初期化する。
   */
  public ngOnInit() {
    this.keyedStatuses = this.route.snapshot.data.statusContainer.keyedStatuses;
  }

  /**
   * このコンポーネントが変更された場合の処理。
   * 初期化後にも実行される。
   * 採点依頼がなされていなければ、初期状態を表示する。
   */
  public ngOnChanges() {
    if (!this.rating) {
      this.rating = {
        requesterNo: this.newCommer.no,
        statusId: RATING_STATUS.NONE,
        shortName: "-",
        version: 0,
        newest: '1',
      }
    }
  }

  /**
   * このコンポーネントに適用する、採点ステータスに応じたスタイルを取得する。
   */
  getRatingClass() {
    return this.keyedStatuses[this.rating.statusId].style;
  }

  /**
   * 採点依頼モーダルダイアログを表示する。
   */
  showEditRatingModal() {
    this.editRating.show(this.newCommer, this.unit, this.rating);
  }

}