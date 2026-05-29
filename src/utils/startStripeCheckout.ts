export async function startStripeCheckout(params: {
  email?: string;
  userId?: string;
}): Promise<void> {
  const response = await fetch('/api/create-checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: params.email || '',
      userId: params.userId || '',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to create checkout session');
  }

  const { url } = await response.json();
  if (!url) {
    throw new Error('No checkout URL returned');
  }

  window.location.href = url;
}
