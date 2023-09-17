import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:http/http.dart' as http;

import 'package:colorday/models/user_model.dart';
import 'package:colorday/views/login_page.dart';
import 'package:colorday/views/home_page.dart';
import 'package:colorday/viewmodels/login_viewmodel.dart';


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
    return MaterialApp(
      home: FutureBuilder<bool>(
        future: _checkToken(context),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            // 비동기 작업이 진행 중인 동안 로딩 화면 표시
            return const Scaffold(
              body: Center(
                child: CircularProgressIndicator(),
              ),
            );
          } else if (snapshot.hasError) {
            // 에러 처리
            return Scaffold(
              body: Center(
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
              return LoginPage();
            }
          }
        },
      ),
      theme: ThemeData(
        useMaterial3: true,
        primaryColor: Colors.white,
      ),
    );
  }
}