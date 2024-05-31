import { Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { HttpServerService } from '../../../Services/http-server/http-server.service';
import { Title } from '@angular/platform-browser';
import { SearchUserDto, UserDto } from '../../../../dto/classDto';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { SharedDataService } from '../../shared-data-service/shared-data-service.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule ],
  templateUrl: './user.component.html',
  styleUrl: './user.component.css',
  providers: [SearchUserDto]
})
export class UserComponent implements OnInit, OnDestroy{
  toaster = inject(ToastrService);
  @ViewChild('closeButton') closeModelUser!: ElementRef;
  @ViewChild('closeButtonPass') closeModelPass!: ElementRef;

  users: any
  pages: number[]=[]
  user: any
  userForm: FormGroup
  isActive: boolean = false;
  constructor(
    private httpService: HttpServerService,
    private title: Title,
    public searchUserDto: SearchUserDto,
    private formBuilder: FormBuilder,
    private shareDataService: SharedDataService,
  ){
    const storedSearchUserDto = sessionStorage.getItem('searchUserDto');
    if (storedSearchUserDto) {
      const searchUserDtosession = JSON.parse(storedSearchUserDto);
      this.searchUserDto = searchUserDtosession;
    }
    this.userForm = this.formBuilder.group({
      id: "",
      name: "",
      email: "",
      phone: "",
      role: "admin"
    });
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }
  private subscriptions: Subscription = new Subscription();
  ngOnInit(): void {
    this.title.setTitle('Quản lý tài khoản');
    this.getUserFromDB();
    const isActiveSub = this.shareDataService.isActive$.subscribe((isActive) => {
      this.isActive = isActive;
    });
    this.subscriptions.add(isActiveSub)
  }

  getUserFromDB(){
    this.pages=[]
    const searchUserSub = this.httpService.searchUser(this.searchUserDto)
    .subscribe({
      next: (response) => {
        this.users = response.data
        for (let i = 1; i <= response.pageCount; i++) {
          this.pages.push(i);
        }
  

    }}
  )
  this.subscriptions.add(searchUserSub)
  }

  sendSearchQuery(){
    this.setSession()
    this.getUserFromDB()
  }
setPageCurrent(page: number){
  if(page!=this.searchUserDto.page){
    this.searchUserDto.page=page
    this.setSession()
    this.getUserFromDB()

  }
}
idUserDelete: string = '';
email: string=""

confirmDeleteOrder(idUser: string, email: string) {
  this.email=email
  this.idUserDelete = idUser;
}

async deleteUser() {
  const deleteUserSub = await this.httpService.deleteUserById(this.idUserDelete)
 if(deleteUserSub)
  {
    this.toaster.success('Xóa thành công!', 'Success', {
      timeOut: 2000,
    });
    this.getUserFromDB();
  }else{
    this.toaster.error('Xóa không thành công!', 'Error', {
      timeOut: 2000,
    });
  }
  this.subscriptions.add(deleteUserSub)
}
getDetailUser(_id:string,name:string,email:string,phone:string,role:string){
  this.userForm.setValue({
    id: _id,
    name: name,
    email: email,
    phone: phone,
    role: role
  });
}
formErrorProfile: any = { name: '', email: '', phone: '' };
onchangeUser(){
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

  if (this.hasErrorsProfile()) return;
const userChangePass = new UserDto();
userChangePass._id = this.userForm.value.id;
userChangePass.name = this.userForm.value.name;
userChangePass.email = this.userForm.value.email;
userChangePass.phone = this.userForm.value.phone;
userChangePass.role = this.userForm.value.role;
const updateProfileSub = this.httpService.updateProfile(userChangePass).subscribe((data) => console.log(data))
if (updateProfileSub)  {
  this.toaster.success('Đã cập nhật thành công!', 'Success', {
  timeOut: 2000,
});
this.getUserFromDB();
this.closeModelUser.nativeElement.click();
this.subscriptions.add(updateProfileSub)

}
}
hasErrorsProfile(): boolean {
  for (let key in this.formErrorProfile)
    if (this.formErrorProfile[key]) return true;
  return false;
}
clearformErrorProfile() {
  this.formErrorProfile.name = '';
  this.formErrorProfile.email = '';
  this.formErrorProfile.phone = '';
}
passWord1: string=""
passWord2: string=""
errorPass1:string=""
errorPass2:string=""
changePass(){
  this.errorPass1=""
  this.errorPass2=""
  if(this.passWord1=="")this.errorPass1="Mật khẩu không được để trống!"
  if(this.passWord2=="")this.errorPass2="Nhập lại mật khẩu không được để trống!"
  if(this.passWord1!=this.passWord2)
    this.errorPass2="Nhập lại mật khẩu không đúng!"

  if(this.errorPass1==""&&this.errorPass2==""){
  this.toaster.success('Đã cập nhật thành công!', 'Success', {
    timeOut: 2000,
  });
  const changePassFromAdminSub = this.httpService.changePassFromAdmin(this.userForm.value.id,this.passWord1)
  this.subscriptions.add(changePassFromAdminSub)
  this.passWord1=""
  this.passWord2=""
this.closeModelPass.nativeElement.click();

}
}

setSession(){
  sessionStorage.setItem(
  'searchUserDto',
  JSON.stringify(this.searchUserDto)
);}


}
