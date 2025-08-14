'use client';
export default function YardSale(){
  async function pay(){
    const res = await fetch('/api/checkout', {
      method:'POST',
      headers:{'content-type':'application/json'},
      body: JSON.stringify({ mode:'payment', priceId: process.env.NEXT_PUBLIC_PRICE_YARD_SALE })
    });
    const json = await res.json();
    if(res.ok) window.location.href = json.url; else alert(json.error || 'Checkout error');
  }
  return (
    <div>
      <h1 className="text-xl font-semibold">Yard sale — one-off post</h1>
      <button onClick={pay} className="mt-4 px-4 py-2 rounded-md bg-blue-600 text-white">Pay now</button>
    </div>
  );
}
