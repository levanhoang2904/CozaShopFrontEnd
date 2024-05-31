import { Routes } from '@angular/router';
import { ForgotPasswordComponent } from './Components/forgot-password/forgot-password.component';
import { HomePageComponent } from './Components/home-page/home-page.component';
import { LoginComponent } from './Components/login/login.component';
import { RegisterComponent } from './Components/register/register.component';
import { ResetPasswordComponent } from './Components/reset-password/reset-password.component';
import { VerifyOtpComponent } from './Components/verify-otp/verify-otp.component';
import { DefaultLayoutComponent } from './Pages/DefaultLayout/default-layout/default-layout.component';
import { CartComponent } from './Components/cart/cart.component';
import { ProductDetailComponent } from './Components/product-detail/product-detail.component';
import { ProfilePageComponent } from './Components/profile-page/profile-page.component';
import { PageAdminComponent } from './Pages/admin/page-admin/page-admin.component';
import { MainComponent } from './Components/admin/main/main.component';
import { ProductComponent } from './Components/admin/product/product.component';
import { EditProductComponent } from './Components/admin/edit-product/edit-product.component';
import { NoAccessComponent } from './Components/admin/no-access/no-access.component';
import { OrderComponent } from './Components/admin/order/order.component';
import { EditOrderComponent } from './Components/admin/edit-order/edit-order.component';
import { UserComponent } from './Components/admin/user/user.component';
import { CategoryComponent } from './Components/admin/category/category.component';
import { FormCategoryComponent } from './Components/admin/form-category/form-category.component';
import { PostComponent } from './Components/admin/post/post.component';
import { FormPostComponent } from './Components/admin/form-post/form-post.component';
import { BlogComponent } from './Components/blog/blog.component';
import { BlogDetailComponent } from './Components/blog-detail/blog-detail.component';
import { StatisticsProductComponent } from './Components/admin/statistics-product/statistics-product.component';
import { StatisticsRenevueComponent } from './Components/admin/statistics-renevue/statistics-renevue.component';
import { authGuard, isAdmin } from './guard/auth.guard';
import { SecurityComponent } from './Components/policy/security/security.component';
import { ExchangeComponent } from './Components/policy/exchange/exchange.component';
import { ShoppingGuideComponent } from './Components/policy/shopping-guide/shopping-guide.component';
import { CreateOrderComponent } from './Components/admin/create-order/create-order.component';
export const routes: Routes = [
  {
    path: '',
    component: DefaultLayoutComponent,
    children: [
      {
        path: '',
        component: HomePageComponent,
      },
      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: 'register',
        component: RegisterComponent,
      },
      {
        path: 'auth',
        children: [
          { path: 'forgot-password', component: ForgotPasswordComponent },
          { path: 'verify-otp', component: VerifyOtpComponent },
          { path: 'reset-password/:token', component: ResetPasswordComponent },
        ],
      },
      {
        path: 'product',
        component: ProductDetailComponent,
      },
      {
        path: 'cart',
        component: CartComponent,
      },
      { path: 'blog', component: BlogComponent },
      { path: 'blog-detail', component: BlogDetailComponent },
      {
        path: 'profile',
        canActivate: [authGuard],
        component: ProfilePageComponent,
      },
      { path: 'chinhsachbaomat', component: SecurityComponent },
      { path: 'chinhsachdoitra', component: ExchangeComponent },
      { path: 'huongdanmuahang', component: ShoppingGuideComponent },

      

      
    ],
  },
  {
    path: 'noAccess',
    component: NoAccessComponent,
  },


  {
    path: 'admin',
    component: PageAdminComponent,
    canActivate: [authGuard, isAdmin],
    
    children: [
      {
        path: '',
        component: MainComponent,
      },
      {
        path: 'product',
        component: ProductComponent,
      },
      {
        path: 'product/edit',
        component: EditProductComponent,
      },
      {
        path: 'product/noAccess',
        component: NoAccessComponent,
      },
      {
        path: 'order',
        component: OrderComponent,
      },
      {
        path: 'order/edit',
        component: EditOrderComponent,
      },
      {
        path: 'user',
        component: UserComponent,
      },
      {
        path: 'category',
        component: CategoryComponent,
      },
      {
        path: 'form-category',
        component: FormCategoryComponent,
      },
      {
        path: 'post',
        component: PostComponent,
      },
      {
        path: 'form-post',
        component: FormPostComponent,
      },
      {
        path: 'product',
        component: ProductComponent,
      },
      {
        path: 'statistics',
        component: StatisticsProductComponent,
      },
      {
        path: 'statistics-renevue',
        component: StatisticsRenevueComponent,
      },
      {
        path: 'order/create',
        component: CreateOrderComponent,
      },
      
    ],
  },
];
