import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, of } from 'rxjs';
import { SharedDataService } from '../../Components/shared-data-service/shared-data-service.component';
import { HttpServerService } from '../http-server/http-server.service';
import { ToastrService } from 'ngx-toastr';

interface CartItem {
  id: string;
  _idProduct: string;
  nameProduct: string;
  color: string;
  size: string;
  amount: number;
  imgCover: string;
  price: number;
  sale: number;
  idCart: string;
}

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private items: CartItem[] = [];
  private cartUpdatedSubject = new BehaviorSubject<void>(undefined);
  toaster = inject(ToastrService);

  constructor(
    private httpServerService: HttpServerService,
    private sharedDataService: SharedDataService
  ) {
    this.initItems();
  }

  initItems(): void {
    this.getItems().subscribe({
      next: (items: CartItem[]) => {
        this.items = items;
        this.cartUpdatedSubject.next();
      },
      error: (error: any) => {
        this.items = [];
        this.toaster.error('Không thể lấy giỏ hàng của bạn', 'Lỗi');
      },
    });
  }

  clearCart() {
    this.items = [];
  }

  totalPrice(): number {
    return this.items.reduce((total, item) => {
      if (item.sale !== 0) {
        return (
          total + item.amount * (item.price - (item.price * item.sale) / 100)
        );
      } else {
        return total + item.amount * item.price;
      }
    }, 0);
  }

  getCartLength(): number {
    return this.items.length;
  }

  getItems(): Observable<CartItem[]> {
    const accessToken = this.sharedDataService.accessToken;
    if (accessToken !== null) {
      return this.httpServerService.getMyCart(accessToken).pipe(
        map((carts) => {
          if (carts.status === 200 && carts.data !== null) {
            const formattedData: CartItem[] = carts.data.items.map(
              (cart: any) => ({
                id: cart._id,
                _idProduct: cart.idProduct._id,
                nameProduct: cart.idProduct.name,
                color: cart.idColor.color,
                size: cart.idSize.size,
                amount: cart.amount,
                imgCover: cart.idColor.image,
                price: cart.idProduct.price,
                sale: cart.idProduct.sale,
                idCart: cart.idCart,
              })
            );
            return formattedData;
          } else {
            return [];
          }
        }),
        catchError((error) => {
          return of([]);
        })
      );
    } else {
      return of([]);
    }
  }

  addToMyCart(accessToken: string, payload: object) {
    this.httpServerService
      .addToMyCart(accessToken, payload)
      .subscribe((data) => {
        if (data.status === 200) {
          this.toaster.success(data.message, 'Thành công');
          this.initItems();
        } else {
          console.log(data);
          this.toaster.error(data.message, 'Lỗi');
        }
      });
  }

  editItemCart(idCartItem: string, edit: string) {
    this.httpServerService.editMyCart(idCartItem, edit).subscribe((data) => {
      if (data.status === 200) {
        this.initItems();
        
      } 
    });
  }

  deleteItemCart(idCartItem: string) {
    this.httpServerService.deleteItemMyCart(idCartItem).subscribe((data) => {
      if (data.status === 200) {
        this.initItems();
        this.toaster.success(data.message, 'Thành công');
      } else {
        console.log(data);
        this.toaster.error(data.message, 'Lỗi');
      }
    });
  }

  deleteCart(accessToken: string) {
    this.httpServerService.deleteMyCart(accessToken).subscribe((data) => {
      if (data.status === 200) {
        this.initItems();
        this.toaster.success(data.message, 'Thành công');
      } else {
        console.log(data);
        this.toaster.error(data.message, 'Lỗi');
      }
    });
  }

  cartUpdated(): Observable<void> {
    return this.cartUpdatedSubject.asObservable();
  }

  getItemsSync(): CartItem[] {
    return this.items;
  }
}
