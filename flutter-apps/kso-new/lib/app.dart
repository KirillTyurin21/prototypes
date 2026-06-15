import 'package:flutter/material.dart';
import 'core/theme/app_theme.dart';
import 'core/router/app_router.dart';
import 'dev_panel/dev_panel_shell.dart';
import 'shared/session/session_service.dart';

/// Корневой виджет приложения КСО
class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    final session = SessionService();

    return ListenableBuilder(
      listenable: session,
      builder: (context, _) {
        // Ждём инициализации сессии
        if (!session.isInitialized) {
          return const MaterialApp(
            home: Scaffold(
              backgroundColor: Colors.black,
              body: Center(child: CircularProgressIndicator()),
            ),
          );
        }

        // Нет доступа — экран «Введите код»
        if (!session.isAuthenticated) {
          return MaterialApp(
            title: 'КСО Киоск',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.dark,
            darkTheme: AppTheme.dark,
            themeMode: ThemeMode.dark,
            home: const _AccessDeniedScreen(),
          );
        }

        // Есть доступ — основное приложение
        return MaterialApp.router(
          title: 'КСО Киоск',
          debugShowCheckedModeBanner: false,
          theme: AppTheme.dark,
          darkTheme: AppTheme.dark,
          themeMode: ThemeMode.dark,
          routerConfig: AppRouter.router,
          builder: (context, child) {
            if (child == null) return const SizedBox.shrink();
            return DevPanelShell(child: child);
          },
        );
      },
    );
  }
}

/// Экран «Нет доступа» — показывается, если нет валидной сессии
class _AccessDeniedScreen extends StatelessWidget {
  const _AccessDeniedScreen();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.lock_outline, size: 64, color: Colors.white38),
              const SizedBox(height: 24),
              Text(
                'Доступ ограничен',
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.9),
                  fontSize: 24,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                'Используйте ссылку с кодом доступа,\nпредоставленную администратором.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.5),
                  fontSize: 16,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
