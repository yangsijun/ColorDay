import 'package:colorday/viewmodels/day_color_viewmodel.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_colorpicker/flutter_colorpicker.dart';

import 'package:colorday/models/day_color_model.dart';
import 'package:provider/provider.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});


  @override
  Widget build(BuildContext context) {
    ScrollController scrollController = ScrollController();
    return Scaffold(
      appBar: AppBar(
        title: const Text('홈 페이지'),
      ),
      body: ColorCalendar(
        today: DateTime.now(),
        scrollController: scrollController,
      ),
    );
  }
}

class DayWidget extends StatelessWidget {
  const DayWidget({super.key});

  @override
  Widget build(BuildContext context) {
    final viewmodel = Provider.of<DayColorViewModel>(context);
    Color? newColor;
    TextEditingController descriptionController = TextEditingController(text: viewmodel.description);

    return Padding(
      padding: const EdgeInsets.all(8.0),
      
      child: GestureDetector(
        onTap: () {
          // show dialog
          showDialog(
            context: context,
            builder: (context) {
              return Dialog.fullscreen(
                child: Scaffold(
                  appBar: AppBar(
                    leading: IconButton(
                      onPressed: () {
                        Navigator.pop(context);
                      },
                      icon: const Icon(Icons.close),
                    ),
                    title: const Text('Color 기록하기')
                  ),
                  body: ListView(
                    padding: const EdgeInsets.all(16.0),
                    children: [
                      Text(
                        '${viewmodel.date.year}년 ${viewmodel.date.month}월 ${viewmodel.date.day}일',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      Center(
                        child: SizedBox(
                          width: 480,
                          child: ColorPicker(
                            pickerColor: viewmodel.color ?? Colors.white,
                            onColorChanged: (pickedColor) {
                              newColor = pickedColor;
                            },
                            pickerAreaHeightPercent: 0.7,
                            enableAlpha: false,
                            labelTypes: const [
                              ColorLabelType.rgb,
                              ColorLabelType.hsv,
                            ],
                            displayThumbColor: true,
                            colorPickerWidth: 480,
                            paletteType: PaletteType.hueWheel,
                            pickerAreaBorderRadius: const BorderRadius.only(
                              topLeft: Radius.circular(2.0),
                              topRight: Radius.circular(2.0),
                            ),
                            hexInputBar:  false,
                          ),
                        ),
                      ),
                      TextField(
                        controller: descriptionController,
                        decoration: const InputDecoration(
                          border: OutlineInputBorder(),
                          labelText: '메모',
                        ),
                        maxLength: 30,
                      ),
                      FilledButton(
                        onPressed: () {
                          viewmodel.setColor(newColor ?? viewmodel.color ?? Colors.white);
                          viewmodel.setDescription(descriptionController.text);
                          Navigator.pop(context);
                        },
                        child: const Text('저장'),
                      ),
                    ]
                  )
                )
              );
            },
          );
        },
        child: Container(        
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: viewmodel.color ?? Colors.white,
            border: (viewmodel.isToday)
                ? Border.all(
                  color: Theme.of(context).colorScheme.primary,
                  width: 3,
                )
                : (viewmodel.color == null)
                ? Border.all(color: Colors.grey, width: 2)
                : null,
            borderRadius: BorderRadius.circular(10),
            boxShadow: [
              (viewmodel.color != null)
                  ? BoxShadow(
                    color: Colors.grey.shade300,
                    offset: const Offset(3.0, 3.0),
                    blurRadius: 3.0,
                    spreadRadius: 1.0,
                  )
                  : const BoxShadow(
                    offset: Offset.zero,
                  ),
            ]
          ),
          child: Center(
            child: Text(
              (viewmodel.date.month == 1 && viewmodel.date.day == 1)
                  ? '${viewmodel.date.year}\n${viewmodel.date.month}/${viewmodel.date.day}'
                  : (viewmodel.date.day == 1)
                      ? '${viewmodel.date.month}/${viewmodel.date.day}'
                      : '${viewmodel.date.day}',
              style: Theme.of(context).textTheme.titleLarge!.copyWith(
                color: (viewmodel.color == null)
                ? Colors.grey
                : (viewmodel.color!.computeLuminance() > .5)
                    ? Colors.black
                    : Colors.white,
                fontWeight: FontWeight.bold
              ),
              textAlign: TextAlign.center,
            ),
          ),
        ),
      ),
    );
  }
}

class ColorCalendar extends StatefulWidget  {
  final DateTime today;
  final dynamic scrollController;

  const ColorCalendar({
    super.key,
    required this.today,
    required this.scrollController,
  });

  @override
  ColorCalendarState createState() => ColorCalendarState();
}

class ColorCalendarState extends State<ColorCalendar> {
  late DateTime minDate;
  late final DateTime maxDate;
  List<Widget> days = [];
  List<DayColorModel?> dayModels = [];

  @override
  void initState() {
    super.initState();
    minDate = widget.today.subtract(const Duration(days: 364));
    maxDate = widget.today;

    int minDateWeekDay = minDate.weekday % DateTime.daysPerWeek;
    int maxDateWeekDay = maxDate.weekday % DateTime.daysPerWeek;
    dayModels = List.generate(
      365 + minDateWeekDay + DateTime.daysPerWeek - maxDateWeekDay - 1,
      (index) {
        if (index < maxDateWeekDay + 1) {
          return null;
        }
        final date = maxDate.subtract(Duration(days: index - maxDateWeekDay - 1));
        return DayColorModel(
          date: date,
          isToday: date.year == widget.today.year &&
              date.month == widget.today.month &&
              date.day == widget.today.day,
        );
      }
    );
    days = List.generate(365 + minDateWeekDay + DateTime.daysPerWeek - maxDateWeekDay - 1, (index) {
      if (dayModels[index] == null) {
        return Container();
      }
      return ChangeNotifierProvider(
        create: (_) => DayColorViewModel(dayModels[index]!),
        child: const DayWidget(),
      );
    });

    widget.scrollController.addListener(() {
      if (widget.scrollController.position.pixels ==
          widget.scrollController.position.maxScrollExtent) {
        DateTime date = minDate;
        int index = dayModels.length - 1;
        setState(() {
          for (int i = 0; i < DateTime.daysPerWeek * 10; i++) {
            dayModels.add(
              DayColorModel(
                date: date.subtract(Duration(days: i)),
                isToday: false,
              )
            );
            days.add(
              ChangeNotifierProvider(
                create: (_) => DayColorViewModel(dayModels[index + i + 1]!),
                child: const DayWidget(),
              ),
            );
          }
          minDate = minDate.subtract(const Duration(days: DateTime.daysPerWeek * 10));
        });
      }
    });
  }

  @override
  void dispose() {
    widget.scrollController.dispose(); // 사용이 끝나면 ScrollController를 해제합니다.
    super.dispose();
  }  

  @override
  Widget build(BuildContext context) {
    double calendarCrossAxisSpacing = 0;
    double calendarMainAxisSpacing = 0;

    return GridView.builder(
      reverse: true,
      controller: widget.scrollController,
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 7,
        crossAxisSpacing: calendarCrossAxisSpacing,
        mainAxisSpacing: calendarMainAxisSpacing,
      ),
      itemCount: days.length,
      itemBuilder: (context, index) {
        return days[index - index % DateTime.daysPerWeek + (DateTime.daysPerWeek - index % DateTime.daysPerWeek) - 1];
      },
    );
  }
}