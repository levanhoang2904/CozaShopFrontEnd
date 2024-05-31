import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { HttpServerService } from '../../Services/http-server/http-server.service';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './verify-otp.component.html',
  styleUrl: './verify-otp.component.css',
})
export class VerifyOtpComponent implements OnInit, OnDestroy {
  constructor(
    private httpServerService: HttpServerService,
    private router: Router,
    private title: Title
  ) {}
  toaster = inject(ToastrService);
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }
  private subscriptions: Subscription = new Subscription();
  ngOnInit(): void {
    this.title.setTitle('Xác nhận OTP');
  }

  formData: FormGroup = new FormGroup({
    OTP: new FormControl('', [Validators.required]),
  });

  isFormSubmitted: boolean = false;
  isError: boolean = false;
  isLoading: boolean = false;

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
    this.isLoading = true;
    const verifyOTPSub = this.httpServerService.verifyOTP(this.formData.value).subscribe((data) => {
      if (data.statusCode === 200) {
        this.toaster.success(data.message, 'Thành công');
        this.router.navigate(['auth/reset-password', data.data.resetToken]);
        this.isError = false;
        this.isLoading = false;
      } else {
        this.toaster.error(data.message, 'Lỗi');
        this.isError = true;
        this.isLoading = false;
      }
    });
    this.subscriptions.add(verifyOTPSub)
  }
}
