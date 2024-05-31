import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
  AddressDto,
  DataProductOrderDto,
  Product,
  SearchOrderDto,
  SearchProductDto,
  SearchUserDto,
  UserDto,
} from '../../../dto/classDto';
import { ProductSize } from '../../../dto/productSize';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class HttpServerService {
  private REST_API_SERVER = 'https://backendqlshop-1.onrender.com';
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };
  constructor(private httpClient: HttpClient) {}

  public getUser(payload: Object): Observable<any> {
    const url = `${this.REST_API_SERVER}/auth`;
    return this.httpClient.post<any>(url, payload, this.httpOptions);
  }

  public createUser(payload: Object): Observable<any> {
    const url = `${this.REST_API_SERVER}/auth/create`;
    return this.httpClient.post<any>(url, payload, this.httpOptions);
  }

  public getDetailUser(accessToken: string): Observable<any> {
    const url = `${this.REST_API_SERVER}/user`;
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${accessToken}`
    );
    return this.httpClient.get<any>(url, { headers });
  }

  public getUserById(id: string): Observable<any> {
    const url = `${this.REST_API_SERVER}/user/${id}`;
    return this.httpClient.get<any>(url);
  }

  public forgotPassword(payload: Object): Observable<any> {
    const url = `${this.REST_API_SERVER}/auth/forgot-password`;
    return this.httpClient.post<any>(url, payload, this.httpOptions);
  }

  public verifyOTP(payload: Object): Observable<any> {
    const url = `${this.REST_API_SERVER}/auth/verify-otp`;
    return this.httpClient.post<any>(url, payload, this.httpOptions);
  }

  public resetPassword(payload: Object, token: string): Observable<any> {
    const url = `${this.REST_API_SERVER}/auth/reset-password/${token}`;
    return this.httpClient.post<any>(url, payload, this.httpOptions);
  }

  public loginGoogle() {
    const url = `${this.REST_API_SERVER}/user/google`;
    return this.httpClient.get<any>(url);
  }

  getProductDetail(id: string) {
    const url = `${this.REST_API_SERVER}/product/detail?id=${id}`;
    return this.httpClient.get<any>(url);
  }

  public getAllProduct(pageCurrent: number = 1, accessToken: string) {
    const url = `${this.REST_API_SERVER}/product?page=${pageCurrent}`;
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${accessToken}`
    );
    return this.httpClient.get<any>(url, { headers });
  }

  public getAllInforProduct(page: number = 1, accessToken: string) {
    const url = `${this.REST_API_SERVER}/product/all?page=${page}`;
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${accessToken}`
    );
    return this.httpClient.get<any>(url, { headers });
  }

  public filterAndSortProducts(searchDto: SearchProductDto) {
    const url = `${this.REST_API_SERVER}/product`;
    return this.httpClient.post<any>(url, searchDto, this.httpOptions);
  }

  public getCategories() {
    const url = `${this.REST_API_SERVER}/category`;
    return this.httpClient.get<any>(url);
  }

  public getProductBySearch(query: string) {
    const url = `${this.REST_API_SERVER}/product/search${query}`;
    return this.httpClient.get<any>(url);
  }

  public getAllUser() {
    const url = `${this.REST_API_SERVER}/user/all`;
    return this.httpClient.get<any>(url);
  }

  public updateProfile(userDto: UserDto): Observable<boolean> {
    const url = `${this.REST_API_SERVER}/user/update`;
    return this.httpClient.post<any>(url, userDto, this.httpOptions);
  }

  public getUserAndAddress(userId: string): Observable<boolean> {
    const url = `${this.REST_API_SERVER}/user/address/${userId}`;
    return this.httpClient.get<any>(url);
  }

  public AddAddressToUser(addressDto: AddressDto): Observable<boolean> {
    const url = `${this.REST_API_SERVER}/user/AddAddress`;
    return this.httpClient.post<any>(url, addressDto, this.httpOptions);
  }

  public UpdateAddress(addressDto: AddressDto): Observable<boolean> {
    const url = `${this.REST_API_SERVER}/user/UpdateAddress`;
    return this.httpClient.post<any>(url, addressDto, this.httpOptions);
  }

  public DeleteAddress(addressDto: AddressDto): Observable<boolean> {
    const url = `${this.REST_API_SERVER}/user/DeleteAddress`;
    return this.httpClient.post<any>(url, addressDto, this.httpOptions);
  }

  public getSimilarProduct(): Observable<any> {
    const url = `${this.REST_API_SERVER}/product/similar`;
    return this.httpClient.get<any>(url);
  }

  public postComment(payload: {}): Observable<boolean> {
    const url = `${this.REST_API_SERVER}/comment`;
    return this.httpClient.post<boolean>(url, payload, this.httpOptions);
  }

  public getComment(idProduct: string): Observable<any> {
    const url = `${this.REST_API_SERVER}/comment/${idProduct}`;
    return this.httpClient.get<any>(url);
  }

  public removeComment(
    idProduct: string,
    idUser: string,
    createdAt: string
  ): Observable<boolean> {
    const url = `${this.REST_API_SERVER}/comment/remove/${idProduct}/${idUser}/${createdAt}`;
    return this.httpClient.get<boolean>(url);
  }

  public makePayment(payload: any, accessToken: string): Observable<any> {
    const url = `${this.REST_API_SERVER}/payment`;
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${accessToken}`
    );
    const httpOptions = {
      ...this.httpOptions,
      headers,
    };

    return this.httpClient.post<any>(url, payload, httpOptions);
  }

  public checkComment(idProduct: string, idUser: string): Observable<boolean> {
    const url = `${this.REST_API_SERVER}/order/${idUser}/${idProduct}`;
    return this.httpClient.get<boolean>(url, this.httpOptions);
  }

  public upateComment(idUser: string, idProduct: string) {
    const url = `${this.REST_API_SERVER}/order/update/${idUser}/${idProduct}`;
    return this.httpClient.get<boolean>(url);
  }

  public getMyCart(accessToken: string): Observable<any> {
    const url = `${this.REST_API_SERVER}/cart/my-cart`;
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${accessToken}`
    );
    return this.httpClient.get<any>(url, { headers });
  }

  public addToMyCart(accessToken: string, payload: object): Observable<any> {
    const url = `${this.REST_API_SERVER}/cart`;
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${accessToken}`
    );
    return this.httpClient.post<any>(url, payload, { headers });
  }

  public editMyCart(idCartItem: string, edit: string): Observable<any> {
    const url = `${this.REST_API_SERVER}/cart/${idCartItem}/my-cart?edit=${edit}`;
    return this.httpClient.get<any>(url, this.httpOptions);
  }

  public deleteItemMyCart(idCartItem: string): Observable<any> {
    const url = `${this.REST_API_SERVER}/cart/${idCartItem}/my-cart`;
    return this.httpClient.delete<any>(url, this.httpOptions);
  }

  public deleteMyCart(accessToken: string): Observable<any> {
    const url = `${this.REST_API_SERVER}/cart/my-cart`;
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${accessToken}`
    );
    return this.httpClient.delete<any>(url, { headers });
  }

  public getOrder(idOrder: string): Observable<any> {
    const url = `https://connect-my.vnpost.vn/customer-partner/getOrder?type=2&code=${idOrder}`;
    const headers = new HttpHeaders().set('token',environment.apiTokenVNPost);
    return this.httpClient.get<any>(url, { headers });
  }

  public GetStatusHistoryOrder(idOrder: string): Observable<any> {
    const url = `https://connect-my.vnpost.vn/customer-partner/GetStatusHistoryOrder?type=2&code=${idOrder}`;
    const headers = new HttpHeaders().set('token',environment.apiTokenVNPost );
    return this.httpClient.get<any>(url, { headers });
  }

  public getListOrderByUser(idUser: string, page: number): Observable<any> {
    const url = `${this.REST_API_SERVER}/order/getListOrderByUser/${idUser}/${page}`;
    return this.httpClient.post<any>(url, this.httpOptions);
  }

  public updateStatusOrder(idOrder: string, status: number) {
    const url = `${this.REST_API_SERVER}/order/updateStatusOrder/${idOrder}/${status}`;
    this.httpClient.post<any>(url, this.httpOptions).subscribe();
  }

  public getPointFromSerper(Search: string): Observable<any> {
    let url = 'https://google.serper.dev/places'; // Thay đổi URL nếu cần

    let headers = new HttpHeaders({
      'X-API-KEY': environment.keySerper,
      'Content-Type': 'application/json',
    });

    let data = {
      q: Search,
    };
    return this.httpClient.post<any>(url, data, { headers });
  }

  public deleteOrder(idOrder: string): Observable<any> {
    const url = `${this.REST_API_SERVER}/order/deleteOrder/${idOrder}`;
    return this.httpClient.post<any>(url, this.httpOptions);
  }

  public createProduct(
    product: any,
    accessToken: string,
    file?: File
  ): Observable<any> {
    const formData = new FormData();
    formData.append('data', JSON.stringify(product));
    if (file) {
      formData.append('uploadPhoto', file);
    }
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${accessToken}`
    );
    const url = `${this.REST_API_SERVER}/product/create`;
    return this.httpClient.post<any>(url, formData, { headers });
  }

  public deleteProduct(id: string, accessToken: string): Observable<any> {
    const url = `${this.REST_API_SERVER}/product?id=${id}`;
    const headers = new HttpHeaders().set(
      'Authorization',
      `Bearer ${accessToken}`
    );
    this.httpOptions = {
      ...this.httpOptions,
      headers,
    };
    return this.httpClient.delete<any>(url, this.httpOptions);
  }

  updateProduct(id: string, product: Product, file?: File): Observable<any> {
    const formData = new FormData();
    formData.append('data', JSON.stringify(product));
    if (file) {
      formData.append('uploadPhoto', file);
    }
    const url = `${this.REST_API_SERVER}/product/update?id=${id}`;
    return this.httpClient.patch<any>(url, formData);
  }

  createColorProduct(id: string, color: string, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('color', color);
    if (file) {
      formData.append('photoColor', file);
    }
    const url = `${this.REST_API_SERVER}/product/create/detail?id=${id}`;
    return this.httpClient.post<any>(url, formData);
  }

  updateColorProduct(idProduct: string, id: string, color: string, file?: File): Observable<any> {
    const formData = new FormData();
    formData.append('color', color);
    if (file) {
      formData.append('photoColor', file);
    }
    const url = `${this.REST_API_SERVER}/product/update/detail?id=${id}&idProduct=${idProduct}`;
    return this.httpClient.patch<any>(url, formData);
  }

  deleteColorProduct(id: string): Observable<any> {
    const url = `${this.REST_API_SERVER}/product/delete/detail?id=${id}`;
    return this.httpClient.delete<any>(url);
  }

  createSizeProduct(id: string, productSize: ProductSize): Observable<any> {
    const url = `${this.REST_API_SERVER}/product/create/size?id=${id}`;
    return this.httpClient.post<any>(url, productSize);
  }

  updateSizeProduct(idDetail : string, id: string, productSize: ProductSize): Observable<any> {
    const url = `${this.REST_API_SERVER}/product/update/size?id=${id}&idDetail=${idDetail}`;
    return this.httpClient.patch<any>(url, productSize);
  }

  deleteSizeProduct(id: string, idProductDetail: string): Observable<any> {
    const url = `${this.REST_API_SERVER}/product/delete/size?id=${id}&idDetail=${idProductDetail}`;
    return this.httpClient.delete<any>(url);
  }

  public searchOrders(searchDto: SearchOrderDto) {
    const url = `${this.REST_API_SERVER}/order/searchOrders`;
    return this.httpClient.post<any>(url, searchDto, this.httpOptions);
  }

  public getOrderById(idOrder: string): Observable<any> {
    const url = `${this.REST_API_SERVER}/order/getOrderById/${idOrder}`;
    return this.httpClient.post<any>(url, this.httpOptions);
  }

  public addNameStaff(idOrder: string, nameStaff: string) {
    const url = `${this.REST_API_SERVER}/order/addNameStaff/${nameStaff}/${idOrder}`;
    this.httpClient.post<any>(url, this.httpOptions).subscribe();
  }

  public updateProductInOrder(data: DataProductOrderDto) {
    const url = `${this.REST_API_SERVER}/order/updateProductInOrder`;
    return this.httpClient.post<any>(url, data, this.httpOptions);
  }

  public addIdVNPost(idOrder: string, idVNPost: string) {
    const url = `${this.REST_API_SERVER}/order/addIdVNPost/${idOrder}/${idVNPost}`;
    this.httpClient.post<any>(url, this.httpOptions).subscribe();
  }

  public searchUser(data: SearchUserDto) {
    const url = `${this.REST_API_SERVER}/user/searchUser`;
    return this.httpClient.post<any>(url, data, this.httpOptions);
  }

  public deleteUserById(idUser: string) {
    const url = `${this.REST_API_SERVER}/user/deleteUser/${idUser}`;
    return this.httpClient.post<any>(url, this.httpOptions).subscribe();
  }

  public checkEmail(email: string) {
    const url = `${this.REST_API_SERVER}/user/checkEmail/${email}`;
    return this.httpClient.post<any>(url, this.httpOptions).subscribe();
  }

  public changePassFromAdmin(idUser: string, password: string) {
    const url = `${this.REST_API_SERVER}/user/changePassFromAdmin/${idUser}/${password}`;
    return this.httpClient.post<any>(url, this.httpOptions).subscribe();
  }

  //ADMIN
  public getAllCategoriesAdmin(query: string): Observable<any> {
    const url = `${this.REST_API_SERVER}/category/admin${query}`;
    return this.httpClient.get<any>(url, this.httpOptions);
  }

  public getCategoryAdmin(id: string): Observable<any> {
    const url = `${this.REST_API_SERVER}/category/admin/${id}`;
    return this.httpClient.get<any>(url, this.httpOptions);
  }

  public createCategoryAdmin(createCategoryDTO: any): Observable<any> {
    const url = `${this.REST_API_SERVER}/category/admin`;
    return this.httpClient.post<any>(url, createCategoryDTO, this.httpOptions);
  }

  public updateCategoryAdmin(
    id: string,
    updateCategoryDTO: any
  ): Observable<any> {
    const url = `${this.REST_API_SERVER}/category/admin/${id}`;
    return this.httpClient.patch<any>(url, updateCategoryDTO, this.httpOptions);
  }

  public deleteCategoryAdmin(id: string): Observable<any> {
    const url = `${this.REST_API_SERVER}/category/admin/${id}`;
    return this.httpClient.delete<any>(url, this.httpOptions);
  }

  public getAllPostAdmin(query: string = ''): Observable<any> {
    const url = `${this.REST_API_SERVER}/blog${query}`;
    return this.httpClient.get<any>(url);
  }

  public getDetailPost(id: string): Observable<any> {
    const url = `${this.REST_API_SERVER}/blog/${id}`;
    return this.httpClient.get<any>(url, this.httpOptions);
  }

  public createPost(postData: any, file?: File): Observable<any> {
    const formData = new FormData();
    formData.append('title', postData.title);
    formData.append('category', postData.category);
    formData.append('description', postData.description);

    if (file) {
      formData.append('thumbnail', file); // Append file with its name
    }
    const url = `${this.REST_API_SERVER}/blog`;

    return this.httpClient.post<any>(url, formData);
  }

  public updatePost(id: string, updatePost: any, file?: File): Observable<any> {
    const formData = new FormData();
    formData.append('title', updatePost.title);
    formData.append('category', updatePost.category);
    formData.append('description', updatePost.description);
    if (file) {
      formData.append('thumbnail', file);
    }

    const url = `${this.REST_API_SERVER}/blog/${id}`;
    return this.httpClient.patch<any>(url, formData);
  }

  public deletePost(id: string): Observable<any> {
    const url = `${this.REST_API_SERVER}/blog/${id}`;
    return this.httpClient.delete<any>(url, this.httpOptions);
  }

  //Statistics
  public getStatisticsProductTop(): Observable<any> {
    const url = `${this.REST_API_SERVER}/statistics/top/products`;
    return this.httpClient.get<any>(url);
  }

  public getStatisticsProductBot(): Observable<any> {
    const url = `${this.REST_API_SERVER}/statistics/bot/products`;
    return this.httpClient.get<any>(url);
  }

  public getTotalProducts(option: string): Observable<Number> {
    const url = `${this.REST_API_SERVER}/statistics/total/products?option=${option}`;
    return this.httpClient.get<any>(url);
  }

  public getStatisticsRenevue(option: string, year: number): Observable<[]> {
    const url = `${this.REST_API_SERVER}/statistics/renevue?option=${option}&year=${year}`;
    return this.httpClient.get<[]>(url);
  }
  
  public getAdminHomeStats(query: string): Observable<any> {
    const url = `${this.REST_API_SERVER}/statistics/admin${query}`;
    return this.httpClient.get<any>(url, this.httpOptions);
  }

  public getAdminStatCategory(): Observable<any> {
    const url = `${this.REST_API_SERVER}/statistics/admin/category`;
    return this.httpClient.get<any>(url, this.httpOptions);
  }

  public getAdminStatOrderWeeky(): Observable<any> {
    const url = `${this.REST_API_SERVER}/statistics/admin/weeky`;
    return this.httpClient.get<any>(url, this.httpOptions);
  }

  public getDetailSize(idSize:string): Observable<any> {
    const url = `${this.REST_API_SERVER}/product/getDetailSize/${idSize}`;
    return this.httpClient.get<any>(url, this.httpOptions);
  }

  public postOrder(data: any): Observable<any> {
    const url = `${this.REST_API_SERVER}/order/post`;
    return this.httpClient.post<any>(url, data, this.httpOptions);
  }
}
