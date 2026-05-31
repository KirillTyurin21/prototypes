import 'package:flutter/material.dart';
import '../common/kso_back_button.dart';

class KsoProductImage extends StatelessWidget {
  final String imageAsset;
  final VoidCallback? onBackTap;
  final String? heroTag;

  const KsoProductImage({
    super.key,
    required this.imageAsset,
    this.onBackTap,
    this.heroTag,
  });

  @override
  Widget build(BuildContext context) {
    Widget image = Container(
      color: const Color(0xFF2A2A2A),
      child: const Center(
        child: Icon(Icons.local_cafe, size: 80, color: Color(0xFF555555)),
      ),
    );

    if (heroTag != null) {
      image = Hero(tag: heroTag!, child: image);
    }

    return SizedBox(
      height: MediaQuery.of(context).size.height * 0.45,
      width: double.infinity,
      child: Stack(
        fit: StackFit.expand,
        children: [
          image,
          Positioned(
            top: MediaQuery.of(context).padding.top + 8,
            left: 16,
            child: KsoBackButton(onPressed: onBackTap),
          ),
        ],
      ),
    );
  }
}
