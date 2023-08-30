import 'package:flutter/material.dart';

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
  final DateTime date;
  final bool isToday;
  final Color? backgroundColor;

  const DayWidget({
    super.key,
    required this.date,
    required this.isToday,
    this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(8.0),
      
      child: Container(        
        alignment: Alignment.center,
        decoration: BoxDecoration(
          border: (isToday)
              ? Border.all(
                color: Theme.of(context).colorScheme.primary,
                width: 3,
              )
              : null,
          borderRadius: BorderRadius.circular(10),
          boxShadow: [
            BoxShadow(
              color: Colors.grey.shade300,
              offset: const Offset(3.0, 3.0),
              blurRadius: 3.0,
              spreadRadius: 1.0,
            ),
            const BoxShadow(
              color: Colors.white,
              offset: Offset(-3.0, 3.0),
              blurRadius: 3.0,
              spreadRadius: 1.0,
            ),
          ]
        ),
        child: Center(
          child: Text(
            (date.month == 1 && date.day == 1)
                ? '${date.year}\n${date.month}/${date.day}'
                : (date.day == 1)
                    ? '${date.month}/${date.day}'
                    : '${date.day}',
            style: Theme.of(context).textTheme.titleLarge!.copyWith(
              color: backgroundColor != null
                  ? backgroundColor!.computeLuminance() > .5
                      ? Colors.black
                      : Colors.white
                  : Theme.of(context).colorScheme.onSurface,
              fontWeight: FontWeight.bold
            ),
            textAlign: TextAlign.center,
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

  @override
  void initState() {
    super.initState();
    minDate = widget.today.subtract(const Duration(days: 364));
    maxDate = widget.today;

    int minDateWeekDay = minDate.weekday % DateTime.daysPerWeek;
    int maxDateWeekDay = maxDate.weekday % DateTime.daysPerWeek;
    days = List.generate(365 + minDateWeekDay + DateTime.daysPerWeek - maxDateWeekDay - 1, (index) {
      if (index < maxDateWeekDay + 1) {
        return Container();
      }
      final date = maxDate.subtract(Duration(days: index - maxDateWeekDay - 1));
      return DayWidget(
        date: date,
        isToday: date.year == widget.today.year &&
            date.month == widget.today.month &&
            date.day == widget.today.day,
      );
    });

    widget.scrollController.addListener(() {
      if (widget.scrollController.position.pixels ==
          widget.scrollController.position.maxScrollExtent) {
        setState(() {
          for (int i = 0; i < DateTime.daysPerWeek * 10; i++) {
            final date = minDate.subtract(Duration(days: i));
            days.add(DayWidget(date: date, isToday: false));
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