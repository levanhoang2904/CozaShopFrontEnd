import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpServerService } from '../../Services/http-server/http-server.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedDataService } from '../shared-data-service/shared-data-service.component';
import { Title } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
  constructor(
    private httpServerService: HttpServerService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private shareDataService: SharedDataService,
    private title: Title
  ) {}
  toaster = inject(ToastrService);

  isFormSubmitted: boolean = false;
  tokenReset: string = '';
  isError: boolean = false;
  isLoading: boolean = false;

  formData: FormGroup = new FormGroup({
    password: new FormControl('', [Validators.required]),
    passwordConfirm: new FormControl('', [Validators.required]),
  });
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }
  private subscriptions: Subscription = new Subscription();
  ngOnInit(): void {
    this.tokenReset = this.activatedRoute.snapshot.paramMap.get('token') ?? '';
    this.title.setTitle('Quên mật khẩu');
  }

  onChange() {
    this.isError = false;
    if (!this.formData.valid) {
      this.isError = true;
    } else {
      this.isError = false;
    }
  }

  onSubmit() {
    this.isFormSubmitted = true;
    this.isError = false;
    if (!this.formData.valid) {
      this.isError = true;
      return;
    }

    if (this.formData.value.password !== this.formData.value.passwordConfirm) {
      this.toaster.error('Vui lòng xác nhận đúng mật khẩu!', 'Lỗi');
      this.isError = true;
      return;
    }

    this.isLoading = true;
    const resetPasswordSub = this.httpServerService
      .resetPassword(this.formData.value, this.tokenReset)
      .subscribe((data) => {
        if (data.statusCode === 200) {
          this.toaster.success(data.message, 'Thành công');
          localStorage.setItem('accessToken', data.data.jwt);
          this.shareDataService.accessToken = data.data.jwt;
          this.isLoading = false;
          this.isError = false;
          this.router.navigateByUrl('');
        } else {
          this.toaster.error(data.message, 'Lỗi');
          this.isLoading = false;
          this.isError = true;
        }
      });
      this.subscriptions.add(resetPasswordSub)
  }
}
