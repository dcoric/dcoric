// World: procedural tile map, buildings, collision, doors, camera.
window.WORLD = (function () {
  const TILE = 32;
  const MAP_W = 40;
  const MAP_H = 30;
  const VIEW_W = 28; // tiles visible horizontally
  const VIEW_H = 18; // tiles visible vertically

  // Terrain codes
  const GRASS = ".", PATH = ",", TREE = "T", WATER = "W",
        FLOWER = "F", ROCK = "R", CHEST = "C", SIGN = "S",
        BRIDGE = "=";

  // Solid terrain (blocks movement)
  const SOLID = new Set([TREE, WATER, ROCK, CHEST, SIGN]);

  let grid = []; // [y][x] terrain
  let buildings = []; // {x,y,w,h,roof,wall,door:{x,y},id,name,label}
  let doorMap = {}; // "x,y" -> building
  let decor = []; // {type:'tree'|'flower'|'rock'|'sign'|'chest', x, y}

  function makeGrid() {
    grid.length = 0;
    for (let y = 0; y < MAP_H; y++) {
      const row = [];
      for (let x = 0; x < MAP_W; x++) row.push(GRASS);
      grid.push(row);
    }
  }

  function set(x, y, c) {
    if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return;
    grid[y][x] = c;
  }

  function isSolidAt(x, y) {
    if (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H) return true;
    if (SOLID.has(grid[y][x])) return true;
    // building walls block, doors do not
    const b = buildingAt(x, y);
    if (b && !(b.door.x === x && b.door.y === y)) return true;
    return false;
  }

  function buildingAt(x, y) {
    for (const b of buildings) {
      if (x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h) return b;
    }
    return null;
  }

  function doorAt(x, y) {
    return doorMap[x + "," + y] || null;
  }

  // --- Terrain carving ---
  function treeBorder() {
    for (let x = 0; x < MAP_W; x++) { set(x, 0, TREE); set(x, MAP_H - 1, TREE); }
    for (let y = 0; y < MAP_H; y++) { set(0, y, TREE); set(MAP_W - 1, y, TREE); }
  }

  // A winding vertical river on the left third with bridges.
  function river() {
    for (let y = 2; y < MAP_H - 2; y++) {
      const cx = 8 + Math.round(2 * Math.sin(y * 0.4));
      set(cx, y, WATER);
      set(cx + 1, y, WATER);
    }
    // bridges (passable)
    const bridges = [7, 17];
    bridges.forEach((by) => {
      for (let x = 6; x <= 13; x++) set(x, by, BRIDGE);
    });
  }

  // Scatter forest clusters, flowers, rocks (seeded pseudo-random).
  function seededRand(seed) {
    let s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function () {
      s = (s * 16807) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  function scatter() {
    const rnd = seededRand(1337);
    // tree clusters
    const clusters = 14;
    for (let i = 0; i < clusters; i++) {
      const cx = 2 + Math.floor(rnd() * (MAP_W - 4));
      const cy = 2 + Math.floor(rnd() * (MAP_H - 4));
      const n = 3 + Math.floor(rnd() * 5);
      for (let j = 0; j < n; j++) {
        const dx = Math.floor(rnd() * 5) - 2;
        const dy = Math.floor(rnd() * 5) - 2;
        const x = cx + dx, y = cy + dy;
        if (grid[y] && grid[y][x] === GRASS) set(x, y, TREE);
      }
    }
    // flowers
    for (let i = 0; i < 60; i++) {
      const x = 1 + Math.floor(rnd() * (MAP_W - 2));
      const y = 1 + Math.floor(rnd() * (MAP_H - 2));
      if (grid[y][x] === GRASS) set(x, y, FLOWER);
    }
    // rocks
    for (let i = 0; i < 12; i++) {
      const x = 1 + Math.floor(rnd() * (MAP_W - 2));
      const y = 1 + Math.floor(rnd() * (MAP_H - 2));
      if (grid[y][x] === GRASS) set(x, y, ROCK);
    }
  }

  // --- Buildings ---
  function addBuilding(b) {
    buildings.push(b);
    doorMap[b.door.x + "," + b.door.y] = b;
  }

  function placeBuildings() {
    addBuilding({
      id: "about", name: "Home", label: "ABOUT",
      x: 17, y: 4, w: 6, h: 3,
      roof: "#c0392b", wall: "#d9c79a", door: { x: 20, y: 6 },
      desc: "Denis's cabin",
    });
    addBuilding({
      id: "skills", name: "Armory", label: "SKILLS",
      x: 30, y: 4, w: 6, h: 3,
      roof: "#7a4ad6", wall: "#d9c79a", door: { x: 33, y: 6 },
      desc: "Skill tree",
    });
    addBuilding({
      id: "projects", name: "Quest Board", label: "PROJECTS",
      x: 30, y: 13, w: 6, h: 3,
      roof: "#e1ad01", wall: "#d9c79a", door: { x: 30, y: 14 },
      desc: "Quests",
    });
    addBuilding({
      id: "oss", name: "Guild Hall", label: "OPEN SOURCE",
      x: 17, y: 22, w: 8, h: 3,
      roof: "#2e7d32", wall: "#d9c79a", door: { x: 20, y: 22 },
      desc: "OSS guilds",
    });
    addBuilding({
      id: "achievements", name: "Trophy Hall", label: "TROPHIES",
      x: 4, y: 13, w: 6, h: 3,
      roof: "#5ad2ff", wall: "#d9c79a", door: { x: 9, y: 14 },
      desc: "Achievements",
    });
    addBuilding({
      id: "contact", name: "Mailbox", label: "CONTACT",
      x: 4, y: 4, w: 5, h: 3,
      roof: "#ff7ad9", wall: "#d9c79a", door: { x: 6, y: 6 },
      desc: "Get in touch",
    });
  }

  // BFS from plaza center to a door, routing around building footprints
  // (except the target door tile itself). Marks the resulting path as PATH.
  function bfsPath(sx, sy, tx, ty) {
    const W = MAP_W, H = MAP_H;
    const visited = new Array(W * H).fill(false);
    const prev = new Array(W * H).fill(-1);
    const idx = (x, y) => y * W + x;
    const inBounds = (x, y) => x >= 0 && y >= 0 && x < W && y < H;

    // Walkable for BFS: in bounds, not solid terrain (tree/water/rock/etc),
    // not inside a building unless it is the target door tile.
    const walkable = (x, y) => {
      if (!inBounds(x, y)) return false;
      if (SOLID.has(grid[y][x])) return false;
      const b = buildingAt(x, y);
      if (b) {
        if (x === tx && y === ty) return true; // target door
        return false; // any other building tile is blocked
      }
      return true;
    };

    const queue = [idx(sx, sy)];
    visited[idx(sx, sy)] = true;
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    let found = false;
    while (queue.length) {
      const cur = queue.shift();
      const cx = cur % W, cy = (cur / W) | 0;
      if (cx === tx && cy === ty) { found = true; break; }
      for (const [dx, dy] of dirs) {
        const nx = cx + dx, ny = cy + dy;
        if (!inBounds(nx, ny)) continue;
        const ni = idx(nx, ny);
        if (visited[ni]) continue;
        if (!walkable(nx, ny)) continue;
        visited[ni] = true;
        prev[ni] = cur;
        queue.push(ni);
      }
    }
    if (!found) return;
    // Backtrack from target, marking PATH (skip the door tile itself so the
    // building renderer can still treat it as a door; it gets PATH later).
    let cur = idx(tx, ty);
    while (cur !== -1) {
      const cx = cur % W, cy = (cur / W) | 0;
      if (grid[cy][cx] !== WATER) set(cx, cy, PATH);
      cur = prev[cur];
    }
  }

  function paths() {
    const cx = 20, cy = 15; // plaza center
    // plaza
    for (let y = 13; y <= 17; y++)
      for (let x = 17; x <= 23; x++) set(x, y, PATH);
    set(cx, 12, SIGN); // a welcome sign north of the plaza center
    // connect plaza to each door via BFS (around buildings)
    buildings.forEach((b) => {
      bfsPath(cx, cy, b.door.x, b.door.y);
    });
    // a perimeter ring path for nicer exploration
    for (let x = 2; x < MAP_W - 2; x++) { set(x, 2, PATH); set(x, MAP_H - 3, PATH); }
    for (let y = 2; y < MAP_H - 2; y++) { set(2, y, PATH); set(MAP_W - 3, y, PATH); }
  }

  // A hidden treasure chest easter egg in a far corner.
  function placeChest() {
    set(MAP_W - 3, MAP_H - 3, CHEST);
    decor.push({ type: "chest", x: MAP_W - 3, y: MAP_H - 3 });
  }

  // Build decor list from terrain for sprite rendering.
  function buildDecor() {
    decor.length = 0;
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        const c = grid[y][x];
        if (c === TREE) decor.push({ type: "tree", x, y });
        else if (c === FLOWER) decor.push({ type: "flower", x, y });
        else if (c === ROCK) decor.push({ type: "rock", x, y });
        else if (c === SIGN) decor.push({ type: "sign", x, y });
        else if (c === CHEST) decor.push({ type: "chest", x, y });
      }
    }
  }

  function build() {
    makeGrid();
    treeBorder();
    river();
    placeBuildings();
    paths();
    scatter();
    placeChest();
    // Ensure doors + tiles under buildings/plaza stay clear of decor-blocks.
    // Keep building footprints as grass (drawn over by building renderer).
    buildings.forEach((b) => {
      for (let y = b.y; y < b.y + b.h; y++)
        for (let x = b.x; x < b.x + b.w; x++) set(x, y, GRASS);
    });
    // Keep doors walkable.
    buildings.forEach((b) => set(b.door.x, b.door.y, PATH));
    buildDecor();
  }

  // Pixel-space camera that follows the player's interpolated position for
  // smooth scrolling (no per-tile snapping). Returns top-left in world pixels.
  function cameraPx(px, py) {
    const viewWpx = VIEW_W * TILE;
    const viewHpx = VIEW_H * TILE;
    let camX = px - viewWpx / 2;
    let camY = py - viewHpx / 2;
    const maxX = (MAP_W - VIEW_W) * TILE;
    const maxY = (MAP_H - VIEW_H) * TILE;
    camX = maxX > 0 ? Math.max(0, Math.min(camX, maxX)) : 0;
    camY = maxY > 0 ? Math.max(0, Math.min(camY, maxY)) : 0;
    return { x: camX, y: camY };
  }

  // Camera that follows the player, clamped to map bounds.
  function camera(px, py) {
    let camX = px - Math.floor(VIEW_W / 2);
    let camY = py - Math.floor(VIEW_H / 2);
    camX = Math.max(0, Math.min(camX, MAP_W - VIEW_W));
    camY = Math.max(0, Math.min(camY, MAP_H - VIEW_H));
    return { x: camX, y: camY };
  }

  function startTile() {
    return { x: 20, y: 15 };
  }

  return {
    TILE, MAP_W, MAP_H, VIEW_W, VIEW_H,
    GRASS, PATH, TREE, WATER, FLOWER, ROCK, CHEST, SIGN, BRIDGE,
    build, grid, buildings, decor,
    isSolidAt, buildingAt, doorAt, camera, cameraPx, startTile,
  };
})();
