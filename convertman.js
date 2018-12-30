/*
{
  "name": "manual",
  "version": "1.0.0",
  "description": "",
  "main": "convertman.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "cheerio": "^1.0.0-rc.2",
    "reason": "^3.3.4",
    "turndown": "^5.0.1",
    "turndown-plugin-gfm": "^1.0.2"
  }
}
*/
// For Node.js
var TurndownService = require('turndown')

var cheerio = require('cheerio');


var TurndownService = require('turndown')
var turndownPluginGfm = require('turndown-plugin-gfm')
var refmt = require('reason')



var gfm = turndownPluginGfm.gfm
var turndownService = new TurndownService()
turndownService.use(gfm)
turndownService.use(turndownPluginGfm.gfm)

var path = require('path');
var dir = __dirname;
var fs = require('fs');
var chopExt = function(filepath) {
  return path.basename(filepath, path.extname(filepath))
};
var librefs = fs.readdirSync(path.join(dir, 'htmlman-4.0.6', 'libref')).map(function(itm) {
// var librefs = ['Arg.html'].map(function(itm) {
  return {input: path.join(dir, 'htmlman-4.0.6', 'libref', itm), output: path.join(dir, 'docs', 'libref', chopExt(itm) + '.' + 'md')};
});
var langrefs = fs.readdirSync(path.join(dir, 'htmlman-4.0.6')).map(function(itm) {
  return {input: path.join(dir, 'htmlman-4.0.6', itm), output: path.join(dir, 'docs', chopExt(itm) + '.' + 'md')};
});
langrefs.concat([]).forEach(function(itm) {
  if(!itm.input.endsWith('.html')) {
    return;
  }
  console.log("Reading " + itm.input + " writing to " + itm.output);
  $ = cheerio.load(fs.readFileSync(itm.input).toString());
  // $('code > code').each(function(i, el) {el.tagName ='span';});
  // $('pre > code').each(function(i, el) {el.tagName ='span';});
  // $('pre').each(function(i, el) {el.tagName ='code';});
  // $('span.keyword').each(function(i, elem) {
  //   var e = $(elem);
  //   e.replaceWith('!' + e.text() + '!');
  // });
  // Code examples are a pre with two children.
  // First child is div with className="caml-input"
  // Second child is div with className="caml-output"
  //   Sometimes it has the "ok" class on it which means
  //   we should even expect the input to be valid.
  $('div.info').each(function(i, elem) {
    var e = $(elem);
    e.replaceWith("<blockquote>" + e.html() + "</blockquote>");
  });
  $('pre').each(function(i, elem) {
    if (elem.childNodes && elem.childNodes.length == 2) {
      var child1 = $(elem.childNodes[0]);
      var child2 = $(elem.childNodes[1]);
      var child1Class = child1.prop('class') || '';
      var child2Class = child2.prop('class') || '';
      if (child1Class.indexOf('caml-in') !== -1 && child2Class.indexOf('caml-output') !== -1) {
        $(elem).replaceWith('<pre>' + child1.html() + '</pre> <pre>' + child2.html() + '</pre>');
      }
      return;
    }
    
    if (elem.childNodes.length > 1 || elem.childNodes.length === 1 && elem.childNodes[0].tagName !== 'code') {
      $(elem).replaceWith('<pre><code>' + $(elem).html() + '</code></pre>');
    }
  });
  $('dd.dd-description').each(function(i, elem) {
    var e = $(elem);
    e.replaceWith('<blockquote>' + e.html() + '</blockquote>');
  });
  $('dt.dt-description').each(function(i, elem) {
    var e = $(elem);
    e.replaceWith('<h5>' + e.html() + '</h5>');
  });
  // To see where c002 is used search for "Conversely, the module expression " - actually doesn't work.
  // To see where c004 is used search for Compunit.html
  // c015 is used for rule productions ::==
  $('span.c003,span.c006,span.c004').each(function(i, elem) {
    var e = $(elem);
    e.replaceWith('<code>' + e.html() + '</code>');
  });
  // Appears in Unix doc
  $('span.c007').each(function(i, elem) {
    var e = $(elem);
    e.replaceWith('<b>' + e.html() + '</b>');
  });
  // Sometimes should be code, but sometimes there are tables
  // inside a div.center (see Unix docs)
  // $('div.center').each(function(i, elem) {
  //   if (!elem.childNodes || elem.childNodes.length !== 1 || elem.childNodes[0].tagName !== 'table') {
  //     var e = $(elem);
  //     e.replaceWith('<pre><code>' + e.html() + '</code></pre>');
  //   }
  // });
  $('span.c003,span.c010').each(function(i, elem) {
    var e = $(elem);
    e.replaceWith('<code>' + e.html() + '</code>');
  });
  $('td').filter(function(i, elem) {
    let oneChild = elem.childNodes.length === 1;
    if (oneChild) {
      let str = $.html(elem.childNodes[0]);
      return str === "<code>(*</code>" ||  str === "<code>*)</code>";
    } else {
      return false;
    }
  }).remove();

  

  var pretocode = {
    filter: 'pre',
    replacement: function (content, node, options) {
      var result = doAllTheRefmting(node.textContent, false);
      return options.fence + 'reason\n' + result + '\n' + options.fence + '\n'
    }
  };
  var codetocode = {
    filter: 'code',
    replacement: function (content, node, options) {
      // console.log(node.textContent);
      var textContent = node.textContent;
      var result;
      // - because of flags to the compiler.
      if (textContent[0] === '@' || textContent[0] === '.' || textContent[0] === '-') {
        result = textContent;
      } else {
       result = doAllTheRefmting(node.textContent, true);
      }
      // console.log('`' + result + '`');
      return '`' + result + '`';
    }
  };


  turndownService.addRule('pretocode', pretocode);
  turndownService.addRule('codetocode', codetocode);
  // var markdown = ($.html());
  var markdown = turndownService.turndown($.html());
  fs.writeFileSync(itm.output, markdown);
});

