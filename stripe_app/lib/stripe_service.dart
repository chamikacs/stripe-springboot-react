import 'dart:developer';

import 'package:dio/dio.dart';
import 'package:stripe_app/product_model.dart';
import 'package:url_launcher/url_launcher.dart';

class StripeService {
  Future<String?> createPaymentIntent() async {
    final model = ProductModel(
      id: "shoe",
      name: "Puma Shoes",
      description: "Premium Shoes",
      image: ["https://source.unsplash.com/NUoPWImmjCU"],
      price: 20,
      quantity: 1,
    );
    final reqModel = {
      "items": [model.toJson()],
      "customerName": "chamika",
      "customerEmail": "chamika@gmail.com",
      "invoiceNeeded": false
    };
    try {
      final response = await Dio().post(
        "http://localhost:8080/checkout/hosted",
        options: Options(
          headers: {
            "Content-Type": "application/json",
          },
        ),
        data: reqModel,
      );
      return response.data;
      // return responseData['clientSecret'];
    } catch (e) {
      log(e.toString());
      return null;
    }
  }

  Future<void> redirectToStripeCheckout(String sessionUrl) async {
    if (await canLaunchUrl(Uri.parse(sessionUrl))) {
      await launchUrl(Uri.parse(sessionUrl),
          mode: LaunchMode.externalApplication);
    } else {
      throw 'Could not launch $sessionUrl';
    }
  }
}
