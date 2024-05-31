import { ToastrService } from 'ngx-toastr';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { HttpServerService } from '../../../Services/http-server/http-server.service';
import { ProductService } from '../../../Services/product/product.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { CateogryService } from '../../../Services/category/cateogry.service';
import { Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { SharedDataService } from '../../shared-data-service/shared-data-service.component';
import { FormsModule } from '@angular/forms';
import { ProductDetailService } from '../../../Services/product-detail/product-detail.service';
import { SearchProductDto } from '../../../../dto/classDto';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css',
})
export class ProductComponent implements OnInit, OnDestroy {
  constructor(
    private httpServer: HttpServerService,
    private title: Title,
    private shareDataService: SharedDataService,
    private router: Router
  ) {}
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }

  toaster = inject(ToastrService);
  products: ProductService[] = [];
  pageCount: number[] = [];
  categories: CateogryService[] = [];
  pageCurrent = 1;
  private idProduct: string = '';
  private index: number = 0;
  searchInput: string = '';
  selected: string = '';
  isSearch: boolean = false;
  isActive: boolean = false;
  private subscriptions: Subscription = new Subscription();

  ngOnInit(): void {
    const isActiveSub = this.shareDataService.isActive$.subscribe((isActive) => {
      this.isActive = isActive;
    });

    this.title.setTitle('Quản lý sản phẩm');
    const categorySub = this.httpServer.getCategories().subscribe((data) => {
      this.categories = data;
    });
    this.searchInput = sessionStorage.getItem('searchInput')?.toString() ?? '';
    this.selected = sessionStorage.getItem('selected')?.toString() ?? '';
    if (sessionStorage.getItem('page')) {
      this.pageCurrent = Number(sessionStorage.getItem('page'));
    }
    if (this.searchInput === '' && this.selected === '')
      this.getAllProduct(this.pageCurrent);
    else this.getProductFilter(this.pageCurrent);
    this.subscriptions.add(categorySub)
    this.subscriptions.add(isActiveSub)
  }

  getProductFilter(page: number = 1) {
    sessionStorage.setItem('selected', this.selected);
    const searchDto: SearchProductDto = {
      page: page, //số trang đang chọn
      pageSize: 8, //số sản phẩm trên 1 trang
      categoryId: this.selected, // chọn theo danh mục category
      sale: 0, //chọn sản phẩn đang sale
      minPrice: 0, // giá tối thiểu
      maxPrice: 0, //giá tối đa
      fabric: '', // chọn theo loại vải
      sortBy: 0, //giá cao thấp hoặc thấp cao là -1 và 1
      sizes: [''], //   mảng lưu kích thước người dùng chọn
      colors: [''],
      quantitySold: false,
      newProduct: true,
      searchValue: this.searchInput,
    };
    const filterSub =  this.httpServer.filterAndSortProducts(searchDto).subscribe({
      next: (res) => {
        if (res.data) {
          this.products = res.data;
          this.products.map((product: any) => {
            product.price = new Intl.NumberFormat('vn-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(product.price - product.price * (product.sale / 100));
          });
          this.pageCount = [];
          for (let i = 1; i <= res.pageCount; i++) this.pageCount.push(i);
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
    this.subscriptions.add(filterSub)
  }

  getAllProduct(page: number = 1) {
    const accessToken = this.shareDataService.accessToken;
    if (accessToken) {
      const productInfoSub = this.httpServer.getAllInforProduct(page, accessToken).subscribe({
        next: (data) => {
          this.products = data.data;
          this.products.map((product: any) => {
            product.price = new Intl.NumberFormat('vn-VN', {
              style: 'currency',
              currency: 'VND',
            }).format(product.price - product.price * (product.sale / 100));
          });

          if (this.pageCount.length === 0)
            for (let i = 1; i <= data.pageCount; i++) this.pageCount.push(i);
        },
        error: (error) => {
          if (error.error.statusCode === 403)
            this.router.navigateByUrl('/admin/product/noAccess');
        },
      });
      this.subscriptions.add(productInfoSub)
      return;
    }
    this.toaster.error('Vui lòng đăng nhập lại', 'Lỗi');
  }

  setPageCurrent(page: number = 1) {
    sessionStorage.setItem('page', page.toString());
    this.pageCurrent = page;
    if (this.searchInput === '' && this.selected === '')
      this.getAllProduct(page);
    if (this.searchInput !== '') {
      this.onSubmit(page);
      return;
    }
    if (this.selected !== '') {
      this.getProductFilter(page);
    }
  }

  setIdProduct(id: string, index: number) {
    this.idProduct = id;
    this.index = index;
  }

  deleteProduct() {
    const accessToken = this.shareDataService.accessToken;
    if (accessToken) {
      const deleteProductSub = this.httpServer.deleteProduct(this.idProduct, accessToken).subscribe({
        next: (data) => {
          if (data.status === 405) {
            this.toaster.error(data.message, 'Lỗi');
            return;
          }
          if (data.status === 200) {
            this.products.splice(this.index, 1);
            this.toaster.success('Xóa sản phẩm thành công', 'Thành công');
            return;
          }
        },
        error: (error) => {
          if (error.error.statusCode === 403) {
            this.toaster.error('Bạn không có quyền xóa sản phẩm', 'Lỗi');
            this.setPageCurrent(1);
            return;
          }
          this.toaster.error('Xóa sản phảm thất bại', 'Lỗi');
        },
      });
      this.subscriptions.add(deleteProductSub)
    }
  }
  onSubmit(page: number = 1) {
    this.pageCount = [];
    sessionStorage.setItem('searchInput', this.searchInput);
    this.isSearch = this.searchInput !== '' ? true : false;
    if (this.searchInput === '' && this.selected === '') this.getAllProduct();
    else this.getProductFilter();
  }

  checkAmount(productDetai: ProductDetailService[]) {
    let total = 0;
    productDetai.map((productdetail) => {
      productdetail.sizes.map((productSize) => {
        total += productSize.quantity;
      });
    });
    if (total !== 0) return 'Còn hàng';
    return 'Hết hàng';
  }
}
