import {Component, OnInit} from '@angular/core';
import {Store} from '@ngrx/store';
import {PingService} from '../services/ping.service';
import {PingPayload} from '../models/ping-payload';
import {PongPayload} from '../models/pong-payload';
import {MessageResponse} from '../models/message-response';
import {Failure, Logout} from '../../auth/actions/auth';
import {Observable} from 'rxjs/Observable';
import {AuthUser} from '../../auth/models/auth-user';
import {AuthService} from '../services/auth.service';

@Component({
  selector: 'app-index',
  template: `
    
    <!--<div>-->
      <!--<a routerLink="/auth/SignUp">Зарегистрироваться</a>-->
    <!--</div>-->
    <!--<div *ngIf="!(loggedIn$ | async)">-->
      <!--<a routerLink="/auth/SignIn">Войти</a>-->
    <!--</div>-->
    
    <table width="100%" border="0" style="color: darkblue;">
      <tr>
        <td width="200" height="50" style="background:url('../../../home_header_logo2.png'); background-size: 211px 52px;">
        <td style="background:url('../../../home_header_center.png'); background-size: 250px;" align="right">
          <table>
            <tr>
              <td height="22"></td>
            </tr>
            <tr>
              <td>
                <div *ngIf="loggedIn$ | async">
                  <table width="200">
                    <tr>
                      <td width="100">{{(authUser$ | async).username}}</td>
                      <td width="70"><a (click)="logout()">Log Out</a></td>
                      <td width="30"></td>
                    </tr>
                  </table>
                </div> 
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    
    
    
    <!--Нужно было бы сделать app-page-ping как контайнер из модуля ping.module-->
    <!--<app-ping></app-ping>-->

    <table width="300" class="left-menu" bgcolor="blue" cellpadding="20" style="height: 745px;">
      <tr>
        <td valign="top">
          <table>
            <tr><td> <a href="#">Организация</a> </td></tr>
            <tr><td> <a href="#">Терминал</a> </td></tr>
            <tr><td> <a href="#">Лимиты</a> </td></tr>
            <tr><td> <a href="#">Диапазоны приема PAN</a> </td></tr>
            <tr><td> <a href="#">Языки приложений</a> </td></tr>
            <tr><td> <a href="#">Группы терминалов</a> </td></tr>
            <tr><td> <a href="#">Шаблон чека</a> </td></tr>
            <tr><td> <a href="#">Шаблон карты</a> </td></tr>
            <tr><td> <a href="#">Ключи безопасности</a> </td></tr>
            <tr><td> <a href="#">Расписание</a> </td></tr>
            <tr><td> <a href="#">Коды активации</a> </td></tr>
            <tr><td> <a href="#">Банки</a> </td></tr>
          </table>
        </td>
      </tr>
    </table>
    
    <table width="100%" border="0" style="color: darkblue; margin-top: 0%;">
      <tr>
        <td width="200" height="50" style="background:url('../../../footer.png'); background-size: 200px 52px;">
          <table>
            <tr>
              <td width="200" align="center">
                Version 0.0.1
              </td>
              <td width="70%"></td>
              <td width="300" align="right">
                Card Technologies & Sysytems 2019
              </td>
              <td width="100">
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `,
  styles: [`

  `]
})
export class IndexComponent implements OnInit {

  authUser$: Observable<AuthUser>;
  loggedIn$: Observable<boolean>;

  constructor(private store: Store<any>,
              private authService: AuthService) {
    this.authUser$ = this.authService.getLoggedUser();
    this.loggedIn$ = this.authService.isLoggedIn();
  }

  ngOnInit() {
  }

  logout() {
    this.store.dispatch(new Logout());
  }
}
