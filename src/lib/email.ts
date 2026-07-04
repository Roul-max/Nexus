import { Resend } from 'resend';

const getResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('RESEND_API_KEY is missing. Using mock email client for development.');
    return {
      emails: {
        send: async (payload: any) => {
          console.log('[MOCK EMAIL SENT]', payload);
          return { data: { id: 'mock-id' }, error: null };
        }
      }
    } as unknown as Resend;
  }
  return new Resend(apiKey);
};

export const resend = getResendClient();

export async function sendWelcomeEmail(email: string, name: string) {
  return await resend.emails.send({
    from: 'Nexus <noreply@nexus.inc>',
    to: email,
    subject: 'Welcome to Nexus',
    html: `
      <div>
        <h1>Welcome to Nexus, ${name}!</h1>
        <p>We are excited to have you on board. Let's build something great together.</p>
      </div>
    `,
  });
}

export async function sendInvoiceEmail(email: string, amount: string, invoicePdfUrl: string) {
  return await resend.emails.send({
    from: 'Nexus Billing <billing@nexus.inc>',
    to: email,
    subject: 'Your latest Nexus invoice',
    html: `
      <div>
        <h1>Invoice Available</h1>
        <p>Your invoice for ${amount} is ready.</p>
        <p><a href="${invoicePdfUrl}">Download PDF</a></p>
      </div>
    `,
  });
}
