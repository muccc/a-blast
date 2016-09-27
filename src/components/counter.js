/* global THREE AFRAME */

function TextAnimatedCanvas (text, fontSize, w, h, color, bg, bold, textAlign) {
  this.myFontSize = fontSize;
  this.w = w;
  this.h = h;
  this.myColor = color;
  this.bg = bg;
  this.bold = bold;
  this.myTextAlign = textAlign;

  this.totalLines = 1;

  this.canvas = document.createElement('canvas');
  this.canvas.style.fontFamily = 'Helvetica';

  this.canvas.width = this.w;
  this.canvas.height = this.h;

  this.drawText(text);
}

TextAnimatedCanvas.prototype.drawText = function (text) {
  this.text = text;
  this.characters = text.length;
  var context = this.canvas.getContext('2d');
  context.clearRect(0, 0, this.canvas.width, this.canvas.height);

  if (this.bg) {
    context.fillStyle = 'rgba(0,0,0,0.2)';
    context.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
  context.fillStyle = 'rgba(0,0,0,1)';
  context.fillRect(0, 0, this.canvas.width, this.canvas.height);

  if (this.bold) {
    context.font = 'bold ' + this.myFontSize + 'px Helvetica';
  } else {
    context.font = 'normal ' + this.myFontSize + 'px Helvetica';
  }

  context.fillStyle = this.myColor;

  if (this.myTextAlign === 'right') {
    context.textAlign = 'right';
  } else if (this.myTextAlign === 'left') {
    context.textAlign = 'left';
  } else {
    context.textAlign = 'center';
  }

  context.textBaseline = 'top';

  if (this.myTextAlign === 'right') {
    this.wrapTextCanvas(context, text, this.canvas.width, 0, this.canvas.width, this.myFontSize * 1.1);
  } else if (this.myTextAlign === 'left') {
    this.wrapTextCanvas(context, text, 0, 0, this.canvas.width, this.myFontSize * 1.1);
  } else {
    this.wrapTextCanvas(context, text, this.canvas.width / 2, 0, this.canvas.width, this.myFontSize * 1.1);
  }

  // use canvas contents as a texture

  this.texture = new THREE.Texture(this.canvas);
  this.texture.needsUpdate = true;
  this.texture.minFilter = THREE.LinearFilter;
  this.texture.magFilter = THREE.LinearFilter;

  return this.texture;
};

TextAnimatedCanvas.prototype.wrapTextCanvas = function (context, text, x, y, maxWidth, lineHeight) {
  var paragraphs = text.split('<br>');
  var words = [];
  for (var n = 0; n < paragraphs.length; n++) {
    var wordsParag = paragraphs[n].split(' ');
    for (var m = 0; m < wordsParag.length; m++) {
      words.push(wordsParag[m]);
    }
    words.push('//');
  }
  // console.log(words);
  var line = '';

  for (n = 0; n < words.length; n++) {
    var testLine = line + words[n] + ' ';
    var metrics = context.measureText(testLine);
    var testWidth = metrics.width;
    if (testWidth > maxWidth && n > 0 || words[ n ] === '//') {
      context.fillText(line, x, y);
      if (words[ n ] === '//') {
        line = '';
      } else {
        line = words[ n ] + ' ';
        this.totalLines++;
      }
      y += lineHeight;
    } else {
      line = testLine;
    }
  }

  context.fillText(line, x, y);
};

AFRAME.registerComponent('counter', {
  dependencies: ['material'],

  schema: {
    points: {type: 'number'},
    health: {type: 'number'}
  },

  init: function () {
    this.canvas = new TextAnimatedCanvas('', 64, 512, 512, '#AAAAAA', false, false, 'center');
  },

  update: function () {
    var data = this.data;
    var el = this.el;
    var mesh;
    var text;

    mesh = el.getObject3D('mesh');
    if (!mesh.children.length) {
      el.addEventListener('model-loaded', this.update.bind(this));
      return;
    }

    text = '<br><br><br><br>health: ' + data.health +'<br> points: ' + data.points;
    mesh.children[0].material.map = this.canvas.drawText(text);
    mesh.children[0].material.needsUpdate = true;
  }
});
