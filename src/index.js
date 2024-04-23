import { URL, fetchBreeds, fetchCatByBreed } from './api-cat.js';
import SlimSelect from 'slim-select';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import 'slim-select/dist/slimselect.css';

function getRefs() {
  return {
    select: document.querySelector('.breed-select'),
    loader: document.querySelector('.loader'),
    error: document.querySelector('.error'),
    catInfo: document.querySelector('.cat-info'),
  };
}

const refs = getRefs();
refs.select.style.maxWidth = '360px';

function isVisually(arr) {
  arr.forEach(el => {
    if (el.classList.contains('visually-hidden')) {
      el.classList.remove('visually-hidden');
    }
  });
}

function isHidden(arr) {
  arr.forEach(el => {
    if (!el.classList.contains('visually-hidden')) {
      el.classList.add('visually-hidden');
    }
  });
}

isVisually([refs.select, refs.error, refs.catInfo]);
isHidden([refs.loader]);

const selectInstance = new SlimSelect({
  select: refs.select,
  settings: {
    placeholderText: 'Choose the breed of the cat',
    allowDeselect: true,
    maxSelected: 1,
  },
});

let str = 'breeds';
let url = URL + str;
fetchBreeds(url).then(addDataSelectBreeds).catch(isError);

function addDataSelectBreeds(arrBreeds) {
  if (!arrBreeds || arrBreeds.length === 0) {
    isHidden([refs.loader]);
    isVisually([refs.error]);
    Notify.failure(refs.error.textContent);
    return;
  }

  const dataSelectBreeds = arrBreeds.map(({ name, id }) => {
    return { text: name, value: id };
  });

  const firstOption = [
    {
      text: '',
      placeholder: true,
    },
  ];
  const allOptions = [...firstOption, ...dataSelectBreeds];
  selectInstance.setData(allOptions);
  isHidden([refs.loader, refs.error, refs.catInfo]);
  isVisually([refs.select]);
}

function isError(error) {
  isVisually([refs.error]);
  isHidden([refs.loader, refs.catInfo]);
  console.error('Error status: ', error);
    Notify.failure(refs.error.textContent);
}

refs.select.addEventListener('change', onSelect);

function onSelect(event) {
  if (event.target.value === '') {
    return;
  }
  str = 'images/search?';
  const searchParams = new URLSearchParams({
    breed_ids: event.target.value,
    limit: 2,
    size: 'small',
  });

  url = URL + str + searchParams;
  isHidden([refs.error, refs.catInfo]);
  isVisually([refs.loader]);
  fetchCatByBreed(url).then(renderInfo).catch(isError);
}

function renderInfo(arrInfo) {
  const markup =
    arrInfo
      .map(
        ({ url, breeds }) =>
          `<img src='${url}' 
        alt='${breeds[0].alt_names || breeds[0].name || 'cat image'}'
        width='300'
        height='300'
        />`
      )
      .join('') +
    `<div class="info">
            <h1 class="info-title">${arrInfo[0].breeds[0].name}</h1>
            <p class="info-description">${arrInfo[0].breeds[0].description}</p>
            <p class="info-description"><span class='span'>Country of Origin:</span> ${arrInfo[0].breeds[0].origin}</p>
            <p class="info-description"><span class='span'>Temperament:</span>: ${arrInfo[0].breeds[0].temperament}</p>
     </div>`;
  refs.catInfo.innerHTML = markup;
  console.log(arrInfo)
  isHidden([refs.loader]);
  isVisually([refs.catInfo]);
}
