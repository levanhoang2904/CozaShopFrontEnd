import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpServerService } from '../../../Services/http-server/http-server.service';
import { Title } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { SharedDataService } from '../../shared-data-service/shared-data-service.component';
import { CateogryService } from '../../../Services/category/cateogry.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './category.component.html',
  styleUrl: './category.component.css',
})
export class CategoryComponent implements OnInit, OnDestroy {
  constructor(
    private httpServer: HttpServerService,
    private shareDataService: SharedDataService,
    private title: Title,
    private router: Router
  ) {}
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }

  toaster = inject(ToastrService);

  pageCount: number[] = [];
  categories: CateogryService[] = [];
  pageCurrent = 1;
  isActive: boolean = false;
  idCategoryCurrent: string = '';
  private subscriptions: Subscription = new Subscription();
  ngOnInit(): void {
    const isActiveSub = this.shareDataService.isActive$.subscribe((isActive) => {
      this.isActive = isActive;
    });
    this.subscriptions.add(isActiveSub)
    this.title.setTitle('Quản lý loại sản phẩm');

    if (sessionStorage.getItem('pageCategory')) {
      this.pageCurrent = Number(
        sessionStorage.getItem('pageCategory')?.toString()
      );
    }

    this.getAllCategories(this.pageCurrent);
  }

  getAllCategories(page: number = 1) {
    const categoryAdminSub = this.httpServer.getAllCategoriesAdmin(`?page=${page}`).subscribe({
      next: (data) => {
        this.categories = data.categories;

        if (this.pageCount.length === 0)
          for (let i = 1; i <= data.pageCount; i++) this.pageCount.push(i);
      },
      error: (error) => {
        if (error.error.statusCode === 403)
          this.router.navigateByUrl('/admin/product/noAccess');
      },
    });
    this.subscriptions.add(categoryAdminSub)
  }

  setPageCurrent(page: number): void {
    sessionStorage.setItem('pageCategory', page.toString());
    this.pageCurrent = page;
    this.getAllCategories(this.pageCurrent);
  }

  setCurrentIdCategory(id: string): void {
    this.idCategoryCurrent = id;
  }

  clearQuery(): void {
    sessionStorage.removeItem('pageCategory');
    this.pageCurrent=1
  }

  deleteCategory(): void {
    if (this.idCategoryCurrent !== '') {
      const deleteCategoryAdminSub = this.httpServer.deleteCategoryAdmin(this.idCategoryCurrent).subscribe({
        next: (data) => {
          if (data.statusCode === 200) {
            this.getAllCategories();
            this.toaster.success('Xoá loại sản phẩm thành công', 'Thành công');
            this.clearQuery();
          }

          if (data.statusCode === 404) {
            this.toaster.error(data.message, 'Lỗi');
          }
        },
        error: (error) => {
          this.toaster.error(error.error.message, 'Lỗi');
        },
      });
      this.subscriptions.add(deleteCategoryAdminSub)
    }
  }
}
