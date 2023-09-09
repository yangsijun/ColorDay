import 'package:flutter/material.dart';
import 'package:colorday/models/day_color_model.dart';

class DayColorViewModel extends ChangeNotifier {
  final DayColorModel _model;

  DayColorViewModel(this._model);

  DateTime get date => _model.date;

  bool get isToday => _model.isToday;

  Color? get color => _model.color;

  String? get description => _model.description;

  void setColor(Color? value) {
    _model.color = value;
    notifyListeners();
  }

  void setDescription(String? value) {
    _model.description = value;
    notifyListeners();
  }
}