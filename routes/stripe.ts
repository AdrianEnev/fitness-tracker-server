
import express from 'express';
const stripeRouter = express.Router();
import dotenv from 'dotenv'
dotenv.config();
const stripe = require('stripe')(process.env.BACKEND_STRIPE_SECRET_KEY);

stripeRouter.get('/', (req, res) => {
    res.json({ message: 'Stripe' });
});

stripeRouter.post('/create-payment-intent', async (req, res) => {
    try {
        const { amount, currency, customerId } = req.body;

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            customer: customerId,
        });

        res.send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error: any) {
        res.status(500).send({ error: error.message });
    }
});

stripeRouter.post('/create-ephemeral-key', async (req, res) => {
    try {
        const { customerId } = req.body;

        const ephemeralKey = await stripe.ephemeralKeys.create(
            { customer: customerId }
        );

        res.send(ephemeralKey);
    } catch (error: any) {
        res.status(500).send({ error: error.message });
    }
});

stripeRouter.post('/create-or-retrieve-customer', async (req, res) => {
    try {
        const { email } = req.body;

        // Check if the customer already exists
        const customers = await stripe.customers.list({ email });
        let customer;

        if (customers.data.length > 0) {
            customer = customers.data[0];
        } else {
            // Create a new customer if one doesn't exist
            customer = await stripe.customers.create({ email });
        }

        res.send({ customerId: customer.id });
    } catch (error: any) {
        res.status(500).send({ error: error.message });
    }
});


export default stripeRouter;