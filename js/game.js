// dcoric.dev ARCADE - main engine.
window.GAME = (function () {
  let canvas, ctx;
  let state = "boot"; // boot | play | panel | dialog
  let lastTime = 0;
  let animTime = 0;
  let raf = null;

  const TILE = WORLD.TILE;

  // Player
  const player = {
    tileX: 20, tileY: 15,
    x: 20 * TILE, y: 15 * TILE,
    tx: 20 * TILE, ty: 15 * TILE,
    dir: "down", moving: false,
    frame: 0, frameTime: 0,
    pendingDoor: null,
  };

  // Input
  const dirStack = []; // most-recent-first ordering of held directions
  const keyDir = {
    ArrowUp: "up", KeyW: "up",
    ArrowDown: "down", KeyS: "down",
    ArrowLeft: "left", KeyA: "left",
    ArrowRight: "right", KeyD: "right",
  };
  let konamiBuffer = [];
  const KONAMI = [
    "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
    "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
    "KeyB", "KeyA",
  ];

  // Progress
  const unlocked = {};
  const stats = {
    visited: new Set(),
    projectsRead: new Set(),
    skillsSeen: new Set(),
    ossVisited: new Set(),
    contactOpened: false,
    chestOpened: false,
  };
  let xp = 0;
  let coins = 0;
  const MAX_XX = 2330;

  // ---- Boot / init ----
  function init() {
    canvas = document.getElementById("game");
    ctx = canvas.getContext("2d");
    canvas.width = WORLD.VIEW_W * TILE;
    canvas.height = WORLD.VIEW_H * TILE;
    ctx.imageSmoothingEnabled = false;

    WORLD.build();
    const st = WORLD.startTile();
    player.tileX = st.x; player.tileY = st.y;
    player.x = st.x * TILE; player.y = st.y * TILE;
    player.tx = player.x; player.ty = player.y;

    bindInput();
    bindHud();
    renderBoot();

    lastTime = performance.now();
    raf = requestAnimationFrame(loop);
  }

  // ---- Main loop ----
  function loop(t) {
    const dt = Math.min(0.05, (t - lastTime) / 1000);
    lastTime = t;
    animTime += dt;
    update(dt);
    render();
    raf = requestAnimationFrame(loop);
  }

  // ---- Update ----
  function update(dt) {
    if (state !== "play") return;

    if (player.moving) {
      const speed = 140; // px/s
      const dx = player.tx - player.x;
      const dy = player.ty - player.y;
      const dist = Math.hypot(dx, dy);
      const step = speed * dt;
      if (dist <= step) {
        player.x = player.tx;
        player.y = player.ty;
        player.moving = false;
        player.frame = 0;
        onArrive();
      } else {
        player.x += (dx / dist) * step;
        player.y += (dy / dist) * step;
        player.frameTime += dt;
        if (player.frameTime > 0.14) {
          player.frameTime = 0;
          player.frame = (player.frame + 1) % 2;
        }
      }
      return;
    }

    // Attempt new move from held direction.
    const dir = dirStack.length ? dirStack[dirStack.length - 1] : null;
    if (dir) tryMove(dir);
  }

  function tryMove(dir) {
    player.dir = dir;
    let nx = player.tileX, ny = player.tileY;
    if (dir === "up") ny--;
    else if (dir === "down") ny++;
    else if (dir === "left") nx--;
    else if (dir === "right") nx++;

    if (WORLD.isSolidAt(nx, ny)) {
      SFX.bump();
      return;
    }
    player.tileX = nx;
    player.tileY = ny;
    player.tx = nx * TILE;
    player.ty = ny * TILE;
    player.moving = true;
    player.frameTime = 0;
    SFX.move();
  }

  function onArrive() {
    const door = WORLD.doorAt(player.tileX, player.tileY);
    if (door && !player.pendingDoor) {
      player.pendingDoor = door;
      SFX.open();
      setTimeout(() => {
        if (player.pendingDoor === door) {
          openPanel(door.id);
          player.pendingDoor = null;
        }
      }, 160);
    }
  }

  // ---- Interact (Space/Enter) ----
  function interact() {
    if (state === "boot") { startGame(); return; }
    if (state === "panel") { closePanel(); return; }
    if (state === "dialog") { closeDialog(); return; }
    if (state !== "play") return;

    // tile in front
    let fx = player.tileX, fy = player.tileY;
    if (player.dir === "up") fy--;
    else if (player.dir === "down") fy++;
    else if (player.dir === "left") fx--;
    else if (player.dir === "right") fx++;

    const c = WORLD.grid[fy] && WORLD.grid[fy][fx];
    if (c === WORLD.CHEST) { openChest(fx, fy); return; }
    if (c === WORLD.SIGN) { showSign(); return; }
    const door = WORLD.doorAt(fx, fy);
    if (door) { openPanel(door.id); return; }
    SFX.blip();
  }

  function showSign() {
    SFX.confirm();
    showDialog(
      "WELCOME, TRAVELER",
      [
        "This is the dcoric.dev ARCADE.",
        "Use ARROW KEYS or WASD to walk around.",
        "Step into buildings to explore Denis's profile.",
        "Find the hidden treasure chest for a reward!",
        "Press M to toggle music. Press ESC to close panels.",
      ]
    );
  }

  function openChest(x, y) {
    if (stats.chestOpened) { SFX.error(); showDialog("EMPTY", ["You already looted this chest."]); return; }
    stats.chestOpened = true;
    WORLD.grid[y][x] = WORLD.GRASS;
    const di = WORLD.decor.findIndex((d) => d.x === x && d.y === y);
    if (di >= 0) WORLD.decor.splice(di, 1);
    SFX.coin();
    award(500, 500);
    showDialog("TREASURE!", [
      "You found a hidden chest!",
      "+500 XP  +500 GOLD",
      "Denis says: thanks for exploring every corner.",
    ]);
    unlock("treasure");
    checkCartographer();
  }

  // ---- Start game from boot ----
  function startGame() {
    SFX.init();
    SFX.resume();
    SFX.start();
    SFX.startMusic();
    updateMusicBtn();
    state = "play";
    document.getElementById("boot").classList.add("hidden");
    document.getElementById("hud").classList.remove("hidden");
    updateHud();
    toast("Tip: walk into buildings with ARROW KEYS", 4000);
  }

  // ---- Render ----
  function render() {
    if (state === "boot") { renderBoot(); return; }
    renderWorld();
    renderMinimap();
  }

  function renderWorld() {
    // Pixel-space camera follows the player's interpolated position so the
    // world scrolls smoothly instead of snapping a tile per step.
    const cam = WORLD.cameraPx(player.x + TILE / 2, player.y + TILE / 2);
    ctx.fillStyle = "#0d0d12";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Visible tile range (+1 to cover sub-pixel edges).
    const startX = Math.floor(cam.x / TILE);
    const startY = Math.floor(cam.y / TILE);
    const endX = startX + WORLD.VIEW_W + 1;
    const endY = startY + WORLD.VIEW_H + 1;

    // Terrain
    for (let y = startY; y < endY; y++) {
      if (y < 0 || y >= WORLD.MAP_H) continue;
      for (let x = startX; x < endX; x++) {
        if (x < 0 || x >= WORLD.MAP_W) continue;
        drawTile(x, y, x * TILE - cam.x, y * TILE - cam.y);
      }
    }

    // Buildings
    WORLD.buildings.forEach((b) => drawBuilding(b, cam));

    // Decor sprites (sorted by y for fake depth)
    const visibleDecor = WORLD.decor
      .filter((d) => d.x >= startX - 1 && d.x <= endX && d.y >= startY - 1 && d.y <= endY)
      .sort((a, b) => a.y - b.y);
    visibleDecor.forEach((d) => {
      SPR.tile(ctx, d.type, d.x * TILE - cam.x, d.y * TILE - cam.y, 2);
    });

    // Player (drawn at its smooth interpolated pixel position)
    SPR.player(ctx, player.dir, player.frame, player.x - cam.x, player.y - cam.y, 2);

    // Interaction hint
    drawInteractHint(cam);

    // Location label near buildings
    drawNearbyLabel();
  }

  function drawTile(x, y, sx, sy) {
    const c = WORLD.grid[y][x];
    if (c === WORLD.GRASS) {
      ctx.fillStyle = (x + y) % 2 === 0 ? "#5fae3a" : "#56a334";
      ctx.fillRect(sx, sy, TILE, TILE);
    } else if (c === WORLD.PATH) {
      ctx.fillStyle = "#c2a878";
      ctx.fillRect(sx, sy, TILE, TILE);
      ctx.fillStyle = "#b8975f";
      ctx.fillRect(sx, sy, TILE, 2);
    } else if (c === WORLD.BRIDGE) {
      ctx.fillStyle = "#8d5524";
      ctx.fillRect(sx, sy, TILE, TILE);
      ctx.fillStyle = "#6b3d16";
      ctx.fillRect(sx, sy + 14, TILE, 4);
    } else if (c === WORLD.WATER) {
      const sh = Math.floor(animTime * 2 + x * 0.5) % 4;
      ctx.fillStyle = "#2a5a9c";
      ctx.fillRect(sx, sy, TILE, TILE);
      ctx.fillStyle = "#3a78c2";
      ctx.fillRect(sx, sy, TILE, TILE);
      ctx.fillStyle = "rgba(111,168,220,0.5)";
      if (sh === 0) ctx.fillRect(sx + 4, sy + 8, 8, 3);
      else if (sh === 1) ctx.fillRect(sx + 16, sy + 18, 8, 3);
      else if (sh === 2) ctx.fillRect(sx + 10, sy + 22, 8, 3);
    } else if (c === WORLD.CHEST || c === WORLD.TREE || c === WORLD.FLOWER ||
               c === WORLD.ROCK || c === WORLD.SIGN) {
      // grass underneath
      ctx.fillStyle = (x + y) % 2 === 0 ? "#5fae3a" : "#56a334";
      ctx.fillRect(sx, sy, TILE, TILE);
    } else {
      ctx.fillStyle = "#5fae3a";
      ctx.fillRect(sx, sy, TILE, TILE);
    }
  }

  function drawBuilding(b, cam) {
    const sx = b.x * TILE - cam.x;
    const sy = b.y * TILE - cam.y;
    if (sx + b.w * TILE < 0 || sy + b.h * TILE < 0) return;
    if (sx > canvas.width || sy > canvas.height) return;
    const W = b.w * TILE, H = b.h * TILE;

    // shadow
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.fillRect(sx + 4, sy + H - 4, W, 6);

    // walls
    ctx.fillStyle = b.wall;
    ctx.fillRect(sx, sy + TILE, W, (b.h - 1) * TILE);
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    ctx.fillRect(sx, sy + (b.h - 1) * TILE, W, 4); // base shadow

    // roof
    ctx.fillStyle = b.roof;
    ctx.fillRect(sx - 2, sy, W + 4, TILE);
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(sx - 2, sy + TILE - 4, W + 4, 4);
    // roof trim
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.fillRect(sx - 2, sy, W + 4, 4);

    // door
    const dx = b.door.x * TILE - cam.x;
    const dy = b.door.y * TILE - cam.y;
    ctx.fillStyle = "#3a2a1a";
    ctx.fillRect(dx + 6, dy + 6, TILE - 12, TILE - 6);
    ctx.fillStyle = "#6b4a2b";
    ctx.fillRect(dx + 8, dy + 8, TILE - 16, TILE - 10);
    ctx.fillStyle = "#e1ad01";
    ctx.fillRect(dx + TILE - 14, dy + TILE / 2, 3, 3); // knob

    // label plaque above roof
    const label = b.label;
    ctx.font = "10px 'Press Start 2P', monospace";
    ctx.textAlign = "center";
    const tw = ctx.measureText(label).width + 10;
    const lx = sx + W / 2;
    const ly = sy - 14;
    ctx.fillStyle = "rgba(13,13,18,0.85)";
    ctx.fillRect(lx - tw / 2, ly - 10, tw, 14);
    ctx.fillStyle = b.roof;
    ctx.fillRect(lx - tw / 2, ly - 10, tw, 2);
    ctx.fillStyle = "#f4f4f8";
    ctx.fillText(label, lx, ly);
    ctx.textAlign = "left";
  }

  function drawInteractHint(cam) {
    if (state !== "play" || player.moving) return;
    let fx = player.tileX, fy = player.tileY;
    if (player.dir === "up") fy--;
    else if (player.dir === "down") fy++;
    else if (player.dir === "left") fx--;
    else if (player.dir === "right") fx++;
    const c = WORLD.grid[fy] && WORLD.grid[fy][fx];
    const door = WORLD.doorAt(fx, fy);
    if (!c && !door) return;
    if (c === WORLD.CHEST || c === WORLD.SIGN || door) {
      const hx = fx * TILE - cam.x;
      const hy = fy * TILE - cam.y;
      const bob = Math.sin(animTime * 4) * 2;
      ctx.fillStyle = "rgba(13,13,18,0.85)";
      ctx.fillRect(hx + 4, hy - 18 + bob, TILE - 8, 12);
      ctx.fillStyle = "#ffd166";
      ctx.font = "8px 'Press Start 2P', monospace";
      ctx.textAlign = "center";
      ctx.fillText("SPACE", hx + TILE / 2, hy - 9 + bob);
      ctx.textAlign = "left";
    }
  }

  function drawNearbyLabel() {
    let nearest = null, nd = 99;
    WORLD.buildings.forEach((b) => {
      const d = Math.abs(b.door.x - player.tileX) + Math.abs(b.door.y - player.tileY);
      if (d < nd) { nd = d; nearest = b; }
    });
    const el = document.getElementById("location-label");
    if (nearest && nd <= 3) {
      el.textContent = "▶ " + nearest.name + " — " + nearest.desc;
      el.classList.remove("hidden");
    } else {
      el.classList.add("hidden");
    }
  }

  // ---- Minimap ----
  function renderMinimap() {
    const el = document.getElementById("minimap");
    if (!el) return;
    const mctx = el.getContext("2d");
    const W = el.width, H = el.height;
    mctx.clearRect(0, 0, W, H);
    mctx.fillStyle = "rgba(13,13,18,0.7)";
    mctx.fillRect(0, 0, W, H);
    const sx = W / WORLD.MAP_W;
    const sy = H / WORLD.MAP_H;
    // water + paths faint
    for (let y = 0; y < WORLD.MAP_H; y++) {
      for (let x = 0; x < WORLD.MAP_W; x++) {
        const c = WORLD.grid[y][x];
        if (c === WORLD.WATER) { mctx.fillStyle = "#2a5a9c"; mctx.fillRect(x * sx, y * sy, sx, sy); }
        else if (c === WORLD.PATH || c === WORLD.BRIDGE) { mctx.fillStyle = "rgba(194,168,120,0.4)"; mctx.fillRect(x * sx, y * sy, sx, sy); }
      }
    }
    // buildings
    WORLD.buildings.forEach((b) => {
      mctx.fillStyle = b.roof;
      mctx.fillRect(b.x * sx, b.y * sy, b.w * sx, b.h * sy);
      if (stats.visited.has(b.id)) {
        mctx.fillStyle = "rgba(255,255,255,0.5)";
        mctx.fillRect(b.x * sx, b.y * sy, b.w * sx, 1);
      }
    });
    // player
    mctx.fillStyle = "#ffd166";
    mctx.fillRect(player.tileX * sx - 1, player.tileY * sy - 1, sx + 2, sy + 2);
    mctx.strokeStyle = "#0d0d12";
    mctx.strokeRect(player.tileX * sx - 1, player.tileY * sy - 1, sx + 2, sy + 2);
  }

  // ---- Boot screen ----
  function renderBoot() {
    const w = canvas.width, h = canvas.height;
    // bg gradient
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, "#101427");
    g.addColorStop(1, "#0d0d12");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // starfield
    for (let i = 0; i < 60; i++) {
      const sx = (i * 73) % w;
      const sy = (i * 131 + Math.sin(animTime + i) * 6) % h;
      const a = 0.3 + 0.5 * Math.abs(Math.sin(animTime * 2 + i));
      ctx.fillStyle = "rgba(90,210,255," + a.toFixed(2) + ")";
      ctx.fillRect(sx, sy, 2, 2);
    }
    // grid floor
    ctx.strokeStyle = "rgba(90,210,255,0.12)";
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 32) {
      ctx.beginPath(); ctx.moveTo(x, h * 0.62); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let i = 0; i < 8; i++) {
      const y = h * 0.62 + i * 18;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }

    // Title
    ctx.textAlign = "center";
    ctx.fillStyle = "#5ad2ff";
    ctx.font = "28px 'Press Start 2P', monospace";
    ctx.fillText("DCORIC.DEV", w / 2, h * 0.32);
    ctx.fillStyle = "#ff7ad9";
    ctx.font = "14px 'Press Start 2P', monospace";
    ctx.fillText("A R C A D E", w / 2, h * 0.32 + 28);

    ctx.fillStyle = "#f4f4f8";
    ctx.font = "10px 'Press Start 2P', monospace";
    ctx.fillText("Denis Ćorić — Full-Stack Engineer", w / 2, h * 0.32 + 60);

    // idle player sprite
    SPR.player(ctx, "down", Math.floor(animTime * 2) % 2, w / 2 - 16, h * 0.5, 2);

    // blinking prompt
    if (Math.floor(animTime * 2) % 2 === 0) {
      ctx.fillStyle = "#ffd166";
      ctx.font = "12px 'Press Start 2P', monospace";
      ctx.fillText("PRESS  SPACE  /  ENTER  TO  START", w / 2, h * 0.82);
    }
    ctx.fillStyle = "rgba(244,244,248,0.5)";
    ctx.font = "8px 'Press Start 2P', monospace";
    ctx.fillText("ARROWS / WASD = MOVE     M = MUSIC     ESC = CLOSE", w / 2, h * 0.9);
    ctx.textAlign = "left";
  }

  // ---- Panels (HTML overlays) ----
  function openPanel(id) {
    state = "panel";
    SFX.open();
    const map = {
      about: buildAbout,
      skills: buildSkills,
      projects: buildProjects,
      oss: buildOss,
      achievements: buildAchievements,
      contact: buildContact,
    };
    const fn = map[id];
    if (!fn) return;
    fn();
    document.getElementById("panel").classList.remove("hidden");
    document.getElementById("panel").scrollTop = 0;

    if (!stats.visited.has(id)) {
      stats.visited.add(id);
      award(100, 50);
    }
    checkCartographer();
    updateHud();
  }

  function closePanel() {
    if (state !== "panel") return;
    SFX.back();
    state = "play";
    document.getElementById("panel").classList.add("hidden");
    document.getElementById("panel-body").innerHTML = "";
  }

  function panelHeader(title, sub) {
    const body = document.getElementById("panel-body");
    body.innerHTML = "";
    const h = document.createElement("div");
    h.className = "panel-head";
    h.innerHTML =
      '<div class="panel-title">' + esc(title) + "</div>" +
      (sub ? '<div class="panel-sub">' + esc(sub) + "</div>" : "");
    body.appendChild(h);
  }

  function buildAbout() {
    panelHeader("ABOUT — " + DATA.player.name, DATA.player.title + " @ " + DATA.player.guild);
    const body = document.getElementById("panel-body");
    const a = DATA.about;

    const card = document.createElement("div");
    card.className = "char-card";
    card.innerHTML =
      '<div class="char-avatar"><img src="' + DATA.player.avatarUrl + '" alt="avatar"></div>' +
      '<div class="char-stats">' +
      '<div class="cs-row"><span>NAME</span><b>' + esc(DATA.player.name) + "</b></div>" +
      '<div class="cs-row"><span>CLASS</span><b>Full-Stack Engineer</b></div>' +
      '<div class="cs-row"><span>GUILD</span><b>G-Research</b></div>' +
      '<div class="cs-row"><span>BASE</span><b>Belgrade, Serbia</b></div>' +
      '<div class="cs-row"><span>LEVEL</span><b>' + DATA.player.level + "</b></div>" +
      "</div>";
    body.appendChild(card);

    const tag = document.createElement("p");
    tag.className = "lead";
    tag.textContent = DATA.player.tagline;
    body.appendChild(tag);

    a.body.forEach((p) => {
      const el = document.createElement("p");
      el.textContent = p;
      body.appendChild(el);
    });

    const stats = document.createElement("div");
    stats.className = "stat-row";
    a.stats.forEach((s) => {
      stats.innerHTML +=
        '<div class="stat-box"><div class="stat-ic">' + s.icon + "</div>" +
        '<div class="stat-v">' + esc(s.value) + "</div>" +
        '<div class="stat-l">' + esc(s.label) + "</div></div>";
    });
    body.appendChild(stats);

    const h2 = document.createElement("h3");
    h2.textContent = "Bio";
    body.appendChild(h2);
    const ul = document.createElement("ul");
    ul.className = "bio-list";
    DATA.about.bio.forEach((b) => {
      const li = document.createElement("li");
      li.textContent = b;
      ul.appendChild(li);
    });
    body.appendChild(ul);

    const h3 = document.createElement("h3");
    h3.textContent = "What I'm focused on";
    body.appendChild(h3);
    DATA.about.focus.forEach((f) => {
      const el = document.createElement("div");
      el.className = "focus-card";
      el.innerHTML =
        '<div class="focus-title">' + esc(f.title) + "</div>" +
        '<div class="focus-text">' + esc(f.text) + "</div>";
      body.appendChild(el);
    });
  }

  function buildSkills() {
    panelHeader("SKILLS — Armory", "Skill tree & equipped technologies");
    const body = document.getElementById("panel-body");
    DATA.skills.groups.forEach((g, gi) => {
      const wrap = document.createElement("div");
      wrap.className = "skill-group";
      wrap.style.setProperty("--accent", g.color);
      const head = document.createElement("div");
      head.className = "skill-group-head";
      head.innerHTML =
        '<span class="skill-dot" style="background:' + g.color + '"></span>' +
        '<span>' + esc(g.name) + "</span>" +
        '<span class="skill-count">' + g.skills.length + " skills</span>";
      wrap.appendChild(head);

      const list = document.createElement("div");
      list.className = "skill-list";
      g.skills.forEach((s) => {
        const bars = "";
        let barHtml = "";
        for (let i = 0; i < 10; i++) {
          barHtml += '<span class="lvl ' + (i < s.level ? "on" : "") + '"></span>';
        }
        const row = document.createElement("div");
        row.className = "skill-row";
        row.innerHTML =
          '<div class="skill-name">' + esc(s.name) + "</div>" +
          '<div class="skill-bar">' + barHtml + "</div>" +
          '<div class="skill-lv">Lv ' + s.level + "</div>";
        list.appendChild(row);
      });
      wrap.appendChild(list);
      body.appendChild(wrap);

      if (!stats.skillsSeen.has(g.name)) {
        stats.skillsSeen.add(g.name);
        award(60, 30);
      }
    });
    if (stats.skillsSeen.size >= DATA.skills.groups.length) unlock("armorer");
    updateHud();
  }

  function buildProjects() {
    panelHeader("PROJECTS — Quest Board", "Accept a quest to inspect the spoils");
    const body = document.getElementById("panel-body");
    DATA.projects.forEach((p) => {
      const card = document.createElement("div");
      card.className = "quest-card";
      card.innerHTML =
        '<div class="quest-top">' +
          '<div class="quest-name">' + esc(p.name) + "</div>" +
          '<div class="quest-stars">' + stars(p.difficulty) + "</div>" +
        "</div>" +
        '<div class="quest-tag">' + esc(p.tagline) + "</div>" +
        '<div class="quest-tags">' + p.tags.map((t) => "<span>" + esc(t) + "</span>").join("") + "</div>" +
        '<div class="quest-reward">REWARD +' + p.reward + " XP</div>";
      card.addEventListener("click", () => openQuest(p, card));
      body.appendChild(card);
    });
  }

  function openQuest(p, card) {
    SFX.confirm();
    const existing = document.querySelector(".quest-detail");
    if (existing) existing.remove();
    const detail = document.createElement("div");
    detail.className = "quest-detail";
    detail.innerHTML =
      '<div class="qd-desc">' + esc(p.desc) + "</div>" +
      '<a class="qd-link" href="' + p.link + '" target="_blank" rel="noopener">▶ View on GitHub</a>';
    card.after(detail);
    if (!stats.projectsRead.has(p.id)) {
      stats.projectsRead.add(p.id);
      award(40, 20);
    }
    if (stats.projectsRead.size >= DATA.projects.length) unlock("scholar");
    updateHud();
  }

  function buildOss() {
    panelHeader("OPEN SOURCE — Guild Hall", "Guilds Denis contributes to");
    const body = document.getElementById("panel-body");
    DATA.oss.forEach((o) => {
      const card = document.createElement("div");
      card.className = "guild-card";
      card.innerHTML =
        '<div class="guild-badge">' + o.badge + "</div>" +
        '<div class="guild-info">' +
          '<div class="guild-org">' + esc(o.org) + "</div>" +
          '<div class="guild-name">' + esc(o.name) + "</div>" +
          '<div class="guild-role">' + esc(o.role) + "</div>" +
        "</div>";
      card.addEventListener("click", () => {
        SFX.coin();
        const ex = card.querySelector(".guild-desc");
        if (ex) { ex.remove(); return; }
        const d = document.createElement("div");
        d.className = "guild-desc";
        d.innerHTML = esc(o.desc) +
          ' <a href="' + o.link + '" target="_blank" rel="noopener">open ▶</a>';
        card.appendChild(d);
        if (!stats.ossVisited.has(o.org)) {
          stats.ossVisited.add(o.org);
          award(80, 40);
        }
        if (stats.ossVisited.size >= DATA.oss.length) unlock("guildmaster");
        updateHud();
      });
      body.appendChild(card);
    });
  }

  function buildAchievements() {
    panelHeader("TROPHIES — Hall of Fame", "GitHub badges + in-game achievements");
    const body = document.getElementById("panel-body");
    const grid = document.createElement("div");
    grid.className = "ach-grid";
    DATA.achievements.forEach((a) => {
      const got = unlocked[a.id] || (!a.hidden && a.source === "GitHub");
      const cell = document.createElement("div");
      cell.className = "ach-cell " + (got ? "got" : "locked");
      cell.innerHTML =
        '<div class="ach-ic">' + (got ? a.icon : "❓") + "</div>" +
        '<div class="ach-info">' +
          '<div class="ach-name">' + (got ? esc(a.name) : "???") +
            (a.tier ? ' <span class="ach-tier">' + esc(a.tier) + "</span>" : "") + "</div>" +
          '<div class="ach-desc">' + (got ? esc(a.desc) : "Hidden achievement") + "</div>" +
          '<div class="ach-src">' + esc(a.source) + "</div>" +
        "</div>";
      grid.appendChild(cell);
    });
    body.appendChild(grid);
  }

  function buildContact() {
    panelHeader("CONTACT — Mailbox", "Open a channel to reach out");
    const body = document.getElementById("panel-body");
    const lead = document.createElement("p");
    lead.className = "lead";
    lead.textContent =
      "Open to collaborations, consulting, and interesting conversations about software, open source, or anything in between.";
    body.appendChild(lead);
    DATA.contact.forEach((c) => {
      const a = document.createElement("a");
      a.className = "contact-link";
      a.href = c.url;
      a.target = "_blank";
      a.rel = "noopener";
      a.innerHTML =
        '<span class="contact-ic">' + c.icon + "</span>" +
        '<span class="contact-label">' + esc(c.label) + "</span>" +
        '<span class="contact-handle">' + esc(c.handle) + "</span>" +
        '<span class="contact-go">▶</span>';
      a.addEventListener("click", () => {
        SFX.coin();
        if (!stats.contactOpened) {
          stats.contactOpened = true;
          award(50, 25);
          unlock("social");
        }
        updateHud();
      });
      body.appendChild(a);
    });
  }

  // ---- Dialog (small in-world box) ----
  function showDialog(title, lines) {
    state = "dialog";
    const d = document.getElementById("dialog");
    d.querySelector(".dialog-title").textContent = title;
    const body = d.querySelector(".dialog-body");
    body.innerHTML = "";
    lines.forEach((l) => {
      const p = document.createElement("p");
      p.textContent = l;
      body.appendChild(p);
    });
    d.classList.remove("hidden");
  }
  function closeDialog() {
    if (state !== "dialog") return;
    SFX.back();
    state = "play";
    document.getElementById("dialog").classList.add("hidden");
  }

  // ---- Achievements / awards ----
  function award(xpAdd, coinAdd) {
    xp += xpAdd;
    coins += coinAdd;
    updateHud();
  }

  function unlock(id) {
    if (unlocked[id]) return;
    unlocked[id] = true;
    const a = DATA.achievements.find((x) => x.id === id);
    if (!a) return;
    SFX.achievement();
    toast("🏆 ACHIEVEMENT: " + a.name, 4200);
    updateHud();
  }

  function checkCartographer() {
    const all = WORLD.buildings.map((b) => b.id);
    if (all.every((id) => stats.visited.has(id))) unlock("explorer");
  }

  // ---- HUD ----
  function updateHud() {
    document.getElementById("hud-name").textContent = DATA.player.name;
    document.getElementById("hud-title").textContent = DATA.player.title;
    document.getElementById("hud-level").textContent = "LV " + DATA.player.level;
    document.getElementById("hud-coins").textContent = coins;
    const pct = Math.min(100, (xp / MAX_XX) * 100);
    document.getElementById("xp-fill").style.width = pct + "%";
    document.getElementById("xp-val").textContent = xp + " / " + MAX_XX + " XP";
    const achCount = DATA.achievements.filter(
      (a) => unlocked[a.id] || (!a.hidden && a.source === "GitHub")
    ).length;
    document.getElementById("hud-ach").textContent = achCount + "/" + DATA.achievements.length;
  }

  function updateMusicBtn() {
    const btn = document.getElementById("btn-music");
    btn.textContent = SFX.isMusicOn() ? "♪ ON" : "♪ OFF";
  }

  // ---- Toast ----
  function toast(msg, dur) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.remove("hidden");
    t.classList.add("show");
    clearTimeout(t._timer);
    t._timer = setTimeout(() => {
      t.classList.remove("show");
      t.classList.add("hidden");
    }, dur || 3000);
  }

  // ---- Helpers ----
  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
  }
  function stars(n) {
    let s = "";
    for (let i = 0; i < 5; i++) s += i < n ? "★" : "☆";
    return s;
  }

  // ---- Input binding ----
  function bindInput() {
    window.addEventListener("keydown", (e) => {
      // Konami tracking (only arrows + b/a)
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "KeyB", "KeyA"].includes(e.code)) {
        konamiBuffer.push(e.code);
        if (konamiBuffer.length > KONAMI.length) konamiBuffer.shift();
        if (KONAMI.every((k, i) => konamiBuffer[i] === k)) {
          konamiBuffer = [];
          if (!unlocked["konami"]) {
            unlock("konami");
            award(300, 200);
            toast("↑↑↓↓←→←→ B A — Cheater! ;) +300 XP", 5000);
          } else {
            SFX.blip();
          }
        }
      }

      if (e.code === "Space" || e.code === "Enter") {
        e.preventDefault();
        interact();
        return;
      }
      if (e.code === "Escape") {
        if (state === "panel") closePanel();
        else if (state === "dialog") closeDialog();
        return;
      }
      if (e.code === "KeyM") {
        SFX.toggleMusic();
        updateMusicBtn();
        return;
      }
      const d = keyDir[e.code];
      if (d) {
        e.preventDefault();
        if (state !== "play") return;
        const i = dirStack.indexOf(d);
        if (i >= 0) dirStack.splice(i, 1);
        dirStack.push(d);
        // Immediate single-tile move on tap (so quick keypresses register
        // even if keyup fires before the next animation frame).
        if (!player.moving) tryMove(d);
      }
    });

    window.addEventListener("keyup", (e) => {
      const d = keyDir[e.code];
      if (d) {
        const i = dirStack.indexOf(d);
        if (i >= 0) dirStack.splice(i, 1);
      }
    });

    // Lose focus -> clear dirs
    window.addEventListener("blur", () => { dirStack.length = 0; });
  }

  // On-screen D-pad
  function bindHud() {
    const press = (dir) => {
      if (state !== "play") return;
      const i = dirStack.indexOf(dir);
      if (i >= 0) dirStack.splice(i, 1);
      dirStack.push(dir);
      if (!player.moving) tryMove(dir);
    };
    const release = (dir) => {
      const i = dirStack.indexOf(dir);
      if (i >= 0) dirStack.splice(i, 1);
    };
    const bindBtn = (id, dir) => {
      const b = document.getElementById(id);
      if (!b) return;
      const down = (e) => { e.preventDefault(); press(dir); };
      const up = (e) => { e.preventDefault(); release(dir); };
      b.addEventListener("mousedown", down);
      b.addEventListener("touchstart", down, { passive: false });
      b.addEventListener("mouseup", up);
      b.addEventListener("mouseleave", up);
      b.addEventListener("touchend", up);
    };
    bindBtn("dp-up", "up");
    bindBtn("dp-down", "down");
    bindBtn("dp-left", "left");
    bindBtn("dp-right", "right");

    const actBtn = document.getElementById("dp-action");
    if (actBtn) actBtn.addEventListener("click", (e) => { e.preventDefault(); interact(); });

    const musicBtn = document.getElementById("btn-music");
    if (musicBtn) musicBtn.addEventListener("click", () => {
      SFX.init(); SFX.resume();
      SFX.toggleMusic();
      updateMusicBtn();
    });

    const helpBtn = document.getElementById("btn-help");
    if (helpBtn) helpBtn.addEventListener("click", () => {
      if (state === "play") showSign();
    });

    const closeBtn = document.getElementById("panel-close");
    if (closeBtn) closeBtn.addEventListener("click", closePanel);

    const dialogClose = document.getElementById("dialog-close");
    if (dialogClose) dialogClose.addEventListener("click", closeDialog);
  }

  return { init, start: startGame };
})();
