import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import 'package:colorday/views/home_page.dart';
import 'package:colorday/viewmodels/login_viewmodel.dart';

class LoginPage extends StatelessWidget {
  LoginPage({super.key});

  final _formKey = GlobalKey<FormState>();
  final TextEditingController emailController = TextEditingController();
  final TextEditingController passwordController = TextEditingController();

  Future<bool> _handleLogin(BuildContext context) async {
    final viewModel = Provider.of<LoginViewModel>(context, listen: false);

    final loginSuccess = await viewModel.login();


    if (loginSuccess) {
      return true;
    } else {
      return false;
    }
  }

  @override
  Widget build(BuildContext context) {
    final viewModel = Provider.of<LoginViewModel>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('로그인 페이지'),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: <Widget>[
              TextFormField(
                controller: emailController,
                decoration: const InputDecoration(
                  border: OutlineInputBorder(),
                  labelText: '이메일',
                ),
                keyboardType: TextInputType.emailAddress,
                textInputAction: TextInputAction.next,
                onChanged: (value) => viewModel.setEmail(value),
                validator:(value) {
                  if (value!.isEmpty) {
                    return '이메일을 입력해주세요.';
                  }
                  if (!RegExp(r"^[a-zA-Z0-9.a-zA-Z0-9.!#$%&'*+-/=?^_`{|}~]+@[a-zA-Z0-9]+\.[a-zA-Z]+").hasMatch(value)) {
                    return '이메일 형식이 올바르지 않습니다.';
                  }
                  return null;
                },
              ),
              const SizedBox(height: 16.0),
              TextFormField(
                controller: passwordController,
                decoration: const InputDecoration(
                  border: OutlineInputBorder(),
                  labelText: '비밀번호',
                ),
                keyboardType: TextInputType.visiblePassword,
                textInputAction: TextInputAction.done,
                obscureText: true,
                onChanged: (value) => viewModel.setPassword(value),
                validator: (value) => value!.isEmpty ? '비밀번호를 입력해주세요.' : null,
              ),
              const SizedBox(height: 32.0),
              FilledButton(
                onPressed: () async {
                  if (_formKey.currentState!.validate()) {
                    bool isSuccess = await _handleLogin(context); // 로그인 처리 함수 호출
                    if (isSuccess) {
                      // 로그인에 성공한 경우
                      if (!context.mounted) return;
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('로그인에 성공했습니다.'),
                        ),
                      );
                      if (!context.mounted) return;
                      Navigator.of(context).pushReplacement(
                        MaterialPageRoute(
                          builder: (context) => const HomePage(),
                        ),
                      );
                    } else {
                      // 로그인에 실패한 경우
                      if (!context.mounted) return;
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('로그인에 실패했습니다.'),
                        ),
                      );
                      emailController.clear();
                      passwordController.clear();
                      viewModel.setEmail('');
                      viewModel.setPassword('');
                    }
                  }
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