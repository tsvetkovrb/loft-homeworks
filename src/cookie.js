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

/** Helper functions */

const formatTextToIDValue = text => text.split(' ').join('_');

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

function createRow(cookieName, cookieValue) {
  const fragment = document.createDocumentFragment();
  const row = document.createElement('tr');
  const name = document.createElement('td');
  const value = document.createElement('td');
  const deleteButton = document.createElement('button');

  name.textContent = cookieName;
  value.textContent = cookieValue;
  value.setAttribute('id', formatTextToIDValue(cookieName));

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

function renderRows(cookie) {
  const itterableItem = cookie instanceof Map ? cookie : Object.entries(cookie);

  for (const [key, value] of itterableItem) {
    renderRow(key, value);
  }
}

function clearTable() {
  listTable.innerHTML = '';
}

function filterCookie(cookie, searcheableCookie) {
  const filteredCookie = new Map();

  const keys = Object.keys(cookie);
  const values = Object.values(cookie);

  const filteredKeys = keys.filter(item => item.includes(searcheableCookie));
  const filteredValues = values.filter(item => item.includes(searcheableCookie));

  if (filteredKeys) {
    filteredKeys.forEach(key => {
      const value = cookie[key];

      filteredCookie.set(key, value);
    });
  }

  if (filteredValues) {
    filteredValues.forEach(value => {
      const [key, ...restKeys] = keys.filter(key => cookie[key] === value);

      if (!restKeys.length) {
        filteredCookie.set(key, value);
      } else {
        [key, ...restKeys].forEach(key => {
          filteredCookie.set(key, value);
        });
      }
    });
  }

  return filteredCookie;
}

function setCookie(cookieName, cookieValue) {
  document.cookie = `${cookieName}=${cookieValue}`;
}

function changeCookieValue(nameField, valueField) {
  const valueCell = document.getElementById(formatTextToIDValue(nameField));

  valueCell.textContent = valueField;
  setCookie(nameField, valueField);
}

function renderFilteredCookie(cookie, searcheableCookie) {
  const filteredCookie = filterCookie(cookie, searcheableCookie);

  clearTable();
  renderRows(filteredCookie);
}

/** Main logic */

document.addEventListener('DOMContentLoaded', () => {
  filterNameInput.addEventListener('keyup', function() {
    const cookie = getCookie();

    if (!this.value) {
      clearTable();
      renderRows(cookie);

      return;
    }

    renderFilteredCookie(cookie, this.value);
  });

  addButton.addEventListener('click', () => {
    const cookieName = addNameInput.value;
    const cookieValue = addValueInput.value;
    const searcheableCookie = filterNameInput.value;

    if (!cookieName || !cookieValue) {
      return;
    }

    if (searcheableCookie) {
      setCookie(cookieName, cookieValue);
      const cookie = getCookie();

      renderFilteredCookie(cookie, searcheableCookie);

      return;
    }

    const cookie = getCookie();
    const hasCookie = cookieName in cookie;
    const sameCookie = hasCookie && cookie[cookieName] === cookieValue;

    if (sameCookie) {
      return;
    }

    if (hasCookie) {
      changeCookieValue(cookieName, cookieValue);

      return;
    }

    setCookie(cookieName, cookieValue);
    renderRow(cookieName, cookieValue);
  });

  const settedCookie = getCookie();

  renderRows(settedCookie);
});
