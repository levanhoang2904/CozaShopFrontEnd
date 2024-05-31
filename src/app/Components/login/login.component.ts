import { HeaderService } from '../../Services/header/header-service.service';
import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { HttpServerService } from '../../Services/http-server/http-server.service';
import { SharedDataService } from './../shared-data-service/shared-data-service.component';
import { Subscription } from 'rxjs';

declare var google: any;
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  providers: [],
})
export class LoginComponent implements OnInit, OnDestroy {
  constructor(
    private httpServerService: HttpServerService,
    private router: Router,
    private shareDataService: SharedDataService,
    private title: Title,
    private headerService: HeaderService
  ) {}
  private subscriptions: Subscription = new Subscription();

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }
  public typePassword = 'password';
  public checkLogin = true;
  private _submitted = false;
  @Input() name = '';

  get submitted(): boolean {
    return this._submitted;
  }
  public formData = new FormGroup({
    email: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
  });

  isLoggedin?: boolean;
  checked = true;
  ngOnInit(): void {
    this.title.setTitle('Đăng nhập');
    if (this.shareDataService.accessToken !== null) {
      this.router.navigate(['']);
      return;
    }
    const checkedString = localStorage.getItem('checked');
    this.checked = checkedString === 'true' ? true : false;
    const account = localStorage.getItem('accountUser');
    const password = localStorage.getItem('passwordUser');
    if (account && password) {
      this.formData = new FormGroup({
        email: new FormControl(account, Validators.required),
        password: new FormControl(password, Validators.required),
      });
    }
  }

  setChecked() {
    this.checked = this.checked ? false : true;
    localStorage.setItem('checked', this.checked.toString());
    if (!this.checked) {
      localStorage.removeItem('accountUser');
      localStorage.removeItem('passwordUser');
    }
  }

  onSubmit(): void {
    this._submitted = true;
    if (
      this.formData.value.email === '' ||
      this.formData.value.password === ''
    ) {
      this.checkLogin = true;
      return;
    }

    const userSub = this.httpServerService.getUser(this.formData.value).subscribe((data) => {
      if (data.status === 200) {
        if (this.checked) {
          localStorage.setItem('accountUser', this.formData.value.email!);
          localStorage.setItem('passwordUser', this.formData.value.password!);
        }
        this.shareDataService.accessToken = data.accessToken;
        localStorage.setItem('accessToken', data.accessToken);
        const detailSub =  this.httpServerService.getDetailUser(data.accessToken).subscribe({
          next: (response) => {
            localStorage.setItem('user', JSON.stringify(response.data));
            this.router.navigate(['/']);
            return;
          },
          error: (error) => {
            this.shareDataService.accessToken = '';
            localStorage.removeItem('accessToken');
            localStorage.removeItem('user');
          },
        });
        this.subscriptions.add(detailSub)
      } else {
        this.checkLogin = false;
      }
    });
    this.subscriptions.add(userSub)
  }
}
