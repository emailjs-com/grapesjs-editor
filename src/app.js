var grapesjs = require('grapesjs');
window.grapesjs = grapesjs;

require('grapesjs-preset-newsletter');

grapesjs.plugins.add('emailjs-plugin', function(editor, options) {
  var REG_EXP = /^{{(.*)}}$/g;
  var panel = editor.Panels;
  var blockManager = editor.BlockManager;
  var defaultType = editor.DomComponents.getType('default');

  panel.addButton('options', [{
    id: 'undo',
    className: 'fa fa-undo',
    attributes: {
      title: 'Undo'
    },
    command: function() {
      editor.runCommand('core:undo');
    }
  }, {
    id: 'redo',
    className: 'fa fa-repeat',
    attributes: {
      title: 'Redo'
    },
    command: function() {
      editor.runCommand('core:redo');
    }
  }, {
    id: 'clear-all',
    className: 'fa fa-trash icon-blank',
    attributes: {
      title: 'Clear canvas'
    },
    command: {
      run: function(editor, sender) {
        sender && sender.set('active', false);
        if (confirm('Are you sure to clean the canvas?')) {
          editor.DomComponents.clear();
          setTimeout(function() {
            localStorage.clear();
          }, 0);
        }
      }
    }
  }]);

  editor.DomComponents.addType('dynamic-variable', {
    model: defaultType.model.extend({  // how it looks on html result
      defaults: Object.assign({}, defaultType.model.prototype.defaults, {
        draggable: true,
        droppable: false,
        stylable: true,
        tagName: 'SPAN',
        traits: [{
          type: 'text',
          label: 'Name',
          name: 'variableName',
          changeProp: true
        }, {
          type: 'text',
          label: 'Default Value',
          name: 'defaultValue',
          changeProp: true
        }]
      }),
      init: function() {
        if (!this.get('variableName')) {
          this.set('variableName', 'emailjs-' + (Math.random() * 16777216 | 0).toString(16));
        }
        if (!this.get('defaultValue')) {
          this.set('defaultValue', '');
        }
      },
      toHTML: function() {
        var tag = this.get('tagName');
        var attributes = this.getAttrToHTML();
        var attrs = [];

        for (var attr in attributes) {
          var val = attributes[attr];
          var value = (typeof value === 'string')? val.replace(/"/g, '&quot;') : val;

          if (typeof value !== 'undefined') {
            if ((typeof value === 'boolean')) {
              value && attrs.push(attr);
            } else {
              attrs.push(attr + '="' + value + '"');
            }
          }
        }

        var attrString = attrs.length ? ' ' + attrs.join(' ') : '';

        return '<' + tag + attrString + ' data-default-value="' +  this.get('defaultValue') + '">{{' + this.get('variableName') + '}}</' + tag + '>';
      }
    }, {
      isComponent: function(el) {
        var result = REG_EXP.exec(el.innerText);

        if (el.tagName === 'SPAN' && result.length) {
          return {
            type: 'dynamic-variable',
            variableName: result[1],
            defaultValue: el.getAttribute('data-default-value')
          }
        }
      }
    }),
    view: defaultType.view.extend({ // how it looks on canvas
      render: function() {
        defaultType.view.prototype.render.apply(this, arguments);
        return this;
      },
      updateContent: function() {
        this.$el.html('<span style="background: aqua">{{</span>' + this.model.get('variableName') + '<span style="background: aqua">}}</span>');
      },
      init: function() {
        this.listenTo(this.model, 'change:variableName', this.updateContent);
      }
    })
  });

  blockManager.add('emailjs-value', {
    label: 'Dynamic Value',
    attributes: {
      class:'fa fa-code'
    },
    content: {
      type: 'dynamic-variable'
    }
  });
});

var editor = grapesjs.init({
  container : '#gjs-editor',
  fromElement: true,
  storageManager: {
    id: 'emailjs-editor-'
    // autosave: true,
    // autoload: true,
    // stepsBeforeSave: 0
  },
  plugins: ['gjs-preset-newsletter', 'emailjs-plugin'],
  pluginsOpts: {
    'gjs-preset-newsletter': {
      modalTitleImport: 'Import Code'
    }
  }
});
