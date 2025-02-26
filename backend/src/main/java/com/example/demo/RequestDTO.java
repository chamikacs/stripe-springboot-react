package com.example.demo;

import com.stripe.model.Product;

public class RequestDTO {
    Product[] items;
    String customerName;
    String customerEmail;
    String subscriptionId;
    Boolean invoiceNeeded;

    public Product[] getItems() {
        return items;
    }

    public String getCustomerName() {
        return customerName;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }
    public String getSubscriptionId() {
        return subscriptionId;
    }

    public Boolean isInvoiceNeeded() {
        return invoiceNeeded;
    }

}