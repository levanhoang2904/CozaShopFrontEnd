import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { SharedDataService } from '../../shared-data-service/shared-data-service.component';
import Chart from 'chart.js/auto';
import { ProductService } from '../../../Services/product/product.service';
import { HttpServerService } from '../../../Services/http-server/http-server.service';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-statistics-product',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statistics-product.component.html',
  styleUrl: './statistics-product.component.css',
})
export class StatisticsProductComponent implements OnInit, OnDestroy {
  constructor(
    private shareDataService: SharedDataService,
    private httpServer: HttpServerService,
    private title: Title
  ) {}
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }
  chart!: Chart<'bar', number[], string>;
  products: ProductService[] = [];
  note: [] = [];
  isActive: boolean = false;
  bestSell: boolean = true;
  total: Number = 0;
  selectOption?: string;
  isHiddenChart: boolean = false;
  private subscriptions: Subscription = new Subscription();
  ngOnInit(): void {
    this.title.setTitle('Thống kê sản phẩm');
    const isActiveSub = this.shareDataService.isActive$.subscribe((isActive) => {
      this.isActive = isActive;
    });
    this.subscriptions.add(isActiveSub)
    this.getProductTop();
  }

  setHiddenChart(value: boolean) {
    this.isHiddenChart = value;
    if (!value) {
      if (this.bestSell) this.getProductTop();
      else this.setBestSelling(false);
    }
  }

  getProductTop() {
    const statisticsSub = this.httpServer.getStatisticsProductTop().subscribe((data) => {
      this.products = data;
      this.chartBar(this.products, 'Top 10 sản phẩm bán chạy');
    });
    this.subscriptions.add(statisticsSub)
  }

  chartBar(products: ProductService[], title: string) {

    this.chart = new Chart('canvas', {
      type: 'bar',
      data: {
        labels: products.map((row, index) => `Sản phẩm ${index + 1}`),
        datasets: [
          {
            data: products.map((col) => col.quantitySold),

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
            borderWidth: 1,
          },
         
        ],
      },
      options: {
        plugins: {
          title: {
            display: true,
            text: title
          },
          tooltip: {
            callbacks: {
              title: function(context) {
                return products[context[0].dataIndex].name
              },
            },
          },
          legend: {
            labels: {
              generateLabels: function(chart : any) {
                
                if (chart.data && chart.data.datasets.length > 0) {
                  return products.map(function(product, i : number) {
                      return {
                      text: product.name, 
                      fillStyle: chart.data.datasets[0].backgroundColor[i]
                    }
                  });
                }
                return [];
              }
            }
          }
        },
        
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
              text: 'Sản phẩm',
            },
          },
         
        },
      
      },
    });
  }

  setBestSelling(value: boolean) {
    this.chart.destroy();
    this.products = [];
    if (!value) {
      this.httpServer.getStatisticsProductBot().subscribe((data) => {
        this.products = data;
        this.chartBar(this.products, 'Top 10 sản phẩm không bán chạy');
      });
      this.bestSell = false;
      return;
    }
    this.getProductTop();
    this.bestSell = true;
  }

  priceProductFormat(price: number, quantitySold: number) {
    return new Intl.NumberFormat('vn-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price * quantitySold);
  }
}
