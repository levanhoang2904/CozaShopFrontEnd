import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ChatbotService {
  constructor() {}

  initChatbot(): void {
    if (!(window as any).kommunicate) {
      (function (d, m) {
        var kommunicateSettings = {
          appId: '97b872ccb4d7a982dfeabb09b1fe487',
          popupWidget: true,
          automaticChatOpenOnNavigation: true,
          voiceNote: true,
          talkToHuman: true,
          primaryCTA: 'TALK_TO_HUMAN',
          askUserDetails: ['name', 'email', 'phone'],
          labels: {
            'lead.collection': {
              title: 'Thông tin người dùng',
              email: 'Email',
              name: 'Họ tên',
              phone: 'Số điện thoại',
              heading:
                'Vui lòng cung cấp thông tin của bạn trước khi sử dụng chatbot!',
              submit: 'Bắt đầu chat',
            },
            'input.message': 'Nhập tin nhắn của bạn...',
            'conversations.title': 'Cuộc trò chuyện',
            'start.new': 'Bắt đầu cuộc trò chuyện mới',
            'email.error.alert': 'Email không hợp lệ!!!',
            'char.limit.warn':
              'Giữ tin nhắn của bạn trong giới hạn 256 ký tự để giúp bot dễ hiểu',
          },
        };
        var s = document.createElement('script');
        s.type = 'text/javascript';
        s.async = true;
        s.src = 'https://widget.kommunicate.io/v2/kommunicate.app';
        var h = document.getElementsByTagName('head')[0];
        h.appendChild(s);
        (window as any).kommunicate = m;
        m._globals = kommunicateSettings;
      })(document, (window as any).kommunicate || {});
    }
  }
}
