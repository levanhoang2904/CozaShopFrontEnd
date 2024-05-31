import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { HttpServerService } from '../../Services/http-server/http-server.service';
import { CommonModule, NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  constructor(
    private httpServerService: HttpServerService,
    private router: Router,
    private title: Title
  ) {}

  forgotPasswordForm: FormGroup = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  isFormSubmitted: boolean = false;
  isLoading: boolean = false;
  isError: boolean = false;
  toaster = inject(ToastrService);
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }
  private subscriptions: Subscription = new Subscription();
  ngOnInit(): void {
    this.title.setTitle('Quên mật khẩu');
  }

  onChange() {
    this.isError = false;
    if (!this.forgotPasswordForm.valid) {
      this.isError = true;
    } else {
      this.isError = false;
    }
  }

  onSubmit() {
    this.isError = false;

    this.isFormSubmitted = true;
    if (!this.forgotPasswordForm.valid) {
      this.isError = true;
      return;
    }

    this.isLoading = true;
    const forgortPassSub = this.httpServerService
      .forgotPassword(this.forgotPasswordForm.value)
      .subscribe((data) => {
        if (data.statusCode === 200) {
          this.toaster.success(data.message, 'THành công');
          this.router.navigate(['auth/verify-otp']);
          this.isLoading = false;
        } else {
          console.log(data);
          this.toaster.error(data.message, 'Lỗi');
          this.isLoading = false;
          this.isError = true;
        }
      });
      this.subscriptions.add(forgortPassSub)
  }
}
