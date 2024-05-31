import dayjs, { Dayjs } from 'dayjs';
export class Product {
  productName?: string;
  price?: number;
  fabric?: string;
  path?: string;
  categoryId?: string;
  sale?: number;
}

export class SearchProductDto {
  page: number = 1; //số trang đang chọn
  pageSize: number = 8; //số sản phẩm trên 1 trang
  categoryId: string = ''; // chọn theo danh mục category
  sale: number = 0; //chọn sản phẩn đang sale
  minPrice: number = 0; // giá tối thiểu
  maxPrice: number = 0; //giá tối đa
  fabric: string = ''; // chọn theo loại vải
  sortBy: number = 0; //giá cao thấp hoặc thấp cao là -1 và 1
  quantitySold: boolean = false; // sắp xếp theo bán chạy
  newProduct: boolean = false; // sắp xếp theo sản phẩm mới nhất
  sizes: string[] = ['']; //   mảng lưu kích thước người dùng chọn
  colors: string[] = ['']; // mảng lưu màu sắc người dùng chọn
  searchValue = '';
}

export class UserDto {
  _id: any = '';
  name: string = '';
  email: string = '';
  password: string = '';
  oldPass: string = '';
  phone: string = '';
  date: string = '';
  role: string = '';
}

export class AddressDto {
  idAddress: string = '';
  idUser: string = '';
  name: string = '';
  phone: string = '';
  detailAddress: string = '';
  city: string = '';
  district: string = '';
  ward: string = '';
  note: string = '';
}

export class SearchOrderDto {
  page: number = 1;
  pageSize: number = 10;
  searchValue: string = '';
  startDay: Dayjs = dayjs().startOf('day');
  endDay: Dayjs = dayjs().endOf('day');
  status: number = -2;
}

export class DataProductOrderDto {
  _id?: string;
  number?: number;
  _idColor?: string;
  color?: string;
  image?: string;
  _idSize?: string;
  size?: string;
  _idSizeold?: string;
  amount?: number;
  static _id: any;
}
export class SearchUserDto {
  page: number = 1;
  pageSize: number = 10;
  searchValue: string = '';
}
