// The mobile UI intentionally favors compact event handlers for mobile flows.
// ignore_for_file: curly_braces_in_flow_control_structures, use_build_context_synchronously, unnecessary_cast

import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:intl/intl.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:shared_preferences/shared_preferences.dart';

const navy = Color(0xFF082B52);
const blue = Color(0xFF0B63CE);
const teal = Color(0xFF0F8B8D);
const amber = Color(0xFFF5A623);
const ink = Color(0xFF132238);
const muted = Color(0xFF64748B);
const canvas = Color(0xFFF5F8FC);

void main() => runApp(const ProcurementApp());

class ProcurementApp extends StatelessWidget {
  const ProcurementApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'TGMSIDC Procurement',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        scaffoldBackgroundColor: canvas,
        colorScheme: ColorScheme.fromSeed(seedColor: blue, primary: blue),
        fontFamily: 'Roboto',
        appBarTheme: const AppBarTheme(
          backgroundColor: canvas,
          foregroundColor: navy,
          elevation: 0,
          centerTitle: false,
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: Colors.white,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: Color(0xFFE1E8F0)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: const BorderSide(color: blue, width: 1.5),
          ),
        ),
        cardTheme: CardThemeData(
          color: Colors.white,
          elevation: 0,
          margin: EdgeInsets.zero,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(18),
            side: const BorderSide(color: Color(0xFFE5ECF4)),
          ),
        ),
      ),
      home: const AppGate(),
    );
  }
}

class AppGate extends StatefulWidget {
  const AppGate({super.key});
  @override
  State<AppGate> createState() => _AppGateState();
}

class _AppGateState extends State<AppGate> {
  late Future<AppContext> _context;

  @override
  void initState() {
    super.initState();
    _context = AppContext.load();
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<AppContext>(
      future: _context,
      builder: (context, snapshot) {
        if (!snapshot.hasData) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }
        if (snapshot.data!.persona == null) {
          return PersonaSetup(
            onSaved: (value) => setState(() => _context = Future.value(value)),
          );
        }
        return HomeShell(appContext: snapshot.data!);
      },
    );
  }
}

enum Persona { facility, approver, procurement, warehouse, executive }

extension PersonaLabel on Persona {
  String get label => switch (this) {
    Persona.facility => 'Facility Officer',
    Persona.approver => 'Approving Authority',
    Persona.procurement => 'Procurement Officer',
    Persona.warehouse => 'Warehouse & QA',
    Persona.executive => 'Executive Viewer',
  };
  String get description => switch (this) {
    Persona.facility => 'Raise indents and follow deliveries',
    Persona.approver => 'Review, approve, and reject indents',
    Persona.procurement => 'Track tenders, RCs, and purchase orders',
    Persona.warehouse => 'Record QA and accept deliveries',
    Persona.executive => 'Monitor KPIs and procurement health',
  };
  IconData get icon => switch (this) {
    Persona.facility => Icons.local_hospital_outlined,
    Persona.approver => Icons.verified_user_outlined,
    Persona.procurement => Icons.account_tree_outlined,
    Persona.warehouse => Icons.inventory_2_outlined,
    Persona.executive => Icons.insights_outlined,
  };
}

class AppContext {
  AppContext({
    required this.persona,
    required this.facilityId,
    required this.facilityName,
    required this.apiUrl,
  });
  final Persona? persona;
  final int? facilityId;
  final String facilityName;
  final String apiUrl;

  static Future<AppContext> load() async {
    final prefs = await SharedPreferences.getInstance();
    final rawPersona = prefs.getString('persona');
    final persona = rawPersona == null
        ? null
        : Persona.values.byName(rawPersona);
    return AppContext(
      persona: persona,
      facilityId: prefs.getInt('facilityId'),
      facilityName: prefs.getString('facilityName') ?? 'All facilities',
      apiUrl:
          prefs.getString('apiUrl') ??
          const String.fromEnvironment(
            'API_BASE_URL',
            defaultValue: 'http://10.0.2.2:8080',
          ),
    );
  }

  Future<AppContext> save({
    Persona? nextPersona,
    int? nextFacilityId,
    String? nextFacilityName,
    String? nextApiUrl,
  }) async {
    final prefs = await SharedPreferences.getInstance();
    final result = AppContext(
      persona: nextPersona ?? persona,
      facilityId: nextFacilityId ?? facilityId,
      facilityName: nextFacilityName ?? facilityName,
      apiUrl: nextApiUrl ?? apiUrl,
    );
    if (result.persona != null)
      await prefs.setString('persona', result.persona!.name);
    if (result.facilityId != null)
      await prefs.setInt('facilityId', result.facilityId!);
    await prefs.setString('facilityName', result.facilityName);
    await prefs.setString('apiUrl', result.apiUrl);
    return result;
  }
}

class ApiException implements Exception {
  ApiException(this.message);
  final String message;
  @override
  String toString() => message;
}

class ApiClient {
  ApiClient(this.baseUrl);
  final String baseUrl;

  Uri _uri(String path, [Map<String, String>? query]) {
    final root = baseUrl.trim().replaceFirst(RegExp(r'/$'), '');
    return Uri.parse('$root/api$path').replace(queryParameters: query);
  }

  Future<dynamic> get(String path, {Map<String, String>? query}) async {
    try {
      final response = await http
          .get(_uri(path, query), headers: {'Accept': 'application/json'})
          .timeout(const Duration(seconds: 12));
      return _decode(response);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException(
        'Could not reach the API. Check the API URL and internet connection.',
      );
    }
  }

  Future<dynamic> send(
    String method,
    String path, [
    Map<String, dynamic>? body,
  ]) async {
    try {
      final request = http.Request(method, _uri(path));
      request.headers.addAll({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      });
      if (body != null) request.body = jsonEncode(body);
      final streamed = await request.send().timeout(
        const Duration(seconds: 12),
      );
      return _decode(await http.Response.fromStream(streamed));
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Request failed. Check the API URL and try again.');
    }
  }

  dynamic _decode(http.Response response) {
    dynamic value;
    try {
      value = response.body.isEmpty ? null : jsonDecode(response.body);
    } catch (_) {
      value = null;
    }
    if (response.statusCode < 200 || response.statusCode >= 300) {
      final message = value is Map && value['error'] != null
          ? value['error'].toString()
          : 'Server returned ${response.statusCode}.';
      throw ApiException(message);
    }
    return value;
  }
}

