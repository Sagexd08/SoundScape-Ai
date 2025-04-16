import { logger } from '../utils/logger';

// Mock email service for development

/**
 * Send verification email to user
 * @param to Recipient email address
 * @param name Recipient name
 * @param verificationToken Verification token
 */
export async function sendVerificationEmail(to: string, name: string, verificationToken: string) {
  try {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;

    logger.info(`[MOCK] Verification email sent to ${to}`);
    logger.info(`[MOCK] Verification URL: ${verificationUrl}`);
    return true;
  } catch (error) {
    logger.error('Error sending verification email:', error);
    return false;
  }
}

/**
 * Send password reset email to user
 * @param to Recipient email address
 * @param name Recipient name
 * @param resetToken Reset token
 */
export async function sendPasswordResetEmail(to: string, name: string, resetToken: string) {
  try {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    logger.info(`[MOCK] Password reset email sent to ${to}`);
    logger.info(`[MOCK] Reset URL: ${resetUrl}`);
    return true;
  } catch (error) {
    logger.error('Error sending password reset email:', error);
    return false;
  }
}
