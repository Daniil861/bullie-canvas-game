window.addEventListener('load', () => {
	const canvas = document.getElementById('canvas1');
	const ctx = canvas.getContext('2d');

	canvas.width = 1280;
	canvas.height = 720;

	ctx.fillStyle = '#fff'; // цвет заливки по умолчанию
	ctx.lineWidth = 3;
	ctx.strokeStyle = '#000';
	ctx.font = '40px Bangers';
	ctx.textAlign = 'center';

	// Создаем класс, в котором пишем логику относящуюся к игроку
	class Player {
		constructor(game) {
			this.game = game;

			// Позиция игрока на поле
			this.collisionX = this.game.width * 0.5;
			this.collisionY = this.game.height * 0.5;

			this.collisionRadius = 30;

			// Коэффициенты, рассчитывающие расстояние на которое перемещеаем игрока
			this.speedX = 0;
			this.speedY = 0;

			// Коэффициенты, для расчета скорости движения
			this.dx = 0;
			this.dy = 0;

			// Параметр, который отвечает за скорость перемещения игрока (можно увеличивать или уменьшать)
			this.speedModifier = 5;

			this.spriteWidth = 255;
			this.spriteHeight = 255;
			this.width = this.spriteWidth;
			this.height = this.spriteHeight;

			this.spriteX;
			this.spriteY;

			this.frameX = 0;
			this.frameY = 0;

			this.image = document.getElementById('bull');
		}

		restart() {
			this.collisionX = this.game.width * 0.5;
			this.collisionY = this.game.height * 0.5;
			this.spriteX = this.collisionX - this.width * 0.5;
			this.spriteY = this.collisionY - this.height * 0.5 - 100;
		}

		// Метод, который отрисовывает игрока на игровом поле
		draw(context) {
			context.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height);

			if (this.game.debug) {
				context.beginPath();
				context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2);

				// Для тоео, чтобы сделать фигуру полупрозрачной используется конструкция с методами save и restore
				context.save();
				context.globalAlpha = 0.5;
				context.fill();
				context.restore();
				context.stroke();

				// Рисуем линию
				context.beginPath();
				context.moveTo(this.collisionX, this.collisionY); // стратовая координата линии
				context.lineTo(this.game.mouse.x, this.game.mouse.y); // конечная координата линии
				context.stroke(); // отрисовываем линию
			}
		}

		update() {
			// Механизм плавного перемещения игрока от текущей точки к точке в которой кликнем мышкой

			// определяем на какое количество px изменились координаты игрока
			this.dx = this.game.mouse.x - this.collisionX;
			this.dy = this.game.mouse.y - this.collisionY;


			// подбираем нужный фрейм в зависимости от направления движения героя
			const angle = Math.atan2(this.dy, this.dx);

			if (angle < -2.74 || angle > 2.74) this.frameY = 6;
			else if (angle < -1.96) this.frameY = 7;
			else if (angle < -1.17) this.frameY = 0;
			else if (angle < -0.39) this.frameY = 1;
			else if (angle < 0.39) this.frameY = 2;
			else if (angle < 1.17) this.frameY = 3;
			else if (angle < 1.96) this.frameY = 4;
			else if (angle < 2.74) this.frameY = 5;

			// Определяем гипотенузу (прямое расстояние от игрока до области клика - места, куда будем перемещать игрока)
			const distance = Math.hypot(this.dy, this.dx);

			if (distance > this.speedModifier) {
				this.speedX = this.dx / distance || 0;
				this.speedY = this.dy / distance || 0;
			} else {
				this.speedX = 0;
				this.speedY = 0;
			}

			// Указываем новые координаты. Получается с каждым новым обновлением анимации - мы плавно перемещаем игрока к конечной точке
			this.collisionX += this.speedX * this.speedModifier;
			this.collisionY += this.speedY * this.speedModifier;

			this.spriteX = this.collisionX - this.width * 0.5;
			this.spriteY = this.collisionY - this.height * 0.5 - 100;

			// горизонтальные границы (не даем игроку выйти за них)
			if (this.collisionX < this.collisionRadius) this.collisionX = this.collisionRadius;
			else if (this.collisionX > this.game.width - this.collisionRadius) this.collisionX = this.game.width - this.collisionRadius;

			// вертикальные границы (не даем игроку выйти за них)
			if (this.collisionY < this.game.topMargin + this.collisionRadius) this.collisionY = this.game.topMargin + this.collisionRadius;
			else if (this.collisionY > this.game.height - this.collisionRadius) this.collisionY = this.game.height - this.collisionRadius;

			// Проверяем коллизии с препятствиями

			this.game.obstacles.forEach(obstacle => {
				let [collision, distance, sumOfRadii, dx, dy] = this.game.checkCollision(this, obstacle);

				// Если коллизия - тогда выполняем блок в условии
				if (collision) {
					// Здесь мы определяем с какой стороны произошла коллизия и делаем так, чтобы игрок не мог пройти сквозь препятствие, а
					// как быдто обходил препятствие

					const unit_x = dx / distance;
					const unit_y = dy / distance;

					this.collisionX = obstacle.collisionX + (sumOfRadii + 1) * unit_x;
					this.collisionY = obstacle.collisionY + (sumOfRadii + 1) * unit_y;
				}
			})
		}
	}

	// Создаем класс, в котором пишем логику объекта - препятствие
	class Obstacle {
		constructor(game) {
			this.game = game;
			this.collisionX = Math.random() * this.game.width;
			this.collisionY = Math.random() * this.game.height;
			this.collisionRadius = 40;

			this.image = document.getElementById('obstacles'); // получаем spritesheet картинок
			this.spriteWidth = 250;
			this.spriteHeight = 250;

			this.width = this.spriteWidth;
			this.height = this.spriteHeight;

			this.spriteX = this.collisionX - this.width * 0.5;
			this.spriteY = this.collisionY - this.height * 0.5 - 70;

			this.frameX = Math.floor(Math.random() * 4);
			this.frameY = Math.floor(Math.random() * 3);
		}

		// Метод, который отрисовывает препятствие на игровом поле
		draw(context) {
			context.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height);

			// Если нажимаем на клавиатуре на d - появляется кружок (границы) у каждого препятствия 
			if (this.game.debug) {
				context.beginPath();
				context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2);

				context.save();
				context.globalAlpha = 0.5;
				context.fill();
				context.restore();
				context.stroke();
			}
		}

		update() {

		}
	}

	class Egg {
		constructor(game) {
			this.game = game;
			this.collisionRadius = 40;
			this.margin = this.collisionRadius * 2;
			this.collisionX = this.margin + (Math.random() * (this.game.width - this.margin * 2));
			this.collisionY = this.game.topMargin + (Math.random() * (this.game.height - this.game.topMargin - this.margin));

			this.image = document.getElementById('egg');
			this.spriteWidth = 110;
			this.spriteHeight = 135;
			this.width = this.spriteWidth;
			this.height = this.spriteHeight;

			this.spriteX;
			this.spriteY;

			this.hatchTimer = 0;
			this.hatchInterval = 5000;

			this.markedForDelition = false;
		}

		draw(context) {
			context.drawImage(this.image, this.spriteX, this.spriteY);

			if (this.game.debug) {
				context.beginPath();
				context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2);

				context.save();
				context.globalAlpha = 0.5;
				context.fill();
				context.restore();
				context.stroke();

				const displayTimer = (this.hatchTimer * 0.001).toFixed(0);
				context.fillText(displayTimer, this.collisionX, this.collisionY - this.collisionRadius * 2);
			}
		}

		update(deltaTime) {
			this.spriteX = this.collisionX - this.width * 0.5;
			this.spriteY = this.collisionY - this.height * 0.5 - 30;

			// Коллизии
			let collisionObject = [this.game.player, ...this.game.obstacles, ...this.game.enemies];
			collisionObject.forEach(object => {
				let [collision, distance, sumOfRadii, dx, dy] = this.game.checkCollision(this, object);
				if (collision) {
					const unit_x = dx / distance;
					const unit_y = dy / distance;
					this.collisionX = object.collisionX + (sumOfRadii + 1) * unit_x;
					this.collisionY = object.collisionY + (sumOfRadii + 1) * unit_y;
				}
			})

			// Вылупление
			if (this.hatchTimer > this.hatchInterval || this.collisionY < this.game.topMargin) {
				this.game.hatchlings.push(new Larva(this.game, this.collisionX, this.collisionY));
				this.markedForDelition = true;
				this.game.removeGameObject();
			} else {
				this.hatchTimer += deltaTime;
			}
		}
	}

	class Enemy {
		constructor(game) {
			this.game = game;
			this.collisionRadius = 30;

			this.speedX = Math.random() * 3 + 0.5;

			this.image = document.getElementById('toads');
			this.spriteWidth = 140;
			this.spriteHeight = 260;
			this.width = this.spriteWidth;
			this.height = this.spriteHeight;

			this.collisionX = this.game.width + this.width + Math.random() * this.game.width * 0.5;
			this.collisionY = this.game.topMargin + (Math.random() * (this.game.height - this.game.topMargin));

			this.spriteX;
			this.spriteY;

			this.frameX = 0;
			this.frameY = Math.floor(Math.random() * 4);

		}
		draw(context) {
			context.drawImage(this.image, this.frameX, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height);

			if (this.game.debug) {
				context.beginPath();
				context.arc(this.collisionX, this.collisionY, this.collisionRadius, 0, Math.PI * 2);

				context.save();
				context.globalAlpha = 0.5;
				context.fill();
				context.restore();
				context.stroke();
			}
		}
		update() {
			this.spriteX = this.collisionX - this.width * 0.5;
			this.spriteY = this.collisionY - this.height * 0.5;
			this.spriteY;
			this.collisionX -= this.speedX;

			// Переиспользуем объект, когда он долетел до конца (чтобы не создавать новый - экономим производительность)
			if (this.spriteX + this.width < 0 && !this.game.gameOver) {
				this.collisionX = this.game.width + this.width + Math.random() * this.game.width * 0.5;
				this.collisionY = this.game.topMargin + (Math.random() * (this.game.height - this.game.topMargin));
				this.frameY = Math.floor(Math.random() * 4);
			}

			let collisionObject = [this.game.player, ...this.game.obstacles];

			collisionObject.forEach(object => {
				let [collision, distance, sumOfRadii, dx, dy] = this.game.checkCollision(this, object);
				if (collision) {
					const unit_x = dx / distance;
					const unit_y = dy / distance;
					this.collisionX = object.collisionX + (sumOfRadii + 1) * unit_x;
					this.collisionY = object.collisionY + (sumOfRadii + 1) * unit_y;
				}
			})
		}
	}

	class Larva {
		constructor(game, x, y) {
			this.game = game;
			this.collisionRadius = 30;

			this.collisionX = x;
			this.collisionY = y;

			this.image = document.getElementById('larva');
			this.spriteWidth = 150;
			this.spriteHeight = 150;
			this.width = this.spriteWidth;
			this.height = this.spriteHeight;

			this.spriteX;
			this.spriteY;

			this.speedY = 1 + Math.random();
			this.frameX = 0;
			this.frameY = Math.floor(Math.random() * 2);
		}

		draw(context) {
			context.drawImage(this.image, this.frameX * this.spriteWidth, this.frameY * this.spriteHeight, this.spriteWidth, this.spriteHeight, this.spriteX, this.spriteY, this.width, this.height);
		}

		update() {
			this.collisionY -= this.speedY;
			this.spriteX = this.collisionX - this.width * 0.5;
			this.spriteY = this.collisionY - this.height * 0.5 - 30;

			// Если личинка добралась до верха
			if (this.collisionY < this.game.topMargin) {
				this.markedForDelition = true;
				this.game.removeGameObject();

				// Если игра не завершена - увеличиваем общий счет
				if (!this.game.gameOver) this.game.score++;

				for (let i = 0; i < 3; i++) {
					this.game.particles.push(new Firefly(this.game, this.collisionX, this.collisionY, 'yellow'));
				}
			}

			// Коллизии
			let collisionObject = [this.game.player, ...this.game.obstacles];
			collisionObject.forEach(object => {
				let [collision, distance, sumOfRadii, dx, dy] = this.game.checkCollision(this, object);
				if (collision) {
					const unit_x = dx / distance;
					const unit_y = dy / distance;
					this.collisionX = object.collisionX + (sumOfRadii + 1) * unit_x;
					this.collisionY = object.collisionY + (sumOfRadii + 1) * unit_y;
				}
			})

			// Коллизии с врагами
			this.game.enemies.forEach(enemy => {
				if (this.game.checkCollision(this, enemy)[0]) {
					this.markedForDelition = true;
					this.game.removeGameObject();
					this.game.lostHathclings++;

					for (let i = 0; i < 3; i++) {
						this.game.particles.push(new Spark(this.game, this.collisionX, this.collisionY, 'blue'));
					}
				}
			})
		}
	}

	class Particle {
		constructor(game, x, y, color) {
			this.game = game;

			this.collisionX = x;
			this.collisionY = y;

			this.color = color;

			this.radius = Math.floor(Math.random() * 10 + 5);

			this.speedX = Math.random() * 6 - 3;
			this.speedY = Math.random() * 2 + 0.5;

			this.angle = 0;
			this.va = Math.random() * 0.1 + 0.01; // velocity of angle

			this.markedForDelition = false;

		}

		draw(context) {
			context.save();
			context.beginPath();
			context.fillStyle = this.color;
			context.arc(this.collisionX, this.collisionY, this.radius, 0, Math.PI * 2);
			context.fill();
			context.stroke();
			context.restore();
		}
	}

	class Firefly extends Particle {
		update() {
			this.angle += this.va;
			this.collisionX += Math.cos(this.angle) * this.speedX; // с помощью cos мы делаем смещение не линейное по оси x, а как бы туда-обратно
			this.collisionY -= this.speedY;
			if (this.collisionY < 0 - this.radius) {
				this.markedForDelition = true;
				this.game.removeGameObject();
			}
		}
	}

	class Spark extends Particle {
		update() {
			this.angle += this.va * 0.5;
			this.collisionX -= Math.cos(this.angle) * this.speedX; // с помощью cos мы делаем смещение не линейное по оси x, а как бы туда-обратно
			this.collisionY -= Math.sin(this.angle) * this.speedY;
			if (this.radius > 0.1) this.radius -= 0.05;
			if (this.radius < 0.2) {
				this.markedForDelition = true;
				this.game.removeGameObject();
			}
		}
	}

	// Создаем класс, в котором пишем всю игровую логику
	class Game {
		constructor(canvas) {
			this.canvas = canvas;
			this.width = this.canvas.width;
			this.height = this.canvas.height;
			this.topMargin = 260;
			this.debug = true;
			this.player = new Player(this);
			this.score = 0;

			// следующих 3 параметра - для управления частотой обновления экрана. 
			// в некоторых устройствах частота может быть слишком быстрой, что сделает намного быстрее обновление игры, что может исказить саму игру
			// для этого вводится ограничение (параметр this.interval должен быть в итоге не больше 16.6, тогда игра будет смотреться так как мы ее разработали)
			this.fps = 70;
			this.timer = 0;
			this.interval = 1000 / this.fps;

			this.numberOfObstacles = 10; // Определяем количество препятствий

			this.obstacles = [];
			this.eggs = [];
			this.enemies = [];
			this.hatchlings = [];
			this.particles = [];

			this.maxEggs = 10;
			this.eggTimer = 0;
			this.eggInterval = 1000;

			this.maxEnemies = 5;

			this.lostHathclings = 0;


			this.gameObjects = [];


			this.mouse = {
				x: this.width * 0.5,
				y: this.height * 0.5,
				pressed: false
			}

			this.gameOver = false;
			this.winningScore = 30;

			// слушатели событий
			canvas.addEventListener('mousedown', (e) => {
				this.mouse.x = e.offsetX;
				this.mouse.y = e.offsetY;
				this.mouse.pressed = true;
			})
			canvas.addEventListener('mouseup', (e) => {
				this.mouse.x = e.offsetX;
				this.mouse.y = e.offsetY;
				this.mouse.pressed = false;
			})
			canvas.addEventListener('mousemove', (e) => {
				// Меняем координату игрока только при клике мышки
				if (this.mouse.pressed) {
					this.mouse.x = e.offsetX;
					this.mouse.y = e.offsetY;
				}
			})
			window.addEventListener('keydown', (e) => {
				if (e.key === 'd') this.debug = !this.debug;
				if (e.key === 'r') this.restart();
			})
		}

		restart() {
			this.player.restart();
			this.obstacles = [];
			this.eggs = [];
			this.enemies = [];
			this.hatchlings = [];
			this.particles = [];
			this.init();
			this.mouse = {
				x: this.width * 0.5,
				y: this.height * 0.5,
				pressed: false
			}
			this.score = 0;
			this.lostHathclings = 0;
			this.gameOver = false;
		}

		// Данный метод обновляет позиции всех элементов на игровом поле
		render(context, deltaTime) {
			// каждый раз проверяем какое время обновления анимации - если оно больше установленного ограничения, тогда обновляем канвас
			// и в конце обновления обнуляем счетчик, и при следующей сработке анимации снова сравниваем время сработки
			// так мы запрещаем requestAnimationFrame работать быстрее чем нужно на некоторых устройствах
			if (this.timer > this.interval) {

				// для обновления всех позиций движущихся элементов сцены - стираем весь канвас и рисуем все заново с новыми позициями
				context.clearRect(0, 0, this.width, this.height);

				this.gameObjects = [...this.obstacles, ...this.eggs, this.player, ...this.enemies, ...this.hatchlings, ...this.particles];

				// сортировка всех объектов по вертикали
				// работает так - тот объект, который находится ниже - будет на первом плане.
				// работает интересно - например игрок идет снизу вверх, и может быть сначало перед объектом а когда поднимется выше - 
				// будет за объектом. Создается эффект интерактивности.

				this.gameObjects.sort((a, b) => {
					return a.collisionY - b.collisionY;
				})

				this.gameObjects.forEach(object => {
					object.draw(context);
					object.update(deltaTime);
				});

				this.timer = 0;
			}
			this.timer += deltaTime;

			// добавляем таймер создания яиц
			if (this.eggTimer > this.eggInterval && this.eggs.length < this.maxEggs && !this.gameOver) {
				this.addEgg();
				this.eggTimer = 0;
			} else {
				this.eggTimer += deltaTime;
			}

			context.save();
			context.textAlign = 'left';
			context.fillText(`Score ${this.score}`, 25, 50);
			if (this.debug) {
				context.fillText(`Lost: ${this.lostHathclings}`, 25, 100);
			}
			context.restore();

			// win/loose message
			if (this.score >= this.winningScore) {
				this.gameOver = true;
				context.save();
				context.fillStyle = 'rgba(0, 0, 0, 0.5)';
				context.fillRect(0, 0, this.width, this.height);

				context.fillStyle = '#fff';
				context.textAlign = 'center';
				context.shadowOffsetX = 4;
				context.shadowOffsetY = 4;
				context.shadowColor = '#000';
				let message1;
				let message2;
				if (this.lostHathclings <= 5) {
					message1 = 'Bullseye!!!';
					message2 = "You bullied the bullies!";
				} else {
					message1 = 'Bullocks!';
					message2 = `You lost ${this.lostHathclings} hatchlings, don't be a pushover!`;
				}
				context.font = '130px Bangers';
				context.fillText(message1, this.width * 0.5, this.height * 0.5 - 20);
				context.font = '40px Bangers';
				context.fillText(message2, this.width * 0.5, this.height * 0.5 + 30);
				context.fillText(`Final score ${this.score}. Press 'R' to butt heads again!`, this.width * 0.5, this.height * 0.5 + 80);
				context.restore();
			}
		}

		checkCollision(a, b) {
			const dx = a.collisionX - b.collisionX;
			const dy = a.collisionY - b.collisionY;
			const distance = Math.hypot(dy, dx);
			const sumOfRadii = a.collisionRadius + b.collisionRadius;
			return [(distance < sumOfRadii), distance, sumOfRadii, dx, dy];
		}
		addEnemy() {
			this.enemies.push(new Enemy(this));
		}
		addEgg() {
			this.eggs.push(new Egg(this));
		}
		init() {
			// Создаем врагов
			for (let i = 0; i < this.maxEnemies; i++) {
				this.addEnemy();
			}

			// Создаем препятствия, проверяя чтобы они не накладывались друг на друга
			let attempts = 0;
			// Изначально ограничиваем количесвто попыток - не более 500, чтобы не зафризить браузер
			while (this.obstacles.length < this.numberOfObstacles && attempts < 500) {

				// Создаем пробный экземпляр препятствия
				let testObstacle = new Obstacle(this);

				// Делаем переменную метку (для пометки, если экземпляр попал по координатам на уже созданное препятстсвие)
				let overlap = false;

				// Запускаем цикл по массиву с препятстсвиями - проверяем есть ли совпадения  по координатам уже созданных преп. и нового преп.
				// Изначально массив пустой
				this.obstacles.forEach(obstacle => {

					// Выясняем расстояние от цетров от тестового препятстсвия до уже существующего в массиве
					const dx = testObstacle.collisionX - obstacle.collisionX;
					const dy = testObstacle.collisionY - obstacle.collisionY;
					const distance = Math.hypot(dy, dx);

					const distanceBuffer = 150;

					// Определяем суму радиусов двух препятствий
					const sumOfRadii = testObstacle.collisionRadius + obstacle.collisionRadius + distanceBuffer;

					// Проверяем есть коллизия или нет
					if (distance < sumOfRadii) overlap = true;
				})

				const margin = testObstacle.collisionRadius * 3;

				// Если коллизии нет - записываем тестовое препятствие в массив с игровыми препятствиями
				if (!overlap && testObstacle.spriteX > 0 && testObstacle.spriteX < this.width - testObstacle.width &&
					testObstacle.collisionY > this.topMargin + margin && testObstacle.collisionY < this.height - margin)
					this.obstacles.push(testObstacle);

				attempts++;
			}
		}
		removeGameObject() {
			this.eggs = this.eggs.filter(object => !object.markedForDelition);
			this.hatchlings = this.hatchlings.filter(object => !object.markedForDelition);
			this.particles = this.particles.filter(particle => !particle.markedForDelition);
		}
	}

	const game = new Game(canvas);
	game.init();

	let lastTime = 0;

	// Функция, которая будет постоянно обновлять игру
	function animate(timeStamp) {
		// при вызове requestAnimationFrame в функцию которую вызываем передается параметр - время через которое происходит обновление
		// в рендер будем передавать параметр - время обновления анимации
		const deltaTime = timeStamp - lastTime;
		lastTime = timeStamp;

		game.render(ctx, deltaTime);

		// Функция анимация
		window.requestAnimationFrame(animate);
	}
	animate(0);


})
