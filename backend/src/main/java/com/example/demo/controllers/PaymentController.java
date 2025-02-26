package com.example.demo.controllers;

import com.example.demo.CustomerUtil;
import com.example.demo.ProductDAO;
import com.example.demo.RequestDTO;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.*;
import com.stripe.model.checkout.Session;
import com.stripe.param.*;
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

        if (requestDTO.isInvoiceNeeded()) {
            paramsBuilder.setInvoiceCreation(SessionCreateParams.InvoiceCreation.builder().setEnabled(true).build());
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

        PaymentIntent paymentIntent;

        if (!requestDTO.isInvoiceNeeded()) {
            // If the invoice is not needed, create a PaymentIntent directly and send it to the client
            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(Long.parseLong(calculateOrderAmount(requestDTO.getItems())))
                    .setCurrency("usd")
                    .setCustomer(customer.getId())
                    .setAutomaticPaymentMethods(PaymentIntentCreateParams.AutomaticPaymentMethods.builder()
                            .setEnabled(true)
                            .build())
                    .build();
            paymentIntent = PaymentIntent.create(params);
        } else {
            // If invoice is needed, create the invoice object, add line items to it, and finalize it to create the PaymentIntent automatically
            InvoiceCreateParams invoiceCreateParams = new InvoiceCreateParams.Builder()
                    .setCustomer(customer.getId())
                    .build();
            Invoice invoice = Invoice.create(invoiceCreateParams);

            // Add each item to the invoice one by one
            for (Product product : requestDTO.getItems()) {

                // Look for existing Product in Stripe before creating a new one
                Product stripeProduct;

                ProductSearchResult results = Product.search(ProductSearchParams.builder()
                        .setQuery("metadata['app_id']:'" + product.getId() + "'")
                        .build());

                if(!results.getData().isEmpty())
                    stripeProduct = results.getData().getFirst();
                else {

                    // If a product is not found in Stripe database, create it
                    ProductCreateParams productCreateParams = new ProductCreateParams.Builder()
                            .setName(product.getName())
                            .putMetadata("app_id", product.getId())
                            .build();

                    stripeProduct = Product.create(productCreateParams);
                }

                // Create an invoice line item using the product object for the line item
                InvoiceItemCreateParams invoiceItemCreateParams = new InvoiceItemCreateParams.Builder()
                        .setInvoice(invoice.getId())
                        .setQuantity(1L)
                        .setCustomer(customer.getId())
                        .setPriceData(
                                InvoiceItemCreateParams.PriceData.builder()
                                        .setProduct(stripeProduct.getId())
                                        .setCurrency(ProductDAO.getProduct(product.getId()).getDefaultPriceObject().getCurrency())
                                        .build()
                        ).build();
                InvoiceItem.create(invoiceItemCreateParams);
            }

            // Mark the invoice as final so that a PaymentIntent is created for it
            invoice = invoice.finalizeInvoice();

            // Retrieve the payment intent object from the invoice
            paymentIntent = PaymentIntent.retrieve(invoice.getPaymentIntent());
        }

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

    @PostMapping("/subscriptions/trial")
    String newSubscriptionWithTrial(@RequestBody RequestDTO requestDTO) throws StripeException {

        Stripe.apiKey = STRIPE_API_KEY;

        String clientBaseURL = System.getenv().get("CLIENT_BASE_URL");

        // Start by finding existing customer record from Stripe or creating a new one if needed
        Customer customer = CustomerUtil.findOrCreateCustomer(requestDTO.getCustomerEmail(), requestDTO.getCustomerName());

        // Next, create a checkout session by adding the details of the checkout
        SessionCreateParams.Builder paramsBuilder =
                SessionCreateParams.builder()
                        .setMode(SessionCreateParams.Mode.SUBSCRIPTION)
                        .setCustomer(customer.getId())
                        .setSuccessUrl(clientBaseURL + "/success?session_id={CHECKOUT_SESSION_ID}")
                        .setCancelUrl(clientBaseURL + "/failure")
                        // For trials, you need to set the trial period in the session creation request
                        .setSubscriptionData(SessionCreateParams.SubscriptionData.builder().setTrialPeriodDays(30L).build());

        for (Product product : requestDTO.getItems()) {
            paramsBuilder.addLineItem(
                    SessionCreateParams.LineItem.builder()
                            .setQuantity(1L)
                            .setPriceData(
                                    PriceData.builder()
                                            .setProductData(
                                                    PriceData.ProductData.builder()
                                                            .putMetadata("app_id", product.getId())
                                                            .setName(product.getName())
                                                            .build()
                                            )
                                            .setCurrency(ProductDAO.getProduct(product.getId()).getDefaultPriceObject().getCurrency())
                                            .setUnitAmountDecimal(ProductDAO.getProduct(product.getId()).getDefaultPriceObject().getUnitAmountDecimal())
                                            .setRecurring(PriceData.Recurring.builder().setInterval(PriceData.Recurring.Interval.MONTH).build())
                                            .build())
                            .build());
        }

        Session session = Session.create(paramsBuilder.build());

        return session.getUrl();
    }

    @PostMapping("/invoices/list")
    List<Map<String, String>> listInvoices(@RequestBody RequestDTO requestDTO) throws StripeException {

        Stripe.apiKey = STRIPE_API_KEY;

        // Start by finding existing customer record from Stripe
        Customer customer = CustomerUtil.findCustomerByEmail(requestDTO.getCustomerEmail());

        // If no customer record was found, no subscriptions exist either, so return an empty list
        if (customer == null) {
            return new ArrayList<>();
        }

        // Search for invoices for the current customer
        Map<String, Object> invoiceSearchParams = new HashMap<>();
        invoiceSearchParams.put("customer", customer.getId());
        InvoiceCollection invoices = Invoice.list(invoiceSearchParams);

        List<Map<String, String>> response = new ArrayList<>();

        // For each invoice, extract its number, amount, and PDF URL to send to the client
        for (Invoice invoice : invoices.getData()) {
            HashMap<String, String> map = new HashMap<>();

            map.put("number", invoice.getNumber());
            map.put("amount", String.valueOf((invoice.getTotal()  / 100f)));
            map.put("url", invoice.getInvoicePdf());

            response.add(map);
        }
        return response;
    }
}
