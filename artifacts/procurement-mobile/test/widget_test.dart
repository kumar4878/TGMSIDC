import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:tgmsidc_procurement/main.dart';

void main() {
  testWidgets('shows the procurement workspace setup', (tester) async {
    await tester.pumpWidget(MaterialApp(home: PersonaSetup(onSaved: (_) {})));
    await tester.pump();

    expect(find.text('TGMSIDC'), findsOneWidget);
    expect(find.text('Procurement,\nconnected.'), findsOneWidget);
    expect(find.text('Open procurement workspace'), findsOneWidget);
  });
}