class PersonaSetup extends StatefulWidget {
  const PersonaSetup({required this.onSaved, super.key});
  final ValueChanged<AppContext> onSaved;
  @override
  State<PersonaSetup> createState() => _PersonaSetupState();
}

class _PersonaSetupState extends State<PersonaSetup> {
  Persona? selected;
  final apiController = TextEditingController();
  int? facilityId;
  String facilityName = 'All facilities';
  List<dynamic> facilities = [];
  bool loading = false;

  @override
  void initState() {
    super.initState();
    AppContext.load().then((value) {
      apiController.text = value.apiUrl;
      if (mounted) setState(() {});
      _loadFacilities(value.apiUrl);
    });
  }

  Future<void> _loadFacilities(String url) async {
    try {
      final data = await ApiClient(url).get('/institutions');
      if (mounted) setState(() => facilities = data is List ? data : []);
    } catch (_) {}
  }

  Future<void> _save() async {
    if (selected == null) return;
    setState(() => loading = true);
    final value = await AppContext.load();
    final saved = await value.save(
      nextPersona: selected,
      nextFacilityId: facilityId,
      nextFacilityName: facilityName,
      nextApiUrl: apiController.text.trim(),
    );
    widget.onSaved(saved);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(24, 36, 24, 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                height: 56,
                width: 56,
                decoration: BoxDecoration(
                  color: navy,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Icon(
                  Icons.medical_services_outlined,
                  color: Colors.white,
                  size: 30,
                ),
              ),
              const SizedBox(height: 28),
              const Text(
                'TGMSIDC',
                style: TextStyle(
                  color: navy,
                  fontSize: 14,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 1.4,
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Procurement,\nconnected.',
                style: TextStyle(
                  color: ink,
                  fontSize: 34,
                  height: 1.05,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 14),
              const Text(
                'Choose an operating view to get started. This is a convenience setting, not secure authorization.',
                style: TextStyle(color: muted, fontSize: 15, height: 1.45),
              ),
              const SizedBox(height: 28),
              const Text(
                'I am using the app as',
                style: TextStyle(fontWeight: FontWeight.w700, color: ink),
              ),
              const SizedBox(height: 12),
              ...Persona.values.map(
                (persona) => Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: InkWell(
                    borderRadius: BorderRadius.circular(16),
                    onTap: () => setState(() => selected = persona),
                    child: Container(
                      padding: const EdgeInsets.all(15),
                      decoration: BoxDecoration(
                        color: selected == persona
                            ? const Color(0xFFE8F1FF)
                            : Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(
                          color: selected == persona
                              ? blue
                              : const Color(0xFFE1E8F0),
                          width: selected == persona ? 1.5 : 1,
                        ),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            persona.icon,
                            color: selected == persona ? blue : muted,
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  persona.label,
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w700,
                                    color: ink,
                                  ),
                                ),
                                const SizedBox(height: 3),
                                Text(
                                  persona.description,
                                  style: const TextStyle(
                                    color: muted,
                                    fontSize: 12,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Icon(
                            selected == persona
                                ? Icons.radio_button_checked
                                : Icons.radio_button_off,
                            color: selected == persona ? blue : muted,
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 14),
              const Text(
                'Facility context',
                style: TextStyle(fontWeight: FontWeight.w700, color: ink),
              ),
              const SizedBox(height: 8),
              DropdownButtonFormField<int?>(
                value: facilityId,
                decoration: const InputDecoration(
                  prefixIcon: Icon(Icons.location_on_outlined),
                  hintText: 'All facilities',
                ),
                items: [
                  const DropdownMenuItem<int?>(
                    value: null,
                    child: Text('All facilities'),
                  ),
                  ...facilities.map(
                    (f) => DropdownMenuItem<int?>(
                      value: asInt(f['id']),
                      child: Text(asText(f['name'], fallback: 'Facility')),
                    ),
                  ),
                ],
                onChanged: (id) {
                  final item = facilities
                      .where((f) => asInt(f['id']) == id)
                      .firstOrNull;
                  setState(() {
                    facilityId = id;
                    facilityName = item == null
                        ? 'All facilities'
                        : asText(item['name']);
                  });
                },
              ),
              const SizedBox(height: 12),
              TextField(
                controller: apiController,
                decoration: const InputDecoration(
                  prefixIcon: Icon(Icons.link),
                  labelText: 'API base URL',
                  hintText: 'https://your-api.example.com',
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'For a physical device, use a reachable HTTPS API URL. Android emulator default is 10.0.2.2:8080.',
                style: TextStyle(color: muted, fontSize: 11),
              ),
              const SizedBox(height: 24),
              FilledButton(
                onPressed: selected == null || loading ? null : _save,
                style: FilledButton.styleFrom(
                  minimumSize: const Size.fromHeight(52),
                  backgroundColor: navy,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                ),
                child: loading
                    ? const SizedBox.square(
                        dimension: 20,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2,
                        ),
                      )
                    : const Text('Open procurement workspace'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class HomeShell extends StatefulWidget {
  const HomeShell({required this.appContext, super.key});
  final AppContext appContext;
  @override
  State<HomeShell> createState() => _HomeShellState();
}

class _HomeShellState extends State<HomeShell> {
  int index = 0;
  late AppContext appContext;
  late ApiClient api;

  @override
  void initState() {
    super.initState();
    appContext = widget.appContext;
    api = ApiClient(appContext.apiUrl);
  }

  void changeContext(AppContext value) => setState(() {
    appContext = value;
    api = ApiClient(value.apiUrl);
  });

  @override
  Widget build(BuildContext context) {
    final pages = [
      DashboardPage(
        appContext: appContext,
        api: api,
        onNavigate: (value) => setState(() => index = value),
      ),
      IndentsPage(appContext: appContext, api: api),
      TrackingPage(api: api),
      MorePage(
        appContext: appContext,
        api: api,
        onContextChanged: changeContext,
      ),
    ];
    return Scaffold(
      body: IndexedStack(index: index, children: pages),
      bottomNavigationBar: NavigationBar(
        selectedIndex: index,
        onDestinationSelected: (value) => setState(() => index = value),
        backgroundColor: Colors.white,
        indicatorColor: const Color(0xFFDCEBFF),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.grid_view_outlined),
            selectedIcon: Icon(Icons.grid_view),
            label: 'Overview',
          ),
          NavigationDestination(
            icon: Icon(Icons.assignment_outlined),
            selectedIcon: Icon(Icons.assignment),
            label: 'Indents',
          ),
          NavigationDestination(
            icon: Icon(Icons.route_outlined),
            selectedIcon: Icon(Icons.route),
            label: 'Tracking',
          ),
          NavigationDestination(
            icon: Icon(Icons.more_horiz),
            selectedIcon: Icon(Icons.more_horiz),
            label: 'More',
          ),
        ],
      ),
    );
  }
}

class DashboardPage extends StatefulWidget {
  const DashboardPage({
    required this.appContext,
    required this.api,
    required this.onNavigate,
    super.key,
  });
  final AppContext appContext;
  final ApiClient api;
  final ValueChanged<int> onNavigate;
  @override
  State<DashboardPage> createState() => _DashboardPageState();
}

class _DashboardPageState extends State<DashboardPage> {
  late Future<List<dynamic>> _data;
  @override
  void initState() {
    super.initState();
    _data = _load();
  }

  Future<List<dynamic>> _load() => Future.wait([
    widget.api.get('/dashboard/summary'),
    widget.api.get('/dashboard/procurement-pipeline'),
    widget.api.get('/dashboard/recent-activity'),
  ]);

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: () async => setState(() => _data = _load()),
      child: FutureBuilder<List<dynamic>>(
        future: _data,
        builder: (context, snapshot) {
          if (snapshot.hasError)
            return ErrorState(
              message: snapshot.error.toString(),
              onRetry: () => setState(() => _data = _load()),
            );
          if (!snapshot.hasData) return const LoadingPage();
          final summary = (snapshot.data![0] as Map).cast<String, dynamic>();
          final pipeline = snapshot.data![1] is List
              ? snapshot.data![1] as List
              : <dynamic>[];
          final activity = snapshot.data![2] is List
              ? snapshot.data![2] as List
              : <dynamic>[];
          return CustomScrollView(
            slivers: [
              SliverToBoxAdapter(
                child: _Header(
                  appContext: widget.appContext,
                  title: 'Good morning',
                ),
              ),
              SliverPadding(
                padding: const EdgeInsets.fromLTRB(16, 4, 16, 20),
                sliver: SliverList(
                  delegate: SliverChildListDelegate([
                    Text(
                      widget.appContext.persona?.label ?? 'Workspace',
                      style: const TextStyle(color: muted, fontSize: 13),
                    ),
                    const SizedBox(height: 18),
                    const Text(
                      'Operations at a glance',
                      style: TextStyle(
                        color: ink,
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 14),
                    GridView.count(
                      crossAxisCount: 2,
                      shrinkWrap: true,
                      physics: const NeverScrollableScrollPhysics(),
                      mainAxisSpacing: 10,
                      crossAxisSpacing: 10,
                      childAspectRatio: 1.45,
                      children: [
                        MetricCard(
                          label: 'Total indents',
                          value: asText(summary['totalIndents']),
                          icon: Icons.assignment_outlined,
                          color: blue,
                        ),
                        MetricCard(
                          label: 'Pending approval',
                          value: asText(summary['pendingApproval']),
                          icon: Icons.pending_actions,
                          color: amber,
                        ),
                        MetricCard(
                          label: 'Active POs',
                          value: asText(summary['activePurchaseOrders']),
                          icon: Icons.receipt_long_outlined,
                          color: teal,
                        ),
                        MetricCard(
                          label: 'QA queue',
                          value: asText(summary['deliveriesPendingQA']),
                          icon: Icons.fact_check_outlined,
                          color: const Color(0xFF7B61FF),
                        ),
                      ],
                    ),
                    const SizedBox(height: 18),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text(
                          'Quick actions',
                          style: TextStyle(
                            color: ink,
                            fontSize: 17,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        TextButton(
                          onPressed: () => widget.onNavigate(1),
                          child: const Text('View indents'),
                        ),
                      ],
                    ),
                    Row(
                      children: [
                        Expanded(
                          child: QuickAction(
                            icon: widget.appContext.persona == Persona.facility
                                ? Icons.add_task
                                : Icons.fact_check_outlined,
                            label: widget.appContext.persona == Persona.facility
                                ? 'New indent'
                                : widget.appContext.persona == Persona.warehouse
                                ? 'QA queue'
                                : 'Review indents',
                            onTap: () {
                              if (widget.appContext.persona ==
                                  Persona.facility) {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => CreateIndentPage(
                                      api: widget.api,
                                      appContext: widget.appContext,
                                    ),
                                  ),
                                );
                              } else if (widget.appContext.persona ==
                                  Persona.warehouse) {
                                Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => QaPage(api: widget.api),
                                  ),
                                );
                              } else {
                                widget.onNavigate(1);
                              }
                            },
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: QuickAction(
                            icon: Icons.qr_code_scanner,
                            label: 'Scan item',
                            onTap: () => Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) => const ScannerPage(),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 22),
                    const Text(
                      'Procurement pipeline',
                      style: TextStyle(
                        color: ink,
                        fontSize: 17,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 12),
                    ...pipeline
                        .take(5)
                        .map(
                          (item) => PipelineRow(
                            item: (item as Map).cast<String, dynamic>(),
                          ),
                        ),
                    const SizedBox(height: 22),
                    const Text(
                      'Recent activity',
                      style: TextStyle(
                        color: ink,
                        fontSize: 17,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                    const SizedBox(height: 12),
                    ...activity
                        .take(5)
                        .map(
                          (item) => ActivityRow(
                            item: (item as Map).cast<String, dynamic>(),
                          ),
                        ),
                  ]),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class IndentsPage extends StatefulWidget {
  const IndentsPage({required this.appContext, required this.api, super.key});
  final AppContext appContext;
  final ApiClient api;
  @override
  State<IndentsPage> createState() => _IndentsPageState();
}

class _IndentsPageState extends State<IndentsPage> {
  late Future<dynamic> _future;
  String filter = 'all';
  @override
  void initState() {
    super.initState();
    _future = _load();
  }

  Future<dynamic> _load() => widget.api.get(
    '/indents',
    query: widget.appContext.facilityId == null
        ? null
        : {'facilityId': '${widget.appContext.facilityId}'},
  );

  Future<void> _action(int id, bool approve) async {
    try {
      await widget.api.send(
        'POST',
        '/indents/$id/${approve ? 'approve' : 'reject'}',
        approve
            ? {'procurementMode': 'tender', 'approvedBy': 'Mobile approver'}
            : {
                'rejectionReason': 'Returned from mobile workspace',
                'rejectedBy': 'Mobile approver',
              },
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(approve ? 'Indent approved' : 'Indent rejected'),
          ),
        );
        setState(() => _future = _load());
      }
    } catch (e) {
      if (mounted)
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Indents',
          style: TextStyle(fontWeight: FontWeight.w800),
        ),
        actions: [
          IconButton(
            onPressed: () => setState(() => _future = _load()),
            icon: const Icon(Icons.refresh),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: navy,
        foregroundColor: Colors.white,
        onPressed: () async {
          await Navigator.push(
            context,
            MaterialPageRoute(
              builder: (_) => CreateIndentPage(
                api: widget.api,
                appContext: widget.appContext,
              ),
            ),
          );
          if (mounted) setState(() => _future = _load());
        },
        icon: const Icon(Icons.add),
        label: const Text('New indent'),
      ),
      body: FutureBuilder<dynamic>(
        future: _future,
        builder: (context, snapshot) {
          if (snapshot.hasError)
            return ErrorState(
              message: snapshot.error.toString(),
              onRetry: () => setState(() => _future = _load()),
            );
          if (!snapshot.hasData) return const LoadingPage();
          final items = snapshot.data is List
              ? snapshot.data as List
              : <dynamic>[];
          final filtered = items
              .where((item) => filter == 'all' || item['status'] == filter)
              .toList();
          return Column(
            children: [
              SizedBox(
                height: 56,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.fromLTRB(16, 10, 16, 8),
                  children: [
                    for (final entry in const {
                      'all': 'All',
                      'pending_approval': 'Needs review',
                      'approved': 'Approved',
                      'rejected': 'Rejected',
                    }.entries)
                      Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: ChoiceChip(
                          label: Text(entry.value),
                          selected: filter == entry.key,
                          onSelected: (_) => setState(() => filter = entry.key),
                        ),
                      ),
                  ],
                ),
              ),
              Expanded(
                child: filtered.isEmpty
                    ? const EmptyState(
                        title: 'No indents found',
                        message:
                            'Create an indent or change the current filter.',
                      )
                    : ListView.separated(
                        padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
                        itemCount: filtered.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 10),
                        itemBuilder: (_, index) {
                          final item = (filtered[index] as Map)
                              .cast<String, dynamic>();
                          final pending = item['status'] == 'pending_approval';
                          return Card(
                            child: Padding(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Expanded(
                                        child: Text(
                                          asText(
                                            item['indentNumber'],
                                            fallback: 'Indent',
                                          ),
                                          style: const TextStyle(
                                            color: navy,
                                            fontWeight: FontWeight.w800,
                                          ),
                                        ),
                                      ),
                                      StatusPill(
                                        status: asText(item['status']),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 10),
                                  Text(
                                    asText(
                                      item['equipmentName'],
                                      fallback: 'Equipment request',
                                    ),
                                    style: const TextStyle(
                                      fontSize: 16,
                                      fontWeight: FontWeight.w700,
                                      color: ink,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    '${asText(item['facilityName'], fallback: 'Facility')}  •  Qty ${asText(item['quantity'], fallback: '—')}',
                                    style: const TextStyle(
                                      color: muted,
                                      fontSize: 13,
                                    ),
                                  ),
                                  const SizedBox(height: 12),
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        formatDate(item['createdAt']),
                                        style: const TextStyle(
                                          color: muted,
                                          fontSize: 12,
                                        ),
                                      ),
                                      if (pending &&
                                          (widget.appContext.persona ==
                                                  Persona.approver ||
                                              widget.appContext.persona ==
                                                  Persona.executive))
                                        Row(
                                          children: [
                                            OutlinedButton(
                                              onPressed: () => _action(
                                                asInt(item['id']),
                                                false,
                                              ),
                                              style: OutlinedButton.styleFrom(
                                                foregroundColor: Colors.red,
                                              ),
                                              child: const Text('Reject'),
                                            ),
                                            const SizedBox(width: 8),
                                            FilledButton(
                                              onPressed: () => _action(
                                                asInt(item['id']),
                                                true,
                                              ),
                                              child: const Text('Approve'),
                                            ),
                                          ],
                                        ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class CreateIndentPage extends StatefulWidget {
  const CreateIndentPage({
    required this.api,
    required this.appContext,
    super.key,
  });
  final ApiClient api;
  final AppContext appContext;
  @override
  State<CreateIndentPage> createState() => _CreateIndentPageState();
}

class _CreateIndentPageState extends State<CreateIndentPage> {
  final formKey = GlobalKey<FormState>();
  final qty = TextEditingController(text: '1');
  final requirements = TextEditingController();
  final digitisedBy = TextEditingController(text: 'Mobile Facility Officer');
  List<dynamic> equipment = [];
  int? equipmentId;
  bool loading = true;
  bool saving = false;

  @override
  void initState() {
    super.initState();
    widget.api
        .get('/equipment')
        .then((data) {
          if (mounted)
            setState(() {
              equipment = data is List ? data : [];
              loading = false;
            });
        })
        .catchError((_) {
          if (mounted) setState(() => loading = false);
        });
  }

  Future<void> submit() async {
    if (!formKey.currentState!.validate() ||
        equipmentId == null ||
        widget.appContext.facilityId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Select a facility and equipment before submitting.'),
        ),
      );
      return;
    }
    setState(() => saving = true);
    try {
      await widget.api.send('POST', '/indents', {
        'facilityId': widget.appContext.facilityId,
        'equipmentId': equipmentId,
        'quantity': int.parse(qty.text),
        'technicalRequirements': requirements.text.trim(),
        'digitisedBy': digitisedBy.text.trim(),
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Indent submitted for approval')),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted)
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(e.toString())));
    } finally {
      if (mounted) setState(() => saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Create indent',
          style: TextStyle(fontWeight: FontWeight.w800),
        ),
      ),
      body: Form(
        key: formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            InfoBanner(
              icon: Icons.location_on_outlined,
              title: widget.appContext.facilityName,
              message: widget.appContext.facilityId == null
                  ? 'Choose a facility in More → Operating context before creating an indent.'
                  : 'Request will be routed to the approval workflow.',
            ),
            const SizedBox(height: 18),
            const Text(
              'Equipment request',
              style: TextStyle(
                color: ink,
                fontSize: 20,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 16),
            DropdownButtonFormField<int>(
              value: equipmentId,
              decoration: const InputDecoration(
                labelText: 'Equipment',
                prefixIcon: Icon(Icons.medical_services_outlined),
              ),
              items: equipment
                  .map(
                    (item) => DropdownMenuItem<int>(
                      value: asInt(item['id']),
                      child: Text(asText(item['name'], fallback: 'Equipment')),
                    ),
                  )
                  .toList(),
              onChanged: loading
                  ? null
                  : (value) => setState(() => equipmentId = value),
              validator: (_) => equipmentId == null ? 'Select equipment' : null,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: qty,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(
                labelText: 'Quantity',
                prefixIcon: Icon(Icons.numbers),
              ),
              validator: (value) => int.tryParse(value ?? '') == null
                  ? 'Enter a valid quantity'
                  : null,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: requirements,
              minLines: 4,
              maxLines: 6,
              decoration: const InputDecoration(
                labelText: 'Technical requirements',
                alignLabelWithHint: true,
                hintText:
                    'Capacity, configuration, warranty, compliance or other specifications',
              ),
              validator: (value) => value == null || value.trim().length < 10
                  ? 'Add the technical requirements'
                  : null,
            ),
            const SizedBox(height: 12),
            TextFormField(
              controller: digitisedBy,
              decoration: const InputDecoration(
                labelText: 'Submitted by',
                prefixIcon: Icon(Icons.person_outline),
              ),
            ),
            const SizedBox(height: 24),
            FilledButton.icon(
              onPressed: saving ? null : submit,
              style: FilledButton.styleFrom(
                backgroundColor: navy,
                minimumSize: const Size.fromHeight(52),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              icon: saving
                  ? const SizedBox.square(
                      dimension: 18,
                      child: CircularProgressIndicator(
                        color: Colors.white,
                        strokeWidth: 2,
                      ),
                    )
                  : const Icon(Icons.send_outlined),
              label: const Text('Submit for approval'),
            ),
          ],
        ),
      ),
    );
  }
}

class TrackingPage extends StatefulWidget {
  const TrackingPage({required this.api, super.key});
  final ApiClient api;
  @override
  State<TrackingPage> createState() => _TrackingPageState();
}

class _TrackingPageState extends State<TrackingPage> {
  int tab = 0;
  late Future<dynamic> future;
  @override
  void initState() {
    super.initState();
    future = _load();
  }

  Future<dynamic> _load() => widget.api.get(
    ['/rate-contracts', '/purchase-orders', '/deliveries'][tab],
  );

  @override
  Widget build(BuildContext context) {
    final labels = ['Rate contracts', 'Purchase orders', 'Deliveries'];
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Procurement tracking',
          style: TextStyle(fontWeight: FontWeight.w800),
        ),
      ),
      body: Column(
        children: [
          SizedBox(
            height: 58,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 10),
              children: [
                for (var i = 0; i < labels.length; i++)
                  Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ChoiceChip(
                      label: Text(labels[i]),
                      selected: tab == i,
                      onSelected: (_) => setState(() {
                        tab = i;
                        future = _load();
                      }),
                    ),
                  ),
              ],
            ),
          ),
          Expanded(
            child: FutureBuilder<dynamic>(
              future: future,
              builder: (context, snapshot) {
                if (snapshot.hasError)
                  return ErrorState(
                    message: snapshot.error.toString(),
                    onRetry: () => setState(() => future = _load()),
                  );
                if (!snapshot.hasData) return const LoadingPage();
                final rows = snapshot.data is List
                    ? snapshot.data as List
                    : <dynamic>[];
                if (rows.isEmpty)
                  return EmptyState(
                    title: 'No ${labels[tab].toLowerCase()}',
                    message: 'Live records will appear here when available.',
                  );
                return ListView.separated(
                  padding: const EdgeInsets.fromLTRB(16, 8, 16, 24),
                  itemCount: rows.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 10),
                  itemBuilder: (_, i) => TrackingCard(
                    data: (rows[i] as Map).cast<String, dynamic>(),
                    type: tab,
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class TrackingCard extends StatelessWidget {
  const TrackingCard({required this.data, required this.type, super.key});
  final Map<String, dynamic> data;
  final int type;
  @override
  Widget build(BuildContext context) {
    final title = asText(
      data[type == 0
          ? 'contractNumber'
          : type == 1
          ? 'poNumber'
          : 'deliveryNumber'],
      fallback: type == 0
          ? 'Rate contract'
          : type == 1
          ? 'Purchase order'
          : 'Delivery',
    );
    final subtitle = asText(
      data[type == 0
          ? 'vendorName'
          : type == 1
          ? 'vendorName'
          : 'purchaseOrderNumber'],
      fallback: asText(data['facilityName'], fallback: 'Procurement record'),
    );
    final status = asText(data['status']);
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    title,
                    style: const TextStyle(
                      color: navy,
                      fontWeight: FontWeight.w800,
                    ),
                  ),
                ),
                StatusPill(status: status),
              ],
            ),
            const SizedBox(height: 10),
            Text(
              subtitle,
              style: const TextStyle(color: ink, fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 6),
            Text(_detail(), style: const TextStyle(color: muted, fontSize: 13)),
          ],
        ),
      ),
    );
  }

  String _detail() {
    if (type == 0)
      return '${asText(data['equipmentName'], fallback: 'Equipment')}  •  Ends ${formatDate(data['endDate'])}';
    if (type == 1)
      return 'Value ${money(data['totalValue'] ?? data['unitPrice'])}  •  Due ${formatDate(data['expectedDeliveryDate'])}';
    return 'QA score ${asText(data['qaComplianceScore'], fallback: 'Pending')}  •  ${formatDate(data['createdAt'])}';
  }
}

class MorePage extends StatelessWidget {
  const MorePage({
    required this.appContext,
    required this.api,
    required this.onContextChanged,
    super.key,
  });
  final AppContext appContext;
  final ApiClient api;
  final ValueChanged<AppContext> onContextChanged;
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'More',
          style: TextStyle(fontWeight: FontWeight.w800),
        ),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(18),
              child: Row(
                children: [
                  CircleAvatar(
                    backgroundColor: const Color(0xFFE4EEFF),
                    foregroundColor: blue,
                    radius: 25,
                    child: Icon(
                      appContext.persona?.icon ?? Icons.person_outline,
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          appContext.persona?.label ?? 'Workspace',
                          style: const TextStyle(
                            color: ink,
                            fontWeight: FontWeight.w800,
                            fontSize: 16,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          appContext.facilityName,
                          style: const TextStyle(color: muted, fontSize: 13),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    onPressed: () async {
                      final value = await Navigator.push<AppContext>(
                        context,
                        MaterialPageRoute(
                          builder: (_) => ContextSettings(initial: appContext),
                        ),
                      );
                      if (value != null) onContextChanged(value);
                    },
                    icon: const Icon(Icons.edit_outlined),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 18),
          const Text(
            'Workspaces',
            style: TextStyle(
              color: ink,
              fontWeight: FontWeight.w800,
              fontSize: 17,
            ),
          ),
          const SizedBox(height: 10),
          MenuTile(
            icon: Icons.fact_check_outlined,
            title: 'QA & acceptance',
            subtitle: 'Review delivery compliance and issue acceptance',
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => QaPage(api: api)),
            ),
          ),
          MenuTile(
            icon: Icons.bar_chart_outlined,
            title: 'Reports & KPIs',
            subtitle: 'Procurement health, cycle time, and performance',
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => ReportsPage(api: api)),
            ),
          ),
          MenuTile(
            icon: Icons.qr_code_scanner,
            title: 'Scan QR / barcode',
            subtitle: 'Open a delivery, PO, or equipment record',
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const ScannerPage()),
            ),
          ),
          MenuTile(
            icon: Icons.settings_outlined,
            title: 'Operating context',
            subtitle: 'Switch persona, facility, or API URL',
            onTap: () async {
              final value = await Navigator.push<AppContext>(
                context,
                MaterialPageRoute(
                  builder: (_) => ContextSettings(initial: appContext),
                ),
              );
              if (value != null) onContextChanged(value);
            },
          ),
          const SizedBox(height: 18),
          InfoBanner(
            icon: Icons.info_outline,
            title: 'Connected workspace',
            message: appContext.apiUrl,
          ),
        ],
      ),
    );
  }
}

class ContextSettings extends StatefulWidget {
  const ContextSettings({required this.initial, super.key});
  final AppContext initial;
  @override
  State<ContextSettings> createState() => _ContextSettingsState();
}

class _ContextSettingsState extends State<ContextSettings> {
  late Persona persona;
  late TextEditingController apiUrl;
  late TextEditingController facility;
  @override
  void initState() {
    super.initState();
    persona = widget.initial.persona ?? Persona.facility;
    apiUrl = TextEditingController(text: widget.initial.apiUrl);
    facility = TextEditingController(text: widget.initial.facilityName);
  }

  @override
  void dispose() {
    apiUrl.dispose();
    facility.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: const Text(
        'Operating context',
        style: TextStyle(fontWeight: FontWeight.w800),
      ),
    ),
    body: ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text(
          'Persona',
          style: TextStyle(
            color: ink,
            fontSize: 17,
            fontWeight: FontWeight.w800,
          ),
        ),
        const SizedBox(height: 10),
        DropdownButtonFormField<Persona>(
          value: persona,
          items: Persona.values
              .map((p) => DropdownMenuItem(value: p, child: Text(p.label)))
              .toList(),
          onChanged: (p) => setState(() => persona = p ?? persona),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: facility,
          decoration: const InputDecoration(
            labelText: 'Facility label',
            prefixIcon: Icon(Icons.location_on_outlined),
          ),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: apiUrl,
          decoration: const InputDecoration(
            labelText: 'API base URL',
            prefixIcon: Icon(Icons.link),
          ),
        ),
        const SizedBox(height: 24),
        FilledButton(
          onPressed: () async => Navigator.pop(
            context,
            await widget.initial.save(
              nextPersona: persona,
              nextFacilityName: facility.text.trim().isEmpty
                  ? 'All facilities'
                  : facility.text.trim(),
              nextApiUrl: apiUrl.text.trim(),
            ),
          ),
          style: FilledButton.styleFrom(
            backgroundColor: navy,
            minimumSize: const Size.fromHeight(52),
          ),
          child: const Text('Save context'),
        ),
      ],
    ),
  );
}

class QaPage extends StatefulWidget {
  const QaPage({required this.api, super.key});
  final ApiClient api;
  @override
  State<QaPage> createState() => _QaPageState();
}

class _QaPageState extends State<QaPage> {
  late Future<dynamic> future;
  @override
  void initState() {
    super.initState();
    future = widget.api.get('/deliveries');
  }

  Future<void> accept(int id) async {
    try {
      await widget.api.send('POST', '/deliveries/$id/accept');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Delivery accepted and certificate issued'),
          ),
        );
        setState(() => future = widget.api.get('/deliveries'));
      }
    } catch (e) {
      if (mounted)
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: const Text(
        'QA & acceptance',
        style: TextStyle(fontWeight: FontWeight.w800),
      ),
    ),
    body: FutureBuilder<dynamic>(
      future: future,
      builder: (context, snapshot) {
        if (snapshot.hasError)
          return ErrorState(
            message: snapshot.error.toString(),
            onRetry: () =>
                setState(() => future = widget.api.get('/deliveries')),
          );
        if (!snapshot.hasData) return const LoadingPage();
        final rows = snapshot.data is List
            ? snapshot.data as List
            : <dynamic>[];
        return ListView.separated(
          padding: const EdgeInsets.all(16),
          itemCount: rows.length,
          separatorBuilder: (_, __) => const SizedBox(height: 10),
          itemBuilder: (_, i) {
            final item = (rows[i] as Map).cast<String, dynamic>();
            final canAccept =
                item['status'] == 'qa_pending' &&
                asInt(item['qaComplianceScore']) >= 100 &&
                item['documentsUploaded'] == true;
            return Card(
              child: Padding(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            asText(
                              item['deliveryNumber'],
                              fallback: 'Delivery #${asText(item['id'])}',
                            ),
                            style: const TextStyle(
                              color: navy,
                              fontWeight: FontWeight.w800,
                            ),
                          ),
                        ),
                        StatusPill(status: asText(item['status'])),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Text(
                      asText(
                        item['purchaseOrderNumber'],
                        fallback: 'Purchase order',
                      ),
                      style: const TextStyle(
                        fontWeight: FontWeight.w700,
                        color: ink,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'QA score: ${asText(item['qaComplianceScore'], fallback: 'Not recorded')}  •  Documents: ${item['documentsUploaded'] == true ? 'Ready' : 'Missing'}',
                      style: const TextStyle(color: muted, fontSize: 13),
                    ),
                    if (canAccept)
                      Align(
                        alignment: Alignment.centerRight,
                        child: FilledButton.icon(
                          onPressed: () => accept(asInt(item['id'])),
                          icon: const Icon(Icons.verified_outlined),
                          label: const Text('Accept delivery'),
                        ),
                      ),
                  ],
                ),
              ),
            );
          },
        );
      },
    ),
  );
}

class ReportsPage extends StatefulWidget {
  const ReportsPage({required this.api, super.key});
  final ApiClient api;
  @override
  State<ReportsPage> createState() => _ReportsPageState();
}

class _ReportsPageState extends State<ReportsPage> {
  late Future<dynamic> future;
  @override
  void initState() {
    super.initState();
    future = widget.api.get('/dashboard/summary');
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: const Text(
        'Reports & KPIs',
        style: TextStyle(fontWeight: FontWeight.w800),
      ),
    ),
    body: FutureBuilder<dynamic>(
      future: future,
      builder: (context, snapshot) {
        if (snapshot.hasError)
          return ErrorState(
            message: snapshot.error.toString(),
            onRetry: () =>
                setState(() => future = widget.api.get('/dashboard/summary')),
          );
        if (!snapshot.hasData) return const LoadingPage();
        final data = (snapshot.data as Map).cast<String, dynamic>();
        final metrics = [
          (
            'Average cycle time',
            '${asText(data['avgProcycleDays'])} days',
            Icons.timelapse,
            blue,
          ),
          (
            'QA rejection rate',
            '${asText(data['qaRejectionRate'])}%',
            Icons.fact_check_outlined,
            teal,
          ),
          (
            'Active rate contracts',
            asText(data['activeRateContracts']),
            Icons.description_outlined,
            amber,
          ),
          (
            'Expiring contracts',
            asText(data['expiringContracts']),
            Icons.warning_amber_outlined,
            Colors.red,
          ),
          (
            'Vendors onboarded',
            asText(data['totalVendors']),
            Icons.storefront_outlined,
            const Color(0xFF7B61FF),
          ),
          (
            'Institutions',
            asText(data['totalInstitutions']),
            Icons.apartment_outlined,
            navy,
          ),
        ];
        return ListView(
          padding: const EdgeInsets.all(16),
          children: [
            const Text(
              'Executive snapshot',
              style: TextStyle(
                color: ink,
                fontSize: 22,
                fontWeight: FontWeight.w800,
              ),
            ),
            const SizedBox(height: 6),
            const Text(
              'Live metrics from the procurement API',
              style: TextStyle(color: muted),
            ),
            const SizedBox(height: 18),
            ...metrics.map(
              (m) => Padding(
                padding: const EdgeInsets.only(bottom: 10),
                child: Card(
                  child: ListTile(
                    leading: CircleAvatar(
                      backgroundColor: (m.$4 as Color).withAlpha(25),
                      foregroundColor: m.$4 as Color,
                      child: Icon(m.$3),
                    ),
                    title: Text(
                      m.$1,
                      style: const TextStyle(color: muted, fontSize: 13),
                    ),
                    subtitle: Text(
                      m.$2,
                      style: const TextStyle(
                        color: ink,
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ],
        );
      },
    ),
  );
}

class ScannerPage extends StatefulWidget {
  const ScannerPage({super.key});
  @override
  State<ScannerPage> createState() => _ScannerPageState();
}

class _ScannerPageState extends State<ScannerPage> {
  bool found = false;
  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(
      title: const Text(
        'Scan QR / barcode',
        style: TextStyle(fontWeight: FontWeight.w800),
      ),
    ),
    body: Stack(
      children: [
        MobileScanner(
          onDetect: (capture) {
            final value = capture.barcodes.firstOrNull?.rawValue;
            if (value != null && !found) setState(() => found = true);
            if (value != null && mounted)
              showModalBottomSheet(
                context: context,
                builder: (_) => Padding(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Code detected',
                        style: TextStyle(
                          color: ink,
                          fontSize: 20,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(value, style: const TextStyle(color: muted)),
                      const SizedBox(height: 18),
                      FilledButton(
                        onPressed: () => Navigator.pop(context),
                        child: const Text('Done'),
                      ),
                    ],
                  ),
                ),
              );
          },
        ),
        Center(
          child: Container(
            width: 260,
            height: 180,
            decoration: BoxDecoration(
              border: Border.all(color: Colors.white, width: 3),
              borderRadius: BorderRadius.circular(18),
            ),
          ),
        ),
        const Positioned(
          bottom: 35,
          left: 30,
          right: 30,
          child: Text(
            'Align the code inside the frame',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
          ),
        ),
      ],
    ),
  );
}

class _Header extends StatelessWidget {
  const _Header({required this.appContext, required this.title});
  final AppContext appContext;
  final String title;
  @override
  Widget build(BuildContext context) => SafeArea(
    child: Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Row(
        children: [
          Container(
            height: 44,
            width: 44,
            decoration: BoxDecoration(
              color: navy,
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Icon(
              Icons.medical_services_outlined,
              color: Colors.white,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(color: muted, fontSize: 12)),
                Text(
                  'TGMSIDC Procurement',
                  style: const TextStyle(
                    color: navy,
                    fontSize: 17,
                    fontWeight: FontWeight.w800,
                  ),
                ),
              ],
            ),
          ),
          CircleAvatar(
            backgroundColor: const Color(0xFFE4EEFF),
            foregroundColor: navy,
            child: Text((appContext.persona?.label ?? 'W').substring(0, 1)),
          ),
        ],
      ),
    ),
  );
}

class MetricCard extends StatelessWidget {
  const MetricCard({
    required this.label,
    required this.value,
    required this.icon,
    required this.color,
    super.key,
  });
  final String label, value;
  final IconData icon;
  final Color color;
  @override
  Widget build(BuildContext context) => Card(
    child: Padding(
      padding: const EdgeInsets.all(14),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                value,
                style: const TextStyle(
                  color: ink,
                  fontSize: 25,
                  fontWeight: FontWeight.w800,
                ),
              ),
              Icon(icon, color: color),
            ],
          ),
          Text(label, style: const TextStyle(color: muted, fontSize: 12)),
        ],
      ),
    ),
  );
}