/**
 * testType: Maybe it's just a type in <code>x -> y</code>
 */
function doAllTheRefmting(textContent, testType) {
  //  Replace nonbreakable space with space
  var txt = (textContent.replace(/\xa0/g, ' ')).trim();
  var result = txt;
  try {
    var result = tryToRefmt(txt);
  } catch(e) {
    var obj = "<obj>";
    var fun = "<fun>";
    if (txt.indexOf(obj) !== -1) {
      txt = txt.replace(/\<obj\>/g, "__obj__")
    }
    if (txt.indexOf(fun) !== -1) {
      txt = txt.replace(/\<fun\>/g, "__fun__")
    }
    txt = txt.replace(/: sig \.\. end/g, ":")
    txt = txt.replace(/\.\.\.\./g, " _more_stuff_here_ ")
    txt = txt.replace(/\.\.\./g, " _more_stuff_here_ ")
    if (txt.indexOf("- :") !== -1 || txt.indexOf("val ") !== -1) {
      var lines = txt.split('\n');
      var lines = lines.map(function(ln) {
        if (ln.indexOf("- :") === 0) {
          ln = "let result:" + ln.substr("- :".length + 1);
        }
        if (ln.match(/^\s*val /g) != null) {
          ln = ln.replace(/^\s*val /g, "let ");
        }
        return ln;
      });
      txt = lines.join('\n');
    }
    try {
      var result = tryToRefmt(txt);
      // console.log('saved ' + textContent);
      // console.log('by ' + txt);
    } catch(e) {
      try {
        var result = tryToRefmt('type t = ' + txt);
        var result = result.replace('type t =', '');
        // console.log('found type annotation: ' + result)
        // console.log('saved ' + textContent);
        // console.log('by ' + txt);
      } catch(e) {
        // console.log('nothing could save ' + result);
        // console.log('not even ' + txt);
      }
    }
  }
  return removeArityThings((removeTrailingNewlineAndSemi(result)));
}
function removeTrailingNewlineAndSemi(txt) {
  return txt.trim().replace(/;$/g, '')
}
function removeArityThings(txt) {
  return txt.replace(/\[@implicit_arity\]/g, '')
}
function tryToRefmt(txt) {
  var result = txt;
  try {
    var parsed = refmt.parseML(txt);
    return refmt.printRE(parsed); 
  } catch(e) {
    var parsed = refmt.parseMLI(txt);
    return refmt.printREI(parsed); 
  }
}

