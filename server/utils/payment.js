import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '';

export async function startPayment({
  amount,
  bookingId,
  user,
  onSuccess,
  onFailure,
}) {
  try {
    const { data } = await axios.post(
      `${API}/api/payment/create-order`,
      { amount, bookingId },
      { withCredentials: true }
    );

    // ---------- DUMMY MODE ----------
    if (data.mode === 'dummy') {
      // Confirmation popup
      const confirmed = window.confirm(
        `🧪 DUMMY PAYMENT MODE\n\n` +
          `Amount: ₹${amount}\n` +
          `Booking: #${bookingId}\n\n` +
          `Ye ek fake payment hai. Aage badhna hai?`
      );

      if (!confirmed) {
        onFailure?.({ message: 'Payment cancelled' });
        return;
      }

      // Thoda delay de taaki real lagay
      await new Promise((r) => setTimeout(r, 1200));

      // Server pe verify karo (dummy)
      const verifyRes = await axios.post(
        `${API}/api/payment/verify`,
        {
          razorpay_order_id: data.orderId,
          razorpay_payment_id: `pay_dummy_${Date.now()}`,
          razorpay_signature: 'dummy_signature',
          bookingId,
        },
        { withCredentials: true }
      );

      if (verifyRes.data.success) {
        onSuccess?.(verifyRes.data);
      } else {
        onFailure?.({ message: verifyRes.data.message || 'Failed' });
      }
      return;
    }

    // ---------- LIVE MODE ----------
    if (!window.Razorpay) {
      onFailure?.({ message: 'Razorpay SDK load nahi hua' });
      return;
    }

    const options = {
      key: data.keyId,
      amount: data.amount,
      currency: data.currency,
      name: 'Siyaram Palace',
      description: `Booking #${bookingId}`,
      order_id: data.orderId,
      prefill: {
        name: user?.name || '',
        email: user?.email || '',
        contact: user?.phone || '',
      },
      theme: { color: '#D4AF37' },

      handler: async function (response) {
        try {
          await axios.post(
            `${API}/api/payment/verify`,
            { ...response, bookingId },
            { withCredentials: true }
          );
          onSuccess?.(response);
        } catch (err) {
          onFailure?.(err);
        }
      },

      modal: {
        ondismiss: () => onFailure?.({ message: 'Payment cancelled' }),
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (err) {
    console.error('Payment error:', err);
    onFailure?.(err);
  }
}