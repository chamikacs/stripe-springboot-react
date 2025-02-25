package com.example.demo.controllers;

import com.example.demo.CustomerUtil;
import com.example.demo.ProductDAO;
import com.example.demo.RequestDTO;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.*;
import com.stripe.model.checkout.Session;
import com.stripe.param.PaymentIntentCreateParams;
import com.stripe.param.SubscriptionItemListParams;
import com.stripe.param.SubscriptionListParams;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import com.stripe.param.checkout.SessionCreateParams.LineItem.PriceData;
import com.stripe.param.checkout.SessionCreateParams.LineItem.PriceData.ProductData;
import com.stripe.param.checkout.SessionCreateParams.LineItem.PriceData.Recurring;


import java.text.SimpleDateFormat;
import java.util.*;

import static com.example.demo.ProductDAO.calculateOrderAmount;

@RestController
@CrossOrigin
public class PaymentController {

    @Value("${stripe.api.key}")
    private String STRIPE_API_KEY;

    @Value("${client.base.url}")
    private String CLIENT_BASE_URL;

    //    @GetMapping("/get-key")
//    public String getStripeKey() {
//        return "Stripe API Key: " + STRIPE_API_KEY;
//    }
    @GetMapping("/get-products")
    private Product[] getProducts() {
        return ProductDAO.getProducts();
    }

