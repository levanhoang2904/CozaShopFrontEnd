import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpServerService } from '../../../Services/http-server/http-server.service';
import { SharedDataService } from '../../shared-data-service/shared-data-service.component';
import { HttpClient } from '@angular/common/http';
import {
  FormBuilder,
  FormsModule,
  FormGroup,
  ReactiveFormsModule,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AddressDto, DataProductOrderDto } from '../../../../dto/classDto';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-order',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './edit-order.component.html',
  styleUrl: './edit-order.component.css',
})
export class EditOrderComponent implements OnInit, OnDestroy {
  toaster = inject(ToastrService);
  @ViewChild('closeButton1') closeModelAddress!: ElementRef;
  @ViewChild('closeButton2') closeModelProduct!: ElementRef;
  @ViewChild('closeButton3') closeAddIdVNPost!: ElementRef;
  isActive: boolean = false;

  constructor(
    private httpServer: HttpServerService,
    private router: ActivatedRoute,
    private route: Router,
    private shareDataService: SharedDataService,
    private title: Title,
    private http: HttpClient,
    private formBuilder: FormBuilder,

  ) {
    this.router.queryParams.subscribe((data) => {
      if (data['id']) {
        this.idOrder = data['id'];
        this.httpServer.getOrderById(data['id']).subscribe((data) => {
          this.order = data;
          this.calculateTotalPrice();
        });
      }
    });
    
    this.addressForm = this.formBuilder.group({
      name: '',
      phone: '',
      detailAddress: '',
      city: '',
      district: '',
      ward: '',
      note: '',
      idAddress: '',
    });
    this.productForm = this.formBuilder.group({
      name: '',
      image: '',
      color: [],
      size: [],
      number: 0,
    });
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }
  private subscriptions: Subscription = new Subscription();
  idOrder: string = '';
  order: any;
  totalPrice: number = 0;
  ngOnInit(): void {
    this.title.setTitle('Cập nhật đơn hàng');
    const isActiveSub = this.shareDataService.isActive$.subscribe((isActive) => {
      this.isActive = isActive;
    });
    this.subscriptions.add(isActiveSub)
  }

  calculateTotalPrice() {
    this.totalPrice = 0;
    for (let orderDetail of this.order._idOrderDetail) {
      this.totalPrice += orderDetail.price * orderDetail.amount;
    }
  }
  getStatusDescription(status: number): string {
    switch (status) {
      case 1:
        return 'Chưa đóng hàng';
      case 2:
        return 'Đang lấy hàng';
      case 3:
        return 'Đang giao hàng';
      case 4:
        return 'Giao thành công';
      case 5:
        return 'Đã bị hủy';
      case 0:
        return 'Lỗi vận đơn';
      default:
        return '';
    }
  }
  updateStatus: number = 0;
  informationStatus: string = '';
  confirmAndSetStatus(status: number) {
    this.updateStatus = status;
    if (this.updateStatus == 2) {
      this.informationStatus = 'Bạn có chắc chắn đã đóng hàng chưa?';
    } else if (this.updateStatus == 5) {
      this.informationStatus = 'Bạn có chắc chắn muốn hủy đơn hàng không ?';
    }
  }
  UpdateStatus() {
    if (this.updateStatus == 2) {
      this.setStatus(2);
    } else if (this.updateStatus == 5) {
      this.setStatus(5);
    }
  }

  setStatus(status: number) {
    const detailUserSub = this.httpServer
      .getDetailUser(this.shareDataService.accessToken!)
      .subscribe({
        next: (response) => {
          const addNameStaffSub = this.httpServer.addNameStaff(this.idOrder, response.data.name);
          this.order.nameStaff = response.data.name;
          this.subscriptions.add(addNameStaffSub)
        },
        error: (error) => {
          localStorage.removeItem('accessToken');
        },
      });
      const updateStatusSub = this.httpServer.updateStatusOrder(this.idOrder, status);
      this.subscriptions.add(updateStatusSub)
      this.order.status = status;
      this.subscriptions.add(detailUserSub)
  }

  cities: any[] = [];
  districts: any[] = [];
  wards: any[] = [];
  formErrorAddress: any = {
    name: '',
    phone: '',
    detailAddress: '',
    city: '',
    district: '',
    ward: '',
  };
  addressForm: FormGroup;

