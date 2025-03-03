import 'package:flutter/material.dart';
import 'package:stripe_app/common_button.dart';
import 'package:stripe_app/stripe_service.dart';

class MyHomePage extends StatefulWidget {
  const MyHomePage({super.key});

  @override
  State<MyHomePage> createState() => _MyHomePageState();
}

class _MyHomePageState extends State<MyHomePage> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Stripe Payments With Flutter & Java '),
      ),
      body: SizedBox(
        width: double.infinity,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            CommonButton(
                label: "Integrated Checkout",
                onPressed: () async {
                  print("Integrated Checkout");
                  String? clientSecret =
                      await StripeService().createPaymentIntent();
                  if (clientSecret != null) {
                    StripeService().redirectToStripeCheckout(clientSecret);
                  }
                },
                color: Colors.blue),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}
