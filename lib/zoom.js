/*jslint devel: true, browser: true, indent: 2 */
/*global jQuery, $ */

/*! jQuery Zoom plugin. */
/*! Brian McAllister ⚓ http://brianmcallister.com */
(function ($) {
  'use strict';

  $.zoom = function (el, options) {
    var defaults,
      plugin,
      data,
      settings,
      privates;
    
    plugin = this;
    
    // Set the default options.
    plugin.defaults = {
      // Zoom window properties.
      zoomWindowWidth: 400,
      zoomWindowHeight: 400,
      zoomWindowClass: 'zoom-window',
      fullSizeImage: '', // set in init()
      
      // Customize the jQuery method to insert the zoom window into the DOM
      insertMethod: 'append',
      
      // Custom callbacks
      onMouseEnter: function (args) {
        console.log('custom mouse enter', args);
      },
      
      onMouseLeave: function (args) {
        console.log('custom mouse leave', args);
      }
    };
    
    // Public methods.
    plugin.init = function () {
      plugin.$el = $(el);
      
      // Set some options using the cached $el jQuery object.
      data = plugin.$el.data();
      plugin.defaults.fullSizeImage = data.fullsize;
      plugin.defaults.zoomTargetWidth = plugin.$el.outerWidth();
      plugin.defaults.zoomTargetHeight = plugin.$el.outerHeight();
      plugin.defaults.zoomTargetOffset = plugin.$el.offset();
      
      // Merge passed in options and defaults.
      plugin.settings = $.extend({}, plugin.defaults, options);
      
      // Apply config to the zoom window.
      privates.markup.zoomWindow.css({
        'width'             : plugin.settings.zoomWindowWidth,
        'height'            : plugin.settings.zoomWindowHeight,
        'background-image'  : 'url(' + plugin.settings.fullSizeImage + ')'
      }).addClass(plugin.settings.zoomWindowClass);
      
      // Event bindings.
      this.delegateEvents();
    };
    
    plugin.delegateEvents = function () {
      plugin.$el
        .on('mouseenter.zoom', privates.mouseEnter)
        .on('mouseleave.zoom', privates.mouseLeave);
    };
    
    // Private methods.
    privates = {
      // Little library of various bits of markup to use.
      markup: {
        zoomWindow: $('<div />')
      },
      
      // Track mouse coords.
      coords: {
        winX: '',
        winY: '',
        elX: '',
        elY: ''
      },
      
      /**
       * Show the zoom window on the mouseenter event.
       * @private
       * @returns The privates object.
       * @type Object
       */
      mouseEnter: function () {
        plugin.$el[plugin.settings.insertMethod](privates.markup.zoomWindow);
        
        setTimeout(function () {
          privates.markup.zoomWindow.css('opacity', 1);
        }, 100);
        
        // Start tracking mouse coordinates.
        privates.bindPrivateEvents();
        
        // Run the custom callback.
        plugin.settings.onMouseEnter.apply(plugin.$el, ['---> mouseenter']);
        
        // Fire the custom event.
        plugin.$el.trigger('mouseenterZoom.zoom');
        
        return privates;
      },
      
      /**
       * Hide the zoom window on mouseleave.
       * @private
       * @returns The privates object.
       * @type Object
       */
      mouseLeave: function () {
        privates.markup.zoomWindow.remove();
        
        privates.removePrivateEvents();
        
        // Run the custom callback.
        plugin.settings.onMouseLeave.apply(plugin.$el, ['---> mouseleave']);
        
        // Fire the custom event.
        plugin.$el.trigger('mouseleaveZoom.zoom');
        
        return privates;
      },
      
      /**
       * Bind events to track mouse coordinates.
       * @private
       * @returns The privates object.
       * @type Object
       */
      bindPrivateEvents: function () {
        // Attach an event listener for mouse coords.
        plugin.$el.on('mousemove.zoom', function (event) {
          privates.coords = {
            winX: event.pageX,
            winY: event.pageY,
            elX: event.pageX - plugin.settings.zoomTargetOffset.left,
            elY: event.pageY - plugin.settings.zoomTargetOffset.top
          };
          
          privates.markup.zoomWindow.css({
            'background-position': privates.calculateBackgroundPosition
          })
          
          // Testing
          // TODO - Create an onMouseMove custom callback for stuff like this.
          $('.left').text(privates.coords.winX);
          $('.top').text(privates.coords.winY);
          
          $('.elleft').text(privates.coords.elX);
          $('.eltop').text(privates.coords.elY);
          
          $('.fullleft').text((privates.coords.elX * -1 * 2.7));
          $('.fulltop').text((privates.coords.elY * -1 * 2.7));
        });
        
        return privates;
      },
      
      /**
       * Unbind events.
       * @private
       * @returns The privates object.
       * @type Object
       */
      removePrivateEvents: function () {
        plugin.$el.off('mousemove.zoom');
        
        return privates;
      },
      
      /**
       * Calculate the background position of the fullsize image in the zoom window.
       * @private
       * @returns Background coords for the fullsize image.
       * @type String
       */
      calculateBackgroundPosition: function () {
        var moveLeft,
          moveTop;
        
        moveLeft = (privates.coords.elX / plugin.settings.zoomTargetWidth) * 100 + '%';
        moveTop = (privates.coords.elY / plugin.settings.zoomTargetHeight) * 100 + '%';
        
        return moveLeft + ' ' + moveTop;
      }
    };
    
    // Init.
    this.init();
  };

  $.fn.zoom = function (options) {
    console.time('Zoom plugin loaded');
    return this.each(function () {
      if (undefined === $(this).data('zoom')) {
        var plugin = new $.zoom(this, options);
        $(this).data('zoom', plugin);
      }
      console.timeEnd('Zoom plugin loaded');
    });
  };
}(jQuery));