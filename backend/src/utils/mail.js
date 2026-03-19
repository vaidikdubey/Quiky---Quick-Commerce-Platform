import Mailgen from "mailgen";
import nodemailer from "nodemailer";

export const sendEmail = async (options) => {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Quiky",
      link: "https://quiky.com",
    },
  });

  const emailText = mailGenerator.generatePlaintext(options.mailgenContent);
  const emailHTML = mailGenerator.generate(options.mailgenContent);

  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    secure: false,
    auth: {
      user: process.env.MAILTRAP_SMTP_USER,
      pass: process.env.MAILTRAP_SMTP_PASS,
    },
  });

  const mailOptions = {
    from: "Quiky <team@quiky.com>",
    to: options.email,
    subject: options.subject,
    text: emailText,
    html: emailHTML,
  };

  try {
    await transporter.sendMail(mailOptions);

    console.log(
      `Email sent successfully to user ${options.email} for subject: ${options.subject}`,
    );
  } catch (error) {
    console.error("Error sending email: ", error);
  }
};

export const emailVerificationMailgenContent = (username, verificationUrl) => {
  return {
    body: {
      name: username,
      intro: "Welcome to Quiky! We're very excited to have you on board.",
      action: {
        instructions: "To get started with Quiky, please click here:",
        button: {
          color: "#22BC66", // Optional action button color
          text: "Verify your email",
          link: verificationUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};

export const emailReverificationMailgenContent = (
  username,
  verificationUrl,
) => {
  return {
    body: {
      name: username,
      intro:
        "We noticed that your email address has been updated. Verifying your email helps keep your Quiky account secure and ensures you don’t miss important updates.",
      action: {
        instructions:
          "Please confirm your email address by clicking the button below:",
        button: {
          color: "#22BC66",
          text: "Verify your email",
          link: verificationUrl,
        },
      },
      outro:
        "If you didn’t request this email, you can safely ignore it. If you need any help, just reply to this email and our team will assist you.",
    },
  };
};

export const forgotPasswordMailgenContent = (username, passwordResetUrl) => {
  return {
    body: {
      name: username,
      intro:
        "You have received this email because a password reset request for your Quiky account was received",
      action: {
        instructions: "Click the button below to reset your password:",
        button: {
          color: "#EE3266",
          text: "Reset your password",
          link: passwordResetUrl,
        },
      },
      outro:
        "If you did not request a password reset, no further action is required on your part.",
    },
  };
};

export const verifiedEmailMailgenContent = (username) => {
  return {
    body: {
      name: username,
      intro: "Your email has been successfully verified! Welcome to Quiky.",
      action: {
        instructions:
          "To access your account and start learning, please click here:",
        button: {
          color: "#55eeffff",
          text: "Login to Quiky",
          link: `${process.env.BASE_URL}/api/v1/auth/login`,
        },
      },
      outro:
        "If you have any questions or need assistance, feel free to reply to this email. We're happy to help!",
    },
  };
};

export const resendEmailVerificationMailgenContent = (
  username,
  verificationUrl,
) => {
  return {
    body: {
      name: username,
      intro:
        "It looks like you requested to resend your email verification link for your Quiky account.",
      action: {
        instructions: "Please click the button below to verify your email:",
        button: {
          color: "#22BC66",
          text: "Verify your email",
          link: verificationUrl,
        },
      },
      outro:
        "If you did not request this email, you can safely ignore it. Need help? Just reply to this email, we'd love to assist you.",
    },
  };
};

export const profileDeletionMailgenContent = (username) => {
  return {
    body: {
      name: username,
      intro:
        "We’re sorry to see you go. This email is to confirm that your Quiky account has been successfully deleted, as per your request.",
      outro:
        "All data associated with your Quiky account, including your orders, saved addresses, preferences, and wallet details, is no longer accessible. If you believe this action was taken in error or have any concerns, please reply to this email and our support team will assist you promptly.",
    },
  };
};
