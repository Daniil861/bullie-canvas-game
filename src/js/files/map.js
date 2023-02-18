
function mapAdd() {
	let tag = document.createElement('script');
	tag.src = "https://maps.google.com/maps/api/js?sensor=false&amp;key=&callback=mapInit";
	let firstScriptTag = document.getElementsByTagName('script')[0];
	firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}
function mapInit(n = 1) {
	google.maps.Map.prototype.setCenterWithOffset = function (latlng, offsetX, offsetY) {
		var map = this;
		var ov = new google.maps.OverlayView();
		ov.onAdd = function () {
			var proj = this.getProjection();
			var aPoint = proj.fromLatLngToContainerPixel(latlng);
			aPoint.x = aPoint.x + offsetX;
			aPoint.y = aPoint.y + offsetY;
			map.panTo(proj.fromContainerPixelToLatLng(aPoint));
			//map.setCenter(proj.fromContainerPixelToLatLng(aPoint));
		}
		ov.draw = function () { };
		ov.setMap(this);
	};
	var markers = new Array();
	var infowindow = new google.maps.InfoWindow({
		//pixelOffset: new google.maps.Size(-230,250)
	});
	var locations = [
		[new google.maps.LatLng(53.819055, 27.8813694)],
		[new google.maps.LatLng(53.700055, 27.5513694)],
		[new google.maps.LatLng(53.809055, 27.5813694)],
		[new google.maps.LatLng(53.859055, 27.5013694)],
	]
	var options = {
		zoom: 10,
		panControl: false,
		mapTypeControl: false,
		center: locations[0][0],
		styles: [{ "featureType": "landscape.natural", "elementType": "geometry.fill", "stylers": [{ "visibility": "on" }, { "color": "#e0efef" }] }, { "featureType": "poi", "elementType": "geometry.fill", "stylers": [{ "visibility": "on" }, { "hue": "#1900ff" }, { "color": "#c0e8e8" }] }, { "featureType": "road", "elementType": "geometry", "stylers": [{ "lightness": 100 }, { "visibility": "simplified" }] }, { "featureType": "road", "elementType": "labels", "stylers": [{ "visibility": "off" }] }, { "featureType": "transit.line", "elementType": "geometry", "stylers": [{ "visibility": "on" }, { "lightness": 700 }] }, { "featureType": "water", "elementType": "all", "stylers": [{ "color": "#7dcdcd" }] }],
		scrollwheel: false,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};
	var map = new google.maps.Map(document.getElementById('map'), options);
	var icon = {
		url: 'img/icons/map.svg',
		scaledSize: new google.maps.Size(18, 20),
		anchor: new google.maps.Point(9, 10)
	}
	for (var i = 0; i < locations.length; i++) {
		var marker = new google.maps.Marker({
			icon: icon,
			position: locations[i][0],
			map: map,
		});
		google.maps.event.addListener(marker, 'click', (function (marker, i) {
			return function () {
				for (var m = 0; m < markers.length; m++) {
					markers[m].setIcon(icon);
				}
				var cnt = i + 1;
				//infowindow.setContent(document.querySelector('.events-map__item_' + cnt).innerHTML);
				//infowindow.open(map, marker);
				marker.setIcon(icon);
				map.setCenterWithOffset(marker.getPosition(), 0, 0);
				setTimeout(function () {

				}, 10);
			}
		})(marker, i));
		markers.push(marker);
	}
	if (n) {
		var nc = n - 1;
		setTimeout(function () {
			google.maps.event.trigger(markers[nc], 'click');
		}, 500);
	}
}
if (document.querySelector('#map')) {
	mapAdd();
}


