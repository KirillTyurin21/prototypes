import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

/// Главная страница — витрина Flutter-прототипов
class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final screenWidth = MediaQuery.of(context).size.width;
    final crossAxisCount = screenWidth > 900 ? 3 : (screenWidth > 600 ? 2 : 1);

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          // Hero Header
          SliverToBoxAdapter(
            child: _buildHeader(context, theme),
          ),
          // Сетка прототипов
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 24),
            sliver: SliverGrid(
              gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: crossAxisCount,
                mainAxisSpacing: 20,
                crossAxisSpacing: 20,
                childAspectRatio: 1.6,
              ),
              delegate: SliverChildListDelegate([
                _PrototypeCard(
                  title: 'КСО Прототип',
                  description: 'Касса самообслуживания — экраны заказа, оплаты и выдачи',
                  icon: Icons.point_of_sale_rounded,
                  color: theme.colorScheme.primary,
                  route: '/kso',
                  status: 'В разработке',
                ),
                _PrototypeCard(
                  title: 'Скоро...',
                  description: 'Новые Flutter-прототипы будут добавлены здесь',
                  icon: Icons.rocket_launch_rounded,
                  color: theme.colorScheme.secondary,
                  route: null,
                  status: 'Планирование',
                ),
              ]),
            ),
          ),
          // Footer
          SliverToBoxAdapter(
            child: _buildFooter(context, theme),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(BuildContext context, ThemeData theme) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            theme.colorScheme.primary,
            theme.colorScheme.primary.withValues(alpha: 0.8),
            const Color(0xFF1565C0),
          ],
        ),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 48),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Навигация назад
          TextButton.icon(
            onPressed: () {
              // Переход к Angular-части сайта
            },
            icon: const Icon(Icons.arrow_back_rounded, color: Colors.white70),
            label: const Text(
              '← К основным прототипам',
              style: TextStyle(color: Colors.white70),
            ),
          ),
          const SizedBox(height: 24),
          // Заголовок
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(
                  Icons.flutter_dash,
                  color: Colors.white,
                  size: 36,
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Flutter-прототипы',
                      style: theme.textTheme.headlineLarge?.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      'Интерактивные прототипы приложений на Flutter Web',
                      style: theme.textTheme.bodyLarge?.copyWith(
                        color: Colors.white.withValues(alpha: 0.85),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 24),
          // Чипы технологий
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _TechChip(label: 'Flutter 3.44', icon: Icons.flutter_dash),
              _TechChip(label: 'Material 3', icon: Icons.palette_rounded),
              _TechChip(label: 'Dart 3.12', icon: Icons.code_rounded),
              _TechChip(label: 'GoRouter', icon: Icons.route_rounded),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildFooter(BuildContext context, ThemeData theme) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 24),
      child: Column(
        children: [
          const Divider(),
          const SizedBox(height: 16),
          Text(
            'Flutter Web • view21.ru/flutter',
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }
}

/// Карточка прототипа
class _PrototypeCard extends StatefulWidget {
  final String title;
  final String description;
  final IconData icon;
  final Color color;
  final String? route;
  final String status;

  const _PrototypeCard({
    required this.title,
    required this.description,
    required this.icon,
    required this.color,
    required this.route,
    required this.status,
  });

  @override
  State<_PrototypeCard> createState() => _PrototypeCardState();
}

class _PrototypeCardState extends State<_PrototypeCard> {
  bool _isHovered = false;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isClickable = widget.route != null;

    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      cursor: isClickable ? SystemMouseCursors.click : SystemMouseCursors.basic,
      child: GestureDetector(
        onTap: isClickable ? () => context.go(widget.route!) : null,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          curve: Curves.easeOut,
          transform: _isHovered && isClickable
              ? (Matrix4.identity()..translate(0.0, -4.0))
              : Matrix4.identity(),
          decoration: BoxDecoration(
            color: theme.colorScheme.surface,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: _isHovered && isClickable
                  ? widget.color.withValues(alpha: 0.5)
                  : theme.colorScheme.outlineVariant.withValues(alpha: 0.5),
            ),
            boxShadow: _isHovered && isClickable
                ? [
                    BoxShadow(
                      color: widget.color.withValues(alpha: 0.15),
                      blurRadius: 20,
                      offset: const Offset(0, 8),
                    ),
                  ]
                : [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.04),
                      blurRadius: 8,
                      offset: const Offset(0, 2),
                    ),
                  ],
          ),
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: widget.color.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(widget.icon, color: widget.color, size: 28),
                  ),
                  const Spacer(),
                  _StatusBadge(status: widget.status, color: widget.color),
                ],
              ),
              const SizedBox(height: 16),
              Text(
                widget.title,
                style: theme.textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                widget.description,
                style: theme.textTheme.bodyMedium?.copyWith(
                  color: theme.colorScheme.onSurfaceVariant,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Бейдж статуса
class _StatusBadge extends StatelessWidget {
  final String status;
  final Color color;

  const _StatusBadge({required this.status, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Text(
        status,
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w500,
          color: color,
        ),
      ),
    );
  }
}

/// Чип технологии
class _TechChip extends StatelessWidget {
  final String label;
  final IconData icon;

  const _TechChip({required this.label, required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withValues(alpha: 0.25)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: Colors.white.withValues(alpha: 0.9)),
          const SizedBox(width: 6),
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: Colors.white.withValues(alpha: 0.9),
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
      ),
    );
  }
}
