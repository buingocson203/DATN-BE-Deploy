// utils/email.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'Gmail', // Bạn có thể sử dụng các dịch vụ khác như Yahoo, Outlook...
  auth: {
    user: process.env.EMAIL_USER, // Email của bạn
    pass: process.env.EMAIL_PASS, // Mật khẩu ứng dụng email
  },
});

export const sendOrderConfirmationEmail = (to, order) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'huyhungsp2003@gmail.com',
    subject: 'Xác nhận đơn hàng',
    text: `Cảm ơn bạn đã đặt hàng! Đơn hàng của bạn có mã: ${order.codeOrders}. Tổng giá: ${order.total_price}.`,
    html: `<h1>Cảm ơn bạn đã đặt hàng!</h1>
           <p>Đơn hàng của bạn có mã: <strong>${order.codeOrders}</strong>.</p>
           <p>Tổng giá: <strong>${order.total_price}</strong>.</p>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};