/**
 * Angular 2 decorators and services
 */
import {
  Component,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { AppState } from './app.service';
import { SessionStorageService, UtilService } from './services';

import { RATING_STATUS, EMPLOYEE_TYPE } from './const';

/**
 * App Component
 * Top Level Component
 */
@Component({
  selector: 'app',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./app.component.css'],
  templateUrl: `./app.component.html`
})
export class AppComponent implements OnInit {

  public RatingStatus = RATING_STATUS;

  constructor(
    public appState: AppState,
    public session: SessionStorageService,
    private util: UtilService,
  ) {}

  public ngOnInit() {
    console.log('Initial App State', this.appState.state);
  }

  /**
   * 「履歴」メニューでは講師と新人表示される内容が異なっており、そのためのパラメータを生成する。
   * 講師は自身が採点者である採点依頼を7日分表示し、新人は自身が提出した採点依頼を30日分表示する。
   */
  public buildHistoryParams() {
    let user = this.session.getUser();
    if (user.type == EMPLOYEE_TYPE.INSTRUCTOR) {
      return this.util.buildInstructorParams(user.no);
    } else {
      return this.util.buildNewCommerParams(user.no);
    }
  }

}

/**
 * Please review the https://github.com/AngularClass/angular2-examples/ repo for
 * more angular app examples that you may copy/paste
 * (The examples may not be updated as quickly. Please open an issue on github for us to update it)
 * For help or questions please contact us at @AngularClass on twitter
 * or our chat on Slack at https://AngularClass.com/slack-join
 */
