import 'package:flutter/cupertino.dart';
import 'package:provider/provider.dart';

import 'package:colorday/views/home_page.dart';
import 'package:colorday/viewmodels/login_viewmodel.dart';

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