class QuickAction extends StatelessWidget {
  const QuickAction({
    required this.icon,
    required this.label,
    required this.onTap,
    super.key,
  });
  final IconData icon;
  final String label;
  final VoidCallback onTap;
  @override
  Widget build(BuildContext context) => InkWell(
    onTap: onTap,
    borderRadius: BorderRadius.circular(16),
    child: Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE1E8F0)),
      ),
      child: Row(
        children: [
          Icon(icon, color: blue),
          const SizedBox(width: 10),
          Flexible(
            child: Text(
              label,
              style: const TextStyle(color: ink, fontWeight: FontWeight.w700),
            ),
          ),
        ],
      ),
    ),
  );
}

class PipelineRow extends StatelessWidget {
  const PipelineRow({required this.item, super.key});
  final Map<String, dynamic> item;
  @override
  Widget build(BuildContext context) {
    final percentage = (asDouble(item['percentage']) / 100).clamp(0.0, 1.0);
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  asText(item['stage']),
                  style: const TextStyle(
                    color: ink,
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              Text(
                asText(item['count']),
                style: const TextStyle(color: muted, fontSize: 12),
              ),
            ],
          ),
          const SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(6),
            child: LinearProgressIndicator(
              value: percentage,
              minHeight: 7,
              backgroundColor: const Color(0xFFE7EEF6),
              color: blue,
            ),
          ),
        ],
      ),
    );
  }
}

