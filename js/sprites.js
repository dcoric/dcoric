// Pixel-art sprite definitions + renderer.
// Sprites are 16x16, drawn from a compact string map using a palette.
window.SPR = (function () {
  // Palette keys -> colors. '.' = transparent.
  const P = {
    K: "#0d0d12", // outline / black
    S: "#3a2a1a", // dark brown (hair/shoes)
    H: "#6b4a2b", // brown hair
    R: "#e8a87c", // skin
    r: "#c97f5a", // skin shadow
    W: "#f4f4f8", // white (eyes)
    E: "#1a1a22", // eye / dark
    B: "#3a6ea5", // shirt blue
    b: "#2a4f7a", // shirt shadow
    P: "#7a4ad6", // purple accent
    G: "#2e7d32", // green
    g: "#1b5e20", // dark green
    y: "#ffd166", // gold
    Y: "#f4a300",
    o: "#ff7ad9", // pink
    C: "#5ad2ff", // cyan
    L: "#9be7c4", // light green
    D: "#8d5524", // dark wood
    d: "#6b3d16", // wood
    t: "#c2a878", // tan path
    n: "#d9c79a", // light path
    a: "#7ec850", // grass light
    A: "#5fae3a", // grass
    q: "#3f7e26", // grass dark
    u: "#3a78c2", // water
    U: "#2a5a9c", // water dark
    v: "#6fa8dc", // water light
    M: "#9aa0a6", // stone gray
    m: "#6b7280", // stone dark
    F: "#ff5d73", // flower red
    f: "#ffd166", // flower yellow center
  };

  // Player character, 16x16. 4 directions, 2 frames each (walk anim).
  // Format: array of 16 strings of 16 chars.
  function parse(rows) {
    return rows.map((r) => r.split("").map((c) => (c === "." ? null : c)));
  }

  // Down-facing
  const playerDown = parse([
    "................",
    "................",
    ".....KKKKKK.....",
    "....KHHHHHHK....",
    "...KHHHHHHHHK...",
    "...KRRRRRRRRK...",
    "..KRRRWWRRRRK...",
    "..KRRRWWRRRRK...",
    "..KRRRRRRRRRK...",
    "...KRRRRRRRK....",
    "....KBBBBBBK....",
    "...KBBBPBPBBK...",
    "...KBBBPBPBBK...",
    "...KBBBPPpBBK...",
    "...KKK....KKK...",
    "....SS....SS....",
  ]);

  const playerDown2 = parse([
    "................",
    "................",
    ".....KKKKKK.....",
    "....KHHHHHHK....",
    "...KHHHHHHHHK...",
    "...KRRRRRRRRK...",
    "..KRRRWWRRRRK...",
    "..KRRRWWRRRRK...",
    "..KRRRRRRRRRK...",
    "...KRRRRRRRK....",
    "....KBBBBBBK....",
    "...KBBBPBPBBK...",
    "...KBBBPBPBBK...",
    "...KBBBPPpBBK...",
    "...KKK....KKK...",
    "...SS......SS...",
  ]);

  // Up-facing (back of head, no face)
  const playerUp = parse([
    "................",
    "................",
    ".....KKKKKK.....",
    "....KHHHHHHK....",
    "...KHHHHHHHHK...",
    "...KHHHHHHHHK...",
    "..KHHHHHHHHHK...",
    "..KHHHHHHHHHK...",
    "..KHHHHHHHHHK...",
    "...KHHHHHHHK....",
    "....KBBBBBBK....",
    "...KBBBPBPBBK...",
    "...KBBBPBPBBK...",
    "...KBBBPPpBBK...",
    "...KKK....KKK...",
    "....SS....SS....",
  ]);
  const playerUp2 = parse([
    "................",
    "................",
    ".....KKKKKK.....",
    "....KHHHHHHK....",
    "...KHHHHHHHHK...",
    "...KHHHHHHHHK...",
    "..KHHHHHHHHHK...",
    "..KHHHHHHHHHK...",
    "..KHHHHHHHHHK...",
    "...KHHHHHHHK....",
    "....KBBBBBBK....",
    "...KBBBPBPBBK...",
    "...KBBBPBPBBK...",
    "...KBBBPPpBBK...",
    "...KKK....KKK...",
    "...SS......SS...",
  ]);

  // Side (right); left = mirrored at draw time
  const playerRight = parse([
    "................",
    "................",
    ".....KKKKKK.....",
    "....KHHHHHHK....",
    "...KHHHHHHHHK...",
    "...KHHRRRRRRK...",
    "..KHRRRWWRRRK...",
    "..KHRRRWWRRRK...",
    "..KRRRRRRRRRK...",
    "...KRRRRRRRK....",
    "....KBBBBBBK....",
    "...KBBPBPBBBK...",
    "...KBBPBPBBBK...",
    "...KBBPPpBBBK...",
    "...KKK....KKK...",
    "....SS....SS....",
  ]);
  const playerRight2 = parse([
    "................",
    "................",
    ".....KKKKKK.....",
    "....KHHHHHHK....",
    "...KHHHHHHHHK...",
    "...KHHRRRRRRK...",
    "..KHRRRWWRRRK...",
    "..KHRRRWWRRRK...",
    "..KRRRRRRRRRK...",
    "...KRRRRRRRK....",
    "....KBBBBBBK....",
    "...KBBPBPBBBK...",
    "...KBBPBPBBBK...",
    "...KBBPPpBBBK...",
    "...KKK....KKK...",
    "...SS......SS...",
  ]);

  const frames = {
    down: [playerDown, playerDown2],
    up: [playerUp, playerUp2],
    right: [playerRight, playerRight2],
    left: [playerRight, playerRight2], // mirrored when drawn
  };

  // Decorative sprites
  const tree = parse([
    "................",
    "................",
    ".......gg.......",
    "......gGGg......",
    ".....gGGGGg.....",
    "....gGGGGGGg....",
    "...gGGGGGGGGg...",
    "..gGGGgggGGGGg..",
    "..gGGgKKKgGGGg..",
    "..gGGgKDKgGGGg..",
    "...gggKDKgggg...",
    "......KDK.......",
    "......KDK.......",
    "......KDK.......",
    ".....KKDKK......",
    ".....KKDKK......",
  ]);

  const flower = parse([
    "................",
    "................",
    "................",
    "................",
    "......fFf.......",
    ".....fFFFf......",
    ".....FFFFF......",
    "......fFf...q...",
    ".......q..qq....",
    "......qqq.q.....",
    ".......q.q......",
    "........q.......",
    "................",
    "................",
    "................",
    "................",
  ]);

  const rock = parse([
    "................",
    "................",
    "................",
    "................",
    "......mmmm......",
    ".....mMMMMm.....",
    "....mMMMMMMm....",
    "...mMMMMMMMMm...",
    "..mMMMMMMMMMMm..",
    "..mMMMMMMMMMMm..",
    "..mmMMMMMMMMmm..",
    "...mmmmmmmmmm...",
    "................",
    "................",
    "................",
    "................",
  ]);

  const sign = parse([
    "................",
    "................",
    "................",
    "....KKKKKKKK....",
    "...KnnnnnnnnK...",
    "...KnKKKKKKnK...",
    "...KnKyyyyKnK...",
    "...KnKyyyyKnK...",
    "...KnKKKKKKnK...",
    "...KnnnnnnnnK...",
    "....KKKKKKKK....",
    ".......KD.......",
    ".......KD.......",
    "......KKDK......",
    ".....KKKKKK.....",
    "................",
  ]);

  const chest = parse([
    "................",
    "................",
    "................",
    "................",
    "....DDDDDDDD....",
    "...DyyyyyyyyD...",
    "...DyDDDDDDyD...",
    "...DyDyyyyDyD...",
    "..DDDDyyyyDDDD..",
    "..DnnnnnnnnnnD..",
    "..DnnnnKKnnnnD..",
    "..DnnnnKKnnnnD..",
    "..DnnnnnnnnnnD..",
    "..DDDDDDDDDDDD..",
    "................",
    "................",
  ]);

  function draw(ctx, sprite, x, y, scale, mirror) {
    scale = scale || 1;
    if (!sprite || !sprite.length) return;
    for (let row = 0; row < sprite.length; row++) {
      const sr = sprite[row];
      if (!sr) continue;
      for (let col = 0; col < sr.length; col++) {
        const c = sr[col];
        if (!c) continue;
        const drawCol = mirror ? sr.length - 1 - col : col;
        ctx.fillStyle = P[c] || "#ff00ff";
        ctx.fillRect(x + drawCol * scale, y + row * scale, scale, scale);
      }
    }
  }

  function player(ctx, dir, frame, x, y, scale) {
    const dirFrames = frames[dir];
    if (!dirFrames) return;
    const f = dirFrames[frame % 2];
    draw(ctx, f, x, y, scale, dir === "left");
  }

  function tile(ctx, key, x, y, scale) {
    let s = null;
    if (key === "tree") s = tree;
    else if (key === "flower") s = flower;
    else if (key === "rock") s = rock;
    else if (key === "sign") s = sign;
    else if (key === "chest") s = chest;
    if (s) draw(ctx, s, x, y, scale, false);
  }

  return { draw, player, tile, P };
})();
