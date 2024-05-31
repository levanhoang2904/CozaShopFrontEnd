import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule, NgModel } from '@angular/forms';
import {
  NgxDaterangepickerBootstrapDirective,
  NgxDaterangepickerBootstrapComponent,
} from 'ngx-daterangepicker-bootstrap';
import dayjs, { Dayjs } from 'dayjs';
import { HttpServerService } from '../../../Services/http-server/http-server.service';
import { Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { SearchOrderDto } from '../../../../dto/classDto';
import { SharedDataService } from '../../shared-data-service/shared-data-service.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgxDaterangepickerBootstrapDirective,
    NgxDaterangepickerBootstrapComponent,
    RouterLink,
  ],
  providers: [SearchOrderDto],
  templateUrl: './order.component.html',
  styleUrl: './order.component.css',
})
export class OrderComponent implements OnInit, OnDestroy {
  toaster = inject(ToastrService);
  isActive: boolean = false;
  dropsDown = 'down';
  dropsUp = 'up';
  opensRight = 'right';
  opensCenter = 'center';
  opensLeft = 'left';
  selectedRangeCalendarTimeRight: any;
  selectedRangeCalendarCenter: any;
  selectedRangeCalendarAutoLeft: any;
  selectedSingleCalendarTimeRight: any;
  selectedSingleCalendarCenter: any;
  selectedSingleCalendarAutoLeft: any;
  selectedSimpleCalendarTimeUpRight: any;
  selectedSimpleCalendarUpCenter: any;
  selectedSimpleCalendarAutoUpLeft: any;
  selectedRangeCalendarTimeInline: any;
  maxDate?: Dayjs;
  minDate?: Dayjs;
  invalidDates: Dayjs[] = [];
  ranges: any = {
    Today: [dayjs().startOf('day'), dayjs().endOf('day')],
    Yesterday: [
      dayjs().subtract(1, 'day').startOf('day'),
      dayjs().subtract(1, 'day').endOf('day'),
    ],
    'Last 7 days': [
      dayjs().subtract(6, 'days').startOf('day'),
      dayjs().endOf('day'),
    ],
    'Last 30 days': [
      dayjs().subtract(29, 'days').startOf('day'),
      dayjs().endOf('day'),
    ],
    'This month': [dayjs().startOf('month'), dayjs().endOf('month')],
    'Last month': [
      dayjs().subtract(1, 'month').startOf('month'),
      dayjs().subtract(1, 'month').endOf('month'),
    ],
  };
  localeTime = {
    firstDay: 1,
    startDate: dayjs().startOf('day'),
    endDate: dayjs().endOf('day'),
    format: 'DD.MM.YYYY HH:mm:ss',
    applyLabel: 'Apply',
    cancelLabel: 'Cancel',
    fromLabel: 'From',
    toLabel: 'To',
  };
  locale = {
    firstDay: 1,
    startDate: dayjs().startOf('day'),
    endDate: dayjs().endOf('day'),
    format: 'DD.MM.YYYY',
    applyLabel: 'Apply',
    cancelLabel: 'Cancel',
    fromLabel: 'From',
    toLabel: 'To',
  };
  tooltips = [
    { date: dayjs(), text: 'Today is just unselectable' },
    { date: dayjs().add(2, 'days'), text: 'Yeeeees!!!' },
  ];

  constructor(
    private httpServerService: HttpServerService,
    private title: Title,
    public searchOrderDto: SearchOrderDto,
    private shareDataService: SharedDataService,

  ) {
    this.title.setTitle('Quản lý đơn hàng');
    this.selectedRangeCalendarTimeRight = {
      startDate: dayjs().startOf('day'),
      endDate: dayjs().endOf('day'),
    };
  }


