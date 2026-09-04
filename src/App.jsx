import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import "./App.css";

function App() {
  const mountRef = useRef(null);
  const gameOverRef = useRef(false);
  const [win, setWin] = useState(false);

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    // =========================
    // SCENE
    // =========================

    const scene = new THREE.Scene();

    scene.background = new THREE.Color(0x050816);

    // =========================
    // CAMERA
    // =========================

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    camera.position.set(0, 8, 10);

    // =========================
    // RENDERER
    // =========================

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
    });

    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

    renderer.setPixelRatio(
      Math.min(window.devicePixelRatio, 2)
    );

    mountRef.current.appendChild(
      renderer.domElement
    );

    // =========================
    // LIGHTS
    // =========================

    const ambientLight = new THREE.AmbientLight(
      0xffffff,
      0.7
    );

    scene.add(ambientLight);

    const directionalLight =
      new THREE.DirectionalLight(
        0xffffff,
        1
      );

    directionalLight.position.set(5, 10, 5);

    scene.add(directionalLight);

    // =========================
    // GROUND
    // =========================

    const groundGeometry =
      new THREE.PlaneGeometry(30, 30);

    const groundMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x111827,
      });

    const ground = new THREE.Mesh(
      groundGeometry,
      groundMaterial
    );

    ground.rotation.x = -Math.PI / 2;

    scene.add(ground);

    // Grid

    const grid = new THREE.GridHelper(
      30,
      30,
      0x334155,
      0x1e293b
    );

    grid.position.y = 0.01;

    scene.add(grid);

    // =========================
    // PLAYER
    // =========================

    const playerGeometry =
      new THREE.BoxGeometry(
        1,
        1,
        1
      );

    const playerMaterial =
      new THREE.MeshStandardMaterial({
        color: 0x00aaff,
        metalness: 0.5,
        roughness: 0.3,
      });

    const player = new THREE.Mesh(
      playerGeometry,
      playerMaterial
    );

    player.position.set(
      0,
      0.5,
      0
    );

    scene.add(player);

    // =========================
    // COINS
    // =========================

    const coinGeometry =
      new THREE.CylinderGeometry(
        0.4,
        0.4,
        0.15,
        32
      );

    const coinMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xffd700,
        metalness: 0.8,
        roughness: 0.2,
      });

    const coins = [];

    const coinPositions = [
      { x: 3, z: -3 },
      { x: -3, z: -5 },
      { x: 4, z: -8 },
      { x: -4, z: -10 },
      { x: 2, z: -13 },
    ];

    coinPositions.forEach((position) => {
      const coin = new THREE.Mesh(
        coinGeometry,
        coinMaterial
      );

      coin.position.set(
        position.x,
        0.6,
        position.z
      );

      coin.rotation.x =
        Math.PI / 2;

      scene.add(coin);

      coins.push(coin);
    });

    // =========================
    // OBSTACLES
    // =========================

    const obstacles = [];

    const obstaclePositions = [
      { x: 0, z: -4 },
      { x: 3, z: -7 },
      { x: -3, z: -9 },
      { x: 2, z: -12 },
    ];

    obstaclePositions.forEach((position) => {
      const geometry =
        new THREE.BoxGeometry(
          1.5,
          1.2,
          1.5
        );

      const material =
        new THREE.MeshStandardMaterial({
          color: 0xff2244,
          metalness: 0.3,
          roughness: 0.4,
        });

      const obstacle = new THREE.Mesh(
        geometry,
        material
      );

      obstacle.position.set(
        position.x,
        0.6,
        position.z
      );

      scene.add(obstacle);

      obstacles.push(obstacle);
    });

    // =========================
    // KEYBOARD
    // =========================

    const keys = {};

