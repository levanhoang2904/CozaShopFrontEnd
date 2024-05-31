import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { SharedDataService } from '../../shared-data-service/shared-data-service.component';
import { Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';
import { ToastrService } from 'ngx-toastr';
import { HttpServerService } from '../../../Services/http-server/http-server.service';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-create-order',
  standalone: true,
  imports: [CommonModule, ZXingScannerModule, RouterLink],
  templateUrl: './create-order.component.html',
  styleUrl: './create-order.component.css',
})
export class CreateOrderComponent implements OnInit, OnDestroy {
  toaster = inject(ToastrService);
  isActive: boolean = false;
  constructor(
    private shareDataService: SharedDataService,
    private title: Title,
    private httpServer: HttpServerService
  ) {}
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  private subscriptions: Subscription = new Subscription();
  qrResultString: string = '';
  formatsEnabled: BarcodeFormat[] = [
    BarcodeFormat.CODE_128,
    BarcodeFormat.EAN_13,
    BarcodeFormat.QR_CODE,
  ];

  listProduct: any = [];
  lastCallTime: number = 0;
  onCodeResult(idSize: string) {
    const currentTime = new Date().getTime();
    if (currentTime - this.lastCallTime >= 700) {
      this.lastCallTime = currentTime;
      this.qrResultString = idSize;
      if (this.checkCart(idSize)) {
        const detailSize = this.httpServer
          .getDetailSize(idSize)
          .subscribe((data) => {
            if (data.data) {
              this.listProduct.push(data);
              this.toaster.success(
                'Thêm thành sản phẩm thành công!',
                'Success',
                {
                  timeOut: 1000,
                }
              );
              this.totalSum();
            } else {
              this.toaster.error('Thêm không thành công!', 'Error', {
                timeOut: 1000,
              });
            }
          });
        this.subscriptions.add(detailSize);
      }
    }
  }

  ngOnInit(): void {
    this.title.setTitle('Tạo đơn hàng đơn hàng');
    const isActiveSub = this.shareDataService.isActive$.subscribe(
      (isActive) => {
        this.isActive = isActive;
      }
    );
    this.subscriptions.add(isActiveSub);
  }

  indexDelete: number = -1;
  confirmDeleteOne(index: number) {
    this.indexDelete = index;
  }
  deleteOne() {
    this.listProduct.splice(this.indexDelete, 1);
    this.toaster.success('Xóa thành công!', 'Success', {
      timeOut: 1000,
    });
    this.totalSum();
  }
  clearCart() {
    this.listProduct = [];
    this.total = 0;
    this.toaster.success('Xóa thành công!', 'Success', {
      timeOut: 1000,
    });
  }
  checkCart(idSize: string) {
    for (let i = 0; i < this.listProduct.length; i++) {
      if (
        this.listProduct[i].data.details[0].sizes[0]._id.slice(-8) == idSize
      ) {
        this.listProduct[i].quantity++;
        this.toaster.success('Thêm thành sản phẩm thành công!', 'Success', {
          timeOut: 500,
        });
        this.totalSum();

        return false;
      }
    }
    return true;
  }

  editItemCart(idSizeInProduct: string, edit: string): void {
    for (let i = 0; i < this.listProduct.length; i++) {
      if (this.listProduct[i].data.details[0].sizes[0]._id == idSizeInProduct) {
        if (edit == '-') {
          this.listProduct[i].quantity -= 1;
        } else {
          this.listProduct[i].quantity += 1;
        }
        this.totalSum();
        break;
      }
    }
  }

  total: number = 0;
  totalSum() {
    this.total = 0;
    for (let i = 0; i < this.listProduct.length; i++) {
      this.total +=
        this.listProduct[i].quantity *
        (this.listProduct[i].data.price -
          (this.listProduct[i].data.price * this.listProduct[i].data.sale) /
            100);
    }
  }

  makePayment() {
    let carts: any = [];

    for (let i = 0; i < this.listProduct.length; i++) {
      let product = this.listProduct[i];
      carts.push({
        idProduct: {
          _id: product.data._id,
          name: product.data.name,
          sale: product.data.sale,
          price: product.data.price,
        },
        idSize: {
          _id: product.data.details[0].sizes[0]._id,
          size: product.data.details[0].sizes[0].size,
        },
        idColor: {
          _id: product.data.details[0]._id,
          color: product.data.details[0].color,
          image: product.data.details[0].image,
        },
        amount: product.quantity,
        price: product.data.price,
      });
    }
    setTimeout(() => {
      this.listProduct = [];
      this.total = 0;
      const postOrderSub = this.httpServer
        .postOrder(carts)
        .subscribe((data) => {
          if (data.status == 200)
            this.toaster.success('Tạo đơn thành công!', 'Success', {
              timeOut: 1000,
            });
        });
      this.subscriptions.add(postOrderSub);
    }, 500);
  }

  availableDevices: MediaDeviceInfo[] = [];
  currentDevice: any;
  hasDevices: boolean = false;

  onCamerasFound(devices: MediaDeviceInfo[]): void {
    this.availableDevices = devices;
    this.hasDevices = Boolean(devices && devices.length);
  }

  onDeviceSelectChange(event: any) {
    const device = this.availableDevices.find(
      (x) => x.deviceId === event.target.value
    );
    this.currentDevice = device || null;
  }
}
