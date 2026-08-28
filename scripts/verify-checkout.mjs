const checkoutUrl = 'https://api.sociobot.in/api/v1/products/bills-due-board/checkout';
const response = await fetch(checkoutUrl, { redirect: 'manual' });
const location = response.headers.get('location') ?? '';

if (![302, 303].includes(response.status) || !location.startsWith('https://checkout.dodopayments.com/')) {
  throw new Error(`Checkout did not start a hosted Sociobot payment session (status ${response.status}, location ${location || 'missing'}).`);
}

// @claim:license-checkout
const checkoutPage = await fetch(location);
const checkoutHtml = await checkoutPage.text();
if (!checkoutPage.ok || !checkoutHtml.includes('Bills Due Board License') || !checkoutHtml.includes('$19.00') || !checkoutHtml.includes('One-time license')) {
  throw new Error('Hosted checkout did not show the Bills Due Board $19 one-time license.');
}

console.log(`Checkout health check passed: ${response.status} → ${new URL(location).host} ($19 one-time license)`);