function handleKeyDown(event) {
  keys[event.key.toLowerCase()] = true;

  if (
    event.code === "Space" &&
    !isJumping
  ) {
    velocityY = jumpPower;
    isJumping = true;
  }
}

    function handleKeyUp(event) {
      keys[event.key.toLowerCase()] =
        false;
    }

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    window.addEventListener(
      "keyup",
      handleKeyUp
    );

    // =========================
    // GAME SETTINGS
    // =========================

    const speed = 0.08;
    
    let velocityY = 0;
    
    const gravity = 0.012;
    
    const jumpPower = 0.22;
    
    let isJumping = false; 

    let lastHitTime = 0;

    const hitCooldown = 1000;

    let animationId;

    // =========================
    // ANIMATION
    // =========================

    function animate() {
      animationId =
        requestAnimationFrame(animate);

    if (!gameOverRef.current) {

        // PLAYER MOVEMENT

        if (
          keys["w"] ||
          keys["arrowup"]
        ) {
          player.position.z -= speed;
        }

        if (
          keys["s"] ||
          keys["arrowdown"]
        ) {
          player.position.z += speed;
        }

        if (
          keys["a"] ||
          keys["arrowleft"]
        ) {
          player.position.x -= speed;
        }

        if (
          keys["d"] ||
          keys["arrowright"]
        ) {
          player.position.x += speed;
        }
        // =====================
// PLAYER JUMP
// =====================

if (isJumping) {
  player.position.y += velocityY;

  velocityY -= gravity;

  if (player.position.y <= 0.5) {
    player.position.y = 0.5;

    velocityY = 0;

    isJumping = false;
  }
}

        // =====================
        // COIN ROTATION
        // =====================

        coins.forEach((coin) => {
          if (coin.visible) {
            coin.rotation.y += 0.05;
          }
        });

        // =====================
        // COIN COLLISION
        // =====================

        coins.forEach((coin) => {
  if (!coin.visible) return;

  const distance =
    player.position.distanceTo(coin.position);

  if (distance < 0.9) {
    coin.visible = false;

    setScore(
      (previousScore) => previousScore + 1
    );
  }
});

// =========================
// WIN CHECK
// =========================

const allCoinsCollected =
  coins.every((coin) => !coin.visible);

if (allCoinsCollected && !gameOverRef.current) {
  gameOverRef.current = true;
  setWin(true);
}

        // =====================
        // OBSTACLE COLLISION
        // =====================

        const playerBox =
          new THREE.Box3().setFromObject(
            player
          );

        const currentTime =
          Date.now();

        obstacles.forEach(
          (obstacle) => {
            const obstacleBox =
              new THREE.Box3().setFromObject(
                obstacle
              );

            if (
  playerBox.intersectsBox(obstacleBox) &&
  player.position.y < 1.2 &&
  currentTime - lastHitTime > hitCooldown
) {
              lastHitTime =
                currentTime;

              // Move player back
              player.position.set(
                0,
                0.5,
                0
              );

             setLives((previousLives) => {
  const newLives = previousLives - 1;

  if (newLives <= 0) {
    gameOverRef.current = true;
    setGameOver(true);
  }

  return Math.max(newLives, 0);
});
            }
          }
        );

        // =====================
        // CAMERA FOLLOW
        // =====================

        camera.position.x =
          player.position.x;

        camera.position.z =
          player.position.z + 10;

        camera.lookAt(
          player.position.x,
          0,
          player.position.z
        );
      }

      renderer.render(
        scene,
        camera
      );
    }

    animate();

    // =========================
    // RESIZE
    // =========================

    function handleResize() {
      camera.aspect =
        window.innerWidth /
        window.innerHeight;

      camera.updateProjectionMatrix();

      renderer.setSize(
        window.innerWidth,
        window.innerHeight
      );
    }

    window.addEventListener(
      "resize",
      handleResize
    );

    // =========================
    // CLEANUP
    // =========================

    return () => {
      cancelAnimationFrame(
        animationId
      );

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );

      window.removeEventListener(
        "keyup",
        handleKeyUp
      );

      window.removeEventListener(
        "resize",
        handleResize
      );

      if (
        mountRef.current &&
        mountRef.current.contains(
          renderer.domElement
        )
      ) {
        mountRef.current.removeChild(
          renderer.domElement
        );
      }

      renderer.dispose();
    };
  },[]);
 


// =========================
// LEVEL SYSTEM
// =========================

useEffect(() => {
  if (score >= 5 && level === 1) {
    setLevel(2);
  }

  if (score >= 10 && level === 2) {
    setLevel(3);
  }
}, [score, level]);




  // =========================
  // RESTART GAME
  // =========================

  function restartGame() {
    window.location.reload();
  }

  return (
    <div ref={mountRef}>

      {/* HUD */}

     <div className="hud">

  <div className="level">
    🏆 Level: {level}
  </div>

  <div className="score">
    🪙 Score: {score}
  </div>

  <div className="lives">
    ❤️ Lives: {lives}
  </div>

</div>

      {/* GAME OVER */}

      {gameOver && (
        
        <div className="game-over">

          <h1>GAME OVER</h1>

          <p>
            Final Score: {score}
          </p>

          <button
            onClick={restartGame}
          >
            🔄 Play Again
          </button>

        </div>
      )
      }
      {win && (
  <div className="game-over win-screen">
    <h1>🎉 YOU WIN!</h1>

    <p>
      All Coins Collected!
    </p>

    <p>
      Final Score: {score}
    </p>

    <button onClick={restartGame}>
      🔄 Play Again
    </button>
  </div>
)}

    </div>
  );
}

export default App;