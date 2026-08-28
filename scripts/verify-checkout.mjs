const checkoutUrl = 'https://api.sociobot.in/api/v1/products/bills-due-board/checkout';
const response = await fetch(checkoutUrl, { redirect: 'manual' });
const location = response.headers.get('location') ?? '';

if (![302, 303].includes(response.status) || !location.startsWith('https://checkout.dodopayments.com/')) {
  throw new Error(`Checkout did not start a hosted Sociobot payment session (status ${response.status}, location ${location || 'missing'}).`);
}

console.log(`Checkout health check passed: ${response.status} → ${new URL(location).host}`);
