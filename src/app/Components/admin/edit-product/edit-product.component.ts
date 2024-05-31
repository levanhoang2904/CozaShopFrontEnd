import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { HttpServerService } from '../../../Services/http-server/http-server.service';
import { CateogryService } from '../../../Services/category/cateogry.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { ProductService } from '../../../Services/product/product.service';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SharedDataService } from '../../shared-data-service/shared-data-service.component';
import { ProductDetailService } from '../../../Services/product-detail/product-detail.service';
import { ProductSizeService } from '../../../Services/product-size/product-size.service';
import { ProductSize } from '../../../../dto/productSize';
import { Product } from '../../../../dto/classDto';
import { NgxBarcode6Module } from 'ngx-barcode6';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-product',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    NgxBarcode6Module,
  ],
  providers: [CurrencyPipe],
  templateUrl: './edit-product.component.html',
  styleUrl: './edit-product.component.css',
})
export class EditProductComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();
  constructor(
    private httpServer: HttpServerService,
    private title: Title,
    private route: ActivatedRoute,
    private shareDataService: SharedDataService,
    private router: Router,
    private currencyPipe: CurrencyPipe
  ) {}
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }
  toaster = inject(ToastrService);
  formEdit = new FormGroup({
    name: new FormControl('', [Validators.required]),
    categoryId: new FormControl('', [Validators.required]),
    fabric: new FormControl('', [Validators.required]),
    price: new FormControl('', [Validators.required]),
    sale: new FormControl(0),
  });
  color: string = '';
  private file?: File;
  private fileColor?: File;
  imgColor: string | ArrayBuffer | null = '';
  img: string = '';
  categories: CateogryService[] = [];
  public product!: ProductService;
  public productSizes: ProductSizeService[] = [];
  public idItemCurrent: string = '';
  private idSizeProduct: string = '';
  public amount: number = 0;
  public size: string = '';
  public checkNull = {
    isName: false,
    isCategory: false,
    isFabric: false,
    isPrice: false,
    isSale: false,
    isPath: false,
    isImgColor: false,
    isSize: false,
    isColor: false,
  };
  productDetail?: ProductDetailService;
  isActive: boolean = false;
  @ViewChild('photoInput') photoInput!: ElementRef;
  @ViewChild('photo') photo!: ElementRef;

  ngOnInit(): void {
    const fomrEditSub = this.formEdit.valueChanges.subscribe((form) => {
      if (form.price) {
        const formattedPrice = this.currencyPipe.transform(
          form.price.replace(/\D/g, '').replace(/^0+/, ''),
          'VND',
          'symbol',
          '1.0-0'
        );

        this.formEdit.get('price')!.setValue(formattedPrice, {
          emitEvent: false,
        });
      }
    });

    const activeSub = this.shareDataService.isActive$.subscribe((isActive) => {
      this.isActive = isActive;
    });
    const categorySub = this.httpServer.getCategories().subscribe((data) => {
      this.categories = data;
    });

    const routeSub = this.route.queryParams.subscribe((data) => {
      if (data['id']) {
        this.title.setTitle('Cập nhật sản phẩm');
        const productDetailSub = this.httpServer.getProductDetail(data['id']).subscribe((data) => {
          this.product = data;
          if (this.product) {
            this.formEdit.patchValue({
              name: this.product.name,
              categoryId: this.product.categoryId._id,
              price: this.product.price.toString(),
              sale: this.product.sale,
              fabric: this.product.fabric,
            });
          }
        });
        this.subscriptions.add(productDetailSub)
      } else this.title.setTitle('Thêm sản phẩm');

    });

    this.subscriptions.add(fomrEditSub)
    this.subscriptions.add(activeSub)
    this.subscriptions.add(categorySub)
    this.subscriptions.add(routeSub)

  }
  onChangeImg(event: any) {
    this.file = event.target.files[0];
    this.img = window.URL.createObjectURL(event.target.files[0]);
  }

  onChangeImgColor(event: any) {
    this.fileColor = event.target.files[0];
    this.imgColor = window.URL.createObjectURL(event.target.files[0]);
  }

  setProductColor(id: string) {
    this.checkNull.isImgColor = false;
    this.product.details.map((productDetail) => {
      if (productDetail._id === id) {
        this.productDetail = productDetail;
        this.color = productDetail.color;
      }
    });
  }

  resetProductEdit() {
    this.productDetail = undefined;
    this.color = '';
    (this.size = ''), (this.amount = 0);
    this.idSizeProduct = '';
    this.fileColor = undefined;
    this.imgColor = '';
    const inputPhotoColor = this.photoInput.nativeElement as HTMLInputElement
    inputPhotoColor.value = ''
    const inputPhoto = this.photo.nativeElement as HTMLInputElement
    inputPhoto.value = ''
  }
  colorBarcode: string = '';
  idSizeBarcode: string = '';
  sizeBarcode: string = '';
  quantityIn: number = 0;
  getProductSize(
    productSizes: ProductSizeService[],
    idProductDetail: string,
    color: string
  ) {
    this.productSizes = productSizes;
    this.idItemCurrent = idProductDetail;
    this.colorBarcode = color;
  }
  setIdColorProduct(id: string) {
    this.idItemCurrent = id;
  }
  setNameSizeBarCode(_id: string, size: string, quantity: number) {
    this.idSizeBarcode = _id.slice(-8);
    this.sizeBarcode = size;
    this.quantityIn = quantity;
  }

  updateProductDetail(id: string = '') {
    this.checkNull.isImgColor = this.imgColor === '' ? true : false;

    this.checkNull.isColor = this.color === '' ? true : false;
    if (this.color) {
      if (id !== '') {
        this.checkNull.isImgColor = false;
        const updateColorSub = this.httpServer
          .updateColorProduct(this.product._id, id, this.color, this.fileColor)
          .subscribe((res) => {
            if (res.status === 403) {
              this.toaster.error(res.message, 'Lỗi');
              return;
            }
            else if (res.status === 200) {
              const index = this.product.details.findIndex(
                (item) => item._id === id
              );

              if (index !== -1) {
                this.product.details[index].color = res.data.color;
                this.product.details[index].image = res.data.image;
              }
              this.toaster.success('Cập nhật màu sắc thành công', 'Thành công');
            }
           
          });
          
          this.subscriptions.add(updateColorSub)
      } else if (this.fileColor) {
        const createColorSub = this.httpServer
          .createColorProduct(this.product._id, this.color, this.fileColor)
          .subscribe((res) => {
            if (res.status === 403) {
              this.toaster.error(res.message, 'Lỗi');
              return;
            }
            if (res.status === 200) {
              this.product.details.push(res.data);
              this.toaster.success('Thêm màu thành công', 'Thành công');
              return;
            }
            this.toaster.error('Thêm màu thất bại', 'Lỗi');
          });
          this.subscriptions.add(createColorSub)
      }
    }
    this.resetProductEdit()
   
  }

  deleteColorProduct() {
    const deleteColorSub  =  this.httpServer.deleteColorProduct(this.idItemCurrent).subscribe((res) => {
      if (res.status === 405) {
        this.toaster.error(res.message, 'Lỗi');
      } else if (res.status === 200) {
        this.toaster.success('Xóa màu sắc thành công', 'Thành công');
        this.product.details = this.product.details.filter(
          (productDetail) => productDetail._id !== this.idItemCurrent
        );
      }
      this.idItemCurrent = '';
    });
    this.subscriptions.add(deleteColorSub)
  }

  updateSize() {
    this.checkNull.isSize = this.size === '' ? true : false;

    if (this.size) {
      const productSize: ProductSize = {
        size: this.size,
        quantity: this.amount,
      };
      if (this.idSizeProduct !== '') {
       const updateSizeSub = this.httpServer
          .updateSizeProduct(this.idItemCurrent, this.idSizeProduct, productSize)
          .subscribe((res) => {
            if (res.status === 403)
              this.toaster.error('Kích cỡ đã tồn tại', 'Lỗi');
            else if (res.status === 200) {
              const index = this.productSizes.findIndex(
                (item) => item._id === this.idSizeProduct
              );

              if (index !== -1) {
                this.productSizes[index] = res.data;
              }
              this.toaster.success('Cập nhật kích cỡ thành công', 'Thành công');
              this.idSizeProduct = '';

              this.size = '';
              this.amount = 0;
            }
          });
          this.subscriptions.add(updateSizeSub)
      } else {
        const createSizeSub = this.httpServer
          .createSizeProduct(this.idItemCurrent, productSize)
          .subscribe((res) => {
            if (res.status === 403)
              this.toaster.error('Kích cỡ đã tồn tại', 'Lỗi');
            else if (res.status === 200) {
              this.toaster.success('Thêm kích cỡ thành công', 'Thành công');
              this.productSizes.push(res.data);
            }
            this.size = '';
            this.amount = 0;
          });
          this.subscriptions.add(createSizeSub)
      }
    }

  }

  setIdSizeProduct(id: string) {
    this.idSizeProduct = id;
  }

  setSizeProduct(id: string) {
    this.idSizeProduct = id;
    this.productSizes.map((productSize) => {
      if (productSize._id === id) {
        this.size = productSize.size;
        this.amount = productSize.quantity;
      }
    });
  }

  deleteSize() {
    const deleteSizeSub = this.httpServer
      .deleteSizeProduct(this.idSizeProduct, this.idItemCurrent)
      .subscribe((res) => {
        if (res.status === 405) {
          this.toaster.error(res.message, 'Lỗi');
        } else if (res.status === 200) {
          this.toaster.success('Xóa kích cỡ thành công', 'Thành công');
          this.productSizes = this.productSizes.filter(
            (productSize) => productSize._id !== this.idSizeProduct
          );
          this.product.details = this.product.details.map((productDetail) => {
            productDetail.sizes = productDetail.sizes.filter(
              (productSize) => productSize._id !== this.idSizeProduct
            );
            return productDetail;
          });
        } else this.toaster.error('Xóa kích cỡ thất bại', 'Lỗi');
        this.idSizeProduct = '';
      });
      this.subscriptions.add(deleteSizeSub)
  }

  onSubmit() {
    this.checkNull.isName = this.formEdit.value.name ? false : true;
    this.checkNull.isCategory = this.formEdit.value.categoryId ? false : true;
    this.checkNull.isFabric = this.formEdit.value.fabric ? false : true;
    this.checkNull.isPrice = this.formEdit.value.price ? false : true;
    this.checkNull.isPath = this.file ? false : true;
    this.formEdit.value.price = this.formEdit.value.price
      ?.replace(/\D/g, '')
      .replace(/^0+/, '');
    if (!this.checkNull.isPrice && Number(this.formEdit.value.price) <= 10000) {
      this.toaster.error('Vui lòng nhập giá lớn hơn 10.000đ', 'Lỗi');
      return;
    }

    const product: Product = {
      productName: this.formEdit.value.name?.replace(/\s+/g, ' ').trim()!,
      categoryId: this.formEdit.value.categoryId!,
      fabric: this.formEdit.value.fabric?.replace(/\s+/g, ' ').trim()!,
      price: Number(this.formEdit.value.price),
      sale: Number(this.formEdit.value.sale),
    };
    if (this.formEdit.valid) {
      const accessToken = this.shareDataService.accessToken;
      if (accessToken) {
        if (this.product) {
          this.checkNull.isPath = false;
          if (Number(this.formEdit.value.sale) < 0) {
            this.toaster.error('Vui lòng nhập giảm giá lớn hơn 0', 'Lỗi');
            return;
          }
          const updateProductSub = this.httpServer
            .updateProduct(this.product._id, product, this.file)
            .subscribe((data) => {
              if (data.status === 200) {
                this.toaster.success(
                  'Cập nhật sản phẩm thành công',
                  'Thành công'
                );
                this.router.navigateByUrl('/admin/product');
                return;
              }
              this.toaster.error('Cập nhật sản phẩm thất bại', 'Lỗi');
            });
            this.subscriptions.add(updateProductSub)
        } else if (this.file) {
          if (Number(this.formEdit.value.sale) < 0) {
            this.toaster.error('Vui lòng nhập giảm giá lớn hơn 0', 'Lỗi');
            return;
          }
          const createProductSub = this.httpServer
            .createProduct(product, accessToken, this.file)
            .subscribe((data) => {
              if (data.status === 200) {
                this.img = '';
                this.toaster.success('Thêm sản phẩm thành công', 'Thành công');
                this.formEdit = new FormGroup({
                  name: new FormControl('', [Validators.required]),
                  categoryId: new FormControl('', [Validators.required]),
                  fabric: new FormControl('', [Validators.required]),
                  price: new FormControl('', [Validators.required]),
                  sale: new FormControl(0),
                });
              }
            });
            this.subscriptions.add(createProductSub)
        }
      }
    }
    this.resetProductEdit()
  }
  inBarCode() {
    const printableElement = document.getElementById('printable');
    if (printableElement) {
      let printContents = '';
      for (let i = 0; i < this.quantityIn; i++) {
        printContents += printableElement.innerHTML;
      }

      // Tạo một trang mới
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        // Ghi nội dung cần in vào trang mới
        newWindow.document.write(`
          <html>
            <head>
              <title>In mã vạch</title>
            </head>
            <body>
              ${printContents}
            </body>
          </html>
        `);
        newWindow.document.close(); // Kết thúc ghi nội dung
        newWindow.focus(); // Tập trung vào trang mới
        newWindow.print(); // In trang mới
        newWindow.close(); // Đóng trang in sau khi in xong
      } else {
        console.error('Failed to open new window.');
      }
    } else {
      console.error('Element with ID "printable" not found.');
    }
  }
}
