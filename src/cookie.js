/*
 ДЗ 7 - Создать редактор cookie с возможностью фильтрации

 7.1: На странице должна быть таблица со списком имеющихся cookie. Таблица должна иметь следующие столбцы:
   - имя
   - значение
   - удалить (при нажатии на кнопку, выбранная cookie удаляется из браузера и таблицы)

 7.2: На странице должна быть форма для добавления новой cookie. Форма должна содержать следующие поля:
   - имя
   - значение
   - добавить (при нажатии на кнопку, в браузер и таблицу добавляется новая cookie с указанным именем и значением)

 Если добавляется cookie с именем уже существующей cookie, то ее значение в браузере и таблице должно быть обновлено

 7.3: На странице должно быть текстовое поле для фильтрации cookie
 В таблице должны быть только те cookie, в имени или значении которых, хотя бы частично, есть введенное значение
 Если в поле фильтра пусто, то должны выводиться все доступные cookie
 Если добавляемая cookie не соответсвует фильтру, то она должна быть добавлена только в браузер, но не в таблицу
 Если добавляется cookie, с именем уже существующей cookie и ее новое значение не соответствует фильтру,
 то ее значение должно быть обновлено в браузере, а из таблицы cookie должна быть удалена

 Запрещено использовать сторонние библиотеки. Разрешено пользоваться только тем, что встроено в браузер
 */

/*
 homeworkContainer - это контейнер для всех ваших домашних заданий
 Если вы создаете новые html-элементы и добавляете их на страницу, то добавляйте их только в этот контейнер

 Пример:
   const newDiv = document.createElement('div');
   homeworkContainer.appendChild(newDiv);
 */
const homeworkContainer = document.querySelector('#homework-container');
// текстовое поле для фильтрации cookie
const filterNameInput = homeworkContainer.querySelector('#filter-name-input');
// текстовое поле с именем cookie
const addNameInput = homeworkContainer.querySelector('#add-name-input');
// текстовое поле со значением cookie
const addValueInput = homeworkContainer.querySelector('#add-value-input');
// кнопка "добавить cookie"
const addButton = homeworkContainer.querySelector('#add-button');
// таблица со списком cookie
const listTable = homeworkContainer.querySelector('#list-table tbody');

function removeCookie() {
  this.removeEventListener('click', removeCookie);
  const [nameCell, valueCell] = this.parentNode.children;
  const nameField = nameCell.textContent;
  const valueField = valueCell.textContent;

  document.cookie = `${nameField}=${valueField}; max-age=0`;

  listTable.removeChild(this.parentNode);
}

function getCookie() {
  const availableCookie = document.cookie;

  if (!availableCookie) {
    return {};
  }

  const cookieObject = availableCookie.split('; ').reduce((prev, cur) => {
    const [name, value] = cur.split('=');

    prev[name] = value;

    return prev;
  }, {});

  return cookieObject;
}

const formattedValue = string => string.split(' ').join('_');

function createRow(cookieName, cookieValue) {
  const fragment = document.createDocumentFragment();
  const row = document.createElement('tr');
  const name = document.createElement('td');
  const value = document.createElement('td');
  const deleteButton = document.createElement('button');

  name.textContent = cookieName;
  value.textContent = cookieValue;
  value.setAttribute('id', formattedValue(cookieName));

  deleteButton.textContent = 'Удалить';
  deleteButton.addEventListener('click', removeCookie);

  fragment.append(name, value, deleteButton);
  row.appendChild(fragment);

  return row;
}

function appendRow(target, row) {
  if (!row) {
    return;
  }
  target.append(row);
}

function renderRow(cookieName, cookieVlaue) {
  const row = createRow(cookieName, cookieVlaue);

  appendRow(listTable, row);
}

filterNameInput.addEventListener('keyup', function() {
  const cookie = getCookie();

  if (!this.value) {
    listTable.innerHTML = '';
    for (const [key, value] of Object.entries(cookie)) {
      renderRow(key, value);
    }

    return;
  }

  const keys = Object.keys(cookie);
  const values = Object.values(cookie);
  const sortedCookies = new Map();

  const filteredKeys = keys.filter(item => item.includes(this.value));
  const filteredValues = values.filter(item => item.includes(this.value));

  if (filteredKeys) {
    filteredKeys.forEach(key => {
      const value = cookie[key];

      sortedCookies.set(key, value);
    });
  }

  if (filteredValues) {
    filteredValues.forEach(value => {
      const array = keys.filter(key => cookie[key] === value);

      if (array.length === 1) {
        sortedCookies.set(array[0], value);
      } else {
        array.forEach(key => {
          sortedCookies.set(key, value);
        });
      }
    });
  }

  listTable.innerHTML = '';
  for (const [cookieName, cookieVlaue] of sortedCookies) {
    renderRow(cookieName, cookieVlaue);
  }
});

addButton.addEventListener('click', () => {
  const nameField = addNameInput.value;
  const valueField = addValueInput.value;

  if (!nameField || !valueField) {
    return;
  }

  if (filterNameInput.value) {
    document.cookie = `${nameField}=${valueField}`;
    const cookie = getCookie();

    const keys = Object.keys(cookie);
    const values = Object.values(cookie);
    const sortedCookies = new Map();

    const filteredKeys = keys.filter(item =>
      item.includes(filterNameInput.value)
    );
    const filteredValues = values.filter(item =>
      item.includes(filterNameInput.value)
    );

    if (filteredKeys) {
      filteredKeys.forEach(key => {
        const value = cookie[key];

        sortedCookies.set(key, value);
      });
    }

    if (filteredValues) {
      filteredValues.forEach(value => {
        const key = keys.find(key => cookie[key] === value);

        sortedCookies.set(key, value);
      });
    }

    listTable.innerHTML = '';
    for (const [cookieName, cookieVlaue] of sortedCookies) {
      renderRow(cookieName, cookieVlaue);
    }

    return;
  }

  const settedCookie = getCookie();

  if (nameField in settedCookie && settedCookie[nameField] === valueField) {
    return;
  }

  if (nameField in settedCookie) {
    const valueCell = document.getElementById(formattedValue(nameField));

    valueCell.textContent = valueField;
    document.cookie = `${nameField}=${valueField}`;

    return;
  }

  document.cookie = `${nameField}=${valueField}`;

  renderRow(nameField, valueField);
});

document.addEventListener('DOMContentLoaded', () => {
  const settedCookie = getCookie();

  for (const [cookieName, cookieValue] of Object.entries(settedCookie)) {
    renderRow(cookieName, cookieValue);
  }
});
