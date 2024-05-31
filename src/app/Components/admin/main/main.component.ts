import { Component, OnDestroy, OnInit } from '@angular/core';
import { SharedDataService } from '../../shared-data-service/shared-data-service.component';
import { HttpServerService } from '../../../Services/http-server/http-server.service';
import { CommonModule } from '@angular/common';
import Chart from 'chart.js/auto';

import { Stat, CategoryStat, OrderStat } from './interface';
import { Title } from '@angular/platform-browser';
import { ChatbotService } from '../../../Services/chatbot/chatbot.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
})
export class MainComponent implements OnInit, OnDestroy {
  constructor(
    private title: Title,
    private shareDataService: SharedDataService,
    private httpServer: HttpServerService
  ) {}

  isActive: boolean = false;
  stats: {
    order: Stat;
    revenue: Stat;
    user: Stat;
  } = {
    order: { current: 0, previous: 0, growth: 0 },
    revenue: { current: 0, previous: 0, growth: 0 },
    user: { current: 0, previous: 0, growth: 0 },
  };
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }
  private subscriptions: Subscription = new Subscription();

  selectedOrderOption: string = 'Hôm nay';
  selectedUserOption: string = 'Năm hiện tại';
  selectedRevenueOption: string = 'Tháng hiện tại';
  categoryStats: CategoryStat[] = [];
  orderStatsWeeky: OrderStat[] = [];
  chartCategory!: Chart<'doughnut', number[], string>;
  chartOrderWeeky!: Chart<'line', number[], string>;

  selectOption(type: string, option: string): void {
    if (type === 'order') {
      this.selectedOrderOption = option;
    } else if (type === 'user') {
      this.selectedUserOption = option;
    } else if (type === 'revenue') {
      this.selectedRevenueOption = option;
    }

    this.updateQueryAndFetchStats();
  }

  updateQueryAndFetchStats(): void {
    const orderQuery = this.mapOptionToQuery(this.selectedOrderOption);
    const userQuery = this.mapOptionToQuery(this.selectedUserOption);
    const revenueQuery = this.mapOptionToQuery(this.selectedRevenueOption);

    const query = `?order=${orderQuery}&user=${userQuery}&revenue=${revenueQuery}`;
    this.saveQueryToSessionStorage(query);
    this.getStatsAdmin(query);
  }

  mapOptionToQuery(option: string): string {
    switch (option) {
      case 'Hôm nay':
        return 'day';
      case 'Tháng hiện tại':
        return 'month';
      case 'Năm hiện tại':
        return 'year';
      default:
        return '';
    }
  }

  saveQueryToSessionStorage(query: string): void {
    sessionStorage.setItem('queryStats', query);
  }

  loadQueryFromSessionStorage(): void {
    const savedQuery = sessionStorage.getItem('queryStats');
    if (savedQuery) {
      const params = new URLSearchParams(savedQuery);
      this.selectedOrderOption =
        this.mapQueryToOption(params.get('order')) === ''
          ? 'Hôm nay'
          : this.mapQueryToOption(params.get('order'));
      this.selectedUserOption =
        this.mapQueryToOption(params.get('user')) === ''
          ? 'Năm hiện tại'
          : this.mapQueryToOption(params.get('user'));
      this.selectedRevenueOption = this.mapQueryToOption(params.get('revenue'))
        ? 'Tháng hiện tại'
        : this.mapQueryToOption(params.get('revenue'));
    }
  }

  mapQueryToOption(query: string | null): string {
    switch (query) {
      case 'day':
        return 'Hôm nay';
      case 'month':
        return 'Tháng hiện tại';
      case 'year':
        return 'Năm hiện tại';
      default:
        return '';
    }
  }

  getChartCategory() {
    this.chartCategory = new Chart('canvas', {
      type: 'doughnut',
      data: {
        labels: this.categoryStats.map((cate: any) => cate.name),
        datasets: [
          {
            data: this.categoryStats.map((cate: any) => cate.percentage),
            backgroundColor: [
              'rgba(255, 99, 132, 0.2)',
              'rgba(54, 162, 235, 0.2)',
              'rgba(255, 206, 86, 0.2)',
              'rgba(75, 192, 192, 0.2)',
              'rgba(150, 151, 225, 0.2)',
              'rgba(205, 150, 63, 0.2)',
              'rgba(90, 203, 150, 0.2)',
              'rgba(10, 201, 100, 0.2)',
              'rgba(10, 201, 100, 0.3)',
              'rgba(108, 20, 105, 0.3)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
              'rgba(75, 192, 192, 1)',
              'rgba(153, 102, 255, 1)',
              'rgba(255, 159, 64, 1)',
              'rgba(99, 255, 132, 1)',
            ],
            borderWidth: 2,
          },
        ],
      },
    });
  }

  getChartOrderWeeky() {
    this.chartOrderWeeky = new Chart('canvasOrder', {
      type: 'line',
      data: {
        labels: this.orderStatsWeeky.map((order: any) => order.date),
        datasets: [
          {
            label: 'Hoá đơn được lập',
            data: this.orderStatsWeeky.map((order: any) => order.totalOrders),
            fill: true,
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            tension: 0.1,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Số lượng',
            },
          },
          x: {
            title: {
              display: true,
              text: 'Ngày',
            },
          },
        },
      },
    });
  }

  ngOnInit(): void {
    this.title.setTitle('Trang chủ | Admin');
    const isActiveSub =  this.shareDataService.isActive$.subscribe((isActive) => {
      this.isActive = isActive;
    });
    this.loadQueryFromSessionStorage();
    this.updateQueryAndFetchStats();
    
    this.getStatsCategory();
    this.getStatsOrderWeeky();
    this.subscriptions.add(isActiveSub)
  }

  covertPrice(price: number) {
    return new Intl.NumberFormat('vn-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  }

  getStatsAdmin(query: string = '?order=day&revenue=month&user=year') {
    const getAdminHomeStatsSub = this.httpServer.getAdminHomeStats(query).subscribe((data) => {
      this.stats = data.stats;
    })
    this.subscriptions.add(getAdminHomeStatsSub)
  }

  getStatsCategory() {
    const getAdminStatCategorySub = this.httpServer.getAdminStatCategory().subscribe((data) => {
      this.categoryStats = data.stats;
      this.getChartCategory();
    });
    this.subscriptions.add(getAdminStatCategorySub)
  }

  getStatsOrderWeeky() {
    const getAdminStatOrderWeekySub = this.httpServer.getAdminStatOrderWeeky().subscribe((data) => {
      this.orderStatsWeeky = data.dailyOrders;
      this.getChartOrderWeeky();
    });
    this.subscriptions.add(getAdminStatOrderWeekySub)
  }
}
