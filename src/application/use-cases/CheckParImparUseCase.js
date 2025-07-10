export class CheckParImparUseCase {
  execute(inputNumber) {
    const number = Number(inputNumber);
    if (typeof inputNumber === 'undefined' || inputNumber === null || inputNumber === '' || isNaN(number)) {
      throw new TypeError('Error, no se aceptan datos invalidos que no sean numeros reales');
    }
    if (!Number.isInteger(number)) {
      throw new TypeError('Error, No se aceptan numeros decimales, intente de nuevo con numeros enteros');
    }
    if (number < 0) {
      throw new TypeError('Error, No se aceptan numeros negativos');
    }
    if (number === 0) {
      throw new TypeError('Error, No se puede verificar la paridad de 0');
    }
    const parity = number % 2 === 0 ? 'par' : 'impar';
    return { number, parity };
  }
}
