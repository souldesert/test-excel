import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ExcelService {

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

  private normalize(expr: string): string {
    return expr.replace(/\s/g, "").toUpperCase();
  }

  private tokenize(expr: string): string[] {
    let tokens: string[] = [];
    let token: string = '';

    for (let char of expr) {
      // если символ - знак операции
      if (this.operations.indexOf(char) > -1) {
        // и перед ним шло число
        if (token.length > 0) {
          // то сохраняем токен считанного операнда и токен операции, токен обнуляем                   
          tokens.push(token);
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
                throw new Error('Неопознанный унарный оператор');
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
    }
    return tokens;
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
    console.log("RPN finished");
    return outputQueue.concat(stack.reverse());
  }

  private compute(exprRPN: string[]): number {
    while (true) {
      for (let token of exprRPN) {
        if (this.functions.has(token)) {
          let opLeft: number = Number(exprRPN[exprRPN.indexOf(token) - 2]);
          let opRight: number = Number(exprRPN[exprRPN.indexOf(token) - 1]);
          console.log(opLeft + token + opRight);
          let result: number = this.functions.get(token)(opLeft, opRight);

          exprRPN.splice(exprRPN.indexOf(token) - 2, 3, result.toString());
          console.log(exprRPN);
          break;
        }
      }

      if (exprRPN.length == 1) {
        break;
      }
    }
    return Number(exprRPN[0]);
  }

  computeCell(inputString: string): string {
    if (inputString == null) {
      return null;
    } 
    let normalized = this.normalize(inputString);
    let tokens = this.tokenize(normalized);
    let exprConverted = this.convertToRPN(tokens);
    return this.compute(exprConverted).toString();
  }

}