class ActivityRow extends StatelessWidget {
  const ActivityRow({required this.item, super.key});
  final Map<String, dynamic> item;
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 12),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Container(
          height: 34,
          width: 34,
          decoration: BoxDecoration(
            color: const Color(0xFFE8F1FF),
            borderRadius: BorderRadius.circular(10),
          ),
          child: const Icon(Icons.bolt, color: blue, size: 18),
        ),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                asText(item['description'], fallback: 'Procurement activity'),
                style: const TextStyle(
                  color: ink,
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 3),
              Text(
                formatDate(item['timestamp']),
                style: const TextStyle(color: muted, fontSize: 11),
              ),
            ],
          ),
        ),
      ],
    ),
  );
}

class StatusPill extends StatelessWidget {
  const StatusPill({required this.status, super.key});
  final String status;
  @override
  Widget build(BuildContext context) {
    final normalized = status.toLowerCase();
    final color =
        normalized.contains('reject') ||
            normalized.contains('fail') ||
            normalized.contains('cancel')
        ? Colors.red
        : normalized.contains('pending')
        ? amber
        : normalized.contains('accept') ||
              normalized == 'approved' ||
              normalized == 'active' ||
              normalized == 'delivered'
        ? teal
        : blue;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 5),
      decoration: BoxDecoration(
        color: color.withAlpha(24),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        status.replaceAll('_', ' '),
        style: TextStyle(
          color: color,
          fontSize: 11,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}

class MenuTile extends StatelessWidget {
  const MenuTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
    super.key,
  });
  final IconData icon;
  final String title, subtitle;
  final VoidCallback onTap;
  @override
  Widget build(BuildContext context) => Card(
    margin: const EdgeInsets.only(bottom: 10),
    child: ListTile(
      onTap: onTap,
      leading: CircleAvatar(
        backgroundColor: const Color(0xFFE8F1FF),
        foregroundColor: blue,
        child: Icon(icon),
      ),
      title: Text(
        title,
        style: const TextStyle(color: ink, fontWeight: FontWeight.w700),
      ),
      subtitle: Text(
        subtitle,
        style: const TextStyle(color: muted, fontSize: 12),
      ),
      trailing: const Icon(Icons.chevron_right),
    ),
  );
}