  async openModelUpdateAddress() {
    if (this.order._idAddress) {
      this.addressForm = await this.formBuilder.group({
        name: this.order._idAddress.name,
        phone: this.order._idAddress.phone,
        detailAddress: this.order._idAddress.detailAddress,
        city: this.order._idAddress.city,
        district: this.order._idAddress.district,
        ward: this.order._idAddress.ward,
        note: this.order._idAddress.note,
        idAddress: this.order._idAddress._id,
      });
    }
    this.getDataProvince();
  }

  async onchangeAddress() {
    this.clearformErrorAddress();
    if (this.addressForm.value.name == '')
      this.formErrorAddress.name = 'Tên người nhận không được trống';
    if (this.addressForm.value.detailAddress == '')
      this.formErrorAddress.detailAddress = 'Địa chỉ chi tiết không được trống';
    if (this.addressForm.value.city == '')
      this.formErrorAddress.city = 'Tỉnh thành không được trống';
    if (this.addressForm.value.district == '')
      this.formErrorAddress.district = 'Quận huyện không được trống';
    if (this.addressForm.value.ward == '')
      this.formErrorAddress.ward = 'Phường xã không được trống';
    const phonePattern = /^(0\d{9})$/;
    if (!phonePattern.test(this.addressForm.value.phone))
      this.formErrorAddress.phone = 'Số điện thoại không hợp lệ';
    if (this.addressForm.value.phone == '')
      this.formErrorAddress.phone = 'Số điện thoại không được trống';

    if (this.hasErrorsAddress()) return;

    const addressDto = new AddressDto();
    addressDto.idAddress = this.addressForm.value.idAddress;
    addressDto.name = this.addressForm.value.name;
    addressDto.phone = this.addressForm.value.phone;
    addressDto.detailAddress = this.addressForm.value.detailAddress;
    addressDto.city = this.addressForm.value.city;
    addressDto.district = this.addressForm.value.district;
    addressDto.ward = this.addressForm.value.ward;
    addressDto.note = this.addressForm.value.note;

    const updateAddressSub = this.httpServer.UpdateAddress(addressDto).subscribe({
      next: (response) => {
        this.toaster.success('Thay đổi thành công!', 'Success', {
          timeOut: 2000,
        });
        this.resetAddressForm();
        this.closeModelAddress.nativeElement.click();
        this.router.queryParams.subscribe((data) => {
          if (data['id']) {
            this.idOrder = data['id'];
            this.httpServer.getOrderById(data['id']).subscribe((data) => {
              this.order = data;
              this.calculateTotalPrice();
            });
          }
        });
      },
      error: (error) => {
        this.toaster.error('Cập nhật không thành công!', 'Error', {
          timeOut: 2000,
        });
      },
    });
    this.subscriptions.add(updateAddressSub)
  }

  onCityChange(fromView?: boolean) {
    if (fromView) {
      this.addressForm.value.district = '';
      this.addressForm.value.ward = '';
    }
    this.wards = [];
    this.districts = [];
    if (this.addressForm.value.city) {
      const selectedCity = this.cities.find(
        (city) => city.Name === this.addressForm.value.city
      );
      if (selectedCity && selectedCity.Districts) {
        this.districts = selectedCity.Districts.sort(
          (a: { Name: string }, b: { Name: string }) =>
            a.Name.localeCompare(b.Name)
        );
      }
    }
  }

  onDistrictChange(fromView?: boolean) {
    this.wards = [];
    if (fromView) this.addressForm.value.ward = '';
    const selectedDistrict = this.districts.find(
      (district) => district.Name === this.addressForm.value.district
    );
    if (selectedDistrict && selectedDistrict.Wards) {
      this.wards = selectedDistrict.Wards.sort(
        (a: { Name: string }, b: { Name: string }) =>
          a.Name.localeCompare(b.Name)
      );
    }
  }

  getDataProvince() {
    const dataProvinceSub = this.http
      .get(
        'https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json'
      )
      .subscribe((data: any) => {
        this.cities = data.sort((a: { Name: string }, b: { Name: string }) =>
          a.Name.localeCompare(b.Name)
        );
        this.onCityChange();
        this.onDistrictChange();
      });
      this.subscriptions.add(dataProvinceSub)
  }
  clearformErrorAddress() {
    this.formErrorAddress.name = '';
    this.formErrorAddress.phone = '';
    this.formErrorAddress.detailAddress = '';
    this.formErrorAddress.city = '';
    this.formErrorAddress.district = '';
    this.formErrorAddress.ward = '';
  }
  hasErrorsAddress(): boolean {
    for (let key in this.formErrorAddress)
      if (this.formErrorAddress[key]) return true;
    return false;
  }

