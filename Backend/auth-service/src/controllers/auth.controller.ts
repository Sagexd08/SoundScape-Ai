import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model';
import { TokenModel } from '../models/token.model';
import { logger } from '../utils/logger';
// Mock email service for now
const sendVerificationEmail = async (email: string, name: string, token: string) => {
  logger.info(`[MOCK] Sending verification email to ${email} with token ${token}`);
  return true;
};

const sendPasswordResetEmail = async (email: string, name: string, token: string) => {
  logger.info(`[MOCK] Sending password reset email to ${email} with token ${token}`);
  return true;
};

// Mock uuid and OAuth2Client for now
const uuidv4 = () => `mock-uuid-${Date.now()}`;

class OAuth2Client {
  constructor(clientId: string) {}
  async verifyIdToken(_options: any): Promise<any> {
    return {
      getPayload: () => ({
        email: 'mock@example.com',
        name: 'Mock User',
        sub: '12345'
      })
    };
  }
}

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || '');

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_refresh_secret';
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

/**
 * User registration controller
 */
export const register = async (req: Request, res: Response) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate verification token
    const verificationToken = uuidv4();

    // Create new user
    const user = new UserModel({
      email,
      password: hashedPassword,
      name,
      verificationToken,
      isVerified: false,
    });

    await user.save();

    // Send verification email
    await sendVerificationEmail(email, name, verificationToken);

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.'
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

/**
 * Email verification controller
 */
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const user = await UserModel.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ message: 'Invalid verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
  } catch (error) {
    logger.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error during email verification' });
  }
};

/**
 * User login controller
 */
export const login = async (req: Request, res: Response) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(401).json({ message: 'Please verify your email before logging in' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(user);

    // Send response with cookies
    setTokenCookies(res, accessToken, refreshToken);

    logger.info(`User logged in: ${email}`);

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

/**
 * Google OAuth login controller
 */
export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(400).json({ message: 'Invalid Google token' });
    }

    // Find or create user
    let user = await UserModel.findOne({ email: payload.email });

    if (!user) {
      user = new UserModel({
        email: payload.email,
        name: payload.name,
        isVerified: true, // Already verified by Google
        authProvider: 'google',
      });
      await user.save();
    }

    // Generate tokens
    const { accessToken, refreshToken } = await generateTokens(user);

    // Send response with cookies
    setTokenCookies(res, accessToken, refreshToken);

    res.status(200).json({
      message: 'Google login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Google login error:', error);
    res.status(500).json({ message: 'Server error during Google login' });
  }
};

/**
 * Token refresh controller
 */
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token not found' });
    }

    // Verify token from database
    const storedToken = await TokenModel.findOne({ token: refreshToken });
    if (!storedToken) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Verify JWT
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET) as { userId: string };
    const user = await UserModel.findById(decoded.userId);

    if (!user) {
      await TokenModel.deleteOne({ token: refreshToken });
      return res.status(401).json({ message: 'User not found' });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(user);

    // Delete old refresh token
    await TokenModel.deleteOne({ token: refreshToken });

    // Send response with cookies
    setTokenCookies(res, accessToken, newRefreshToken);

    res.status(200).json({ message: 'Token refreshed successfully' });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    logger.error('Token refresh error:', error);
    res.status(500).json({ message: 'Server error during token refresh' });
  }
};

/**
 * Logout controller
 */
export const logout = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      // Remove token from database
      await TokenModel.deleteOne({ token: refreshToken });
    }

    // Clear cookies
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
};

/**
 * Password reset request controller
 */
export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await UserModel.findOne({ email });
    if (!user) {
      // Don't reveal that the email doesn't exist
      return res.status(200).json({
        message: 'If your email is registered, you will receive a password reset link'
      });
    }

    // Generate reset token
    const resetToken = uuidv4();

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    // Send reset email
    await sendPasswordResetEmail(email, user.name, resetToken);

    res.status(200).json({
      message: 'If your email is registered, you will receive a password reset link'
    });
  } catch (error) {
    logger.error('Password reset request error:', error);
    res.status(500).json({ message: 'Server error during password reset request' });
  }
};

/**
 * Password reset controller
 */
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, newPassword } = req.body;

    const user = await UserModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired password reset token' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Invalidate existing tokens
    await TokenModel.deleteMany({ userId: user._id });

    res.status(200).json({ message: 'Password reset successful. You can now log in with your new password.' });
  } catch (error) {
    logger.error('Password reset error:', error);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};

/**
 * Helper function to generate tokens
 */
const generateTokens = async (user: any) => {
  // Generate access token
  const accessToken = jwt.sign(
    {
      userId: user._id,
      role: user.role
    },
    JWT_SECRET as jwt.Secret,
    { expiresIn: ACCESS_TOKEN_EXPIRY } as jwt.SignOptions
  );

  // Generate refresh token
  const refreshToken = jwt.sign(
    { userId: user._id },
    JWT_REFRESH_SECRET as jwt.Secret,
    { expiresIn: REFRESH_TOKEN_EXPIRY } as jwt.SignOptions
  );

  // Store refresh token in database
  const tokenDoc = new TokenModel({
    userId: user._id,
    token: refreshToken,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  });

  await tokenDoc.save();

  return { accessToken, refreshToken };
};

/**
 * Helper function to set secure cookies with tokens
 */
const setTokenCookies = (res: Response, accessToken: string, refreshToken: string) => {
  // Set access token cookie
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000 // 15 minutes
  });

  // Set refresh token cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/auth/refresh', // Only sent to refresh endpoint
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};