import { Component, OnDestroy, OnInit } from '@angular/core';
import { SharedDataService } from '../../shared-data-service/shared-data-service.component';
import { CommonModule } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { HttpServerService } from '../../../Services/http-server/http-server.service';
import Chart from 'chart.js/auto';
import { StatisticsRenevue } from '../../../../dto/staticsRenevue';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-statistics-renevue',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statistics-renevue.component.html',
  styleUrl: './statistics-renevue.component.css',
})
export class StatisticsRenevueComponent implements OnInit, OnDestroy {
  public isActive: boolean = false;
  public renevue: [] = [];
  public chart!: Chart<'line', number[], string | number | undefined>;
  public totalRenevue: number = 0;
  public year?: number;
  public years: number[] = [];
  public selected: boolean = true;
  constructor(
    private shareDataService: SharedDataService,
    private title: Title,
    private httServer: HttpServerService
  ) {}
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }
  private subscriptions: Subscription = new Subscription();

  ngOnInit(): void {
    this.title.setTitle('Thống kê doanh thu');
    const currentDay = new Date();
    this.year = currentDay.getFullYear();
    for (let i = this.year; i >= this.year - 5; i--) this.years.push(i);
    this.getStatisticsRenevue('year', this.year);
    const isActiveSub = this.shareDataService.isActive$.subscribe((isActive) => {
      this.isActive = isActive;
    });
    this.subscriptions.add(isActiveSub)
  }

  getStatisticsRenevue(option: string, year: number = 2024) {
    this.totalRenevue = 0;
    const statisticsSub = this.httServer.getStatisticsRenevue(option, year).subscribe((data) => {
      this.renevue = data;
      this.renevue.map((order: StatisticsRenevue) => {
        this.totalRenevue += order.renevue!;
      });
      this.charLine(this.renevue, 'Thống kê doanh thu');
    });
    this.subscriptions.add(statisticsSub)
  }

  charLine(data: [], title: string) {
    this.chart = new Chart('canvas', {
      type: 'line',
      data: {
        labels: data.map((row: StatisticsRenevue) => {
          return row.month ? row.month : row.day;
        }),
        datasets: [
          {
            label: title,
            data: data.map((col: StatisticsRenevue) => col.renevue),
            fill: true,
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgb(75, 192, 192)',
            tension: 0.1,
          },
        ],
      },
    });
  }

  setOption(option: string) {
    this.chart.destroy();
    if (option === 'week') this.selected = false;
    else this.selected = true;
    this.getStatisticsRenevue(option);
  }

  setYear(year: number) {
    this.year = year;
    this.chart.destroy();
    this.getStatisticsRenevue('year', year);
  }

  formatPrice(price: number) {
    return new Intl.NumberFormat('vn-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  }
}
