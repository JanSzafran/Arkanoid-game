(function () {
   const gameWrap = document.getElementById("arkanoid");
   const tpl = getElementsByAttribute("ref", gameWrap);

   const {
       top: arenaTop,
       left: arenaLeft,
       right: arenaRight,
       width: arenaWidth,
       height: arenaHeight
   } = tpl.arena.getBoundingClientRect();

   const paddleTop = tpl.paddle.offsetTop;
   const paddleWidth = tpl.paddle.offsetWidth;

   let bricksTop;
   let bricksBottom;

   const ballDiameter = tpl.ball.offsetHeight;
   const ballRadius = ballDiameter / 2;

   let lifes;
   let score = 0;

   let bricksQuantity;

   function mouseMove(e) {
       const x = e.pageX;
       if (arenaLeft < x) {
           if (x < arenaRight - paddleWidth) {
               tpl.paddle.style.left = `${x - arenaLeft}px`;
           }
       }
   }

   function getElementsByAttribute(attr, parent = document) {
       return [...parent.querySelectorAll(`[${attr}]`)].reduce((retObj, element) => {
           const name = element.getAttribute(attr);
           retObj[name] = element;
           element.removeAttribute(attr);
           return retObj;
       }, {});
   }

   tpl.paddle.addEventListener("mouseup", function (event) {
       document.removeEventListener("mousemove", mouseMove, false);
   }, false);

   tpl.paddle.addEventListener("click", function (event) {
       console.log(event.type);
   }, false);

   window.arena = tpl.arena;

   let deltaX = 1;
   let deltaY = -1;

   function startBall() {
       const intervalID = setInterval(function () {
           const ballLeftPos = tpl.ball.offsetLeft + deltaX;
           const ballTopPos = tpl.ball.offsetTop + deltaY;
           tpl.ball.style.top = ballTopPos + "px";
           tpl.ball.style.left = ballLeftPos + "px";

           if (ballLeftPos > arenaWidth - ballDiameter || ballLeftPos <= 0) {
               deltaX *= -1;
           }

           if (
               ballTopPos <= 0 ||
               (
                   ballTopPos >= paddleTop - ballDiameter &&
                   ballLeftPos >= tpl.paddle.offsetLeft + ballRadius &&
                   ballLeftPos <= tpl.paddle.offsetLeft + paddleWidth - ballRadius
               )
           ) {
               deltaY *= -1
           }

           if (ballTopPos >= arenaHeight - ballDiameter) {
               clearInterval(intervalID);
               lifes -= 1;
               tpl.lifes.innerHTML = lifes;

               if (lifes === 0) {
                   setTimeout(function () {
                       alert("GAME OVER");
                   }, 10);
               }

               reset();
           }

           if (ballTopPos >= bricksTop && ballTopPos <= bricksBottom) {
               const element = document.elementFromPoint(
                   arenaLeft + (ballLeftPos + (deltaX === 1 ? ballDiameter : 0)),
                   arenaTop + (ballTopPos + (deltaY === 1 ? ballDiameter : 0))
               );
               if (element.classList.contains("brick")) {
                   element.classList.add("hide");
                   score += Number(element.dataset.score);
                   tpl.score.innerHTML = score;

                   bricksQuantity -= 1;

                   deltaY *= -1;

                   if (!bricksQuantity) {
                       alert("SCORE: " + score);
                   }
               }
           }
       }, 1000 / 500)
   }


   function start() {
       const xhr = new XMLHttpRequest();
       xhr.open("GET", "/api/game");
       xhr.responseType = "json";
       xhr.addEventListener("load", function () {
           const {
               bricks: { quantity },
               lifes: resLifes,
               scoreList
           } = this.response[0];
           const fragment = document.createDocumentFragment();

           const brickElement = document.createElement("div");
           brickElement.classList.add("brick");

           for (let i = 1; i <= quantity; i += 1) {
               const brick = brickElement.cloneNode(true);
               brick.dataset.score = scoreList[Math.floor(Math.random() * 3)];
               fragment.appendChild(brick);
           }

           bricksQuantity = quantity;

           lifes = resLifes;
           tpl.lifes.innerHTML = lifes;
           tpl.score.innerHTML = score;

           tpl.bricks.appendChild(fragment);

           bricksTop = tpl.bricks.offsetTop;
           bricksBottom = bricksTop + tpl.bricks.offsetHeight;
       });
       xhr.send();

       setBallPosition();

       tpl.paddle.addEventListener("mousedown", function (event) {
           document.addEventListener("mousemove", mouseMove, false);
           startBall();
       }, false);

   }

   function setBallPosition() {
       const { ball, paddle } = tpl;
       // const ball = tpl.ball;
       // const paddle = tpl.paddle;
       const ballLeft = paddle.offsetLeft + (paddleWidth / 2) - (ballDiameter / 2);
       const ballTop = paddleTop - ballDiameter;
       ball.style.left = ballLeft + "px";
       ball.style.top = ballTop + "px";
   }

   function setPaddlePosition() {
       const { paddle } = tpl;

       paddle.style.left = (arenaWidth - paddleWidth) / 2 + "px";
   }

   function reset() {
       document.removeEventListener("mousemove", mouseMove, false);
       deltaX = 1;
       deltaY = -1;
       setPaddlePosition();
       setBallPosition();
   }

   start();
}());
