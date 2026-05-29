import Stripe from 'stripe';
import { FULL_ACCESS_PRICE_PENCE } from '../lib/pricing.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

function checkoutUnitAmountPence() {
  const fromEnv = parseInt(process.env.STRIPE_UNIT_AMOUNT_PENCE || '', 10);
  if (Number.isFinite(fromEnv) && fromEnv > 0) return fromEnv;
  return FULL_ACCESS_PRICE_PENCE;
}

function appBaseUrl() {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, '');
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'https://www.pippal.uk';
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: 'Payment is not configured. Please try again later.' });
  }

  try {
    const { email, userId } = req.body || {};
    const baseUrl = appBaseUrl();
    const unitAmount = checkoutUnitAmountPence();

    const lineItem = process.env.STRIPE_PRICE_ID
      ? { price: process.env.STRIPE_PRICE_ID, quantity: 1 }
      : {
          price_data: {
            currency: 'gbp',
            product_data: {
              name: 'PIPpal Full Access',
              description: 'One-time payment — lifetime access to all PIPpal tools',
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [lineItem],
      mode: 'payment',
      customer_email: email || undefined,
      metadata: {
        userId: userId || '',
      },
      success_url: `${baseUrl}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}?payment=cancelled`,
    });

    if (!session.url) {
      return res.status(500).json({ error: 'Stripe did not return a checkout URL' });
    }

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Stripe error:', error);

    // Old env price IDs often go inactive when you create a new price in Stripe Dashboard
    const inactivePrice =
      process.env.STRIPE_PRICE_ID &&
      /inactive|only accepts active prices/i.test(String(error.message || ''));

    if (inactivePrice) {
      try {
        const { email, userId } = req.body || {};
        const baseUrl = appBaseUrl();
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price_data: {
                currency: 'gbp',
                product_data: {
                  name: 'PIPpal Full Access',
                  description: 'One-time payment — lifetime access to all PIPpal tools',
                },
                unit_amount: checkoutUnitAmountPence(),
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          customer_email: email || undefined,
          metadata: { userId: userId || '' },
          success_url: `${baseUrl}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${baseUrl}?payment=cancelled`,
        });
        if (session.url) {
          console.warn('Checkout recovered using price_data — update or remove STRIPE_PRICE_ID in Vercel');
          return res.status(200).json({ url: session.url });
        }
      } catch (retryErr) {
        console.error('Stripe retry error:', retryErr);
      }
    }

    return res.status(500).json({
      error: error.message || 'Could not start checkout',
    });
  }
}
