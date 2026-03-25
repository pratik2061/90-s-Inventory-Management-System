import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const emailService = {
  sendSaleEmail: async (sale: any) => {
    try {
      const notificationEmail = process.env.NOTIFICATION_EMAIL || 'pratiksharma2061@gmail.com';
      
      const itemsHtml = sale.items.map((item: any) => `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${item.item.name}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">Rs. ${item.price.toFixed(2)}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">Rs. ${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
      `).join('');

      const mailOptions = {
        from: `"90s Inventory System" <${process.env.SMTP_USER}>`,
        to: notificationEmail,
        subject: `New Sale Recorded - TX-${sale.id.slice(-8)}`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px;">
            <h2 style="color: #2c3e50; text-align: center; border-bottom: 2px solid #3498db; padding-bottom: 10px;">Sale Details</h2>
            
            <p><strong>Sale ID:</strong> TX-${sale.id.slice(-8)}</p>
            <p><strong>Date:</strong> ${new Date(sale.createdAt).toLocaleString()}</p>
            <p><strong>Payment Mode:</strong> ${sale.paymentMode}</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
              <thead>
                <tr style="background-color: #f2f2f2;">
                  <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Item</th>
                  <th style="padding: 8px; border: 1px solid #ddd; text-align: center;">Qty</th>
                  <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Price</th>
                  <th style="padding: 8px; border: 1px solid #ddd; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="padding: 8px; border: 1px solid #ddd; text-align: right; font-weight: bold;">Subtotal</td>
                  <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">Rs. ${(sale.totalAmount + (sale.discount || 0)).toFixed(2)}</td>
                </tr>
                ${sale.discount ? `
                <tr>
                  <td colspan="3" style="padding: 8px; border: 1px solid #ddd; text-align: right; color: #e74c3c;">Discount</td>
                  <td style="padding: 8px; border: 1px solid #ddd; text-align: right; color: #e74c3c;">- Rs. ${sale.discount.toFixed(2)}</td>
                </tr>
                ` : ''}
                <tr style="background-color: #f9f9f9; font-weight: bold;">
                  <td colspan="3" style="padding: 10px; border: 1px solid #ddd; text-align: right; font-size: 1.1em;">Net Total</td>
                  <td style="padding: 10px; border: 1px solid #ddd; text-align: right; font-size: 1.1em;">Rs. ${sale.totalAmount.toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>

            ${sale.note ? `
            <div style="margin-top: 20px; padding: 10px; background-color: #fcf8e3; border: 1px solid #faebcc; border-radius: 4px;">
              <strong>Note:</strong> ${sale.note}
            </div>
            ` : ''}

            <p style="margin-top: 30px; font-size: 0.8em; color: #777; text-align: center;">
              This is an automated message from your Inventory Management System.
            </p>
          </div>
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Notification email sent: %s', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending notification email:', error);
      // We don't throw error here to avoid breaking the sale flow if email fails
    }
  },
};
