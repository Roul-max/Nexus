import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getStripe } from '@/lib/stripe';
import { db } from '@/db';
import { subscriptions, invoices, organizations } from '@/db/schema';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('Stripe-Signature');

  let event: Stripe.Event;

  try {
    const stripe = getStripe();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      return NextResponse.json({ error: 'Stripe webhook is not configured' }, { status: 503 });
    }
    if (!signature) {
      return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
    }
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`❌ Error message: ${err.message}`);
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(subscription);
        break;
      case 'invoice.payment_succeeded':
      case 'invoice.payment_failed':
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoice(invoice);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new NextResponse('Error processing webhook', { status: 500 });
  }

  return NextResponse.json({ received: true });
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  // Find organization by stripe customer ID
  const orgs = await db.select().from(organizations).where(eq(organizations.stripeCustomerId, customerId)).limit(1);
  if (orgs.length === 0) {
    console.error(`Organization not found for customer ${customerId}`);
    return;
  }
  const org = orgs[0];

  const status = subscription.status;
  const currentPeriodStart = new Date((subscription as any).current_period_start * 1000);
  const currentPeriodEnd = new Date((subscription as any).current_period_end * 1000);
  const cancelAtPeriodEnd = (subscription as any).cancel_at_period_end;
  const priceId = (subscription as any).items?.data[0]?.price?.id;

  // Check if subscription exists
  const existingSubs = await db.select().from(subscriptions).where(eq(subscriptions.stripeSubscriptionId, subscription.id)).limit(1);

  if (existingSubs.length > 0) {
    await db.update(subscriptions).set({
      status,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd,
      stripePriceId: priceId,
      updatedAt: new Date(),
    }).where(eq(subscriptions.stripeSubscriptionId, subscription.id));
  } else {
    await db.insert(subscriptions).values({
      organizationId: org.id,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      status,
      currentPeriodStart,
      currentPeriodEnd,
      cancelAtPeriodEnd,
    });
  }
}

async function handleInvoice(invoice: Stripe.Invoice) {
  const subscriptionId = (invoice as any).subscription as string;
  if (!subscriptionId) return;

  const subs = await db.select().from(subscriptions).where(eq(subscriptions.stripeSubscriptionId, subscriptionId)).limit(1);
  if (subs.length === 0) return;
  
  const existingInvoices = await db.select().from(invoices).where(eq(invoices.stripeInvoiceId, invoice.id)).limit(1);

  if (existingInvoices.length > 0) {
    await db.update(invoices).set({
      amountDue: invoice.amount_due,
      amountPaid: invoice.amount_paid,
      status: invoice.status || 'open',
      invoicePdf: invoice.invoice_pdf || null,
      updatedAt: new Date(),
    }).where(eq(invoices.stripeInvoiceId, invoice.id));
  } else {
    await db.insert(invoices).values({
      organizationId: subs[0].organizationId,
      subscriptionId: subs[0].id,
      stripeInvoiceId: invoice.id,
      amountDue: invoice.amount_due,
      amountPaid: invoice.amount_paid,
      status: invoice.status || 'open',
      invoicePdf: invoice.invoice_pdf || null,
    });
  }
}
