enum ModifierType {
  singleSelect,
  multiSelect,
}

class Modifier {
  final String id;
  final String name;
  final int extraPrice;

  const Modifier({
    required this.id,
    required this.name,
    this.extraPrice = 0,
  });
}

class ModifierGroup {
  final String id;
  final String name;
  final ModifierType type;
  final bool isRequired;
  final List<Modifier> options;
  final String? defaultOptionId;

  const ModifierGroup({
    required this.id,
    required this.name,
    required this.type,
    this.isRequired = false,
    required this.options,
    this.defaultOptionId,
  });
}
