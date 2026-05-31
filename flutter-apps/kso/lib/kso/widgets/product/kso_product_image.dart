import 'package:flutter/material.dart';
import '../../theme/kso_colors.dart';
import '../common/kso_back_button.dart';

class KsoProductImage extends StatelessWidget {
  final String imageUrl;
  final VoidCallback? onBackTap;
  final String? heroTag;

  const KsoProductImage({
    super.key,
    required this.imageUrl,
    this.onBackTap,
    this.heroTag,
  });

  @override
  Widget build(BuildContext context) {
    Widget image = imageUrl.isNotEmpty
        ? Image.network(
            imageUrl,
            fit: BoxFit.cover,
            errorBuilder: (_, __, ___) => _placeholder(),
          )
        : _placeholder();

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

  Widget _placeholder() {
    return Container(
      color: KsoColors.surfaceVariant,
      child: Center(
        child: Icon(Icons.local_cafe, size: 80, color: KsoColors.textSecondary),
      ),
    );
  }
}
