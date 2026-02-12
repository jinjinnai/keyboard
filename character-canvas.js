// Canvas 角色绘制引擎
const CharacterCanvas = (() => {
  let canvas, ctx;
  let state = { typing: false, time: 0, blinkTimer: 0, blinking: false, action: '', earPhase: 0, tailPhase: 0, armPhase: 0, keyX: 0.5 };
  let charType = 'human';

  function init(container) {
    canvas = document.createElement('canvas');
    canvas.width = 120;
    canvas.height = 200;
    canvas.id = 'char-canvas';
    container.prepend(canvas);
    ctx = canvas.getContext('2d');
    loop();
  }

  function setCharType(type) { charType = type; }
  function setTyping(v) { state.typing = v; }
  function setAction(a) { state.action = a; }
  function setKeyX(x) { state.keyX = x; }

  function loop() {
    state.time += 0.016;
    state.earPhase += 0.016;
    state.tailPhase += 0.016;
    if (state.typing) state.armPhase += 0.016;

    // blink logic
    state.blinkTimer += 0.016;
    if (!state.blinking && state.blinkTimer > 3) {
      state.blinking = true;
      state.blinkTimer = 0;
    }
    if (state.blinking && state.blinkTimer > 0.15) {
      state.blinking = false;
      state.blinkTimer = 0;
    }

    ctx.clearRect(0, 0, 120, 200);
    if (charType === 'bunny') drawBunny(ctx, state);
    else if (charType === 'cat') drawCat(ctx, state);
    else if (charType === 'bear') drawBear(ctx, state);
    else if (charType === 'dog') drawDog(ctx, state);
    else if (charType === 'penguin') drawPenguin(ctx, state);
    else if (charType === 'duck') drawDuck(ctx, state);
    else drawHuman(ctx, state);

    requestAnimationFrame(loop);
  }

  // === 兔子 ===
  function drawBunny(c, s) {
    const cx = 60, headY = 48, bodyY = 88;
    const earSwing = s.typing ? Math.sin(s.earPhase * 15) * 0.35 : Math.sin(s.earPhase * 2.5) * 0.15;
    const arms = getTypingArms(s, -0.3, 0.3, cx - 28, cx + 28, bodyY - 8);

    // 左耳
    drawBunnyEar(c, cx - 18, headY - 20, -earSwing - 0.12);
    // 右耳
    drawBunnyEar(c, cx + 18, headY - 20, earSwing + 0.12);

    // 身体 — 粉裙
    c.beginPath();
    c.ellipse(cx, bodyY, 26, 22, 0, 0, Math.PI * 2);
    c.fillStyle = '#ffb0cc';
    c.fill();
    c.strokeStyle = '#ee90b0';
    c.lineWidth = 1.5;
    c.stroke();

    // 裙子褶皱
    c.beginPath();
    c.moveTo(cx - 20, bodyY + 8);
    c.quadraticCurveTo(cx - 10, bodyY + 18, cx, bodyY + 14);
    c.quadraticCurveTo(cx + 10, bodyY + 18, cx + 20, bodyY + 8);
    c.strokeStyle = '#ee90b0';
    c.lineWidth = 1;
    c.stroke();

    // 手臂
    drawArm(c, cx - 28, bodyY - 8, arms.leftAngle, arms.leftLen, '#fff', '#f0c0cc');
    drawArm(c, cx + 28, bodyY - 8, arms.rightAngle, arms.rightLen, '#fff', '#f0c0cc');

    // 头
    c.beginPath();
    c.arc(cx, headY, 36, 0, Math.PI * 2);
    c.fillStyle = '#fff';
    c.fill();
    c.strokeStyle = '#f0d0d8';
    c.lineWidth = 1.5;
    c.stroke();

    // 眼睛
    drawEyes(c, cx, headY - 2, s.blinking, 7, '#1a1a2e');

    // 粉鼻
    c.beginPath();
    c.ellipse(cx, headY + 10, 3, 2.5, 0, 0, Math.PI * 2);
    c.fillStyle = '#ff8899';
    c.fill();

    // ω嘴
    drawOmegaMouth(c, cx, headY + 15, '#ee8899');

    // 腮红
    c.beginPath();
    c.ellipse(cx - 22, headY + 8, 8, 5, 0, 0, Math.PI * 2);
    c.fillStyle = 'rgba(255,100,140,0.3)';
    c.fill();
    c.beginPath();
    c.ellipse(cx + 22, headY + 8, 8, 5, 0, 0, Math.PI * 2);
    c.fill();

    // 尾巴 — 根据动作变化（最后绘制，确保可见）
    c.save();
    c.translate(82, 100);
    if (s.action === 'happy') {
      const bounce = Math.abs(Math.sin(s.tailPhase * 18)) * 6;
      c.translate(0, -bounce);
      c.beginPath();
      c.arc(0, 0, 9, 0, Math.PI * 2);
      c.fillStyle = '#fff'; c.fill();
      c.strokeStyle = '#f0c0cc'; c.lineWidth = 1.5; c.stroke();
    } else if (s.action === 'sleepy') {
      c.translate(0, 3);
      c.beginPath();
      c.arc(0, 0, 7, 0, Math.PI * 2);
      c.fillStyle = '#f0e8e8'; c.fill();
      c.strokeStyle = '#e0c0c8'; c.lineWidth = 1.5; c.stroke();
    } else if (s.action === 'shake') {
      const shake = Math.sin(s.tailPhase * 30) * 3;
      c.translate(shake, 0);
      c.beginPath();
      c.arc(0, 0, 9, 0, Math.PI * 2);
      c.fillStyle = '#fff'; c.fill();
      c.strokeStyle = '#f0c0cc'; c.lineWidth = 1.5; c.stroke();
    } else {
      const tailScale = 1 + Math.sin(s.tailPhase * 4) * 0.1;
      c.scale(tailScale, tailScale);
      c.beginPath();
      c.arc(0, 0, 8, 0, Math.PI * 2);
      c.fillStyle = '#fff'; c.fill();
      c.strokeStyle = '#f0c0cc'; c.lineWidth = 1.5; c.stroke();
    }
    c.restore();
  }

  function drawBunnyEar(c, x, y, angle) {
    c.save();
    c.translate(x, y + 24);
    c.rotate(angle);
    // 外耳白
    c.beginPath();
    c.ellipse(0, -24, 9, 26, 0, 0, Math.PI * 2);
    c.fillStyle = '#fff';
    c.fill();
    c.strokeStyle = '#f0c0cc';
    c.lineWidth = 1.5;
    c.stroke();
    // 内耳粉
    c.beginPath();
    c.ellipse(0, -22, 5, 18, 0, 0, Math.PI * 2);
    c.fillStyle = '#ffaabb';
    c.fill();
    c.restore();
  }

  // === 猫咪 ===
  function drawCat(c, s) {
    const cx = 60, headY = 48, bodyY = 88;
    const earSwing = s.typing ? Math.sin(s.earPhase * 16) * 0.3 : Math.sin(s.earPhase * 3.5) * 0.12;
    const arms = getTypingArms(s, -0.3, 0.3, cx - 26, cx + 26, bodyY - 8);

    // 左耳三角
    drawCatEar(c, cx - 22, headY - 26, -earSwing - 0.1);
    drawCatEar(c, cx + 22, headY - 26, earSwing + 0.1);

    // 身体
    c.beginPath();
    c.ellipse(cx, bodyY, 24, 20, 0, 0, Math.PI * 2);
    c.fillStyle = '#f5c07a';
    c.fill();
    c.strokeStyle = '#d9a05c';
    c.lineWidth = 1.5;
    c.stroke();

    // 手臂
    drawArm(c, cx - 26, bodyY - 8, arms.leftAngle, arms.leftLen, '#f5c07a', '#d9a05c');
    drawArm(c, cx + 26, bodyY - 8, arms.rightAngle, arms.rightLen, '#f5c07a', '#d9a05c');

    // 头
    c.beginPath();
    c.arc(cx, headY, 34, 0, Math.PI * 2);
    c.fillStyle = '#fad5a0';
    c.fill();
    c.strokeStyle = '#d9a05c';
    c.lineWidth = 1.5;
    c.stroke();

    // 眼睛
    drawEyes(c, cx, headY - 2, s.blinking, 6, '#2a2a2a');

    // 猫鼻
    c.beginPath();
    c.moveTo(cx, headY + 8);
    c.lineTo(cx - 3, headY + 11);
    c.lineTo(cx + 3, headY + 11);
    c.closePath();
    c.fillStyle = '#e8a080';
    c.fill();

    // ω嘴
    drawOmegaMouth(c, cx, headY + 14, '#c08060');

    // 胡须
    c.strokeStyle = '#c09070';
    c.lineWidth = 1;
    // 左
    c.beginPath(); c.moveTo(cx - 16, headY + 8); c.lineTo(cx - 34, headY + 5); c.stroke();
    c.beginPath(); c.moveTo(cx - 16, headY + 11); c.lineTo(cx - 34, headY + 13); c.stroke();
    // 右
    c.beginPath(); c.moveTo(cx + 16, headY + 8); c.lineTo(cx + 34, headY + 5); c.stroke();
    c.beginPath(); c.moveTo(cx + 16, headY + 11); c.lineTo(cx + 34, headY + 13); c.stroke();

    // 腮红
    c.beginPath();
    c.ellipse(cx - 22, headY + 8, 7, 4, 0, 0, Math.PI * 2);
    c.fillStyle = 'rgba(240,140,100,0.3)';
    c.fill();
    c.beginPath();
    c.ellipse(cx + 22, headY + 8, 7, 4, 0, 0, Math.PI * 2);
    c.fill();

    // 尾巴 — 根据动作变化（最后绘制，确保可见）
    c.save();
    c.translate(85, 85);
    if (s.action === 'happy') {
      c.rotate(-0.8);
      const tipWiggle = Math.sin(s.tailPhase * 20) * 4;
      c.beginPath();
      c.moveTo(0, 0);
      c.quadraticCurveTo(4, -15, tipWiggle, -35);
      c.quadraticCurveTo(tipWiggle + 3, -38, tipWiggle - 2, -32);
      c.quadraticCurveTo(0, -12, -2, 2);
      c.fillStyle = '#f5c07a'; c.fill();
      c.strokeStyle = '#d9a05c'; c.lineWidth = 1.5; c.stroke();
    } else if (s.action === 'sleepy') {
      c.rotate(0.3);
      c.beginPath();
      c.moveTo(0, 0);
      c.quadraticCurveTo(-20, 10, -40, 5);
      c.quadraticCurveTo(-48, 2, -45, 8);
      c.quadraticCurveTo(-38, 12, -18, 12);
      c.quadraticCurveTo(-8, 8, -2, 2);
      c.fillStyle = '#f5c07a'; c.fill();
      c.strokeStyle = '#d9a05c'; c.lineWidth = 1.5; c.stroke();
    } else if (s.action === 'shake') {
      c.rotate(-1.0);
      c.beginPath();
      c.moveTo(0, 0);
      c.quadraticCurveTo(8, -10, 6, -25);
      c.quadraticCurveTo(10, -32, 0, -30);
      c.quadraticCurveTo(-10, -32, -6, -25);
      c.quadraticCurveTo(-8, -10, 0, 0);
      c.fillStyle = '#f5c07a'; c.fill();
      c.strokeStyle = '#d9a05c'; c.lineWidth = 2; c.stroke();
    } else {
      const speed = s.typing ? 8 : 3;
      const amp = s.typing ? 0.5 : 0.4;
      const tailSwing = Math.sin(s.tailPhase * speed) * amp;
      c.rotate(tailSwing - 0.3);
      c.beginPath();
      c.moveTo(0, 0);
      c.quadraticCurveTo(12, 15, 8, 35);
      c.quadraticCurveTo(6, 42, 0, 40);
      c.quadraticCurveTo(2, 38, 4, 30);
      c.quadraticCurveTo(8, 12, -2, 2);
      c.fillStyle = '#f5c07a'; c.fill();
      c.strokeStyle = '#d9a05c'; c.lineWidth = 1.5; c.stroke();
    }
    c.restore();
  }

  function drawCatEar(c, x, y, angle) {
    c.save();
    c.translate(x, y + 14);
    c.rotate(angle);
    // 外耳
    c.beginPath();
    c.moveTo(0, -18);
    c.lineTo(-11, 6);
    c.lineTo(11, 6);
    c.closePath();
    c.fillStyle = '#f5c07a';
    c.fill();
    c.strokeStyle = '#d9a05c';
    c.lineWidth = 1.5;
    c.stroke();
    // 内耳
    c.beginPath();
    c.moveTo(0, -12);
    c.lineTo(-6, 4);
    c.lineTo(6, 4);
    c.closePath();
    c.fillStyle = '#ffddaa';
    c.fill();
    c.restore();
  }

  // === 人物 ===
  function drawHuman(c, s) {
    const cx = 60, headY = 40, bodyY = 82;
    const arms = getTypingArms(s, -0.25, 0.25, cx - 26, cx + 26, bodyY - 8);

    // 身体
    c.beginPath();
    c.ellipse(cx, bodyY, 24, 20, 0, 0, Math.PI * 2);
    c.fillStyle = '#7eb8e0';
    c.fill();
    c.strokeStyle = '#5a9cc5';
    c.lineWidth = 1.5;
    c.stroke();

    // 手臂
    drawArm(c, cx - 26, bodyY - 8, arms.leftAngle, arms.leftLen, '#7eb8e0', '#5a9cc5');
    drawArm(c, cx + 26, bodyY - 8, arms.rightAngle, arms.rightLen, '#7eb8e0', '#5a9cc5');

    // 头
    c.beginPath();
    c.ellipse(cx, headY, 36, 34, 0, 0, Math.PI * 2);
    c.fillStyle = '#ffe0bd';
    c.fill();
    c.strokeStyle = '#f0c8a0';
    c.lineWidth = 1.5;
    c.stroke();

    // 眼睛
    drawEyes(c, cx, headY - 2, s.blinking, 6, '#2a2a2a');

    // ω嘴
    drawOmegaMouth(c, cx, headY + 14, '#d48a8a');

    // 腮红
    drawBlush(c, cx, headY + 8, 'rgba(255,120,120,0.3)');
  }

  // === 小熊 ===
  function drawBear(c, s) {
    const cx = 60, headY = 48, bodyY = 88;
    const earSwing = s.typing ? Math.sin(s.earPhase * 14) * 0.2 : Math.sin(s.earPhase * 2) * 0.08;
    const arms = getTypingArms(s, -0.3, 0.3, cx - 28, cx + 28, bodyY - 8);

    // 身体
    c.beginPath();
    c.ellipse(cx, bodyY, 26, 22, 0, 0, Math.PI * 2);
    c.fillStyle = '#a0724a';
    c.fill();
    c.strokeStyle = '#7a5230';
    c.lineWidth = 1.5;
    c.stroke();
    // 肚皮
    c.beginPath();
    c.ellipse(cx, bodyY + 4, 16, 14, 0, 0, Math.PI * 2);
    c.fillStyle = '#d4a870';
    c.fill();

    // 手臂
    drawArm(c, cx - 28, bodyY - 8, arms.leftAngle, arms.leftLen, '#a0724a', '#7a5230');
    drawArm(c, cx + 28, bodyY - 8, arms.rightAngle, arms.rightLen, '#a0724a', '#7a5230');

    // 耳朵（圆耳）
    [-1, 1].forEach(dir => {
      c.save();
      c.translate(cx + dir * 28, headY - 22);
      c.rotate(dir * earSwing);
      c.beginPath();
      c.arc(0, 0, 12, 0, Math.PI * 2);
      c.fillStyle = '#a0724a';
      c.fill();
      c.strokeStyle = '#7a5230';
      c.lineWidth = 1.5;
      c.stroke();
      c.beginPath();
      c.arc(0, 0, 7, 0, Math.PI * 2);
      c.fillStyle = '#d4a870';
      c.fill();
      c.restore();
    });

    // 头
    c.beginPath();
    c.arc(cx, headY, 34, 0, Math.PI * 2);
    c.fillStyle = '#a0724a';
    c.fill();
    c.strokeStyle = '#7a5230';
    c.lineWidth = 1.5;
    c.stroke();

    // 口鼻区
    c.beginPath();
    c.ellipse(cx, headY + 8, 14, 10, 0, 0, Math.PI * 2);
    c.fillStyle = '#d4a870';
    c.fill();

    // 眼睛
    drawEyes(c, cx, headY - 4, s.blinking, 5, '#1a1a1a');

    // 鼻子
    c.beginPath();
    c.ellipse(cx, headY + 5, 4, 3, 0, 0, Math.PI * 2);
    c.fillStyle = '#3a2a1a';
    c.fill();

    // ω嘴
    drawOmegaMouth(c, cx, headY + 12, '#7a5230');

    // 腮红
    drawBlush(c, cx, headY + 6, 'rgba(220,120,80,0.3)');
  }

  // === 小狗（柯基风） ===
  function drawDog(c, s) {
    const cx = 60, headY = 48, bodyY = 88;
    const earSwing = s.typing ? Math.sin(s.earPhase * 14) * 0.25 : Math.sin(s.earPhase * 2.5) * 0.1;
    const arms = getTypingArms(s, -0.3, 0.3, cx - 28, cx + 28, bodyY - 8);

    // 身体
    c.beginPath();
    c.ellipse(cx, bodyY, 26, 20, 0, 0, Math.PI * 2);
    c.fillStyle = '#f0b860';
    c.fill();
    c.strokeStyle = '#c89030';
    c.lineWidth = 1.5;
    c.stroke();
    // 白肚皮
    c.beginPath();
    c.ellipse(cx, bodyY + 4, 16, 13, 0, 0, Math.PI * 2);
    c.fillStyle = '#fff8e8';
    c.fill();

    // 手臂
    drawArm(c, cx - 28, bodyY - 8, arms.leftAngle, arms.leftLen, '#f0b860', '#c89030');
    drawArm(c, cx + 28, bodyY - 8, arms.rightAngle, arms.rightLen, '#f0b860', '#c89030');

    // 耳朵（竖三角，尖略圆）
    [-1, 1].forEach(dir => {
      c.save();
      c.translate(cx + dir * 24, headY - 24);
      c.rotate(dir * (earSwing + 0.15));
      c.beginPath();
      c.moveTo(0, -16);
      c.quadraticCurveTo(-10, 8, -8, 10);
      c.lineTo(8, 10);
      c.quadraticCurveTo(10, 8, 0, -16);
      c.fillStyle = '#f0b860';
      c.fill();
      c.strokeStyle = '#c89030';
      c.lineWidth = 1.5;
      c.stroke();
      // 内耳
      c.beginPath();
      c.moveTo(0, -10);
      c.lineTo(-5, 6);
      c.lineTo(5, 6);
      c.closePath();
      c.fillStyle = '#ffddaa';
      c.fill();
      c.restore();
    });

    // 头
    c.beginPath();
    c.arc(cx, headY, 34, 0, Math.PI * 2);
    c.fillStyle = '#f0b860';
    c.fill();
    c.strokeStyle = '#c89030';
    c.lineWidth = 1.5;
    c.stroke();

    // 白色脸部
    c.beginPath();
    c.moveTo(cx - 12, headY - 10);
    c.quadraticCurveTo(cx, headY - 16, cx + 12, headY - 10);
    c.quadraticCurveTo(cx + 8, headY + 16, cx, headY + 18);
    c.quadraticCurveTo(cx - 8, headY + 16, cx - 12, headY - 10);
    c.fillStyle = '#fff8e8';
    c.fill();

    // 眼睛
    drawEyes(c, cx, headY - 4, s.blinking, 5, '#1a1a1a');

    // 鼻子
    c.beginPath();
    c.ellipse(cx, headY + 6, 4, 3, 0, 0, Math.PI * 2);
    c.fillStyle = '#2a2a2a';
    c.fill();

    // ω嘴
    drawOmegaMouth(c, cx, headY + 13, '#a07050');

    // 舌头（打字时伸出）
    if (s.typing) {
      c.beginPath();
      c.ellipse(cx + 2, headY + 17, 3, 4, 0, 0, Math.PI * 2);
      c.fillStyle = '#ff8888';
      c.fill();
    }

    // 腮红
    drawBlush(c, cx, headY + 6, 'rgba(240,140,80,0.25)');

    // 尾巴 — 根据动作变化（最后绘制，确保可见）
    c.save();
    c.translate(84, 82);
    if (s.action === 'happy') {
      const wag = Math.sin(s.tailPhase * 25) * 0.8;
      c.rotate(wag - 0.5);
      c.beginPath();
      c.ellipse(0, -10, 6, 12, 0, 0, Math.PI * 2);
      c.fillStyle = '#f0b860'; c.fill();
      c.strokeStyle = '#c89030'; c.lineWidth = 1.5; c.stroke();
    } else if (s.action === 'sleepy') {
      c.rotate(0.6);
      c.beginPath();
      c.moveTo(0, 0);
      c.quadraticCurveTo(4, 12, 2, 20);
      c.quadraticCurveTo(0, 24, -3, 18);
      c.quadraticCurveTo(-1, 10, -2, 2);
      c.fillStyle = '#f0b860'; c.fill();
      c.strokeStyle = '#c89030'; c.lineWidth = 1.5; c.stroke();
    } else if (s.action === 'shake') {
      c.rotate(0.8);
      c.beginPath();
      c.ellipse(0, 8, 4, 9, 0, 0, Math.PI * 2);
      c.fillStyle = '#f0b860'; c.fill();
      c.strokeStyle = '#c89030'; c.lineWidth = 1.5; c.stroke();
    } else {
      const speed = s.typing ? 12 : 4;
      const tailSwing = Math.sin(s.tailPhase * speed) * 0.5;
      c.rotate(tailSwing - 0.5);
      c.beginPath();
      c.ellipse(0, -8, 5, 10, 0, 0, Math.PI * 2);
      c.fillStyle = '#f0b860'; c.fill();
      c.strokeStyle = '#c89030'; c.lineWidth = 1.5; c.stroke();
    }
    c.restore();
  }

  // === 企鹅 ===
  function drawPenguin(c, s) {
    const cx = 60, headY = 44, bodyY = 86;
    const arms = getTypingArms(s, -0.3, 0.3, cx - 30, cx + 30, bodyY - 8);
    const waddle = Math.sin(s.time * 3) * 0.05;

    // 身体（黑）
    c.save();
    c.translate(cx, bodyY);
    c.rotate(waddle);
    c.beginPath();
    c.ellipse(0, 0, 28, 24, 0, 0, Math.PI * 2);
    c.fillStyle = '#2a2a3a';
    c.fill();
    c.strokeStyle = '#1a1a2a';
    c.lineWidth = 1.5;
    c.stroke();
    // 白肚皮
    c.beginPath();
    c.ellipse(0, 3, 18, 18, 0, 0, Math.PI * 2);
    c.fillStyle = '#f0f0f5';
    c.fill();
    c.restore();

    // 翅膀/手臂
    drawArm(c, cx - 30, bodyY - 8, arms.leftAngle, arms.leftLen, '#2a2a3a', '#1a1a2a');
    drawArm(c, cx + 30, bodyY - 8, arms.rightAngle, arms.rightLen, '#2a2a3a', '#1a1a2a');

    // 头
    c.beginPath();
    c.arc(cx, headY, 32, 0, Math.PI * 2);
    c.fillStyle = '#2a2a3a';
    c.fill();
    c.strokeStyle = '#1a1a2a';
    c.lineWidth = 1.5;
    c.stroke();

    // 白脸
    c.beginPath();
    c.ellipse(cx, headY + 4, 22, 20, 0, 0, Math.PI * 2);
    c.fillStyle = '#f0f0f5';
    c.fill();

    // 眼睛
    drawEyes(c, cx, headY - 2, s.blinking, 5, '#1a1a1a');

    // 嘴（橙色扁嘴）
    c.beginPath();
    c.moveTo(cx - 6, headY + 10);
    c.quadraticCurveTo(cx, headY + 16, cx + 6, headY + 10);
    c.quadraticCurveTo(cx, headY + 12, cx - 6, headY + 10);
    c.fillStyle = '#f0a030';
    c.fill();

    // 腮红
    drawBlush(c, cx, headY + 6, 'rgba(255,140,160,0.3)');

    // 脚（橙色）
    c.fillStyle = '#f0a030';
    c.beginPath();
    c.ellipse(cx - 10, bodyY + 22, 8, 4, -0.2, 0, Math.PI * 2);
    c.fill();
    c.beginPath();
    c.ellipse(cx + 10, bodyY + 22, 8, 4, 0.2, 0, Math.PI * 2);
    c.fill();
  }

  // === 小鸭 ===
  function drawDuck(c, s) {
    const cx = 60, headY = 46, bodyY = 88;
    const arms = getTypingArms(s, -0.35, 0.35, cx - 28, cx + 28, bodyY - 8);
    const waddle = Math.sin(s.time * 3.5) * 0.06;

    // 身体
    c.save();
    c.translate(cx, bodyY);
    c.rotate(waddle);
    c.beginPath();
    c.ellipse(0, 0, 26, 22, 0, 0, Math.PI * 2);
    c.fillStyle = '#ffe040';
    c.fill();
    c.strokeStyle = '#d0b020';
    c.lineWidth = 1.5;
    c.stroke();
    // 浅色肚皮
    c.beginPath();
    c.ellipse(0, 4, 16, 14, 0, 0, Math.PI * 2);
    c.fillStyle = '#fff8a0';
    c.fill();
    c.restore();

    // 小翅膀/手臂
    drawArm(c, cx - 28, bodyY - 8, arms.leftAngle, arms.leftLen, '#ffe040', '#d0b020');
    drawArm(c, cx + 28, bodyY - 8, arms.rightAngle, arms.rightLen, '#ffe040', '#d0b020');

    // 头
    c.beginPath();
    c.arc(cx, headY, 32, 0, Math.PI * 2);
    c.fillStyle = '#ffe040';
    c.fill();
    c.strokeStyle = '#d0b020';
    c.lineWidth = 1.5;
    c.stroke();

    // 头顶小毛（两根卷毛）
    c.strokeStyle = '#d0b020';
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(cx - 3, headY - 30);
    c.quadraticCurveTo(cx - 8, headY - 38, cx - 2, headY - 36);
    c.stroke();
    c.beginPath();
    c.moveTo(cx + 3, headY - 30);
    c.quadraticCurveTo(cx + 8, headY - 40, cx + 2, headY - 37);
    c.stroke();

    // 眼睛
    drawEyes(c, cx, headY - 4, s.blinking, 5, '#1a1a1a');

    // 扁嘴（橙色）
    c.beginPath();
    c.ellipse(cx, headY + 10, 10, 5, 0, 0, Math.PI * 2);
    c.fillStyle = '#f0882a';
    c.fill();
    c.strokeStyle = '#c06820';
    c.lineWidth = 1;
    c.stroke();
    // 嘴缝
    c.beginPath();
    c.moveTo(cx - 9, headY + 10);
    c.lineTo(cx + 9, headY + 10);
    c.strokeStyle = '#c06820';
    c.lineWidth = 1;
    c.stroke();

    // 腮红
    drawBlush(c, cx, headY + 4, 'rgba(255,140,100,0.3)');

    // 脚（橙色）
    c.fillStyle = '#f0882a';
    c.beginPath();
    c.ellipse(cx - 10, bodyY + 20, 8, 4, -0.2, 0, Math.PI * 2);
    c.fill();
    c.beginPath();
    c.ellipse(cx + 10, bodyY + 20, 8, 4, 0.2, 0, Math.PI * 2);
    c.fill();
  }

  // === 通用部件 ===
  function drawEyes(c, cx, y, blinking, r, color) {
    if (blinking) {
      c.strokeStyle = color;
      c.lineWidth = 2;
      c.beginPath(); c.moveTo(cx - 16 - r, y); c.lineTo(cx - 16 + r, y); c.stroke();
      c.beginPath(); c.moveTo(cx + 16 - r, y); c.lineTo(cx + 16 + r, y); c.stroke();
      return;
    }
    // 左眼
    c.beginPath();
    c.ellipse(cx - 16, y, r, r + 1, 0, 0, Math.PI * 2);
    c.fillStyle = color;
    c.fill();
    // 高光
    c.beginPath();
    c.arc(cx - 16 + r * 0.3, y - r * 0.3, r * 0.35, 0, Math.PI * 2);
    c.fillStyle = '#fff';
    c.fill();
    // 右眼
    c.beginPath();
    c.ellipse(cx + 16, y, r, r + 1, 0, 0, Math.PI * 2);
    c.fillStyle = color;
    c.fill();
    c.beginPath();
    c.arc(cx + 16 + r * 0.3, y - r * 0.3, r * 0.35, 0, Math.PI * 2);
    c.fillStyle = '#fff';
    c.fill();
  }

  function drawOmegaMouth(c, cx, y, color) {
    c.strokeStyle = color;
    c.lineWidth = 1.5;
    c.lineCap = 'round';
    c.beginPath();
    c.arc(cx - 3, y, 3, 0, Math.PI);
    c.stroke();
    c.beginPath();
    c.arc(cx + 3, y, 3, 0, Math.PI);
    c.stroke();
  }

  function drawBlush(c, cx, y, color) {
    c.fillStyle = color;
    c.beginPath();
    c.ellipse(cx - 22, y, 7, 4, 0, 0, Math.PI * 2);
    c.fill();
    c.beginPath();
    c.ellipse(cx + 22, y, 7, 4, 0, 0, Math.PI * 2);
    c.fill();
  }

  function drawArm(c, x, y, angleBase, length, fill, stroke) {
    c.save();
    c.translate(x, y);
    c.rotate(angleBase);
    c.beginPath();
    c.roundRect(-5, 0, 10, length, 5);
    c.fillStyle = fill;
    c.fill();
    c.strokeStyle = stroke;
    c.lineWidth = 1.5;
    c.stroke();
    // 小手
    c.beginPath();
    c.arc(0, length, 6, 0, Math.PI * 2);
    c.fillStyle = fill;
    c.fill();
    c.strokeStyle = stroke;
    c.stroke();
    c.restore();
  }

  // 打字时根据 keyX 计算左右手臂参数
  function getTypingArms(s, leftBase, rightBase, leftX, rightX, originY) {
    if (!s.typing) return { leftLen: 8, rightLen: 8, leftAngle: leftBase, rightAngle: rightBase };
    const kx = s.keyX; // 0~1
    const isLeft = kx < 0.5;
    const targetX = kx * 120;
    const targetY = 130;
    const ox = isLeft ? leftX : rightX;
    const dx = targetX - ox;
    const dy = targetY - originY;
    const activeLen = Math.sqrt(dx * dx + dy * dy) + Math.sin(s.armPhase * 20) * 3;
    const activeAngle = Math.atan2(dx, dy);
    const idleLen = 12;
    return {
      leftLen: isLeft ? activeLen : idleLen,
      rightLen: isLeft ? idleLen : activeLen,
      leftAngle: isLeft ? activeAngle : leftBase,
      rightAngle: isLeft ? rightBase : activeAngle,
    };
  }

  return { init, setCharType, setTyping, setAction, setKeyX };
})();
