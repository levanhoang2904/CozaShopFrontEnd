import { Component, Input, OnDestroy, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HeaderService } from '../../Services/header/header-service.service';
import { ProductService } from '../../Services/product/product.service';
import { HttpServerService } from '../../Services/http-server/http-server.service';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { ProductSizeService } from '../../Services/product-size/product-size.service';
import { FormsModule } from '@angular/forms';
import { ProductComponent } from '../product/product.component';
import io from 'socket.io-client';
import { ToastrService } from 'ngx-toastr';
import { SharedDataService } from '../../Components/shared-data-service/shared-data-service.component';
import { CartService } from '../../Services/cart/cart.service';
import { Clipboard } from '@angular/cdk/clipboard';
import { loadStripe } from '@stripe/stripe-js';
import { AddressService } from '../../Services/address/address.service';
import { Subscription } from 'rxjs';

interface ContentComment {
  name: string;
  date: string;
  content: string;
}
class ContentComment {
  _idUser!: string;
  name!: string;
  date!: string;
  content!: string;
}

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ProductComponent, RouterLink],
  providers: [ProductSizeService],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css',
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private httpServer: HttpServerService,
    private route: ActivatedRoute,
    private headerService: HeaderService,
    private title: Title,
    private sharedDataService: SharedDataService,
    private cartService: CartService,
    private clipboard: Clipboard
  ) {}

  public product = new ProductService();
  public productSizes!: ProductSizeService[];
  public imageCurrent: string = '';
  @Input() colorCurrent: string = '';
  public colorChoose: string = '';
  public idDetailCurrent: string = '';
  public sizeCurrent: string = '';
  public isSize: boolean = true;
  public similarProduct: ProductService[] = [];
  public comments: ContentComment[] = [];
  @Input() quantityCurrent: number = 1;
  @Input() message: string = '';
  public name: string = '';
  private socket: any;
  toaster = inject(ToastrService);
  public user: any;
  public hour = new Array<string>();
  public isLogin: boolean = false;
  public addresses: AddressService[] = [];
  public selectedAddress: string = '';
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }
  private subscriptions: Subscription = new Subscription();
  ngOnInit(): void {
    const isLoginSub = this.headerService.isLoggedIn$.subscribe((data) => {
      this.isLogin = data;
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) this.isLogin = true;
    });

    this.socket = io('https://backendqlshop-1.onrender.com/');

    this.socket.on('message', (data: any) => {
      this.getComment(data.message);
      this.message = '';
    });

    let userString = localStorage.getItem('user');

    if (userString) {
      this.user = JSON.parse(userString);
      if (this.user.name) {
        this.name = this.user.name;
      }
    }
    this.title.setTitle('Chi tiết sản phẩm');
    if (this.router.url.split('?')[0] === '/product') {
      this.headerService.updateData(true);
    } else this.headerService.updateData(false);
    window.scrollTo(0, 0);
    const routeSub = this.route.queryParams.subscribe((data) => {
      if (data['id']) {
        this.comments = [];
        const getProductDetailSub = this.httpServer.getProductDetail(data['id']).subscribe((product) => {
          this.quantityCurrent = 1;
          this.product = product;
          const getSimilarProductSub = this.httpServer.getSimilarProduct().subscribe((data) => {
            this.similarProduct = data;
          });
          this.subscriptions.add(getSimilarProductSub)
          this.imageCurrent = product.path;
          if (this.product.details.length > 0) {
            this.colorCurrent = product.details[0].color;
            this.idDetailCurrent = this.product.details[0]._id;
            this.imageCurrent = this.product.details[0].image;
            this.productSizes = product.details[0].sizes;
          }

          const getCommentSub = this.httpServer.getComment(this.product._id).subscribe((data) => {
            if (data.length > 0) {
              data[0].comments.map((comment: any) => {
                const getUserSub = this.httpServer
                  .getUserById(comment._idUser)
                  .subscribe((user) => {
                    const dateCreated = new Date(
                      comment.createdAt.split('.')[0]
                    );
                    dateCreated.setHours(dateCreated.getHours() + 7);
                    const currentTime = new Date();
                    const distance =
                      currentTime.getDate() - dateCreated.getDate();
                    if (
                      currentTime.getMonth() != dateCreated.getMonth() ||
                      currentTime.getFullYear() != dateCreated.getFullYear()
                    )
                      this.hour.push(comment.createdAt.split('T')[0]);
                    else if (distance === 1) {
                      if (dateCreated.getHours() - currentTime.getHours() > 1)
                        this.hour.push(
                          (24 - (dateCreated.getHours() - currentTime.getHours())).toString() + ' tiếng trước'
                        );
                      else this.hour.push('1 ngày trước');
                    } else if (distance === 2)
                      if (dateCreated.getHours() - currentTime.getHours() > 1)
                        this.hour.push('1 ngày trước');
                      else this.hour.push(comment.createdAt.split('T'));
                    else if (distance === 0)
                      if (currentTime.getHours() - dateCreated.getHours() < 1)
                        if (
                          currentTime.getMinutes() - dateCreated.getMinutes() <=
                          1
                        )
                          this.hour.push('Vừa xong');
                        else
                          this.hour.push(
                            (
                              currentTime.getMinutes() -
                              dateCreated.getMinutes()
                            ).toString() + ' phút trước'
                          );
                      else
                        this.hour.push(
                          (
                            currentTime.getHours() - dateCreated.getHours()
                          ).toString() + ' giờ trước'
                        );
                    else this.hour.push(comment.createdAt.split('T')[0]);
                    const _idUser: string = user._id;
                    const name: string = user.name;
                    const content: string = comment.content;
                    const date: string = comment.createdAt;
                    this.comments.push({
                      _idUser,
                      name,
                      content,
                      date,
                    });
                  });
                  this.subscriptions.add(getUserSub)
              });
            }
          });
          this.subscriptions.add(getCommentSub)
        });
        this.subscriptions.add(getProductDetailSub)
      } else this.router.navigate(['']);
    });
    this.subscriptions.add(routeSub)
    this.subscriptions.add(isLoginSub)
    if (this.user) {
      const getUserAddressSub = this.httpServer
        .getUserAndAddress(this.user._id)
        .subscribe((data: any) => {
          data.addresses.map((address: AddressService) => {
            this.addresses.push(address);
          });
        });
        this.subscriptions.add(getUserAddressSub)
    }
  }

  chooseColor(image: string, color: string, idColor: string) {
    this.imageCurrent = image;
    this.colorCurrent = color;
    this.idDetailCurrent = idColor;
    this.sizeCurrent = '';
    this.product.details.map((productDetail) => {
      if (productDetail._id === this.idDetailCurrent)
        return (this.productSizes = productDetail.sizes);
      return null;
    });
  }

  setColorCurrent(color: string) {
    this.colorChoose = color;
  }

  chooseSize(size: string) {
    this.sizeCurrent = size;
    this.isSize = true;
  }

  increaseQuantity() {
    this.quantityCurrent += 1;
  }

  decreaseQuantity() {
    if (this.quantityCurrent > 1) {
      this.quantityCurrent -= 1;
    }
  }

  addToCart(productId: string, colorId: string, sizeId: string, price: number) {
    if (!this.sharedDataService.accessToken) {
      this.toaster.error(
        'Vui lòng đăng nhập để sử dụng chức năng này!!!',
        'Lỗi'
      );
      return;
    }

    if (!sizeId) {
      this.isSize = false;
    }
    if (colorId && sizeId) {
      const payload = {
        idProduct: productId,
        idColor: colorId,
        idSize: sizeId,
        amount: this.quantityCurrent,
        price: price,
      };

      this.cartService.addToMyCart(this.sharedDataService.accessToken, payload);
    }
  }

  postComment() {
    if (this.message.trim() != '') {
      this.socket.emit('message', {
        message: this.message,
      });

      const payload = {
        _idProduct: this.product._id,
        comment: {
          _idUser: this.user._id,
          content: this.message,
        },
      };

      const postCommentSub = this.httpServer.postComment(payload).subscribe((data) => {
        return data;
      });
      this.subscriptions.add(postCommentSub)
    }
  }

  getComment(mess: string) {
    this.hour.push('Vừa xong');
    this.comments.push({
      _idUser: this.user._id,
      name: this.name,
      content: mess,
      date: new Date().toISOString(),
    });
  }

  removeComment(i: number) {
    const removeCommentSub = this.httpServer
      .removeComment(
        this.product._id,
        this.comments[i]._idUser,
        this.comments[i].date
      )
      .subscribe((data) => {
        return data;
      });

    this.comments.splice(i, 1);
    this.subscriptions.add(removeCommentSub)
  }

  shareUrl() {
    this.clipboard.copy('http://localhost:4200/' + this.router.url);
  }

  async makePayment() {
    if (!this.sharedDataService.accessToken) {
      this.toaster.error(
        'Vui lòng đăng nhập để sử dụng chức năng này!!!',
        'Lỗi'
      );
      return;
    }

    if (!this.sizeCurrent || this.selectedAddress === '') {
      if (!this.sizeCurrent) this.isSize = false;
      if (this.selectedAddress === '')
        this.toaster.error('Vui lòng chọn địa chỉ giao hàng', 'Lỗi');
    } else {
      let payload: any = {
        idUser: this.user._id,
        idAddress: this.selectedAddress,
        products: [
          {
            productName: this.product.name,
            price: this.product.price,
            imgCover: this.imageCurrent,
            id: this.product._id,
            amount: this.quantityCurrent,
            idSize: this.sizeCurrent,
            color: this.colorCurrent,
            idColor: this.idDetailCurrent,
          },
        ],
      };

      this.product.details.map((productDetail) => {
        productDetail.sizes.map((productSize) => {
          if (productSize._id === this.sizeCurrent)
            payload.products[0].size = productSize.size;
        });
      });
      if (this.product.sale > 0) {
        payload.products[0].price =
          this.product.price - this.product.price * (this.product.sale / 100);
      }

      const stripe = await loadStripe(
        'pk_test_51P7ZcnGOZ4CROzycMXuQfLAVdv7bWqtyWh8Sa1BMvl3xGancvcbv1ZCoEjh7PmVWWQRKDZS4tdDpow7sgiOsWs8N003N5weBuP'
      );
      if (this.sharedDataService.accessToken) {
        const makePaymentSub = this.httpServer
          .makePayment(payload, this.sharedDataService.accessToken)
          .subscribe({
            next(data: any) {
              stripe?.redirectToCheckout({
                sessionId: data.id,
              });
            },
            error: (error) => {
              this.toaster.error('Vui lòng đăng nhập lại', 'Lỗi');
            },
          });
          this.subscriptions.add(makePaymentSub)
      }
    }
  }

  priceProductFormat(price: number, sale: number) {
    return new Intl.NumberFormat('vn-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price - price * (sale / 100));
  }
}
