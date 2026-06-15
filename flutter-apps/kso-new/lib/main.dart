import 'package:flutter/material.dart';
import 'app.dart';
import 'shared/session/session_service.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  // Инициализируем сессию до запуска приложения
  SessionService().init();
  runApp(const App());
}

