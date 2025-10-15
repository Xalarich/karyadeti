(function($) {
  
  "use strict";  

  $(window).on('load', function() {

  /*Page Loader active
    ========================================================*/
    $('#preloader').fadeOut();

  // Sticky Nav
    $(window).on('scroll', function() {
        if ($(window).scrollTop() > 200) {
            $('.scrolling-navbar').addClass('top-nav-collapse');
        } else {
            $('.scrolling-navbar').removeClass('top-nav-collapse');
        }
    });

    /* ==========================================================================
       countdown timer
       ========================================================================== */
     jQuery('#clock').countdown('2026/6/5 15:00:00',function(event){
      var $this=jQuery(this).html(event.strftime(''
      +'<div class="time-entry days"><span>%-D</span> <b>:</b> dní</div> '
      +'<div class="time-entry hours"><span>%H</span> <b>:</b> hodin</div> '
      +'<div class="time-entry minutes"><span>%M</span> <b>:</b> minut</div> '
      +'<div class="time-entry seconds"><span>%S</span> sekund</div> '));
    });

    /* Auto Close Responsive Navbar on Click
    ========================================================*/
    function close_toggle() {
        if ($(window).width() <= 768) {
            $('.navbar-collapse a').on('click', function () {
                $('.navbar-collapse').collapse('hide');
            });
        }
        else {
            $('.navbar .navbar-inverse a').off('click');
        }
    }
    close_toggle();
    $(window).resize(close_toggle);

    // Build Gallery from assets/img/general using manifest if available
    function buildGeneralGallery() {
      var generalDir = 'assets/img/general/';
      var $container = $('#gallery .gallery');
      if (!$container.length) return;

      function render(images) {
        var $row = $('<div class="row no-gutters"></div>');
        images.forEach(function(fname, idx){
          var href = generalDir + fname;
          var $a = $('<a class="lightbox" data-lightbox-gallery="general"></a>').attr('href', href);
          if (idx < 8) {
            var $col = $('<div class="col-lg-3 col-md-4 col-sm-6"></div>');
            var $box = $('<div class="gallery-box"></div>');
            var $img = $('<img class="img-fluid" loading="lazy" alt="Galerie">').attr('src', href);
            $a.append($img);
            $box.append($a);
            $col.append($box);
            $row.append($col);
          } else {
            $a.css('display','none');
            $container.append($a);
          }
        });
        $container.append($row);
        // (Re)initialize lightbox after dynamic insert
        if ($.fn.nivoLightbox) {
          $('.lightbox').nivoLightbox({
            effect: 'fadeScale',
            keyboardNav: true
          });
        }
      }

      $.getJSON(generalDir + 'manifest.json')
        .done(function(data){
          if (Array.isArray(data) && data.length) {
            render(data);
          }
        })
        .fail(function(){
          // Fallback to a small curated list as preview
          render(['MRS_2994.jpg','MRS_2880.jpg','MRS_2875.jpg','MRS_2873.jpg','MRS_2899.jpg','MRS_2918.jpg','MRS_2933.jpg','MRS_3036.jpg']);
        });
    }
    buildGeneralGallery();

      /* WOW Scroll Spy
    ========================================================*/
     var wow = new WOW({
      //disabled for mobile
        mobile: false
    });
    wow.init();

    /* Nivo Lightbox 
    ========================================================*/
    if ($.fn.nivoLightbox) {
      $('.lightbox').nivoLightbox({
        effect: 'fadeScale',
        keyboardNav: true
      });
    }

    // Basic swipe support for Nivo Lightbox (mobile)
    (function initLightboxSwipe(){
      var touch = { startX: 0, startY: 0, startTime: 0 };
      $(document).on('touchstart', '.nivo-lightbox-overlay', function(e){
        var t = e.originalEvent.touches && e.originalEvent.touches[0];
        if (!t) return;
        touch.startX = t.clientX;
        touch.startY = t.clientY;
        touch.startTime = Date.now();
      });
      $(document).on('touchend', '.nivo-lightbox-overlay', function(e){
        var t = e.originalEvent.changedTouches && e.originalEvent.changedTouches[0];
        if (!t) return;
        var dx = t.clientX - touch.startX;
        var dy = t.clientY - touch.startY;
        var dt = Date.now() - touch.startTime;
        if (dt < 1000 && Math.abs(dx) > 50 && Math.abs(dy) < 80) {
          e.preventDefault();
          if (dx < 0) {
            $('.nivo-lightbox-next').trigger('click');
          } else {
            $('.nivo-lightbox-prev').trigger('click');
          }
        }
      });
    })();

    // Drag with inertia and visual feedback (desktop + touchmove)
    (function initLightboxDrag(){
      var state = { active: false, startX: 0, startY: 0, startTime: 0, dx: 0 };

      function getImg($content){
        var $img = $content.find('.nivo-lightbox-image img');
        return $img.length ? $img : null;
      }

      function setImgTransform($img, dx){
        var translate = 'translateX(' + (dx * 0.6) + 'px)';
        var opacity = 1 - Math.min(0.4, Math.abs(dx) / 600);
        $img.css({
          'transform': translate,
          '-webkit-transform': translate,
          'opacity': opacity
        });
      }

      function animateBack($img, $content){
        $img.css({ 'transition': 'transform 200ms ease-out, opacity 200ms' });
        setImgTransform($img, 0);
        setTimeout(function(){
          $img.css({ 'transition': '' });
          $content.removeClass('dragging');
        }, 220);
      }

      function animateOutAndNavigate(left){
        var $content = $('.nivo-lightbox-content');
        var $img = getImg($content);
        if (!$img) return;
        $img.css({ 'transition': 'transform 200ms ease-out, opacity 200ms' });
        var outX = (left ? -1 : 1) * (window.innerWidth * 0.8);
        setImgTransform($img, outX);
        setTimeout(function(){
          if (left) $('.nivo-lightbox-prev').trigger('click');
          else $('.nivo-lightbox-next').trigger('click');
        }, 180);
      }

      // Mouse events (desktop)
      $(document).on('mousedown', '.nivo-lightbox-content', function(e){
        var $content = $('.nivo-lightbox-content');
        var $img = getImg($content);
        if (!$img) return;
        state.active = true;
        state.startX = e.clientX;
        state.startY = e.clientY;
        state.startTime = Date.now();
        state.dx = 0;
        $content.addClass('dragging');
      });
      $(document).on('mousemove', function(e){
        if (!state.active) return;
        var $content = $('.nivo-lightbox-content');
        var $img = getImg($content);
        if (!$img) return;
        state.dx = e.clientX - state.startX;
        setImgTransform($img, state.dx);
      });
      $(document).on('mouseup mouseleave', function(e){
        if (!state.active) return;
        var $content = $('.nivo-lightbox-content');
        var $img = getImg($content);
        if ($img) {
          var dt = Date.now() - state.startTime;
          var velocity = Math.abs(state.dx) / Math.max(1, dt);
          if (Math.abs(state.dx) > 100 || velocity > 0.6) {
            animateOutAndNavigate(state.dx > 0); // right drag -> prev
          } else {
            animateBack($img, $content);
          }
        }
        state.active = false;
      });

      // Touch move visual feedback
      $(document).on('touchmove', '.nivo-lightbox-content', function(e){
        var t = e.originalEvent.touches && e.originalEvent.touches[0];
        if (!t) return;
        var $content = $('.nivo-lightbox-content');
        var $img = getImg($content);
        if (!$img || !state.startX) return;
        var dx = t.clientX - state.startX;
        setImgTransform($img, dx);
        $content.addClass('dragging');
      });
      $(document).on('touchend touchcancel', '.nivo-lightbox-content', function(){
        var $content = $('.nivo-lightbox-content');
        var $img = getImg($content);
        if ($img) animateBack($img, $content);
      });
    })();

    // one page navigation 
    $('.navbar-nav').onePageNav({
            currentClass: 'active'
    }); 

    /* Counter
    ========================================================*/
    $('.counterUp').counterUp({
     delay: 10,
     time: 1500
    });

    /* Back Top Link active
    ========================================================*/
      var offset = 200;
      var duration = 500;
      $(window).scroll(function() {
        if ($(this).scrollTop() > offset) {
          $('.back-to-top').fadeIn(400);
        } else {
          $('.back-to-top').fadeOut(400);
        }
      });

      $('.back-to-top').on('click',function(event) {
        event.preventDefault();
        $('html, body').animate({
          scrollTop: 0
        }, 600);
        return false;
      });

      // Smooth scroll and center for intro button
      $('a[href="#intro"]').on('click', function(e) {
        e.preventDefault();
        var introEl = document.getElementById('intro');
        if (!introEl) return;
        if (introEl.scrollIntoView) {
          introEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          // jQuery fallback: center element in viewport
          var $target = $('#intro');
          if ($target.length) {
            var targetTop = $target.offset().top;
            var targetHeight = $target.outerHeight();
            var viewportH = $(window).height();
            var scrollTo = targetTop - Math.max(0, (viewportH - targetHeight) / 2);
            var maxScroll = $(document).height() - viewportH;
            if (scrollTo > maxScroll) scrollTo = maxScroll;
            if (scrollTo < 0) scrollTo = 0;
            $('html, body').animate({ scrollTop: scrollTo }, 600, 'swing');
          }
        }
      });

      // Copy to clipboard for phone/email
      function copyTextToClipboard(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          return navigator.clipboard.writeText(text);
        }
        var tempInput = document.createElement('input');
        tempInput.style.position = 'fixed';
        tempInput.style.opacity = '0';
        tempInput.value = text;
        document.body.appendChild(tempInput);
        tempInput.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(tempInput);
        return Promise.resolve();
      }

      $('.copy-icon').on('click', function() {
        var $btn = $(this);
        var text = $btn.attr('data-copy') || '';
        copyTextToClipboard(text).then(function(){
          $btn.addClass('copied');
          $btn.attr('title', 'Zkopírováno');
          setTimeout(function(){
            $btn.removeClass('copied');
            $btn.attr('title', 'Zkopírovat');
          }, 1500);
        });
      });

  });      

}(jQuery));