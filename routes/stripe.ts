
import express from 'express';
const stripeRouter = express.Router();
import dotenv from 'dotenv'
import InternalError from '@custom_errors/InternalError';
dotenv.config();
const stripe = require('stripe')(process.env.BACKEND_STRIPE_SECRET_KEY);

stripeRouter.get('/', (req, res) => {
    res.json({ message: 'Stripe' });
});

stripeRouter.post('/create-payment-intent', async (req, res) => {

    const { amount, currency, customerId } = req.body;

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency,
            customer: customerId,
        });

        res.send({
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error: any) {
        throw new InternalError('Error creating stripe payment intent')
    }

});

stripeRouter.post('/create-ephemeral-key', async (req, res) => {

    const { customerId } = req.body;

    try {
        const ephemeralKey = await stripe.ephemeralKeys.create(
            { customer: customerId }
        );

        res.send(ephemeralKey);
    } catch (error: any) {
        throw new InternalError('Error creating stripe empheral key')
    }

});

stripeRouter.post('/create-or-retrieve-customer', async (req, res) => {

    const { email } = req.body;

    try {
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
        throw new InternalError(`Error handling customer "${email}"`)
    }

});

export default stripeRouter;