import 'package:flutter/material.dart';

class DayColorModel {
  DateTime date;
  bool isToday;
  Color? color;
  String? description;

  DayColorModel({
    required this.date,
    required this.isToday,
    this.color,
    this.description,
  });
}