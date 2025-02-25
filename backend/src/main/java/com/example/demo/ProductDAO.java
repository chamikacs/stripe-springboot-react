package com.example.demo;

import com.stripe.model.Price;
import com.stripe.model.Product;

import java.math.BigDecimal;

public class ProductDAO {

    private static final Product[] products;

    static {
        products = new Product[4];

        Product sampleProduct = new Product();
        Price samplePrice = new Price();

        sampleProduct.setName("Puma Shoes");
        sampleProduct.setId("shoe");
        samplePrice.setCurrency("usd");
        samplePrice.setUnitAmountDecimal(BigDecimal.valueOf(2000));
        sampleProduct.setDefaultPriceObject(samplePrice);
        products[0] = sampleProduct;

        sampleProduct = new Product();
        samplePrice = new Price();

        sampleProduct.setName("Nike Sliders");
        sampleProduct.setId("slippers");
        samplePrice.setCurrency("usd");
        samplePrice.setUnitAmountDecimal(BigDecimal.valueOf(1000));
        sampleProduct.setDefaultPriceObject(samplePrice);
        products[1] = sampleProduct;

        sampleProduct = new Product();
        samplePrice = new Price();

        sampleProduct.setName("Apple Music+");
        sampleProduct.setId("music");
        samplePrice.setCurrency("usd");
        samplePrice.setUnitAmountDecimal(BigDecimal.valueOf(499));
        sampleProduct.setDefaultPriceObject(samplePrice);
        products[2] = sampleProduct;

        sampleProduct = new Product();
        samplePrice = new Price();

        sampleProduct.setName("Premium Subscription");
        sampleProduct.setId("premium_subscription");
        samplePrice.setCurrency("usd");
        samplePrice.setUnitAmountDecimal(BigDecimal.valueOf(500));
        sampleProduct.setDefaultPriceObject(samplePrice);
        products[3] = sampleProduct;

    }

    public static Product getProduct(String id) {

        return switch (id) {
            case "shoe" -> products[0];
            case "slippers" -> products[1];
            case "music" -> products[2];
            case "premium_subscription" -> products[3];
            case null, default -> new Product();
        };

    }

    public static Product[] getProducts() {
        return products;
    }

    public static String calculateOrderAmount(Product[] items) {
        long total = 0L;

        for (Product item: items) {
            // Look up the application database to find the prices for the products in the given list
            total += (long) ProductDAO.getProduct(item.getId()).getDefaultPriceObject().getUnitAmountDecimal().floatValue();
        }
        return String.valueOf(total);
    }
}
