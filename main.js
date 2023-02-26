const canvas = document.getElementById("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext("2d");

let radius = 128;
let rotationAngle = 0;
let longitudeSegments = 64;
let latitudeSegments = 64;

function createSphereVertices(
  longitudeSegments,
  latitudeSegments,
  rotationMatrix
) {
  const vertices = [];

  for (let lat = 0; lat <= latitudeSegments; lat++) {
    const theta = (lat * Math.PI) / latitudeSegments;
    const sinTheta = Math.sin(theta);
    const cosTheta = Math.cos(theta);

    for (let long = 0; long <= longitudeSegments; long++) {
      const phi = (long * 2 * Math.PI) / longitudeSegments;
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);

      const x = radius * sinTheta * cosPhi;
      const y = radius * sinTheta * sinPhi;
      const z = radius * cosTheta;

      // Apply the rotation matrix to the coordinates
      const rotated = [
        rotationMatrix[0] * x + rotationMatrix[1] * y + rotationMatrix[2] * z,
        rotationMatrix[3] * x + rotationMatrix[4] * y + rotationMatrix[5] * z,
        rotationMatrix[6] * x + rotationMatrix[7] * y + rotationMatrix[8] * z,
      ];

      vertices.push(...rotated);
    }
  }

  return vertices;
}

function multiplyMatrices(m1, m2) {
  const result = [
    m1[0] * m2[0] + m1[1] * m2[3] + m1[2] * m2[6],
    m1[0] * m2[1] + m1[1] * m2[4] + m1[2] * m2[7],
    m1[0] * m2[2] + m1[1] * m2[5] + m1[2] * m2[8],
    m1[3] * m2[0] + m1[4] * m2[3] + m1[5] * m2[6],
    m1[3] * m2[1] + m1[4] * m2[4] + m1[5] * m2[7],
    m1[3] * m2[2] + m1[4] * m2[5] + m1[5] * m2[8],
    m1[6] * m2[0] + m1[7] * m2[3] + m1[8] * m2[6],
    m1[6] * m2[1] + m1[7] * m2[4] + m1[8] * m2[7],
    m1[6] * m2[2] + m1[7] * m2[5] + m1[8] * m2[8],
  ];
  return result;
}

function onScroll(event) {
  if (event.deltaY < 0) {
    radius += 5;
  } else {
    radius -= 5;
  }
}

function onResize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function onKeyDown(event) {
  const leftKey = 37;
  const rightKey = 39;

  if (event.keyCode === leftKey) {
    longitudeSegments -= 1;
    latitudeSegments -= 1;
  } else if (event.keyCode === rightKey) {
    longitudeSegments += 1;
    latitudeSegments += 1;
  }
}

function renderSphere() {
  // Clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#0d0208";
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = "#00ff41";

  const yRotationMatrix = [
    Math.cos(rotationAngle),
    0,
    Math.sin(rotationAngle),
    0,
    1,
    0,
    -Math.sin(rotationAngle),
    0,
    Math.cos(rotationAngle),
  ];

  const xRotationMatrix = [
    1,
    0,
    0,
    0,
    Math.cos(rotationAngle),
    -Math.sin(rotationAngle),
    0,
    Math.sin(rotationAngle),
    Math.cos(rotationAngle),
  ];

  const zRotationMatrix = [
    Math.cos(rotationAngle),
    -Math.sin(rotationAngle),
    0,
    Math.sin(rotationAngle),
    Math.cos(rotationAngle),
    0,
    0,
    0,
    1,
  ];

  const multipliedMatrices = multiplyMatrices(xRotationMatrix, zRotationMatrix);

  const sphereVertices = createSphereVertices(
    longitudeSegments,
    latitudeSegments,
    multipliedMatrices
  );

  // Loop over each vertex and draw a point at its coordinates
  for (let i = 0; i < sphereVertices.length; i += 3) {
    const x = sphereVertices[i];
    const y = sphereVertices[i + 1];
    const z = sphereVertices[i + 2];

    // Project the 3D coordinates onto the 2D canvas
    const projectedX = x + canvas.width / 2;
    const projectedY = canvas.height / 2 - y;

    // Draw a point at the projected coordinates
    ctx.fillRect(projectedX, projectedY, 1, 1);
  }

  // Increment the rotation angle for the next frame
  rotationAngle += 0.01;

  // Request the next animation frame
  requestAnimationFrame(renderSphere);
}

requestAnimationFrame(renderSphere);

addEventListener("wheel", onScroll);
addEventListener("resize", onResize);
addEventListener("keydown", onKeyDown);
