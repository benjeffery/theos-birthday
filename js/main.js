const max_fireworks = 3;
const max_sparks = 100;
const interval = 2000;
let canvas = document.getElementById('myCanvas');
let context = canvas.getContext('2d');
let twopi = 3.141592654 * 2;
let scaleFactor = 0.125;
let num_petals = 16;
let petal_radius = 2.5;
let petal_cutoff = 2;

context.canvas.width = window.innerWidth;
context.canvas.height = window.innerHeight;
let scale = 1;

function resize() {
  context.canvas.width = window.innerWidth - 10;
  context.canvas.height = window.innerHeight - 10;
  scale = Math.min(window.innerWidth, window.innerHeight) / 800;
}
window.addEventListener("orientationchange", resize, false);
window.addEventListener("resize", resize, false);

function fib_points(num, rotation, stretch, offx, offy) {
  let points = [];
  let r00 = Math.cos(rotation), r01 = -Math.sin(rotation);
  let r10 = Math.sin(rotation), r11 = Math.cos(rotation);


  for (let n = 0; n < num; n++) {
    let theta = 2.39998131 * n;
    let radius = scaleFactor * Math.sqrt(theta);
    let x = Math.cos(theta) * radius * stretch;
    let y = Math.sin(theta) * radius;
    points.push([offx + x * r00 + y * r01, offy + x * r10 + y * r11])
  }
  return points;
}

function makeFirework() {
  let firework = {
    petals: [],
    centre: []
  };
  let size = 1.5 * (0.15 + Math.random());
  let centre_points = fib_points(max_sparks * size, 0, 1, 0, 0);
  let petals = [];
  for (let j = 0; j < num_petals; j++) {
    let p = fib_points(
      15 * size,
      -(twopi) * j / num_petals,
      0.5,
      petal_radius * Math.sin(twopi * j / num_petals),
      petal_radius * Math.cos(twopi * j / num_petals)
    );
    petals = petals.concat(p);
  }
  petals = petals.filter(function (p) {
    return Math.sqrt(p[0] * p[0] + p[1] * p[1]) > petal_cutoff
  });

  let final_transform = function (rotation, stretch) {
    return function func(point) {
      let x = point[0] * stretch;
      let y = point[1];
      let r00 = Math.cos(rotation), r01 = -Math.sin(rotation);
      let r10 = Math.sin(rotation), r11 = Math.cos(rotation);
      return [x * r00 + y * r01, (x * r10 + y * r11) - 3]
    };
  };
  let rotation = Math.random() * twopi;
  let stretch = 0.5 + (Math.random() * 0.5);
  petals = petals.map(final_transform(rotation, stretch));
  centre_points = centre_points.map(final_transform(rotation, stretch));
  for (let n = 3; n < centre_points.length; n++) {
    let spark = {
      vx: centre_points[n][0] * size,
      vy: centre_points[n][1] * size,
      weight: 0.07 + Math.random() * 0.04,
    };
    firework.centre.push(spark);
  }
  for (let n = 0; n < petals.length; n++) {
    let spark = {
      vx: petals[n][0] * size,
      vy: petals[n][1] * size,
      weight: 0.07 + Math.random() * 0.04,
    };
    firework.petals.push(spark);
  }
  firework.x = canvas.width / 2;
  firework.y = canvas.height;
  firework.angle = Math.random() * 8 - 4;
  firework.age = 0;
  firework.phase = 'fly';
  return firework;
}

window.requestAnimationFrame(explode);
let fireworks = [makeFirework()];
for (let i = 0; i < max_fireworks-1; i++) {
  setTimeout(function () {fireworks.push(makeFirework())}, Math.random()*interval);
}

function explode() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  let rects = {};
  fireworks.forEach((firework, index) => {
    let f_x = firework.x;
    let f_y = firework.y;
    if (firework.phase == 'explode') {
      for (let i = 0; i < 10; i++) {
        let fade = i * 20 - firework.age * 1;
        context.beginPath();
        context.fillStyle = 'rgba(107,84,61,' + (fade / 255) + ')';
        let sparks = firework.centre;
        for (let j = 0; j < sparks.length; ++j) {
          let s = sparks[j];
          let trailAge = firework.age + i;
          let x = f_x + s.vx * trailAge;
          let y = f_y + s.vy * trailAge + s.weight * trailAge * s.weight * trailAge;
          context.rect(x * scale, y * scale, 4 * scale, 4 * scale);
        }
        context.fill();
      }
      for (let i = 0; i < 10; i++) {
        let fade = i * 20 - firework.age * 1;
        context.beginPath();
        context.fillStyle = 'rgba(255,209,0,' + (fade / 255) + ')';
        let sparks = firework.petals;
        for (let j = 0; j < sparks.length; ++j) {
          let s = sparks[j];
          let trailAge = firework.age + i;
          let x = f_x + s.vx * trailAge;
          let y = f_y + s.vy * trailAge + s.weight * trailAge * s.weight * trailAge;
          context.rect(x * scale, y * scale, 4 * scale, 4 * scale);
        }
        context.fill();
      }
      firework.age++;
      if (firework.age > 150 && Math.random() < .05) {
        let index = fireworks.indexOf(firework);
        if (index > -1) {
          fireworks.splice(index, 1);
        }
        setTimeout(function () {fireworks.push(makeFirework())}, Math.random()*interval);
      }
    } else {
      firework.y = firework.y - 10;
      firework.x += firework.angle;
      for (let spark = 0; spark < 15; spark++) {
        context.beginPath();
        context.fillStyle = 'rgba(' + index * 50 + ',' + spark * 17 + ',0,1)';

        context.rect(scale * (firework.x + Math.random() * spark - spark / 2) - (firework.angle * (spark / 2)), scale * (firework.y + spark * 4), scale * 4, scale * 4);
        context.fill();
      }
      if (Math.random() < .001 || firework.y < 450) firework.phase = 'explode';
    }
  });
  window.requestAnimationFrame(explode);
}