class InfoBanner extends StatelessWidget {
  const InfoBanner({
    required this.icon,
    required this.title,
    required this.message,
    super.key,
  });
  final IconData icon;
  final String title, message;
  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(14),
    decoration: BoxDecoration(
      color: const Color(0xFFE8F1FF),
      borderRadius: BorderRadius.circular(14),
    ),
    child: Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: blue),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  color: navy,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 3),
              Text(
                message,
                style: const TextStyle(color: navy, fontSize: 12, height: 1.35),
              ),
            ],
          ),
        ),
      ],
    ),
  );
}

class LoadingPage extends StatelessWidget {
  const LoadingPage({super.key});
  @override
  Widget build(BuildContext context) =>
      const Center(child: CircularProgressIndicator());
}

class ErrorState extends StatelessWidget {
  const ErrorState({required this.message, required this.onRetry, super.key});
  final String message;
  final VoidCallback onRetry;
  @override
  Widget build(BuildContext context) => Center(
    child: Padding(
      padding: const EdgeInsets.all(28),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.cloud_off_outlined, color: muted, size: 42),
          const SizedBox(height: 12),
          const Text(
            'Workspace unavailable',
            style: TextStyle(
              color: ink,
              fontSize: 18,
              fontWeight: FontWeight.w800,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            message.replaceFirst('Exception: ', ''),
            textAlign: TextAlign.center,
            style: const TextStyle(color: muted, fontSize: 13),
          ),
          const SizedBox(height: 16),
          OutlinedButton.icon(
            onPressed: onRetry,
            icon: const Icon(Icons.refresh),
            label: const Text('Try again'),
          ),
        ],
      ),
    ),
  );
}

