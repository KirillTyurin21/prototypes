import 'package:flutter/material.dart';
import 'core/theme/app_theme.dart';
import 'core/router/app_router.dart';
import 'dev_panel/dev_panel_shell.dart';

/// Корневой виджет приложения КСО
class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
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
  }
}
