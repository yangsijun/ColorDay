import 'dart:convert';

import 'package:flutter/cupertino.dart';
import 'package:provider/provider.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class UserModel {
  String email = '';
  String password = '';
}

class LoginViewModel extends ChangeNotifier {
  final UserModel _userModel;
  String _token = '';

  LoginViewModel(this._userModel);

  String get email => _userModel.email;

  void setEmail(String value) {
    _userModel.email = value;
    notifyListeners();
  }

  String get password => _userModel.password;

  void setPassword(String value) {
    _userModel.password = value;
    notifyListeners();
  }

  String get token => _token;

  Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', token);
    _token = token;
    notifyListeners();
  }

  Future<void> loadToken() async {
    final prefs = await SharedPreferences.getInstance();
    _token = prefs.getString('token') ?? '';
    notifyListeners();
  }

  Future<void> deleteToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    _token = '';
    notifyListeners();
  }

  Future<bool> login() async {
    var url = Uri.https('colorday.sijun.dev', '/api/auth/login');
    var response = await http.post(url, body: {
      'email': email,
      'password': password,
    });

    if (response.statusCode == 200) {
      final token = jsonDecode(response.body)['token'];
      await saveToken(token);
      return true;
    } else {
      return false;
    }
  }
}

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => LoginViewModel(UserModel())),
      ],
      child: const App(),
    ),
  );
}

class App extends StatelessWidget {
  const App({super.key});

  Future<bool> _checkToken(BuildContext context) async {
    final viewModel = Provider.of<LoginViewModel>(context, listen: false);
    await viewModel.loadToken();

    final token = viewModel.token;

    if (token.isNotEmpty) {
      var url = Uri.https('colorday.sijun.dev', '/api/auth/authenticate');
      final response = await http.get(
        url,
        headers: {'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        return true;
      } else {
        await viewModel.deleteToken();
        return false;
      }
    } else {
      return false;
    }
  }

  @override
  Widget build(BuildContext context) {
    return CupertinoApp(
      home: FutureBuilder<bool>(
        future: _checkToken(context),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            // 비동기 작업이 진행 중인 동안 로딩 화면 표시
            return const CupertinoPageScaffold(
              child: Center(
                child: CupertinoActivityIndicator(),
              ),
            );
          } else if (snapshot.hasError) {
            // 에러 처리
            return CupertinoPageScaffold(
              child: Center(
                child: Text('오류 발생: ${snapshot.error}'),
              ),
            );
          } else {
            // 작업이 완료되면 상태에 따라 페이지를 렌더링
            if (snapshot.data == true) {
              // 토큰이 유효한 경우
              return const HomePage();
            } else {
              // 토큰이 없거나 유효하지 않은 경우
              return const LoginPage();
            }
          }
        },
      ),
    );
  }
}

class LoginPage extends StatelessWidget {
  const LoginPage({super.key});

  Future<void> _handleLogin(BuildContext context) async {
    final viewModel = Provider.of<LoginViewModel>(context, listen: false);

    final loginSuccess = await viewModel.login();


    if (loginSuccess) {
      // 로그인이 성공한 경우
      if (!context.mounted) return;
      Navigator.of(context).pushReplacement(
        CupertinoPageRoute(
          builder: (context) => const HomePage(),
        ),
      );
    } else {
      // 로그인이 실패한 경우
      if (!context.mounted) return;
      showCupertinoDialog(
        context: context,
        builder: (context) => CupertinoAlertDialog(
          title: const Text('로그인 실패'),
          content: const Text('유효하지 않은 이메일 또는 비밀번호입니다.'),
          actions: <Widget>[
            CupertinoDialogAction(
              child: const Text('확인'),
              onPressed: () {
                Navigator.of(context).pop(); // currentContext 사용
              },
            ),
          ],
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final viewModel = Provider.of<LoginViewModel>(context);

    return CupertinoPageScaffold(
      navigationBar: const CupertinoNavigationBar(
        middle: Text('로그인 페이지'),
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              CupertinoTextField(
                placeholder: '이메일',
                onChanged: (value) => viewModel.setEmail(value),
              ),
              const SizedBox(height: 16.0),
              CupertinoTextField(
                placeholder: '비밀번호',
                obscureText: true,
                onChanged: (value) => viewModel.setPassword(value),
              ),
              const SizedBox(height: 32.0),
              CupertinoButton.filled(
                onPressed: () async {
                  _handleLogin(context); // 로그인 처리 함수 호출
                },
                child: const Text('로그인'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return const CupertinoPageScaffold(
      navigationBar: CupertinoNavigationBar(
        middle: Text('홈 페이지'),
      ),
      child: Center(
        child: Text('환영합니다! 홈 페이지입니다.'),
      ),
    );
  }
}