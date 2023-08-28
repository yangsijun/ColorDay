import 'dart:convert';

import 'package:colorday/models/user_model.dart';
import 'package:flutter/cupertino.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

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