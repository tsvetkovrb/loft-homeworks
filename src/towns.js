/*
 Страница должна предварительно загрузить список городов из
 https://raw.githubusercontent.com/smelukov/citiesTest/master/cities.json
 и отсортировать в алфавитном порядке.

 При вводе в текстовое поле, под ним должен появляться список тех городов,
 в названии которых, хотя бы частично, есть введенное значение.
 Регистр символов учитываться не должен, то есть "Moscow" и "moscow" - одинаковые названия.

 Во время загрузки городов, на странице должна быть надпись "Загрузка..."
 После окончания загрузки городов, надпись исчезает и появляется текстовое поле.

 Разметку смотрите в файле towns-content.hbs

 Запрещено использовать сторонние библиотеки. Разрешено пользоваться только тем, что встроено в браузер

 *** Часть со звездочкой ***
 Если загрузка городов не удалась (например, отключился интернет или сервер вернул ошибку),
 то необходимо показать надпись "Не удалось загрузить города" и кнопку "Повторить".
 При клике на кнопку, процесс загрузки повторяется заново
 */

/*
 homeworkContainer - это контейнер для всех ваших домашних заданий
 Если вы создаете новые html-элементы и добавляете их на страницу, то добавляйте их только в этот контейнер

 Пример:
   const newDiv = document.createElement('div');
   homeworkContainer.appendChild(newDiv);
 */
const homeworkContainer = document.querySelector('#homework-container');

/*
 Функция должна вернуть Promise, который должен быть разрешен с массивом городов в качестве значения

 Массив городов пожно получить отправив асинхронный запрос по адресу
 https://raw.githubusercontent.com/smelukov/citiesTest/master/cities.json
 */
async function loadTowns() {
  const response = await fetch(
    'https://raw.githubusercontent.com/smelukov/citiesTest/master/cities.json',
  );
  const sities = await response.json();
  const sortedSities = sities.sort((a, b) => (a.name > b.name ? 1 : -1));

  return sortedSities;
}

/*
 Функция должна проверять встречается ли подстрока chunk в строке full
 Проверка должна происходить без учета регистра символов

 Пример:
   isMatching('Moscow', 'moscow') // true
   isMatching('Moscow', 'mosc') // true
   isMatching('Moscow', 'cow') // true
   isMatching('Moscow', 'SCO') // true
   isMatching('Moscow', 'Moscov') // false
 */
function isMatching(full, chunk) {
  const lowerCasedFull = full.toLowerCase();
  const lowerCasedChunk = chunk.toLowerCase();

  return lowerCasedFull.includes(lowerCasedChunk);
}

/* Блок с надписью "Загрузка" */
const loadingBlock = homeworkContainer.querySelector('#loading-block');
/* Блок с текстовым полем и результатом поиска */
const filterBlock = homeworkContainer.querySelector('#filter-block');
/* Текстовое поле для поиска по городам */
const filterInput = homeworkContainer.querySelector('#filter-input');
/* Блок с результатами поиска */
const filterResult = homeworkContainer.querySelector('#filter-result');

let sortedSities = [];

filterInput.addEventListener('keyup', ({ target }) => {
  filterResult.innerHTML = '';
  const { value: input } = target;

  if (input.length === 0) {
    return;
  }

  const matchedCities = sortedSities.filter(city =>
    isMatching(city.name, input),
  );

  matchedCities.forEach(city => {
    const newElement = document.createElement('div');

    newElement.textContent = city.name;
    filterResult.appendChild(newElement);
  });
});

function hideLoading() {
  loadingBlock.style.display = 'none';
}

async function tryLoad() {
  const wrapper = document.getElementById('wrapper');
  const retry = document.getElementById('retry');

  loadingBlock.style.display = 'block';

  if (wrapper) {
    retry.removeEventListener('click', tryLoad);
    homeworkContainer.removeChild(wrapper);
  }

  try {
    const data = await loadTowns();

    sortedSities = [...data];
    hideLoading();
    filterBlock.style.display = 'block';
  } catch (error) {
    const title = document.createElement('p');
    const button = document.createElement('button');
    const wrapper = document.createElement('div');

    title.textContent = 'Не удалось загрузить города';

    button.textContent = 'Повторить';
    button.setAttribute('id', 'retry');
    button.addEventListener('click', tryLoad);

    wrapper.appendChild(title).appendChild(button);
    wrapper.setAttribute('id', 'wrapper');

    hideLoading();
    homeworkContainer.appendChild(wrapper);
  }
}

tryLoad();

export { loadTowns, isMatching };