class EmptyState extends StatelessWidget {
  const EmptyState({required this.title, required this.message, super.key});
  final String title, message;
  @override
  Widget build(BuildContext context) => Center(
    child: Padding(
      padding: const EdgeInsets.all(32),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(Icons.inbox_outlined, color: muted, size: 42),
          const SizedBox(height: 12),
          Text(
            title,
            style: const TextStyle(
              color: ink,
              fontWeight: FontWeight.w800,
              fontSize: 18,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            message,
            textAlign: TextAlign.center,
            style: const TextStyle(color: muted, fontSize: 13),
          ),
        ],
      ),
    ),
  );
}

String asText(dynamic value, {String fallback = '—'}) =>
    value == null || value.toString().isEmpty ? fallback : value.toString();
int asInt(dynamic value) =>
    value is int ? value : int.tryParse(value?.toString() ?? '') ?? 0;
double asDouble(dynamic value) => value is num
    ? value.toDouble()
    : double.tryParse(value?.toString() ?? '') ?? 0;
String formatDate(dynamic value) {
  if (value == null) return 'Date not set';
  final parsed = DateTime.tryParse(value.toString());
  return parsed == null
      ? value.toString()
      : DateFormat('dd MMM yyyy').format(parsed.toLocal());
}

String money(dynamic value) =>
    value == null ? '—' : '₹${NumberFormat('#,##0').format(asDouble(value))}';
