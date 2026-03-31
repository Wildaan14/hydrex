import { Request, Response } from "express";
import nodemailer from "nodemailer";
import config from "../config/env";

/**
 * @desc    Send contact form email
 * @route   POST /api/contact
 * @access  Public
 */
export const sendContactEmail = async (req: Request, res: Response) => {
  const { companyName, email, message } = req.body;

  // Basic validation
  if (!companyName || !email || !message) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields (companyName, email, message)",
    });
  }

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });

    // Email to Admin
    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'HydrEx Landing Page'}" <${process.env.FROM_EMAIL || config.smtp.user}>`,
      to: config.smtp.user, // Send to the admin email
      subject: `New Demo Request: ${companyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #059669;">New Lead from HydrEx Landing Page</h2>
          <p><strong>Company Name:</strong> ${companyName}</p>
          <p><strong>Business Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px;">
            ${message.replace(/\n/g, '<br/>')}
          </div>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="font-size: 12px; color: #6b7280;">This email was automatically generated from the HydrEx Landing Page contact form.</p>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Optional: Send confirmation email to user
    const confirmationOptions = {
      from: `"${process.env.FROM_NAME || 'HydrEx'}" <${process.env.FROM_EMAIL || config.smtp.user}>`,
      to: email,
      subject: "Thank you for your interest in HydrEx",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #059669;">Hello ${companyName},</h2>
          <p>Thank you for reaching out to HydrEx. We've received your request for an exclusive demo and our team will get back to you shortly.</p>
          <p>In the meantime, feel free to explore our platform and latest water conservation projects.</p>
          <br/>
          <p>Best regards,</p>
          <p><strong>The HydrEx Team</strong></p>
        </div>
      `,
    };
    
    // We don't wait for this to finish to not delay the response
    transporter.sendMail(confirmationOptions).catch(err => console.error("Error sending confirmation email:", err));

    res.status(200).json({
      success: true,
      message: "Your request has been sent successfully. We will contact you soon.",
    });
  } catch (error: any) {
    console.error("Email error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send email. Please try again later.",
      error: config.nodeEnv === "development" ? error.message : undefined,
    });
  }
};
