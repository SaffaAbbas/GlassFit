export const otpEmailTemplate = (otp, type = 'FORGOT_PASSWORD') => {
    const templateConfig = {
        FORGOT_PASSWORD: {
            title: 'Reset Your Password',
            message: 'Please use the following verification code to reset your password',
            action: 'password reset'
        },
        RESEND: {
            title: 'New Verification Code',
            message: 'As requested, here is your new verification code',
            action: 'verification'
        },
    };
    const config = templateConfig[type] || templateConfig.FORGOT_PASSWORD;
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: 'Poppins', sans-serif;
                line-height: 1.6;
                color: #333333;
                background-color: #f4f4f4;
            }
            .email-wrapper {
                padding: 20px 10px;
            }
            .email-container {
                max-width: 600px;
                width: 100%;
                margin: 0 auto;
                background-color: #FFFFFF;
                border-radius: 8px;
                border: 1px solid rgba(0,0,0,0.1);
                overflow: hidden;
            }
            .header {
                padding: 20px;
                text-align: center;
                border-bottom: 1px solid rgba(0,0,0,0.1);
            }
            .header h1 {
                color: #555555;
                font-size: 20px;
                font-weight: 700;
                margin: 0;
                letter-spacing: -0.5px;
            }
            .content {
                padding: 30px 20px;
                text-align: center;
            }
            .message {
                margin-bottom: 25px;
                font-size: 12px;
                color: #555555;
            }
            .otp-container {
                margin: 25px 0;
                text-align: center;
            }
            .otp-code {
                color: #3a86ff;
                font-size: 24px;
                font-weight: 700;
                letter-spacing: 4px;
                padding: 12px 24px;
                border-radius: 6px;
                display: inline-block;
            }
            .notice {
                font-size: 11px;
                color: #666666;
                margin-top: 8px;
            }
            .footer {
                padding: 20px;
                background-color: #f8f9fa;
                border-top: 1px solid rgba(0,0,0,0.1);
                text-align: center;
                font-size: 11px;
                color: #666666;
            }
            .footer p {
                margin: 5px 0;
            }
            .divider {
                border-top: 1px solid rgba(0,0,0,0.1);
                margin: 15px 0;
            }
        </style>
    </head>
    <body>
        <div class="email-wrapper">
            <div class="email-container">
                <div class="header">
                    <h1>FOGO</h1>
                </div>
                <div class="content">
                    <div class="message">
                        <h2 style="color: #333333; margin-bottom: 16px; letter-spacing:0.5px; font-size: 14px;">${config.title}</h2>
                        <p>${config.message}</p>
                    </div>
                    <div class="otp-container">
                        <div class="otp-code">${otp}</div>
                        <p class="notice">
                            This code will expire in <strong>10 minutes</strong>
                        </p>
                    </div>
                </div>
                <div class="footer">
                    <p>This is an automated message, please do not reply.</p>
                    <div class="divider"></div>
                    <p>© ${new Date().getFullYear()} FOGO. All rights reserved.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};