/* YA
// Карта
const configMap = {
	license: "https://api-maps.yandex.ru/2.1/?apikey=84391a3f-790d-4752-85e6-40097ad5c109&lang=ru_RU",
	coordMain: [55.75167053479295, 37.621749677246086],
	coordPin_1: [55.857098408295954, 37.586139534301665], // ЖК "Римского- Корсакова 11”
	coordPin_2: [55.76260005263136, 37.48999533220137], // ЖК "Николин Парк”
	coordPin_3: [55.6412838016509, 37.33263936506678], // ЖК "Рассказово” "ул Бульвар Андрея Тарковского, 14"
	coordPin_4: [55.74990156899145, 37.51671849999992], // ЖК "Западный порт”
	coordPin_5: [55.62746306912344, 37.34600249999995], // ЖК "Рассказово” "пос. Внуковское б-р. А. Тарковского, 5А"
}

if (document.querySelector('.map__map')) {
	const map_item = document.querySelector('.map__map');
	window.addEventListener('scroll', scroll_scroll);

	function scroll_scroll(e) {
		if (!map_item.classList.contains('_active')) {
			let block = document.querySelector('.map__map');
			let block_offset = offset(block).top;
			let block_height = block.offsetHeight;

			if ((window.pageYOffset > block_offset - window.innerHeight / 1.5) && window.pageYOffset < (block_offset + block_height) - window.innerHeight / 5) {
				block.classList.add('_active');
				visible_map()
			}
		}
	}

	function offset(el) {
		var rect = el.getBoundingClientRect(),
			scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
			scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		return { top: rect.top + scrollTop, left: rect.left + scrollLeft }
	}

	function visible_map() {
		function loadScript(url, callback) {
			var script = document.createElement("script");
			if (script.readyState) {
				script.onreadystatechange = function () {
					if (script.readyState == "loaded" ||
						script.readyState == "complete") {
						script.onreadystatechange = null;
						callback();
					}
				};
			} else {
				script.onload = function () {
					callback();
				};
			}

			script.src = url;
			document.getElementsByTagName("head")[0].appendChild(script);
		}

		loadScript(configMap.license, function () {
			ymaps.load(init);
		});

		function init() {
			var map = new ymaps.Map("map", {
				center: configMap.coordMain,
				zoom: 11
			});
			map.behaviors
				.disable(['drag', 'rightMouseButtonMagnifier']);

			const HintLayout = ymaps.templateLayoutFactory.createClass(`
				<div class='map__hint hint-map'> 
					<div class="hint-map__body">
						<div class="hint-map__title">{{ properties.title }}</div>
						<div class="hint-map__sub-title">{{ properties.subTitle }}</div>
						<a href="main.html" class="hint-map__link">Перейти</a>
					</div>
				</div>`,
				{
					// Определяем метод getShape, который
					// будет возвращать размеры макета хинта.
					// Это необходимо для того, чтобы хинт автоматически
					// сдвигал позицию при выходе за пределы карты.
					getShape: function () {
						var el = this.getElement(),
							result = null;
						if (el) {
							var firstChild = el.firstChild;
							console.log(firstChild);
							result = new ymaps.shape.Rectangle(
								new ymaps.geometry.pixel.Rectangle([
									[0, 0],
									[firstChild.offsetWidth, firstChild.offsetHeight]
								])
							);
						}
						return result;
					}
				});


			let placemark1 = new ymaps.Placemark(configMap.coordPin_1, {
				balloonContentHeader: 'ЖК "Римского- Корсакова 11”',
				balloonContentBody: "СВАО, р-н Отрадное, Высоковольтный проезд, 5А",
				title: 'ЖК "Римского- Корсакова 11”',
				subTitle: "СВАО, р-н Отрадное, Высоковольтный проезд, 5А",
			}, {
				hintLayout: HintLayout,
				iconLayout: 'default#image',
				iconImageHref: 'img/main/map/icons/pin.png',
				iconImageSize: [68, 68],
				iconImageOffset: [-50, -20]
			});

			let placemark2 = new ymaps.Placemark(configMap.coordPin_2, {
				balloonContentHeader: 'ЖК "Николин Парк”',
				balloonContentBody: "ул. Николо-Хованская, 26А",
				title: 'ЖК "Николин Парк”',
				subTitle: "ул. Николо-Хованская, 26А",
			}, {
				hintLayout: HintLayout,
				iconLayout: 'default#image',
				iconImageHref: 'img/main/map/icons/pin.png',
				iconImageSize: [68, 68],
				iconImageOffset: [-50, -75]
			});

			let placemark3 = new ymaps.Placemark(configMap.coordPin_3, {
				balloonContentHeader: 'ЖК "Рассказово”',
				balloonContentBody: "ул Бульвар Андрея Тарковского, 14",
				title: 'ЖК "Рассказово”',
				subTitle: "ул Бульвар Андрея Тарковского, 14",
			}, {
				hintLayout: HintLayout,
				iconLayout: 'default#image',
				iconImageHref: 'img/main/map/icons/pin.png',
				iconImageSize: [68, 68],
				iconImageOffset: [-50, -75]
			})

			let placemark4 = new ymaps.Placemark(configMap.coordPin_4, {
				balloonContentHeader: 'ЖК "Западный порт”',
				balloonContentBody: "ул. Большая Филевская д.3, к2",
				title: 'ЖК "Западный порт”',
				subTitle: "ул. Большая Филевская д.3, к2",
			}, {
				hintLayout: HintLayout,
				iconLayout: 'default#image',
				iconImageHref: 'img/main/map/icons/pin.png',
				iconImageSize: [68, 68],
				iconImageOffset: [-50, -100]
			})

			let placemark5 = new ymaps.Placemark(configMap.coordPin_5, {
				balloonContentHeader: 'ЖК "Рассказово”',
				balloonContentBody: "пос. Внуковское б-р. А. Тарковского, 5А",
				title: 'ЖК "Рассказово”',
				subTitle: "пос. Внуковское б-р. А. Тарковского, 5А",
			}, {
				hintLayout: HintLayout,
				iconLayout: 'default#image',
				iconImageHref: 'img/main/map/icons/pin.png',
				iconImageSize: [68, 68],
				iconImageOffset: [-50, -100]
			})


			map.controls.remove('geolocationControl'); // удаляем геолокацию
			map.controls.remove('searchControl'); // удаляем поиск
			map.controls.remove('trafficControl'); // удаляем контроль трафика
			map.controls.remove('typeSelector'); // удаляем тип
			map.controls.remove('fullscreenControl'); // удаляем кнопку перехода в полноэкранный режим
			map.controls.remove('zoomControl'); // удаляем контрол зуммирования
			map.controls.remove('rulerControl'); // удаляем контрол правил
			// map.behaviors.disable(['scrollZoom']); // отключаем скролл карты (опционально)
			if (innerWidth > 992) map.behaviors.disable(['scrollZoom']);

			map.geoObjects.add(placemark1);
			map.geoObjects.add(placemark2);
			map.geoObjects.add(placemark3);
			map.geoObjects.add(placemark4);
			map.geoObjects.add(placemark5);

			placemark1.events
				.add('mouseenter', function (e) {
					e.get('target').options.set('iconLayout', 'default#imageWithContent');
					e.get('target').options.set('iconImageHref', 'img/main/map/icons/pin-hover.png');
				})
				.add('mouseleave', function (e) {
					e.get('target').options.set('iconLayout', 'default#imageWithContent');
					e.get('target').options.set('iconImageHref', 'img/main/map/icons/pin.png');
				});

			placemark2.events
				.add('mouseenter', function (e) {
					e.get('target').options.set('iconLayout', 'default#imageWithContent');
					e.get('target').options.set('iconImageHref', 'img/main/map/icons/pin-hover.png');
				})
				.add('mouseleave', function (e) {
					e.get('target').options.set('iconLayout', 'default#imageWithContent');
					e.get('target').options.set('iconImageHref', 'img/main/map/icons/pin.png');
				});

			placemark3.events
				.add('mouseenter', function (e) {
					e.get('target').options.set('iconLayout', 'default#imageWithContent');
					e.get('target').options.set('iconImageHref', 'img/main/map/icons/pin-hover.png');
				})
				.add('mouseleave', function (e) {
					e.get('target').options.set('iconLayout', 'default#imageWithContent');
					e.get('target').options.set('iconImageHref', 'img/main/map/icons/pin.png');
				});

			placemark4.events
				.add('mouseenter', function (e) {
					e.get('target').options.set('iconLayout', 'default#imageWithContent');
					e.get('target').options.set('iconImageHref', 'img/main/map/icons/pin-hover.png');
				})
				.add('mouseleave', function (e) {
					e.get('target').options.set('iconLayout', 'default#imageWithContent');
					e.get('target').options.set('iconImageHref', 'img/main/map/icons/pin.png');
				});

			placemark5.events
				.add('mouseenter', function (e) {
					e.get('target').options.set('iconLayout', 'default#imageWithContent');
					e.get('target').options.set('iconImageHref', 'img/main/map/icons/pin-hover.png');
				})
				.add('mouseleave', function (e) {
					e.get('target').options.set('iconLayout', 'default#imageWithContent');
					e.get('target').options.set('iconImageHref', 'img/main/map/icons/pin.png');
				});
		}
	}
}
*/