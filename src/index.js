/* ДЗ 2 - работа с массивами и объектами */

/*
 Задание 1:

 Напишите аналог встроенного метода forEach для работы с массивами
 Посмотрите как работает forEach и повторите это поведение для массива, который будет передан в параметре array
 */
function forEach(array, fn) {
  for (let i = 0; i < array.length; i++) {
    const element = array[i];

    fn(element, i, array);
  }
}

/*
 Задание 2:

 Напишите аналог встроенного метода map для работы с массивами
 Посмотрите как работает map и повторите это поведение для массива, который будет передан в параметре array
 */
function map(array, fn) {
  const mappedArray = [];

  for (let i = 0; i < array.length; i++) {
    const element = array[i];

    const returnedValue = fn(element, i, array);

    mappedArray.push(returnedValue);
  }

  return mappedArray;
}

/*
 Задание 3:

 Напишите аналог встроенного метода reduce для работы с массивами
 Посмотрите как работает reduce и повторите это поведение для массива, который будет передан в параметре array
 */
function reduce(array, fn, initial) {
  const copiedArray = [...array];
  let accumulator = initial ? initial : copiedArray.shift();

  for (let i = 0; i < copiedArray.length; i++) {
    const currentElement = copiedArray[i];
    let index = initial ? i : i + 1;

    accumulator = fn(accumulator, currentElement, index, array);
  }

  return accumulator;
}

/*
 Задание 4:

 Функция должна перебрать все свойства объекта, преобразовать их имена в верхний регистр и вернуть в виде массива

 Пример:
   upperProps({ name: 'Сергей', lastName: 'Петров' }) вернет ['NAME', 'LASTNAME']
 */
function upperProps(obj) {
  return Object.keys(obj).map(prop => prop.toUpperCase());
}

/*
 Задание 5 *:

 Напишите аналог встроенного метода slice для работы с массивами
 Посмотрите как работает slice и повторите это поведение для массива, который будет передан в параметре array
 */
const validateRange = (range, length) => (range >= 0 ? range : length + range);

function slice(array, from, to) {
  const slicedArray = [];
  const validFrom = validateRange(from, array.length) || 0;
  const validTo = validateRange(to, array.length) - 1 || array.length - 1;

  for (let i = 0; i < array.length; i++) {
    if (i < validFrom || i > validTo) {
      continue;
    }
    const element = array[i];

    slicedArray.push(element);
  }

  return slicedArray;
}

/*
 Задание 6 *:

 Функция принимает объект и должна вернуть Proxy для этого объекта
 Proxy должен перехватывать все попытки записи значений свойств и возводить это значение в квадрат
 */
function createProxy(obj) {
  const proxiedObj = new Proxy(obj, {
    set(target, prop, value) {
      target[prop] = value * value;

      return this;
    },
  });

  return proxiedObj;
}

export { forEach, map, reduce, upperProps, slice, createProxy };
