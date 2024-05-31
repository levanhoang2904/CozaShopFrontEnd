import { CommonModule, IMAGE_CONFIG } from '@angular/common';
import { Component, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { HttpServerService } from '../../Services/http-server/http-server.service';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../../Services/product/product.service';
import { SearchProductDto } from '../../../dto/classDto';
import { HeaderService } from '../header/header.service';
import { HeaderService as ServiceHeader } from '../../Services/header/header-service.service';
import { FormsModule } from '@angular/forms';
import { CateogryService } from '../../Services/category/cateogry.service';
import { ProductComponent } from '../product/product.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ProductComponent],
  providers: [
    SearchProductDto,
    {
      provide: IMAGE_CONFIG,
      useValue: {
        disableImageSizeWarning: true,
        disableImageLazyLoadWarning: true,
      },
    },
  ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css',
})
export class HomePageComponent implements OnInit, OnDestroy {
  constructor(
    private httpServerService: HttpServerService,
    private headerService: ServiceHeader,
    private el: ElementRef,
    private title: Title,
    public searchProductDto: SearchProductDto,
    private router: Router,
    private searchService: HeaderService
  ) {}
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }
  public pageCount: number = 0;
  public products: ProductService[] = [];
  public page: Array<number> = []; // tạo mảng phân trang nè
  public isShowSearch = false;
  public isShowFilter = false;
  public categories: CateogryService[] = [];
  public searchQuery: { isSearch: boolean; key: string | undefined } = {
    isSearch: false,
    key: '',
  };
  @Input() searchModel: string | undefined;
  private subscriptions: Subscription = new Subscription();

  getCategories(): void {
    const categorySub = this.httpServerService.getCategories().subscribe((data: any) => {
      this.categories = data;
    });
    this.subscriptions.add(categorySub)
  }

  getProduct(): void {
    this.page = [];
    const filterSub = this.httpServerService
      .filterAndSortProducts(this.searchProductDto)
      .subscribe({
        next: (response) => {
          this.products = response.data;
          if (this.page.length === 0) {
            for (let i = 1; i <= response.pageCount; i++) {
              this.page.push(i);
            }
          }
        },
        error: (error) => {
          console.log(error);
        },
      });
      this.subscriptions.add(filterSub)
  }

  ngOnInit(): void {
    this.title.setTitle('Shop bán áo quần');
    this.headerService.updateData(false);

    const storedSearchProductDto = sessionStorage.getItem('searchProductDto');
    //check lại session
    if (storedSearchProductDto) {
      const searchProductDtosession = JSON.parse(storedSearchProductDto);
      // Gán lại dữ liệu vào searchProductDto
      this.searchProductDto = searchProductDtosession;
    }
    this.getProduct();
    this.getCategories();
    if (sessionStorage.getItem('sessionSearch') !== null) {
      this.searchQuery = {
        isSearch: true,
        key: sessionStorage.getItem('sessionSearch')?.toString(),
      };
      this.getProductSearch(
        sessionStorage.getItem('sessionSearch')?.toString(),
        this.searchProductDto.page
      );
    }

    const searchSub = this.searchService.searchQuery$.subscribe((query) => {
      if (query) {
        this.getProductSearch(query);
      } else {
        this.searchQuery = {
          isSearch: false,
          key: '',
        };
        sessionStorage.removeItem('sessionSearch');
        this.getProduct();
      }
      this.searchProductDto.page = 1;
      this.moveProduct();
    });
    this.subscriptions.add(searchSub)
  }
  sendSearchQuery() {
    if (this.searchModel) {
      this.getProductSearch(this.searchModel);
      sessionStorage.setItem(
        'pageCurrent',
        this.searchProductDto.page.toString()
      );
    } else {
      this.searchQuery = {
        isSearch: false,
        key: '',
      };
      sessionStorage.removeItem('sessionSearch');
      this.getProduct();
    }
    this.searchProductDto.page = 1;
    this.searchModel = '';
  }

  showSearch(): void {
    if (this.isShowFilter) {
      this.isShowFilter = false;
    }
    this.isShowSearch = !this.isShowSearch;
  }

  setPageCurrent(page: number) {
    this.searchProductDto.page = page;
    const productSection = this.el.nativeElement.querySelector('#products');

    if (productSection) {
      productSection.scrollIntoView({ behavior: 'smooth' });
    }
    this.getProduct();
    sessionStorage.setItem(
      'searchProductDto',
      JSON.stringify(this.searchProductDto)
    );
    this.moveProduct();

    if (!this.searchQuery.isSearch) {
      this.getProduct();
    } else if (this.searchQuery.isSearch) {
      this.getProductSearch(this.searchQuery.key, this.searchProductDto.page);
    }
  }

  goToProductDetail(productId: string) {
    this.router.navigate(['/product'], { queryParams: { id: productId } });
  }

  // chọn theo danh mục
  onButtonClick(idCategory: string) {
    this.searchProductDto.categoryId = idCategory;
    this.searchProductDto.page = 1;
    this.searchQuery = {
      isSearch: false,
      key: '',
    };
    sessionStorage.removeItem('sessionSearch');
    this.getProduct();
    sessionStorage.setItem(
      'searchProductDto',
      JSON.stringify(this.searchProductDto)
    );
  }

  sortBy(value: string) {
    this.searchQuery = {
      isSearch: false,
      key: '',
    };
    sessionStorage.removeItem('sessionSearch');
    this.searchProductDto.quantitySold = false;
    this.searchProductDto.newProduct = false;
    this.searchProductDto.sortBy = 0;
    if (value == 'banchay') this.searchProductDto.quantitySold = true;
    if (value == 'moinhat') this.searchProductDto.newProduct = true;
    if (value == 'caothap') this.searchProductDto.sortBy = -1;
    if (value == 'thapcao') this.searchProductDto.sortBy = 1;
    this.getProduct();
    sessionStorage.setItem(
      'searchProductDto',
      JSON.stringify(this.searchProductDto)
    );
  }

  sortByPrice(minprice: number, maxprice: number) {
    this.searchQuery = {
      isSearch: false,
      key: '',
    };
    sessionStorage.removeItem('sessionSearch');
    this.searchProductDto.minPrice = minprice;
    this.searchProductDto.maxPrice = maxprice;
    this.searchProductDto.page = 1;
    this.getProduct();
    sessionStorage.setItem(
      'searchProductDto',
      JSON.stringify(this.searchProductDto)
    );
  }
  sale() {
    if (this.searchProductDto.sale != 0) this.searchProductDto.sale = 0;
    else this.searchProductDto.sale = 1;
    this.getProduct();
    sessionStorage.setItem(
      'searchProductDto',
      JSON.stringify(this.searchProductDto)
    );
  }
  chooseColor(color: string) {
    this.searchQuery = {
      isSearch: false,
      key: '',
    };
    sessionStorage.removeItem('sessionSearch');
    const index = this.searchProductDto.colors.indexOf(color);
    if (index !== -1) {
      this.searchProductDto.colors.splice(index, 1);
    } else {
      if (color == '') this.searchProductDto.colors = [''];
      else {
        this.searchProductDto.colors[0] = 'color';
        this.searchProductDto.colors.push(color);
      }
    }
    if (this.searchProductDto.colors.length === 1)
      this.searchProductDto.colors = [''];
    this.searchProductDto.page = 1
    this.getProduct();
    sessionStorage.setItem(
      'searchProductDto',
      JSON.stringify(this.searchProductDto)
    );
  }

  chooseSize(size: string) {
    this.searchQuery = {
      isSearch: false,
      key: '',
    };
    sessionStorage.removeItem('sessionSearch');
    const index = this.searchProductDto.sizes.indexOf(size);
    if (index !== -1) {
      this.searchProductDto.sizes.splice(index, 1);
    } else {
      if (size == '') this.searchProductDto.sizes = [''];
      else {
        this.searchProductDto.sizes[0] = 'size';
        this.searchProductDto.sizes.push(size);
      }
    }
    if (this.searchProductDto.sizes.length === 1)
      this.searchProductDto.sizes = [''];
    this.getProduct();
    sessionStorage.setItem(
      'searchProductDto',
      JSON.stringify(this.searchProductDto)
    );
  }

  chooseFabric(fabric: string) {
    this.searchProductDto.fabric = fabric;
    this.getProduct();
    sessionStorage.setItem(
      'searchProductDto',
      JSON.stringify(this.searchProductDto)
    );
  }

  getProductSearch(query: string = '', page: number = 1): void {
    let queryKey = `?key=${query}&page=${page}`;
    const productSearchSub = this.httpServerService.getProductBySearch(queryKey).subscribe({
      next: (response) => {
        this.searchQuery = {
          isSearch: true,
          key: query,
        };
        this.products = response.data;

        this.page = [];
        if (this.page.length === 0) {
          for (let i = 1; i <= response.pageCount; i++) {
            this.page.push(i);
          }
        }
      },
      error: (error) => {
        console.log(error);
      },
    });
    this.subscriptions.add(productSearchSub)
    if (query) {
      sessionStorage.setItem('sessionSearch', query);
    }
  }

  showFilter(): void {
    if (this.isShowSearch) {
      this.isShowSearch = false;
    }
    this.isShowFilter = !this.isShowFilter;
  }

  moveProduct() {
    const productSection = this.el.nativeElement.querySelector('#product-overview');
    if (productSection) {
      productSection.scrollIntoView({ behavior: 'smooth' });
    }
  }
  shopnow(id: string){
    this.onButtonClick(id)
    this.moveProduct()
  }
}
