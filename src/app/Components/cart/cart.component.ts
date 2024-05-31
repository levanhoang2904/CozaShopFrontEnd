import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpServerService } from '../../Services/http-server/http-server.service';
import { HeaderService } from '../../Services/header/header-service.service';
import { CartService } from '../../Services/cart/cart.service';
import { Title } from '@angular/platform-browser';
import { SharedDataService } from '../../Components/shared-data-service/shared-data-service.component';
import { ToastrService } from 'ngx-toastr';
import { loadStripe } from '@stripe/stripe-js';
import { AddressService } from '../../Services/address/address.service';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css',
})
export class CartComponent implements OnInit, OnDestroy {
  constructor(
    private title: Title,
    private router: Router,
    private httpServer: HttpServerService,
    private route: ActivatedRoute,
    private headerService: HeaderService,
    private cartService: CartService,
    private sharedDataService: SharedDataService
  ) {}

  cart: any[] = [];
  toaster = inject(ToastrService);
  addresses: AddressService[] = [];
  user: any;
  selectedAddress: string = '';
  idItem: string = '';
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }
  private subscriptions: Subscription = new Subscription();
  ngOnInit(): void {
    const userString = localStorage.getItem('user');

    if (userString) {
      this.user = JSON.parse(userString);
    }
    this.title.setTitle('Giỏ hàng');
    if (this.router.url.split('?')[0] === '/cart') {
      this.headerService.updateData(true);
    } else this.headerService.updateData(false);
    window.scrollTo(0, 0);
    const routeSub = this.route.queryParams.subscribe((data: any) => {
      if (data.message === 'success')
        this.toaster.success('Thanh toán thành công', 'Success');
      else if (data.error === 'error')
        this.toaster.error('Có lỗi xảy ra', 'Lỗi');
    });
    this.subscriptions.add(routeSub)
    const cartUpdateSub = this.cartService.cartUpdated().subscribe(() => {
      this.updateCart();
    });
    this.subscriptions.add(cartUpdateSub)

   if (this.user) {
    const getUserAndAddressSub = this.httpServer.getUserAndAddress(this.user._id).subscribe((data: any) => {
      data.addresses.map((address: AddressService) => {
        this.addresses.push(address);
      });
    });
    this.subscriptions.add(getUserAndAddressSub)
   }
  }

  updateCart(): void {
    this.cart = this.cartService.getItemsSync();
  }

  editItemCart(idCartItem: string, edit: string): void {
    this.cartService.editItemCart(idCartItem, edit);
    this.updateCart();
  }

  setIdItem(idItem: string): void {
    this.idItem = idItem;
  }

  deleteItemCart(idCartItem: string): void {
    if (idCartItem !== '') {
      this.cartService.deleteItemCart(idCartItem);
      this.updateCart();
    }
  }

  clearCart() {
    if (!this.sharedDataService.accessToken) {
      this.toaster.error(
        'Vui lòng đăng nhập để sử dụng chức năng này!!!',
        'Lỗi'
      );
      return;
    }
    this.cartService.deleteCart(this.sharedDataService.accessToken);
    this.updateCart();
  }

  summaryPrice(): number {
    return this.cartService.totalPrice();
  }

  async makePayment() {
    if (this.selectedAddress === '') {
      this.toaster.error('Vui lòng chọn địa chỉ giao hàng', 'Lỗi');
      return;
    }
    let payload: any = {
      idCart: this.cart[0].idCart,
      idUser: this.user._id,
      idAddress: this.selectedAddress,
      products: [],
    };

    this.cart.forEach((product: any) => {
      payload.products.push({
        productName: product.nameProduct,
        price: product.price - product.price * (product.sale / 100),
        imgCover: product.imgCover,
        id: product._idProduct,
        amount: product.amount,
        size: product.size,
        color: product.color,
      });
    });

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

  priceProductFormat(price: number, sale: number = 0) {
    return new Intl.NumberFormat('vn-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price - price * (sale / 100));
  }
}
