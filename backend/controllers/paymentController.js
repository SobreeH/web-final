import Stripe from "stripe";
import appointmentModel from "../models/appointmentModel.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// 1️⃣ Create a PaymentIntent for THB
const createPaymentIntent = async (req, res) => {
  try {
    const { amount, appointmentId } = req.body;

    // Stripe uses the smallest unit of currency (Satang = 1/100 Baht)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: "thb",
      automatic_payment_methods: { enabled: true },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Stripe error:", error);
    res.json({ success: false, message: error.message });
  }
};

// 2️⃣ Confirm payment and mark appointment as paid
const confirmPayment = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      paid: true,
    });

    res.json({
      success: true,
      message: "Payment confirmed and appointment updated",
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

export { createPaymentIntent, confirmPayment };
