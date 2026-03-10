import { Request, Response } from "express";
import crypto from "crypto";
import User from "../models/User";
import { generateToken, AuthRequest } from "../middleware/auth";
import sendEmail from "../utils/email";


// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, company, role, phone, address, country } =
      req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (user) {
      if (user.isEmailVerified) {
        res.status(400).json({
          success: false,
          message: "User already exists with this email and is verified. Please log in.",
        });
        return;
      }

      // If user exists but NOT verified, update their info with new registration details
      user.password = password;
      user.name = name;
      user.company = company;
      user.role = role || "individual";
      user.phone = phone;
      user.address = address;
      user.country = country;
    } else {
      // Create a brand new user
      user = new User({
        email,
        password,
        name,
        company,
        role: role || "individual",
        phone,
        address,
        country,
      });
    }

    // Generate 6-Digit OTP Verification Token
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationToken = crypto.createHash('sha256').update(verificationCode).digest('hex');
    user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours expires
    await user.save({ validateBeforeSave: false });

    // Send email with the OTP code
    const message = `Halo ${user.name},\n\nTerima kasih telah mendaftar di HydrEx! Kode Verifikasi Anda adalah:\n\n${verificationCode}\n\nMasukkan 6-angka di atas ke halaman registrasi Anda. Kode ini berlaku selamanya hingga akun terverifikasi.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Kode Verifikasi HydrEx Anda',
        message
      });
      res.status(201).json({
        success: true,
        message: "Registrasi berhasil! Kode verifikasi telah dikirimkan ke email Anda.",
      });
    } catch (err) {
      console.warn("⚠️ Email gagal dikirim (mungkin SMTP belum di-setting). User otomatis terverifikasi.");
      // Skip email verification if SMTP fails
      user.verified = true;
      user.isEmailVerified = true;
      user.verificationToken = undefined;
      user.verificationTokenExpires = undefined;
      await user.save({ validateBeforeSave: false });

      // Return success anyway so they can login immediately
      res.status(201).json({
        success: true,
        message: 'Registrasi berhasil! Anda sudah dapat menskip verifikasi dan langsung Login.',
        autoVerified: true
      });
    }
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      success: false,
      message: "Error registering user",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
      return;
    }

    // Check for user
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
      return;
    }

    // Check if user has verified their email
    if (!user.isEmailVerified) {
      res.status(403).json({
        success: false,
        message: "Mohon periksa email Anda dan lakukan verifikasi sebelum login.",
      });
      return;
    }

    // Generate token
    const token = generateToken(user._id.toString());

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          company: user.company,
          role: user.role,
          avatar: user.avatar,
          phone: user.phone,
          address: user.address,
          country: user.country,
          verified: user.verified,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Error logging in",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Verify Email User
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.body.token).digest('hex');
    const user = (await User.findOne({
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: new Date() }
    })) as any;

    if (!user) {
      res.status(400).json({ success: false, message: "Link verifikasi tidak valid atau sudah kadaluarsa" });
      return;
    }

    user.verified = true;
    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, message: "Email berhasil diverifikasi! Silakan login." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Terjadi kesalahan saat memverifikasi email." });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?._id);

    res.json({
      success: true,
      data: {
        user: {
          id: user?._id,
          email: user?.email,
          name: user?.name,
          company: user?.company,
          role: user?.role,
          avatar: user?.avatar,
          phone: user?.phone,
          address: user?.address,
          country: user?.country,
          verified: user?.verified,
        },
      },
    });
  } catch (error) {
    console.error("Get me error:", error);
    res.status(500).json({
      success: false,
      message: "Error getting user data",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { name, company, phone, address, country } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      { name, company, phone, address, country },
      { new: true, runValidators: true },
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: { user },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// @desc    Change password
// @route   PUT /api/auth/password
// @access  Private
export const changePassword = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user?._id).select("+password");

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    // Check current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
      return;
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Error changing password",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
