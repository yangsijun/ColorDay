import 'package:flutter/cupertino.dart';

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