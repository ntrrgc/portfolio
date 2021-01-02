function drawPolygonSegment(ax, ay, bx, by, numPoints) {
  // Calculamos el alto y ancho del segmento
  var w = bx - ax;
  var h = by - ay;

  // Calculamos el alto y ancho de las partes
  var numParts = numPoints - 1;
  var partW = w / numParts;
  var partH = h / numParts;

  // Para i entre 0 y `numPoints` (no incluido) ...
  for (var i = 0; i < numPoints; i++) {
    // Dibujamos un punto que será A sumado i
    // veces el ancho y alto de la parte.
    drawPoint({
      x: ax + partW * i,
      y: ay + partH * i
    });
  }
}

function calcPolygonVertices(numVertices, centerX, centerY, radius, rotation) {
  // Dividimos el ángulo de la circunferencia completa (2pi=360°)
  // entre el número de vértices del polígono.
  // De esta manera obtendremos el ángulo de los lados.
  var angInterval = TAU / numVertices;

  // Inicializamos una lista de vértices
  var vertices = [];
  for (var i = 0; i < numVertices; i++) {
    // Multiplicamos el número de vértice por el ángulo de los lados
    var x = centerX + Math.cos(i * angInterval + rotation) * radius;
    var y = centerY + Math.sin(i * angInterval + rotation) * radius;
    vertices.push({x: x, y: y});
  }
  return vertices;
}

function drawPolygon(numVertices, centerX, centerY, radius,
                     rotation, numPointsSegment)
{
  var vertices = calcPolygonVertices(numVertices, centerX,
      centerY, radius, rotation);

  // Unimos cada vértice con el siguiente
  for (var numVertex = 0; numVertex < numVertices; numVertex++) {
    var vertexA = vertices[numVertex];
    var vertexB = vertices[numVertex + 1];
    drawPolygonSegment(vertexA.ax, vertexA.ay,
                       vertexB.ax, vertexB.ay,
                       numPointsSegment);
  }
}

function drawStar(numVertices, centerX, centerY, radius,
                  rotation, numPointsSegment, starStep)
{
  var vertices = calcPolygonVertices(numVertices, centerX,
      centerY, radius, rotation);

  // Una estrella tiene el doble de segmentos que vértices
  var numSegments = vertices.length * 2;
  // Empezamos trazando desde el vértice 0
  var indexStartVertex = 0;
  var indexVertexA = indexStartVertex;
  for (var i = 0; i < numSegments; i++) {
    // El vértice destino del segmento es aquel que esté a
    // `starStep` posiciones del vértice de origen
    var indexVertexB = (indexVertexA + starStep)
        % vertices.length;

    // Dibujamos el segmento
    var vertexA = vertices[indexVertexA];
    var vertexB = vertices[indexVertexB];
    drawPolygonSegment(vertexA.ax, vertexA.ay,
        vertexB.ax, vertexB.ay,
        numPointsSegment);

    // El vértice destino de este segmento será el vértice
    // inicio del siguiente
    indexVertexA = indexVertexB;

    // Si volvemos al punto de inicio y todavía quedan más
    // pasos, estamos ante una estrella desconectada.
    // Deberemos repetir el proceso empezando a dibujar por
    // el punto siguiente.
    if (indexVertexA == indexStartVertex) {
      indexStartVertex = (indexStartVertex + 1)
          % vertices.length;
      indexVertexA = indexStartVertex;
    }
  }
}