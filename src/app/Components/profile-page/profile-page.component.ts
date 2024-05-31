import { CommonModule } from '@angular/common';
import {
  Component,
  OnInit,
  inject,
  ViewChild,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HeaderService } from '../../Services/header/header-service.service';
import { HttpServerService } from '../../Services/http-server/http-server.service';
import { SharedDataService } from '../shared-data-service/shared-data-service.component';
import { Title } from '@angular/platform-browser';
import { AddressDto, UserDto } from '../../../dto/classDto';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { Subscription, forkJoin } from 'rxjs';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  providers: [UserDto, AddressDto],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css',
})
export class ProfilePageComponent implements OnInit, OnDestroy {
  userForm: FormGroup;
  passwordForm: FormGroup;
  formErrorProfile: any = { name: '', email: '', phone: '', date: '' };
  formErrorChangePass: any = { oldPass: '', newPass1: '', newPass2: '' };
  profile: boolean;
  changePass: boolean;
  addAddress: boolean;
  orderHistory: boolean;
  IdUser: string = '';
  toaster = inject(ToastrService);

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private headerService: HeaderService,
    private httpServerService: HttpServerService,
    private shareDataService: SharedDataService,
    private title: Title,
    private http: HttpClient,
    private route: ActivatedRoute
  ) {
    this.profile = true;
    this.changePass = false;
    this.addAddress = false;
    this.orderHistory = false;
    this.userForm = this.formBuilder.group({
      id: '',
      name: '',
      email: '',
      phone: '',
      date: '',
      password: '',
    });
    this.passwordForm = this.formBuilder.group({
      oldPass: '',
      newPass1: '',
      newPass2: '',
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
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  private subscriptions: Subscription = new Subscription();
  ngOnInit(): void {
    if (this.router.url.split('?')[0] === '/profile') {
      this.headerService.updateData(true);
    } else this.headerService.updateData(false);
    window.scrollTo(0, 0);

    this.title.setTitle('Thông tin tài khoản');
    const detailUserSub = this.httpServerService
      .getDetailUser(this.shareDataService.accessToken!)
      .subscribe({
        next: (response) => {
          this.IdUser = response.data.id;
          const routeSub = this.route.queryParams.subscribe((data) => {
            if (data['address']) {
              this.chooseFunction('addAddress');
            }
          });
          this.subscriptions.add(routeSub);
          this.userForm.patchValue({
            id: response.data.id,
            name: response.data.name,
            email: response.data.email,
            phone: response.data.phone,
            password: response.data.password,
            date: this.formatDate(response.data.date),
          });
        },
        error: (error) => {
          localStorage.removeItem('accessToken');
        },
      });
    this.subscriptions.add(detailUserSub);
    window.scrollTo(0, 0);
  }

  onSubmit() {
    this.clearformErrorProfile();
    if (this.userForm.value.name == '')
      this.formErrorProfile.name = 'Họ tên không được để trống!';
    if (this.userForm.value.email == '')
      this.formErrorProfile.email = 'Email không được để trống!';
    if (!/@gmail\.com$/i.test(this.userForm.value.email))
      this.formErrorProfile.email = 'Email không hợp lệ!';
    if (this.userForm.value.phone == '')
      this.formErrorProfile.phone = 'Số điện thoại không được để trống!';
    const phonePattern = /^(0\d{9})$/;
    if (!phonePattern.test(this.userForm.value.phone))
      this.formErrorProfile.phone = 'Số điện thoại không hợp lệ!';

    const userDate = new Date(this.userForm.value.date);
    const minDate = new Date('1900-01-01');
    const maxDate = new Date('2100-01-01');

    if (userDate <= minDate || userDate >= maxDate) {
      this.formErrorProfile.date = 'Ngày sinh không hợp lệ!';
    }

    if (this.hasErrorsProfile()) return;
    const userToUpdate = new UserDto();
    userToUpdate._id = this.userForm.value.id;
    userToUpdate.name = this.userForm.value.name;
    userToUpdate.email = this.userForm.value.email;
    userToUpdate.phone = this.userForm.value.phone;
    userToUpdate.date = this.userForm.value.date;
    const updateProfileSub = this.httpServerService
      .updateProfile(userToUpdate)
      .subscribe((data) => console.log(data));
    if (updateProfileSub)
      this.toaster.success('Đã cập nhật thành công!', 'Thành công', {
        timeOut: 2000,
      });
    else this.toaster.error('Cập nhật thất bại!', 'Lỗi', { timeOut: 2000 });
    this.subscriptions.add(updateProfileSub);
  }
  ChangePass() {
    this.clearformErrorChangePass();
    if (this.passwordForm.value.oldPass !== this.userForm.value.password)
      this.formErrorChangePass.oldPass = '';
    if (this.passwordForm.value.oldPass == '')
      this.formErrorChangePass.oldPass = 'Mật khẩu cũ không được để trống!';
    if (this.passwordForm.value.newPass1 == '')
      this.formErrorChangePass.newPass1 = 'Mật khẩu mới không được để trống!';
    if (this.passwordForm.value.newPass2 == '')
      this.formErrorChangePass.newPass2 =
        'Nhập lại mật khẩu không được để trống!';
    if (this.passwordForm.value.newPass2 !== this.passwordForm.value.newPass1)
      this.formErrorChangePass.newPass2 = 'Nhập lại mật khẩu không chính xác!';
    if (this.hasErrorsChangePass()) return;

    const userChangePass = new UserDto();
    userChangePass._id = this.userForm.value.id;
    userChangePass.password = this.passwordForm.value.newPass1;
    userChangePass.oldPass = this.passwordForm.value.oldPass;

    const updateProfileSub = this.httpServerService.updateProfile(userChangePass).subscribe((data) => {
      if (!data) {
        this.formErrorChangePass.oldPass = 'Mật khẩu cũ không chính xác';
        return;
      }
      this.toaster.success('Đã đổi mật khẩu thành công!', 'Thành công', {
        timeOut: 2000,
      });
      this.userForm.value.password = this.passwordForm.value.newPass1;
      this.passwordForm.reset();
    });
    this.subscriptions.add(updateProfileSub)
  }

  async chooseFunction(name: string) {
    this.profile = false;
    this.changePass = false;
    this.addAddress = false;
    this.orderHistory = false;
    if (name == 'profile') this.profile = true;
    if (name == 'changePass') this.changePass = true;
    if (name == 'addAddress') {
      this.addAddress = true;
      const userAddressSub = this.httpServerService.getUserAndAddress(this.IdUser).subscribe({
        next: (response: any) => {
          this.listAddress = response.addresses;
        },
      });
      this.subscriptions.add(userAddressSub)
      this.getDataProvince();
    }
    if (name == 'orderHistory') {
      this.orderHistory = true;
      this.getListOrderAndListVNPost();
    }
  }
  clearformErrorProfile() {
    this.formErrorProfile.name = '';
    this.formErrorProfile.email = '';
    this.formErrorProfile.phone = '';
    this.formErrorProfile.date = '';
  }

  clearformErrorChangePass() {
    this.formErrorChangePass.oldPass = '';
    this.formErrorChangePass.newPass1 = '';
    this.formErrorChangePass.newPass2 = '';
  }

  hasErrorsProfile(): boolean {
    for (let key in this.formErrorProfile)
      if (this.formErrorProfile[key]) return true;
    return false;
  }

  hasErrorsChangePass(): boolean {
    for (let key in this.formErrorChangePass)
      if (this.formErrorChangePass[key]) return true;
    return false;
  }

  formatDate(dateString: string): string {
    const dateObject = new Date(dateString);
    const year = dateObject.getFullYear();
    const month = dateObject.getMonth() + 1;
    const day = dateObject.getDate();
    const formattedDate =
      year +
      '-' +
      month.toString().padStart(2, '0') +
      '-' +
      day.toString().padStart(2, '0');
    return formattedDate;
  }

  // ==========================Địa chỉ giao hàng===============================
  cities: any[] = [];
  districts: any[] = [];
  wards: any[] = [];
  selectedCity: string = '';
  selectedDistrict: string = '';
  selectedWard: string = '';
  addressForm: FormGroup;
  AddOrUpdate = true;
  formErrorAddress: any = {
    name: '',
    phone: '',
    detailAddress: '',
    city: '',
    district: '',
    ward: '',
  };
  listAddress: any;
  @ViewChild('closeButton') closeButton!: ElementRef;

  async onchangeAddress() {
    this.addressForm.value.idUser = this.IdUser;
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
    addressDto.idUser = this.IdUser;
    addressDto.idAddress = this.addressForm.value.idAddress;
    addressDto.name = this.addressForm.value.name;
    addressDto.phone = this.addressForm.value.phone;
    addressDto.detailAddress = this.addressForm.value.detailAddress;
    addressDto.city = this.addressForm.value.city;
    addressDto.district = this.addressForm.value.district;
    addressDto.ward = this.addressForm.value.ward;
    addressDto.note = this.addressForm.value.note;

    if (this.AddOrUpdate) {
      const addAddressSub = this.httpServerService.AddAddressToUser(addressDto).subscribe({
        next: (response) => {
          this.toaster.success('Đã thêm mới thành công!', 'Thành công', {
            timeOut: 2000,
          });
          this.resetAddressForm();
          this.closeButton.nativeElement.click();
          this.chooseFunction('addAddress');
        },
        error: (error) => {
          this.toaster.error('Thêm mới không thành công!', 'Lỗi', {
            timeOut: 2000,
          });
        },
      });
      this.subscriptions.add(addAddressSub)
    } else {
      const updateAddressSub = this.httpServerService.UpdateAddress(addressDto).subscribe({
        next: (response) => {
          this.toaster.success('Đã cập nhật thành công!', 'Thành công', {
            timeOut: 2000,
          });
          this.resetAddressForm();
          this.closeButton.nativeElement.click();
          this.chooseFunction('addAddress');
        },
        error: (error) => {
          this.toaster.error('Cập nhật không thành công!', 'Lỗi', {
            timeOut: 2000,
          });
        },
      });
      this.subscriptions.add(updateAddressSub)
    }
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
    const getProvinceSub = this.http
      .get(
        'https://raw.githubusercontent.com/kenzouno1/DiaGioiHanhChinhVN/master/data.json'
      )
      .subscribe((data: any) => {
        this.cities = data.sort((a: { Name: string }, b: { Name: string }) =>
          a.Name.localeCompare(b.Name)
        );
      });
      this.subscriptions.add(getProvinceSub)
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

  /// cấp nhật địa chỉ
  updateAddress(idAddress: string) {
    this.clearformErrorAddress();
    this.AddOrUpdate = false;
    const addressToUpdate = this.listAddress.find(
      (address: any) => address._id === idAddress
    );

    this.addressForm.patchValue({
      city: addressToUpdate.city,
      district: addressToUpdate.district,
      ward: addressToUpdate.ward,
      name: addressToUpdate.name,
      phone: addressToUpdate.phone,
      detailAddress: addressToUpdate.detailAddress,
      note: addressToUpdate.note,
      idAddress: idAddress,
    });
    this.onCityChange();
    this.onDistrictChange();
  }

  confirmDelete(addressId: string) {
    this.addressForm.value.idAddress = addressId;
  }

  deleteAddress() {
    const addressDto = new AddressDto();
    addressDto.idUser = this.IdUser;
    addressDto.idAddress = this.addressForm.value.idAddress;
    const deleteAddressSub = this.httpServerService.DeleteAddress(addressDto).subscribe({
      next: (response) => {
        this.toaster.success('Xóa thành công!', 'Thành công', {
          timeOut: 2000,
        });
        this.chooseFunction('addAddress');
      },
      error: (error) => {
        this.toaster.error('Xóa không thành công!', 'Lỗi', { timeOut: 2000 });
      },
    });
    this.subscriptions.add(deleteAddressSub)
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

  // ==========================Lịch sử đơn hàng===============================

  ListOrderes: any;
  ListVNPosts: any;
  detailOrder: any;
  ListName: any;
  page: number = 1;
  pageCount: any;

  getListOrderAndListVNPost() {
    this.pageCount = [];
    const orderSub = this.httpServerService
      .getListOrderByUser(this.IdUser, this.page)
      .subscribe({
        next: (response: any) => {
          this.ListOrderes = response.data;
          this.getListVNPost();

          for (let i = 1; i <= response.pageCount; i++) {
            this.pageCount.push(i);
          }

          setTimeout(() => {
            this.ListName = [];
            for (let i = 0; i < this.ListOrderes.length; i++) {
              if (this.ListOrderes[i].idOrderVNPost) {
                const receiverName = this.ListVNPosts.find(
                  (item: any) =>
                    item.itemCode === this.ListOrderes[i].idOrderVNPost
                ).receiverName;
                this.ListName.push(receiverName);
              } else {
                this.ListOrderes[i].idOrderVNPost = 'Đang tạo đơn';
                this.ListName.push('');
              }
            }
          }, 1000); //
        },
      });
      this.subscriptions.add(orderSub)
  }

  getListVNPost() {
    for (let i = 0; i < this.ListOrderes.length; i++) {
      const order = this.ListOrderes[i];
      this.ListVNPosts = [];
      const getOrderSub = this.httpServerService.getOrder(order.idOrderVNPost).subscribe({
        next: (response: any) => {
          response[0].contentNote = response[0].contentNote.split('^')[0];
          this.ListVNPosts.push(response[0]);
          order.status = response[0].status;
        },
      });
      this.subscriptions.add(getOrderSub)
    }
  }
  Order: any;
  HistoryStatusOrder: any;

  getOrder(index: number, idOrderVNPost: string) {
    this.Order = this.ListVNPosts.find(
      (item: any) => item.itemCode === idOrderVNPost
    );
    const getStatusSub = this.httpServerService
      .GetStatusHistoryOrder(this.Order.itemCode)
      .subscribe({
        next: (response: any) => {
          this.HistoryStatusOrder = response;
          this.getPoints();
        },
      });
      this.subscriptions.add(getStatusSub)
    this.toTal = this.ListOrderes[index].totalPrice;
    this.getProductOrder(index);
    this.waypoints = [];
  }

  toTal: any;
  ListProductOrder: any;

  getProductOrder(index: number) {
    this.ListProductOrder = this.ListOrderes[index]._idOrderDetail;
  }

  goToProductDetail(productId: string) {
    this.router.navigate(['/product'], { queryParams: { id: productId } });
    window.scrollTo(0, 0);
  }

  idOrderDelete: string = '';

  confirmDeleteOrder(idOrder: string) {
    this.idOrderDelete = idOrder;
  }

  deleteOrder() {
    const deleteOrderSub = this.httpServerService.deleteOrder(this.idOrderDelete).subscribe({
      next: (response: any) => {
        if (response) this.chooseFunction('orderHistory');
      },
    });
    this.subscriptions.add(deleteOrderSub)
  }
  //bản đồ
  //lấy và tách chuỗi địa điểm
  ListPoint: any = [];
  getPoints() {
    this.ListPoint = [];
    for (let item of this.HistoryStatusOrder.data[0].statusHistory) {
      var mangChuoi = item.statusName.split('-'); // Tách chuỗi thành mảng các phần tử dựa trên dấu "-"
      var chuoiCuoiCung = mangChuoi[mangChuoi.length - 1].trim();
      this.ListPoint.push(chuoiCuoiCung);
    }

    this.removeSpecificStrings();
  }
  //bỏ ký hiệu và xóa trùng lặp
  removeSpecificStrings() {
    const stringsToRemove = ['BCP', 'LT', 'KTC1', 'KT'];
    let cleanedList: string[] = [];

    for (let item of this.ListPoint) {
      let cleanedItem = item;
      for (let str of stringsToRemove) {
        cleanedItem = cleanedItem.replace(str, '').trim();
      }
      cleanedList.push(cleanedItem);
    }
    this.ListPoint = cleanedList;
    //lấy list tọa độ từ listPoint
    this.removeDuplicates();
  }
  // lọc
  removeDuplicates() {
    let uniqueList: string[] = [];
    let seen: { [key: string]: boolean } = {};

    for (let item of this.ListPoint) {
      if (
        !seen[item] &&
        item !== 'Khách hàng lớn' &&
        item !== 'Tạo đơn' &&
        !item.includes('Huế')
      ) {
        seen[item] = true;
        uniqueList.push(item);
      }
    }
    this.ListPoint = uniqueList;
    this.getPointFromSerper2();
  }

  private map!: L.Map;
  private control: any;
  private waypoints: any[] = [];
  private initMap(): void {
    if (!this.map)
      this.map = L.map('map').setView(
        [16.46728999757904, 107.60014957386453],
        11
      );

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this.map);

    this.control = L.Routing.control({
      waypoints: this.waypoints,
    }).addTo(this.map);

    setTimeout(() => {
      const routingAltElement = document.querySelector(
        '.leaflet-right'
      ) as HTMLElement;
      routingAltElement.style.display = 'none';
    }, 1000); //
  }
  //hàm lấy tọa độ
  getPointFromSerper2() {
    this.waypoints = [];
    const requests = [];

    for (let item of this.ListPoint) {
      requests.push(this.httpServerService.getPointFromSerper(item));
    }

    const forkJoinSub = forkJoin(requests).subscribe({
      next: (responses: any[]) => {
        responses.forEach((response: any) => {
          let latLng = L.latLng(
            response.places[0].latitude,
            response.places[0].longitude
          );
          this.waypoints.push(latLng);
        });
      },
      error: (error: any) => {
        console.error('Không thể lấy dữ liệu', error);
      },
    });
    this.subscriptions.add(forkJoinSub)
    setTimeout(() => {
      this.updateWaypoints();
    }, 2000); //
  }

  updateWaypoints() {
    // Thêm tọa độ mới vào waypoints
    let latLng1 = L.latLng(16.467416025684166, 107.60023492611737); //shop
    let latLng2 = L.latLng(16.465090939884078, 107.59051483258999); //bưu điện huế
    this.waypoints.push(latLng1, latLng2);

    if (this.map) {
      this.control.getPlan().setWaypoints([]);
      this.control.getPlan().setWaypoints(this.waypoints);
    } else {
      this.initMap();
    }
  }

  priceProductFormat(price: number) {
    return new Intl.NumberFormat('vn-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  }

  setPageCurrent(page: number) {
    this.page = page;
    this.getListOrderAndListVNPost();
  }
}
