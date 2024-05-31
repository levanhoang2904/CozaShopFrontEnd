import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpServerService } from '../../../Services/http-server/http-server.service';
import { Title } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { CateogryService } from '../../../Services/category/cateogry.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-form-category',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './form-category.component.html',
  styleUrl: './form-category.component.css',
})
export class FormCategoryComponent implements OnInit, OnDestroy {
  constructor(
    private httpServer: HttpServerService,
    private title: Title,
    private router: ActivatedRoute,
    private navigateRouter: Router
  ) {}

  toaster = inject(ToastrService);
  category!: CateogryService;
  isFormSubmitted: boolean = false;

  formSubmit: FormGroup = new FormGroup({
    namecategory: new FormControl('', [Validators.required]),
    note: new FormControl('', [Validators.required]),
  });
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }
  private subscriptions: Subscription = new Subscription();

  ngOnInit(): void {
    const queryParamsSub = this.router.queryParams.subscribe((data) => {
      if (data['id']) {
        this.title.setTitle('Chỉnh sửa loại sản phẩm');
        const getCategoryAdminSub = this.httpServer.getCategoryAdmin(data['id']).subscribe((data) => {
          this.category = data;

          this.formSubmit.patchValue({
            namecategory: this.category.namecategory,
            note: this.category.note,
          });
          this.subscriptions.add(getCategoryAdminSub)
        });
        this.subscriptions.add(queryParamsSub)
      } else {
        this.title.setTitle('Tạo mới loại sản phẩm');
      }
    });
  }

  clearQuery(): void {
    sessionStorage.removeItem('pageCategory');
  }

  onSubmit() {
    this.clearQuery();
    this.isFormSubmitted = true;
    if (this.formSubmit.valid) {
      const categoryData = {
        namecategory: this.formSubmit.value.namecategory,
        note: this.formSubmit.value.note,
      };

      if (!this.category) {
       const createCategorySub = this.httpServer.createCategoryAdmin(categoryData).subscribe({
          next: (data) => {
            if (data.statusCode === 200) {
              this.toaster.success(
                'Tạo mới loại sản phẩm thành công',
                'Thành công'
              );
              this.navigateRouter.navigateByUrl('/admin/category');
            }
          },
          error: (error) => {
            console.log(error);
            this.toaster.error(error.error.message, 'Lỗi');
          },
        });
        this.subscriptions.add(createCategorySub)
      } else {
        const updateCategorySub = this.httpServer
          .updateCategoryAdmin(this.category._id, categoryData)
          .subscribe({
            next: (data) => {
              if (data.statusCode === 200) {
                this.toaster.success(
                  'Chỉnh sửa loại sản phẩm thành công',
                  'Thành công'
                );
                this.navigateRouter.navigateByUrl('/admin/category');
              }
            },
            error: (error) => {
              this.toaster.error(error.error.message, 'Lỗi');
            },
          });
          this.subscriptions.add(updateCategorySub)
      }
    }
  }
}
