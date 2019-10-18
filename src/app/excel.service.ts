import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

  private maxIterations: number = 50;

  private operations: string[] = ['+', '-', '*', '/', '(', ')'];

  private precedence: Map<string, number> = new Map()
    .set("(", 0)
    .set(")", 0)
    .set("-", 1)
    .set("+", 1)
    .set("*", 2)
    .set("/", 2);

  private functions = new Map<string, Function>()
    .set("-", (a: number, b: number): number => { return a - b; })
    .set("+", (a: number, b: number): number => { return a + b; })
    .set("*", (a: number, b: number): number => { return a * b; })
    .set("/", (a: number, b: number): number => { return a / b; });

  public normalize(expr: string): string {
    return expr.replace(/\s/g, "").toUpperCase();
  }

  private tokenize(expr: string): [number[], string[]] {
    let tokens: string[] = [];
    let token: string = '';

    // added
    let refs: number[] = [];

    for (let char of expr) {
      // если символ - знак операции
      if (this.operations.indexOf(char) > -1) {
        // и перед ним шло число
        if (token.length > 0) {
          // то сохраняем токен считанного операнда и токен операции, токен обнуляем                   
          tokens.push(token);

          // added - если операнд -  не число а ссылка
          if (isNaN(Number(token))) {
            refs.push(tokens.length - 1);
          }
          tokens.push(char);
          token = '';
          // если перед знаком не шло число, то это либо начало выражения, либо ранее был символ операции
        } else {
          // если это начало выражения (либо подвыражения в скобках), то это может быть унарный оператор или открывающая скобка, все остальное ошибочно
          if (tokens.length == 0 || tokens[tokens.length - 1] == '(') {
            switch (char) {
              case '-':
                tokens.push('0');
                tokens.push(char);
                break;
              case '+':
                break;
              case '(':
                tokens.push(char);
                break;
              case ')':
                throw new Error('Закрывающая скобка расположена некорректно');
              default:
                throw new Error('Неопознанный унарный оператор ' + char);
            }

            // если ранее шла закрывающая скобка
          } else if (tokens[tokens.length - 1] == ')') {
            tokens.push(char);
            // если ранее шла операция (кроме скобок)
          } else if (this.operations.indexOf(tokens[tokens.length - 1]) > -1) {
            switch (char) {
              case '(':
                tokens.push(char);
                break;
              case ')':
                throw new Error('Закрывающая скобка расположена некорректно');
              default:
                throw new Error('Два или более оператора подряд');
            }
            // если ранее шли числа
          } else {
            tokens.push(char);
          }

        }

      } else {
        token += char;
      }
    }
    if (token.length > 0) {
      tokens.push(token);
      if (isNaN(Number(token))) {
        refs.push(tokens.length - 1);
      }
    }
    return [refs, tokens];
  }

  private convertToRPN(inputQueue: string[]): string[] {
    let stack: string[] = [];
    let outputQueue: string[] = [];

    for (let token of inputQueue) {
      switch (token) {
        case '(':
          stack.push(token);
          break;
        case ')':
          while (stack[stack.length - 1] != '(') {
            let popped: string | undefined = stack.pop();
            if (typeof popped == "string") {
              outputQueue.push(popped);
            } else {
              throw new Error("В выражении либо неверно поставлен разделитель, либо не согласованы скобки");
            }
          }
          stack.pop();
          break;
        default:
          if (this.precedence.has(token)) {
            if (stack.length > 0) {
              while (true) {
                let topOfStack: string | undefined = stack[stack.length - 1];
                if ((typeof topOfStack == "string") && (this.precedence.get(topOfStack) >= this.precedence.get(token))) {
                  outputQueue.push(stack.pop());
                } else {
                  break;
                }
              }
            }
            stack.push(token);
          } else {
            outputQueue.push(token);
          }
          break;
      }
    }
    return outputQueue.concat(stack.reverse());
  }

  private compute(expr: string[]): string {

    while (true) {
      for (let token of expr) {
        if (this.functions.has(token)) {
          let opLeft: number = +expr[expr.indexOf(token) - 2];
          let opRight: number = +expr[expr.indexOf(token) - 1];
          let result: number = this.functions.get(token)(opLeft, opRight);

          expr.splice(expr.indexOf(token) - 2, 3, result.toString());
          break;
        }
      }

      if (expr.length == 1) {
        break;
      }
    }
    return expr[0];
  }

  private processCells(preparedTable: Map<string, Cell>): number {
    let doneCellsCounter: number = 0;

    for (let cellItem of preparedTable) {
      let cell: Cell = cellItem[1];
      if (cell.status == "processing") {

        // итерация по массиву, который может уменьшаться
        for (let i: number = 0; i < cell.refs.length;) {
          let refElement: string = cell.expr[cell.refs[i]];
          let referenceCell: Cell | undefined = preparedTable.get(refElement);
          if (typeof referenceCell == "undefined") {
            cell.errorMsg = "Ссылка на несуществующую ячейку, либо неизвестный символ";
            cell.status = "error";
            break;
          } else {
            if (refElement == cellItem[0]) {
              cell.errorMsg = "Ошибка рекурсии";
              cell.status = "error";
            }
            if (referenceCell.status == "done") {
              // меняем ссылку на число, удаляем ссылку
              cell.expr[cell.refs[i]] = referenceCell.result;

              // удаляем первый элемент массива, счетчик не инкрементируем - на следующей итерации
              // будет обрабатываться первый элемент уже измененного массива
              cell.refs.shift();

              if (!cell.refs.length) {
                // todo добавить обработку ошибок
                cell.exprPRN = this.convertToRPN(cell.expr);
                cell.result = this.compute(cell.exprPRN);
                cell.status = "done";
                doneCellsCounter++;
              }
            } else {
              // инкрементируем только в том случае, если данную ссылку не удалось "отработать"
              i++;
            }
          }
        }
      } else {
        doneCellsCounter++;
      }
    }
    return doneCellsCounter;
  }

  computeTable(inputTable: Map<string, string>): Map<string, Cell> {
    let parsedTable: Map<string, Cell> = this.parseTable(inputTable);

    for (let i: number = 0; i < this.maxIterations; i++) {
      if (this.processCells(parsedTable) == parsedTable.size) {
        return parsedTable;
      }
    }
    for (let cellItem of parsedTable) {
      let cell: Cell = cellItem[1];
      if (cell.status == "processing") {
        cell.status = "error";
        cell.errorMsg = "Ошибка рекурсии";
      }
    }
    return parsedTable;
  }

  private parseTable(table: Map<string, string>): Map<string, Cell> {
    let result = new Map();

    for (let element of table) {
      let currentCell: Cell = new Cell();

      try {
        let normalized: string = this.normalize(element[1]);
        let parseResult: [number[], string[]] = this.tokenize(normalized);
        currentCell.refs = parseResult[0];
        currentCell.expr = parseResult[1];

        if (!currentCell.refs.length) {
          // todo добавить обработку ошибок
          currentCell.exprPRN = this.convertToRPN(currentCell.expr);
          currentCell.result = this.compute(currentCell.exprPRN);
          currentCell.status = "done";
        }


      } catch (e) {
        currentCell.status = "error";
        currentCell.errorMsg = e.message;
      }
      result.set(element[0], currentCell);

      // result.set(element[0], convertToPRN(parse(element[1])))
    }

    return result;
  }

}

type Status = "processing" | "done" | "error";

export class Cell {
  private _refs: number[];
  private _exprPRN: string[];
  private _expr: string[];
  private _status: Status;
  private _result: string;
  private _errorMsg: string;


  constructor() {
    this._refs = [];
    this._expr = [];
    this._exprPRN = [];
    this._status = "processing";
    this._errorMsg = "";
    this._result = "";
  }

  get refs(): number[] {
    return this._refs;
  }

  set refs(refs: number[]) {
    this._refs = refs;
  }

  get expr(): string[] {
    return this._expr;
  }

  set expr(expr: string[]) {
    this._expr = expr;
  }

  get exprPRN(): string[] {
    return this._exprPRN;
  }

  set exprPRN(exprPRN: string[]) {
    this._exprPRN = exprPRN;
  }

  get status(): Status {
    return this._status;
  }

  set status(status: Status) {
    this._status = status;
  }

  get errorMsg(): string {
    return this._errorMsg;
  }

  set errorMsg(errorMsg: string) {
    this._errorMsg = errorMsg;
  }


  get result(): string {
    return this._result;
  }

  set result(result: string) {
    this._result = result;
  }

}


