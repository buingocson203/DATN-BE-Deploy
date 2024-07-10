// utils/email.js
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'Gmail', // Bạn có thể sử dụng các dịch vụ khác như Yahoo, Outlook...
  auth: {
    user: process.env.EMAIL_USER, // Email của bạn
    pass: process.env.EMAIL_PASS, // Mật khẩu ứng dụng email
  },
});
const statusTranslations = {
  pending: "Chờ xác nhận",
  waiting: "Đã xác nhận",
  delivering: "Đang giao hàng",
  done: "Giao hàng thành công",
  cancel: "Đã hủy",
};

const translateStatus = (status) => {
  return statusTranslations[status] || status;
};

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


export const sendOrderStatusUpdateEmail = (to, order, newStatus) => {
  const translatedStatus = translateStatus(newStatus);
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: "huyhungsp2003@gmail.com", // Email của khách hàng
    subject: 'Cập nhật trạng thái đơn hàng',
    text: `Đơn hàng của bạn có mã: ${order.codeOrders} đã được cập nhật trạng thái: ${translatedStatus}.`,
    html: `<h1>Đơn hàng của bạn đã được cập nhật!</h1>
           <p>Đơn hàng của bạn có mã: <strong>${order.codeOrders}</strong> đã được cập nhật trạng thái: <strong>${translatedStatus}</strong>.</p>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};