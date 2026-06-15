/// Данные сессии, декодированные из серверного токена.
///
/// Токен имеет формат: base64url(JSON).HMAC-SHA256(payload)
/// Payload — открытый JSON, HMAC проверяется только на сервере.
class SessionPayload {
  final String type; // 'master' | 'group' | 'proto'
  final List<String> slugs; // доступные slugs
  final int exp; // время истечения (Unix ms)
  final int gen; // поколение токена

  const SessionPayload({
    required this.type,
    required this.slugs,
    required this.exp,
    required this.gen,
  });

  /// Создать из JSON-мапы
  factory SessionPayload.fromJson(Map<String, dynamic> json) {
    return SessionPayload(
      type: (json['type'] as String?) ?? '',
      slugs: (json['slugs'] as List<dynamic>?)
              ?.map((e) => e.toString())
              .toList() ??
          [],
      exp: (json['exp'] as num?)?.toInt() ?? 0,
      gen: (json['gen'] as num?)?.toInt() ?? 1,
    );
  }

  /// Не истёк ли токен
  bool get isExpired => exp > 0 && DateTime.now().millisecondsSinceEpoch > exp;

  /// Мастер-доступ (все прототипы)
  bool get isMaster => slugs.contains('*');

  /// Есть ли доступ к конкретному slug
  bool hasAccess(String slug) => isMaster || slugs.contains(slug);
}
