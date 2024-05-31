import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProductService } from '../../Services/product/product.service';
import { CommonModule } from '@angular/common';
import { CartService } from '../../Services/cart/cart.service';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product.component.html',
  styleUrl: './product.component.css',
})
export class ProductComponent {
  constructor(private router: Router) {}

  @Input() product!: ProductService;
  goToProductDetail(productId: string) {
    this.router.navigate(['/product'], { queryParams: { id: productId } });
    window.scrollTo(0, 0);
  }
  productSalePrice(price: number, sale: number) {
    return new Intl.NumberFormat('vn-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price - price * (sale / 100));
  }
}
