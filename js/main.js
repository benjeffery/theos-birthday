const max_fireworks = 2,
  max_sparks = 100;
let canvas = document.getElementById('myCanvas');
let context = canvas.getContext('2d');
let fireworks = [];
let twopi = 3.141592654*2;
let scaleFactor = 0.125;
let num_petals = 16;
let petal_radius = 2.5;
let petal_cutoff = 2;

context.canvas.width  = window.innerWidth;
context.canvas.height = window.innerHeight;
let scale = 1;
function resize() {
  context.canvas.width  = window.innerWidth-10;
  context.canvas.height = window.innerHeight-10;
  scale = Math.min(window.innerWidth, window.innerHeight)/800;
  console.log(scale);
}

function fib_points(num, rotation, stretch, offx, offy) {
  let points = [];
  let r00 = Math.cos(rotation), r01 = - Math.sin(rotation);
  let r10 = Math.sin(rotation), r11 = Math.cos(rotation);


  for (let n = 0; n < num; n++) {
    let theta = 2.39998131 * n;
    let radius = scaleFactor * Math.sqrt(theta);
    let x = Math.cos(theta) * radius * stretch;
    let y = Math.sin(theta) * radius;
    points.push([offx + x*r00 + y*r01, offy + x*r10 + y*r11])
  }
  return points;
}

for (let i = 0; i < max_fireworks; i++) {
  let firework = {
    sparks: []
  };
  let size = 1.5*(0.15 + Math.random());
  let center_points = fib_points(max_sparks*size, 0, 1, 0, 0);
  let petals = [];
  for (let j = 0; j < num_petals; j++) {
    let p = fib_points(
      15*size,
      -(twopi) * j/num_petals,
      0.5,
      petal_radius * Math.sin(twopi * j/num_petals),
      petal_radius * Math.cos(twopi * j/num_petals)
    );
    petals = petals.concat(p);
  }
  petals = petals.filter(function(p) {return Math.sqrt(p[0]*p[0] + p[1]*p[1]) > petal_cutoff});

  let final_transform = function(rotation, stretch) {
    return function func(point) {
      let x = point[0] * stretch;
      let y = point[1];
      let r00 = Math.cos(rotation), r01 = -Math.sin(rotation);
      let r10 = Math.sin(rotation), r11 = Math.cos(rotation);
      return [x * r00 + y * r01, (x * r10 + y * r11) - 3]
    };
  };
  let rotation = Math.random()*twopi;
  let stretch = 0.5 + (Math.random()*0.5);
  petals = petals.map(final_transform(rotation, stretch));
  center_points = center_points.map(final_transform(rotation, stretch));
  for (let n = 3; n < center_points.length; n++) {
    let spark = {
       vx: center_points[n][0] * size,
       vy: center_points[n][1] * size,
       weight: 0.07 + Math.random() * 0.04,
       red: 0.42,
       green: 0.33,
       blue: 0.24
     };
    firework.sparks.push(spark);
  }
  for (let n = 0; n < petals.length; n++) {
    let spark = {
      vx: petals[n][0] * size,
      vy: petals[n][1] * size,
      weight: 0.07 + Math.random() * 0.04,
      red: 1,
      green: 0.82,
      blue: 0
    };
    firework.sparks.push(spark);
  }

  fireworks.push(firework);
  resetFirework(firework);
}
window.requestAnimationFrame(explode);

function resetFirework(firework) {
  firework.x = canvas.width/2;
  firework.y = canvas.height;
  firework.angle = Math.random() * 8  - 4;
  firework.age = 0;
  firework.phase = 'fly';
}

function explode() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  fireworks.forEach((firework,index) => {
    if (firework.phase == 'explode') {
      firework.sparks.forEach((spark) => {
        for (let i = 0; i < 10; i++) {
          let trailAge = firework.age + i;
          let x = firework.x + spark.vx * trailAge;
          let y = firework.y + spark.vy * trailAge + spark.weight * trailAge * spark.weight * trailAge;
          let fade = i * 20 - firework.age * 1;
          let r = Math.floor(spark.red * fade);
          let g = Math.floor(spark.green * fade);
          let b = Math.floor(spark.blue * fade);

          context.beginPath();
          context.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + (fade/255) + ')';
          context.rect(x * scale, y*scale, 4*scale, 4*scale);
          context.fill();
        }
      });
      firework.age++;
      if (firework.age > 150 && Math.random() < .05) {
        resetFirework(firework);
      }
    } else {
      firework.y = firework.y - 10;
      firework.x += firework.angle;
      for (let spark = 0; spark < 15; spark++) {
        context.beginPath();
        context.fillStyle = 'rgba(' + index * 50 + ',' + spark * 17 + ',0,1)';

        context.rect(scale * (firework.x + Math.random() * spark - spark / 2) - (firework.angle*(spark/2)), scale*(firework.y + spark * 4), scale*4, scale*4);
        context.fill();
      }
      if (Math.random() < .001 || firework.y < 450) firework.phase = 'explode';
    }
  });
  window.requestAnimationFrame(explode);
}
