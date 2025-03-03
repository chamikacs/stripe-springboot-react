import 'package:flutter/material.dart';

class CommonButton extends StatefulWidget {
  final String label;
  final VoidCallback onPressed;
  final Color color;
  const CommonButton(
      {super.key,
      required this.label,
      required this.onPressed,
      required this.color});

  @override
  State<CommonButton> createState() => _CommonButtonState();
}

class _CommonButtonState extends State<CommonButton> {
  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: widget.onPressed,
      style: ElevatedButton.styleFrom(
        backgroundColor: widget.color,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(10), // Rounded corners
        ),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      ),
      child: Text(widget.label),
    );
  }
}
