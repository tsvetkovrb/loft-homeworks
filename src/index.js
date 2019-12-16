import { compile } from 'handlebars';

import placemarkGrey from './static/placemarkGrey.svg';
import circleOrange from './static/circleOrange.svg';

import './main.scss';

const template = document.getElementById('balloon-template').textContent;
const render = compile(template);

const reviewsMap = new Map();

ymaps.ready(init);

function init() {
  let map = new ymaps.Map('map', {
    center: [59.93545698, 30.32687934],
    zoom: 16,
    controls: ['zoomControl'],
  });

  const MyIconContentLayout = ymaps.templateLayoutFactory.createClass(
    '<div style="color: #000000; font-weight: bold;">{{ properties.geoObjects.length }}</div>',
  );
  const customItemContentLayout = ymaps.templateLayoutFactory.createClass(
    `
      <div class="balloon__place">{{ properties.balloonContentPlace }}</div>
      <div class="balloon__address">{{ properties.balloonContentAddress }}</div>
      <div class="balloon__message">{{ properties.balloonContentMessage }}</div>
      <div class="balloon__datetime">{{ properties.balloonContentDatetime }}</div>
    `,
    {
      build: function() {
        customItemContentLayout.superclass.build.call(this);
        this.linkBalloonButton = document.querySelector('.balloon__address');
        this.linkBalloonListener = this.linkBalloonListener.bind(this);
        this.linkBalloonButton.addEventListener(
          'click',
          this.linkBalloonListener,
        );
      },
      clear: function() {
        this.linkBalloonButton.removeEventListener(
          'click',
          this.linkBalloonListener,
        );
        customItemContentLayout.superclass.clear.call(this);
      },
      linkBalloonListener: function(e) {
        e.preventDefault();
        let coords = this.events.params.context._data.properties.get(
          'balloonContentCoords',
        );
        let address = this.events.params.context._data.properties.get(
          'balloonContentAddress',
        );
        const BalloonContentLayout = renderBalloon(coords, address);

        map.balloon.open(coords, null, {
          layout: BalloonContentLayout,
        });
      },
    },
  );

  let clusterer = new ymaps.Clusterer({
    gridSize: 128,
    clusterIcons: [
      {
        href: circleOrange,
        size: [44, 44],
        offset: [-22, -22],
      },
    ],
    clusterIconContentLayout: MyIconContentLayout,
    clusterBalloonContentLayout: 'cluster#balloonCarousel',
    clusterBalloonItemContentLayout: customItemContentLayout,
    clusterBalloonPanelMaxMapArea: 0,
    clusterBalloonContentLayoutWidth: 300,
    clusterBalloonContentLayoutHeight: 200,
    clusterBalloonPagerSize: 5,
    disableClickZoom: true,
    hideIconOnBalloonOpen: false,
  });

  map.geoObjects.add(clusterer);

  function renderBalloon(coords, address) {
    let reviews = reviewsMap.get(address);

    if (!reviews) {
      reviews = [];
    }
    const html = render({ cond: reviews.length === 0, address, reviews });
    const BalloonContentLayout = ymaps.templateLayoutFactory.createClass(html, {
      build: function() {
        BalloonContentLayout.superclass.build.call(this);
        this._$element = document.querySelector('.balloon');
        this.closeBalloonButton = document.querySelector('.balloon__close');
        this.form = document.querySelector('.review');
        this.submitForm = document.querySelector('.review__button');
        this.addReviewListener = this.addReviewListener.bind(this);
        this.submitForm.addEventListener('click', this.addReviewListener);
        this.closeBalloonButton.addEventListener(
          'click',
          this.closeBalloonListener,
        );
      },
      clear: function() {
        this.closeBalloonButton.removeEventListener(
          'click',
          this.closeBalloonListener,
        );
        this.submitForm.removeEventListener('click', this.addReviewListener);
        BalloonContentLayout.superclass.clear.call(this);
      },
      getShape: function() {
        return new ymaps.shape.Rectangle(
          new ymaps.geometry.pixel.Rectangle([
            [0, 0],
            [this._$element.offsetWidth, this._$element.offsetHeight],
          ]),
        );
      },
      closeBalloonListener: e => {
        e.preventDefault();
        map.balloon.close();
      },
      getCurrentDate: () => {
        let newDate = new Date();
        const currentDay = newDate.getDate();
        const currentMonth = newDate.getMonth();
        let day = parseInt(currentDay) < 10 ? `0${currentDay}` : currentDay;
        let month =
          parseInt(currentMonth + 1) < 10
            ? `0${parseInt(currentMonth) + 1}`
            : parseInt(currentMonth) + 1;

        return `${month}/${day}/${newDate.getFullYear()}`;
      },
      addReviewListener: function(e) {
        e.preventDefault();
        let review = {
          author: this.form.elements.name.value,
          place: this.form.elements.place.value,
          date: this.getCurrentDate(),
          message: this.form.elements.message.value,
        };
        let reviews = reviewsMap.get(address);

        if (reviews) {
          reviews.push(review);
        } else {
          reviews = [review];
        }
        reviewsMap.set(address, reviews);
        this._renderedTemplate.text = render({
          noReview: reviews.length === 0,
          address,
          reviews,
        });
        this.clear();
        this.build();

        const mark = {
          balloonContentCoords: coords,
          balloonContentPlace: review.place,
          balloonContentAddress: address,
          balloonContentMessage: review.message,
          balloonContentDatetime: review.date,
        };

        const placemark = new ymaps.Placemark(coords, mark, {
          iconLayout: 'default#image',
          iconImageHref: placemarkGrey,
          iconImageSize: [44, 66],
          iconImageOffset: [-22, -66],
        });

        placemark.events.add('click', function() {
          const BalloonContentLayout = renderBalloon(coords, address);

          map.balloon.open(coords, null, {
            layout: BalloonContentLayout,
          });
        });
        clusterer.add(placemark);
      },
    });

    return BalloonContentLayout;
  }

  map.events.add('click', async e => {
    try {
      const coords = e.get('coords');
      const geocoder = await ymaps.geocode(coords);
      const firstGeoObject = geocoder.geoObjects.get(0);
      const address = firstGeoObject.getAddressLine();
      const BalloonContentLayout = renderBalloon(coords, address);

      await map.balloon.open(coords, null, {
        layout: BalloonContentLayout,
      });
    } catch (error) {
      console.log(error);
    }
  });
}
