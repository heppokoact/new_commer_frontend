import {
  Component,
  OnInit,
} from '@angular/core';
import {
  Router
} from '@angular/router'
import { Observable } from 'rxjs'
import { DataService, SessionStorageService, UtilService, MessageService } from '../services';
import { RATING_STATUS, EMPLOYEE_TYPE } from '../const';

/**
 * ログイン画面のコンポーネント。
 */
@Component({
  selector: 'login',
  styleUrls: [ './login.component.css' ],
  templateUrl: './login.component.html'
})
export class LoginComponent implements OnInit {

  employeeNo: string
  password: string

  constructor(
    private dataService: DataService,
    private session: SessionStorageService,
    private message: MessageService,
    private router: Router,
    public util: UtilService
  ) {}

  /**
   * このコンポーネントを初期化する。
   * セッションストレージに保存してあるログイン情報を破棄する。
   */
  public ngOnInit() {
    this.session.setUser(null);
  }

  /**
   * ログイン処理を行う。
   * 社員Noとパスワードをサーバーに送信し、認証処理を行う。
   * 認証OKなら社員情報が送信されてくるので、それをセッションストアに格納して「全体」画面に遷移する。
   */
  public login() {
    this.dataService.login(this.employeeNo, this.password).subscribe(user => {
      if (!user) {
        this.message.showMessage("ログインエラー", "社員番号とパスワードの組み合わせが正しくありません。");
        return;
      }
      this.session.setUser(user);
      this.router.navigateByUrl("/general")
    });
  }

}
