import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { ReactiveFormsModule } from '@angular/forms';
import { HttpServerService } from '../../Services/http-server/http-server.service';
import { Router } from '@angular/router';
import { SharedDataService } from '../shared-data-service/shared-data-service.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent implements OnInit, OnDestroy {
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }
  private subscriptions: Subscription = new Subscription();
  ngOnInit(): void {
    // Kiểm tra nếu accessToken đã tồn tại, tức là người dùng đã đăng nhập, thì chuyển hướng người dùng đến trang chính
    if (this.shareDataService.accessToken !== null) {
      this.router.navigate(['']);
    }
  }

  signupForm: FormGroup;
  formErrors: any = {
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  };

  constructor(
    private formBuilder: FormBuilder,
    private httpServerService: HttpServerService,
    private router: Router,
    private shareDataService: SharedDataService
  ) {
    this.signupForm = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
    });
  }
  onSubmit() {
    this.clearFormErrors();
    // Xử lý logic khi người dùng nhấn nút Submit
    if (this.signupForm.value.name == '')
      this.formErrors.name = 'Tên không được để trống';
    if (this.signupForm.value.email == '')
      this.formErrors.email = 'Email không được để trống';
    if (!/@gmail\.com$/i.test(this.signupForm.value.email))
      this.formErrors.email = 'Email không hợp lệ';
    const phonePattern = /^(0\d{9})$/; // Biểu thức chính quy kiểm tra số điện thoại
    if (!phonePattern.test(this.signupForm.value.phone))
      this.formErrors.phone = 'Phone không hợp lệ';
    if (this.signupForm.value.phone == '')
      this.formErrors.phone = 'Phone không được để trống';

    if (this.signupForm.value.password == '')
      this.formErrors.password = 'Mật khẩu không được để trống';
    if (this.signupForm.value.confirmPassword == '')
      this.formErrors.confirmPassword = 'Nhập lại mật khẩu không được để trống';
    if (
      this.signupForm.value.confirmPassword !== this.signupForm.value.password
    )
      this.formErrors.confirmPassword = 'Nhập lại mật khẩu không đúng';

    if (this.hasErrors()) return; // Nếu có lỗi, dừng lại và không thực hiện createUser

    const createUserSub = this.httpServerService
      .createUser(this.signupForm.value)
      .subscribe((data) => {
        if (data === true) {
          this.router.navigateByUrl('/login');
        } else {
          this.formErrors.email = 'Email đã tồn tại';
        }
      });
      this.subscriptions.add(createUserSub)
    // Gửi dữ liệu đến backend hoặc thực hiện các thao tác khác ở đây
  }

  clearFormErrors() {
    // Xóa tất cả các thông báo lỗi bằng cách gán giá trị rỗng cho mỗi trường trong formErrors
    this.formErrors.name = '';
    this.formErrors.email = '';
    this.formErrors.phone = '';
    this.formErrors.password = '';
    this.formErrors.confirmPassword = '';
  }
  hasErrors(): boolean {
    for (let key in this.formErrors) {
      if (this.formErrors[key]) {
        return true; // Nếu có ít nhất một lỗi, trả về true
      }
    }
    return false; // Nếu không có lỗi nào, trả về false
  }

  //sử dùng
}
