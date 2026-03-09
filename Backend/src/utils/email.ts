import nodemailer from "nodemailer";

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
  html?: string;
}

const sendEmail = async (options: EmailOptions): Promise<void> => {
  let transporter;

  // Auto-generate test account if no SMTP provided (perfect for local dev testing)
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS || process.env.SMTP_USER === "your-email@gmail.com") {
    console.log("Membuat akun email testing sementara menggunakan Ethereal...");
    const testAccount = await nodemailer.createTestAccount();
    
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, 
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } else {
    // Create a transporter using default SMTP transport
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_PORT === "465",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Define the email options
  const mailOptions = {
    from: `"${process.env.FROM_NAME || "HydrEx Platform"}" <${!process.env.SMTP_USER || process.env.SMTP_USER === "your-email@gmail.com" ? "test@ethereal.email" : process.env.SMTP_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  // Send the email
  const info = await transporter.sendMail(mailOptions);
  console.log("Message sent: %s", info.messageId);

  // Jika menggunakan akun test, tampilkan URL preview di console!
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS || process.env.SMTP_USER === "your-email@gmail.com") {
    console.log("-----------------------------------------");
    console.log("📥 [Pesan Baru!] BUKA LINK INI UNTUK MELIHAT EMAIL VERIFIKASI ANDA: ");
    console.log("🌐 Preview URL: %s", nodemailer.getTestMessageUrl(info));
    console.log("-----------------------------------------");
  }
};

export default sendEmail;