  resetAddressForm() {
    this.addressForm.reset({
      name: '',
      phone: '',
      detailAddress: '',
      city: '',
      district: '',
      ward: '',
      note: '',
      idAddress: '',
    });
  }
  ///////////////////////////////////////
  detailProduct: any;
  productForm: FormGroup;
  listSize: any;
  formErrorProduct: any = {
    color: '',
    size: '',
  };

  async getDetailProduct(
    idProduct: string,
    image: string,
    color: string,
    size: string,
    number: number
  ) {
    this.errorSize=""
    const detailProductSub = this.httpServer.getProductDetail(idProduct).subscribe((data) => {
      this.detailProduct = data;
      this.productForm = this.formBuilder.group({
        name: this.detailProduct.name,
        image: image,
        color: color,
        size: size,
        number: number,
      });
      this.getListSize(color);

      this._idSizeold = this.order._idOrderDetail[number].idSize._id;
      this.amount = this.order._idOrderDetail[number].amount;
    });
    this.subscriptions.add(detailProductSub)
  }

  _idColor: string = '';
  _idSize: string = '';
  _idSizeold: string = '';
  amount: number = 0;
  errorSize:string=""
  onchangeProduct() {
    if(this._idSize==""){
       this.errorSize="Màu này đã hết size!"
      return
    } else{

    let change = new DataProductOrderDto();
    change._id = this.order._id;
    change.number = this.productForm.value.number;
    change._idColor = this._idColor;
    change.color = this.productForm.value.color;
    change.image = this.productForm.value.image;
    change._idSize = this._idSize;
    change.size = this.productForm.value.size;
    change._idSizeold = this._idSizeold;
    change.amount = this.amount;

    const updateProductOrderSub = this.httpServer.updateProductInOrder(change).subscribe((data) => {
      this.order._idOrderDetail = data._idOrderDetail;
      this.toaster.success('Thay đổi thành công!', 'Success', {
        timeOut: 2000,
      });
      this.closeModelProduct.nativeElement.click();
    });
    this.subscriptions.add(updateProductOrderSub)
  }
  }

  onChangeColor() {
    this.errorSize=""
    this.getListSize(this.productForm.value.color);
  }
  onChangeIdSize() {
    let foundIdSize = this.listSize.find(
      (item: { size: string }) => item.size == this.productForm.value.size
    );
    if(!foundIdSize) this._idSize=""
    if (foundIdSize) {
      this._idSize = foundIdSize._id;
    } else {
      this._idSize = this.listSize[0]._id;
    }
  }

  getListSize(color: string) {
    const foundItem = this.detailProduct.details.find(
      (item: { color: string }) => item.color === color
    );
    this._idColor = foundItem._id;
    this.productForm.patchValue({ _idColor: foundItem._id });
    this.productForm.patchValue({ image: foundItem.image });
    if (foundItem) {
      this.listSize = foundItem.sizes.filter(
        (size: { quantity: number }) => size.quantity > 0
      );
    } else {
      this.listSize = null;
    }
    this.onChangeIdSize();
    this.productForm.value._idSize = this.listSize[0]._id;
  }

  maDonHang: string = '';
  errorIdVNPost: boolean = false;
  addIdVNPost() {
    this.errorIdVNPost = false;
    const getOrderSub = this.httpServer.getOrder(this.maDonHang).subscribe({
      next: (response: any) => {
        if (response[0]) {
          this.toaster.success('Thêm mã đơn hàng thành công!', 'Success', {
            timeOut: 2000,
          });
          this.order.status = 1;
          this.order.idOrderVNPost = this.maDonHang;
          this.closeAddIdVNPost.nativeElement.click();
          const addIdVNPostSub = this.httpServer.addIdVNPost(this.order._id, this.maDonHang);
          this.subscriptions.add(addIdVNPostSub)
        } else {
          this.errorIdVNPost = true;
        }
      },
    });
    this.subscriptions.add(getOrderSub)
  }

  idOrderDelete: string = '';

  confirmDeleteOrder(idOrder: string) {
    this.idOrderDelete = idOrder;
  }
  deleteOrder() {
    const deleteOrderSub = this.httpServer.deleteOrder(this.idOrderDelete).subscribe({
      next: (response: any) => {
        if (response) {
          this.toaster.success('Xóa thành công!', 'Success', {
            timeOut: 2000,
          });
          this.route.navigateByUrl('/admin/order');
        }
      },
    });
    this.subscriptions.add(deleteOrderSub)
  }

  NumberFormat(price: number) {
    return new Intl.NumberFormat('vn-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(price);
  }
}
