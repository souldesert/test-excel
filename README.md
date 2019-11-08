# Тестовое задание

## Описание

Нужно сделать небольшой сайт.
При входе на сайт мы видим пустую таблицу 5 на 5 ячеек. В каждую ячейку мы можем вводить текстовые строки.
Под таблицей (или в меню, или еще где-то) есть следующие кнопки:

1. **Изменить размер таблицы**. При нажатии на нее мы можем указать новое кол-во столбцов и строк и применить изменения. При этом размер таблицы меняется на новый, а введенные данные, если они есть, сохраняются в тех ячейках, которые остались после изменения.
1. **Импортировать из CSV-файла**. При нажатии выбираем файл и загружаем. При этом на основе данных создается новая таблица с данными нужного размера. Старые данные теряются.
1. **Экспортировать в CSV-файл**. При нажатии сохраняем введенные данные в файл.
1. **Рассчитать**. При этом обрабатывается содержимое таблицы и ниже выводится результат – вторая таблица такого же размера с полученными данными расчетов (описано ниже).

### Расчеты

В ячейках таблицы могут быть либо вещественные числа, либо формулы.
Формулы могут содержать четыре математические операции: +, -, * и /, скобки, а также числа и/или номера ячеек (по аналогии с Excel). Приоритеты операций нужно соблюдать.
Например, содержимое ячеек может быть следующим:

1. 123
1. 7.55
1. 3+7
1. 22*3-10
1. А1*20+А2/А3
1. (1+2)/(4-1)

Нужно обработать значения ячеек и в таблице с результатом вывести рассчитанные значения.
Если значение из исходной таблицы в какой-то ячейке не может быть обработано, то нужно подкрасить ячейку красным цветом.
При этом в таблице с результатом в соответствующей ячейке нужно вывести причину ошибки.
Должна быть возможность экспортировать в CSV-файл таблицу с результатом вычислений.

Например, для исходной таблицы размером 2 на 2.

#### Вход

|| A | B |
| :---: | :---: | :---: |
| 1 | 7 | A1-1 |
| 2 | A1+B1 | A2-1 |

#### Выход

|| A | B |
| :---: | :---: | :---: |
| 1 | 7 | 6 |
| 2 | 13 | 12 |

При этом для парсинга и расчета формул нельзя использовать регулярки, сторонние библиотеки и т.п. Алгоритм разбора формул нужно написать самому.

## Инструментарий

Сделано на Angular 8 c использованием следующих библиотек:

* Handsontable - для реализации таблиц
* Angular Material - элементы UI
* Papaparse - парсинг CSV
* ngx-mat-file-input - input для загрузки файла

Исходное Angular-приложение обернуто в Java-приложение для возможности сборки
в `war`-архив. Для этого был использован `frontend-maven-plugin`.

## Описание приложения

По умолчанию доступна для взаимодействия таблица 5х5.

### Валидация

Осуществляется валидация вводимых в ячейки значений с помощью регулярного выражения - разрешено вводить только цифры, латинские буквы, скобки и знаки операций. Если в ячейку будет введено неверное значение, отобразится окно с предупреждением.

### Изменение размера таблицы

Доступно изменение количества столбцов и строк таблицы. По умолчанию, максимальный размер таблицы - 20х20.

### Импорт из CSV-файла

Парсинг CSV реализован с помощью библиотеки Papaparse. Приложение позволяет импортировать CSV файлы с разделителями `,` и `;`. Также возможен импорт TSV файлов.

### Экспорт в CSV-файл

Реализован экспорт данных, введенных в таблицу, в CSV файл.

### Расчет

Реализована возможность расчета введенных в таблицу выражений. Расчет осуществляется соответствующим
[бэкенд-сервисом](https://github.com/souldesert/excel-backend).

После того, как расчет результата завершен, значение ячейки отображается в соответствующей ячейке в таблице результата. Если возникла ошибка, в ячейку записывается описание ошибки, а исходная ячейка в первоначальной таблице помечается красным цветом. 

Результат расчета можно экспортировать в CSV файл (функционал аналогичен таковому для исходной таблицы)

## Развертывание
1. Выполнить `mvn clean package`;
1. Получившийся `war`-архив задеплоить на сервер, поддерживающий сервлеты (тестировалось с Jetty и Wildfly)

Приложение будет доступно по адресу `http://<hostname>/<deployment-name>` 