  data: any;
  ListVNPosts: any;
  pages: number[] = [];
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }
  private subscriptions: Subscription = new Subscription();
  ngOnInit(): void {
    const storedSearchOrderDto = sessionStorage.getItem('searchOrderDto');
    if (storedSearchOrderDto) {
      const searchOrderDtosession = JSON.parse(storedSearchOrderDto);
      this.searchOrderDto = searchOrderDtosession;
    }
    const isActiveSub = this.shareDataService.isActive$.subscribe((isActive) => {
      this.isActive = isActive;
    });
    this.getOrderFromDB();
    this.subscriptions.add(isActiveSub)
  }

  getOrderFromDB(): void {
    this.pages = [];
    const searchOrdersSub = this.httpServerService.searchOrders(this.searchOrderDto).subscribe({
      next: (response) => {
        this.data = response.data;

        for (let i = 1; i <= response.pageCount; i++) {
          this.pages.push(i);
        }
        this.getOrderFromVNPost();
      },
      error: (error) => {
        console.log(error);
      },
    });
    this.subscriptions.add(searchOrdersSub)
  }

  async getOrderFromVNPost() {


    for (let i = 0; i < this.data.length; i++) {
      this.ListVNPosts = [];
      const getOrderSub = await this.httpServerService
        .getOrder(this.data[i].idOrderVNPost)
        .subscribe({
          next: (response: any) => {
            if (response[0])
              response[0].contentNote = response[0].contentNote.split('^')[0];
            this.ListVNPosts.push(response[0]);
            if (this.data[i].status == 2 || this.data[i].status == 3){
              if (response[0].status >= 14) {
                this.data[i].status = 4;
                const updateStatusOrderSub = this.httpServerService.updateStatusOrder(this.data[i]._id, 4);
                this.subscriptions.add(updateStatusOrderSub)
              }
              if (response[0].status < 14 && response[0].status > 6) {
                this.data[i].status = 3;
                const updateStatusOrderSub = this.httpServerService.updateStatusOrder(this.data[i]._id, 3);
                this.subscriptions.add(updateStatusOrderSub)
              }
            }
          },
          error: (error: any) => {
            console.error('Error fetching order:', error);
          },
        });
        this.subscriptions.add(getOrderSub)
    }
  }

  onStatusChange(event: any) {
    if (event.target.value) {
      this.searchOrderDto.status = event.target.value;
      this.setSession();
      this.getOrderFromDB();
    }
  }
  sendSearchQuery() {
    this.setSession();
    this.getOrderFromDB();
  }

  setSession() {
    sessionStorage.setItem(
      'searchOrderDto',
      JSON.stringify(this.searchOrderDto)
    );
  }
  isInvalidDate = (m: Dayjs) => {
    return this.invalidDates.some((d) => d.isSame(m, 'day'));
  };

  isCustomDate = (date: Dayjs) => {
    return date.month() === 0 || date.month() === 6 ? 'mycustomdate' : false;
  };

  isTooltipDate = (m: Dayjs) => {
    const tooltip = this.tooltips.find((tt) => tt.date.isSame(m, 'day'));
    return tooltip ? tooltip.text : false;
  };

  datesUpdatedRange($event: any) {
    if ($event.startDate && $event.endDate) {
      this.searchOrderDto.startDay = $event.startDate;
      this.searchOrderDto.endDay = $event.endDate;
      this.setSession();
      this.getOrderFromDB();
    }
  }
  idOrderDelete: string = '';

  confirmDeleteOrder(idOrder: string) {
    this.idOrderDelete = idOrder;
  }
  deleteOrder() {
    const deleteOrderSub = this.httpServerService.deleteOrder(this.idOrderDelete).subscribe({
      next: (response: any) => {
        if (response) {
          this.toaster.success('Xóa thành công!', 'Success', {
            timeOut: 2000,
          });
          this.ngOnInit();
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

  setPageCurrent(page: number) {
    if (page != this.searchOrderDto.page) {
      this.searchOrderDto.page = page;
      this.setSession();
      this.getOrderFromDB();
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
        return 'Lỗi tạo đơn';
      default:
        return '';
    }
  }
}