    @PostMapping("/checkout/hosted")
    public String hostedCheckout(@RequestBody RequestDTO requestDTO) throws StripeException {
        Stripe.apiKey = STRIPE_API_KEY;
        String clientBaseURL = CLIENT_BASE_URL;

        // Find or create Stripe customer
        Customer customer = CustomerUtil.findOrCreateCustomer(requestDTO.getCustomerEmail(), requestDTO.getCustomerName());

        // Create checkout session
        SessionCreateParams.Builder paramsBuilder = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setCustomer(customer.getId())
                .setSuccessUrl(clientBaseURL + "/success?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl(clientBaseURL + "/failure");

        // Add line items to session
        for (Product product : requestDTO.getItems()) {
            paramsBuilder.addLineItem(
                    SessionCreateParams.LineItem.builder()
                            .setQuantity(1L)
                            .setPriceData(
                                    SessionCreateParams.LineItem.PriceData.builder()
                                            .setCurrency(ProductDAO.getProduct(product.getId()).getDefaultPriceObject().getCurrency())
                                            .setUnitAmountDecimal(ProductDAO.getProduct(product.getId()).getDefaultPriceObject().getUnitAmountDecimal())
                                            .setProductData(
                                                    SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                            .putMetadata("app_id", product.getId())
                                                            .setName(product.getName())
                                                            .build()
                                            )
                                            .build()
                            )
                            .build()
            );
        }

        // Create session
        Session session = Session.create(paramsBuilder.build());

        return session.getUrl();
    }

    @PostMapping("/checkout/integrated")
    String integratedCheckout(@RequestBody RequestDTO requestDTO) throws StripeException {

        Stripe.apiKey = STRIPE_API_KEY;

        // Start by finding existing customer or creating a new one if needed
        Customer customer = CustomerUtil.findOrCreateCustomer(requestDTO.getCustomerEmail(), requestDTO.getCustomerName());

        // Create a PaymentIntent and send it's client secret to the client
        PaymentIntentCreateParams params =
                PaymentIntentCreateParams.builder()
                        .setAmount(Long.parseLong(calculateOrderAmount(requestDTO.getItems())))
                        .setCurrency("usd")
                        .setCustomer(customer.getId())
                        .setAutomaticPaymentMethods(
                                PaymentIntentCreateParams.AutomaticPaymentMethods
                                        .builder()
                                        .setEnabled(true)
                                        .build()
                        )
                        .build();

        PaymentIntent paymentIntent = PaymentIntent.create(params);

        // Send the client secret from the payment intent to the client
        return paymentIntent.getClientSecret();
    }

    @PostMapping("/subscriptions/new")
    public String newSubscription(@RequestBody RequestDTO requestDTO) throws StripeException {
        Stripe.apiKey = STRIPE_API_KEY;

        String clientBaseURL = CLIENT_BASE_URL;

        // Find or create Stripe customer
        Customer customer = CustomerUtil.findOrCreateCustomer(requestDTO.getCustomerEmail(), requestDTO.getCustomerName());

        // Create checkout session
        SessionCreateParams.Builder paramsBuilder =
                SessionCreateParams.builder()
                        .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                        .setCustomer(customer.getId())
                        .setSuccessUrl(clientBaseURL + "/success?session_id={CHECKOUT_SESSION_ID}")
                        .setCancelUrl(clientBaseURL + "/failure");

        for (Product product : requestDTO.getItems()) {
            paramsBuilder.addLineItem(
                    SessionCreateParams.LineItem.builder()
                            .setQuantity(1L)
                            .setPriceData(
                                    PriceData.builder()
                                            .setCurrency(ProductDAO.getProduct(product.getId()).getDefaultPriceObject().getCurrency())
                                            .setUnitAmountDecimal(ProductDAO.getProduct(product.getId()).getDefaultPriceObject().getUnitAmountDecimal())
                                            .setRecurring(
                                                    Recurring.builder()
                                                            .setInterval(Recurring.Interval.MONTH)
                                                            .build()
                                            )
                                            .setProductData(
                                                    ProductData.builder()
                                                            .putMetadata("app_id", product.getId())
                                                            .setName(product.getName())
                                                            .build()
                                            )
                                            .build()
                            )
                            .build()
            );
        }
        // Create session
        Session session = Session.create(paramsBuilder.build());
        return session.getUrl();
    }


    @PostMapping("/subscriptions/list")
    List<Map<String, String>> viewSubscriptions(@RequestBody RequestDTO requestDTO) throws StripeException {

        Stripe.apiKey = STRIPE_API_KEY;

        // Start by finding existing customer record from Stripe
        Customer customer = CustomerUtil.findCustomerByEmail(requestDTO.getCustomerEmail());

        // If no customer record was found, no subscriptions exist either, so return an empty list
        if (customer == null) {
            return new ArrayList<>();
        }

        // Search for subscriptions for the current customer
        SubscriptionCollection subscriptions = Subscription.list(
                SubscriptionListParams.builder()
                        .setCustomer(customer.getId())
                        .build());

        List<Map<String, String>> response = new ArrayList<>();

        // For each subscription record, query its item records and collect in a list of objects to send to the client
        for (Subscription subscription : subscriptions.getData()) {
            SubscriptionItemCollection currSubscriptionItems =
                    SubscriptionItem.list(SubscriptionItemListParams.builder()
                            .setSubscription(subscription.getId())
                            .addExpand("data.price.product")
                            .build());

            for (SubscriptionItem item : currSubscriptionItems.getData()) {
                HashMap<String, String> subscriptionData = new HashMap<>();
                subscriptionData.put("appProductId", item.getPrice().getProductObject().getMetadata().get("app_id"));
                subscriptionData.put("subscriptionId", subscription.getId());
                subscriptionData.put("subscribedOn", new SimpleDateFormat("dd/MM/yyyy").format(new Date(subscription.getStartDate() * 1000)));
                subscriptionData.put("nextPaymentDate", new SimpleDateFormat("dd/MM/yyyy").format(new Date(subscription.getCurrentPeriodEnd() * 1000)));
                subscriptionData.put("price", item.getPrice().getUnitAmountDecimal().toString());

                if (subscription.getTrialEnd() != null && new Date(subscription.getTrialEnd() * 1000).after(new Date()))
                    subscriptionData.put("trialEndsOn", new SimpleDateFormat("dd/MM/yyyy").format(new Date(subscription.getTrialEnd() * 1000)));
                response.add(subscriptionData);
            }

        }

        return response;
    }

    @PostMapping("/subscriptions/cancel")
    String cancelSubscription(@RequestBody RequestDTO requestDTO) throws StripeException {
        Stripe.apiKey = STRIPE_API_KEY;

        Subscription subscription =
                Subscription.retrieve(
                        requestDTO.getSubscriptionId()
                );

        Subscription deletedSubscription =
                subscription.cancel();

        return deletedSubscription.getStatus();
    }
}
