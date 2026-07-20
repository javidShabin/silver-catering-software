/**
 * Send an email via Brevo transactional email API
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.htmlContent - HTML body content of the email
 * @returns {Promise<{success: boolean, message?: string, data?: any}>}
 */
export const sendEmail = async ({ to, subject, htmlContent }) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.SENDER_EMAIL || "doquadproject200@gmail.com";

  if (!apiKey) {
    console.error("[EmailService] BREVO_API_KEY is not defined in environment variables.");
    return { success: false, message: "Email service not configured" };
  }

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        sender: { name: "Docateos", email: senderEmail },
        to: [{ email: to }],
        subject,
        htmlContent
      })
    });

    const resData = await response.json();

    if (!response.ok) {
      console.error("[EmailService] Brevo API responded with error:", resData);
      return { 
        success: false, 
        message: resData.message || `Brevo returned status code ${response.status}` 
      };
    }

    return { success: true, data: resData };
  } catch (error) {
    console.error("[EmailService] Network/Unexpected error sending email:", error.message);
    return { success: false, message: error.message };
  }
};
