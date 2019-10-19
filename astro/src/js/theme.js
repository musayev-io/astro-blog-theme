
jQuery(document).ready(function() {
    "use strict";


    (function(){
        configureMedia();
        configureSyntaxHighlighting();
        configurePostAuthors();
        configurePostComments();
        configureGoogleAnalytics();
        configurePermalink();
        configureReadTime();
        configureSocial();
        configureGallery();
    })();

    jQuery(window).load(function(){
        configureSVG();
    });


    // HELPERS

    function eckoThemeConfig(item){
        if(typeof ecko_theme_config !== 'undefined' && ecko_theme_config.hasOwnProperty(item) && ecko_theme_config[item] !== ''){
            return ecko_theme_config[item];
        } else {
            return false;
        }
    }


    // CONFIGURATION

    function configureMedia(){
        jQuery(".postcontents").fitVids();
    }

    function configureSyntaxHighlighting(){
        jQuery('pre code').each(function(i, block){
            hljs.highlightBlock(block);
        });
    }

    function configurePostAuthors(){
        if(jQuery('.postauthors-items').children().length <= 1){
            jQuery('.postauthors').remove();
        }
    }

    function configureSVG(){
        if(navigator.appName == 'Microsoft Internet Explorer' || !!(navigator.userAgent.match(/Trident/) || navigator.userAgent.match(/rv:11/)) || (typeof jQuery.browser !== "undefined" && jQuery.browser.msie == 1)){
            if(typeof svg4everybody() !== "undefined"){
                svg4everybody();
            }
        }
    }

    function configurePermalink(){
        new ClipboardJS('.postshare-item-permalink a');
        jQuery('.postshare-item-permalink a').on('click', function(e) {
            jQuery('.postshare-item-tooltip').css('opacity', '1.0');
            setTimeout(function(){
                jQuery('.postshare-item-tooltip').css('opacity', '0.0');
            }, 3000)
            e.preventDefault();
        });
    }

    function configureReadTime(){
        jQuery(".postcontents").readingTime();
    }

    function configureSocial(){
        if(eckoThemeConfig('social_instagram')){
            jQuery('.social-instagram').attr('href', eckoThemeConfig('social_instagram'));
            jQuery('.social-instagram').show();
        }
        if(eckoThemeConfig('social_github')){
            jQuery('.social-github').attr('href', eckoThemeConfig('social_github'));
            jQuery('.social-github').show();
        }
        if(eckoThemeConfig('social_linkedin')){
            jQuery('.social-linkedin').attr('href', eckoThemeConfig('social_linkedin'));
            jQuery('.social-linkedin').show();
        }
    }

    function configureGallery(){
        var images = document.querySelectorAll('.kg-gallery-image img');
        images.forEach(function (image) {
            var container = image.closest('.kg-gallery-image');
            var width = image.attributes.width.value;
            var height = image.attributes.height.value;
            var ratio = width / height;
            container.style.flex = ratio + ' 1 0%';
        });
    }

    // COMMENTS

    function configurePostComments(){
        if(eckoThemeConfig('disqus_id')){
            jQuery('.postcomments').css('display', 'block');
        }
    }

    jQuery('.postcomments-view').on('click', function(){
        var url = jQuery('.postcomments').data('page-url');
        var id = jQuery('.postcomments').data('page-id');
        jQuery('.postcomments-view').hide();
        jQuery('.postcomments-disqus').css('display', 'block');
        loadDisqusComments(url, id);
    });

    function loadDisqusComments(url, id) {
        var disqus_config = function () {
            this.page.url = url;
            this.page.identifier = id;
        };
        var d = document, s = d.createElement('script');
        s.src = 'https://' + ecko_theme_config.disqus_id + '.disqus.com/embed.js';
        console.log(s.src);
        s.setAttribute('data-timestamp', +new Date());
        (d.head || d.body).appendChild(s);
    }


    // GOOGLE ANALYTICS

    function configureGoogleAnalytics() {
        if(eckoThemeConfig('google_analytics_id')){
            jQuery.getScript('https://www.googletagmanager.com/gtag/js?id=' + ecko_theme_config.google_analytics_id, function() {
                window.dataLayer = window.dataLayer || [];
                function gtag(){ dataLayer.push(arguments); }
                gtag('js', new Date());
                gtag('config', ecko_theme_config.google_analytics_id);
            });
        }
    }


    // EVENT - SUBSCRIPTION FORM

    var subscriptionForm = jQuery('.subscribe-form');
    subscriptionForm.submit(function(e){
        if(jQuery('.subscribe-input').val() === ''){
            e.preventDefault();
            return;
        }
        jQuery.ajax({
            type: subscriptionForm.attr('method'),
            url: subscriptionForm.attr('action'),
            data: subscriptionForm.serialize(),
            success: function(data){
                jQuery('.subscribe-submit').addClass('subscribe-submit__success');
                jQuery('.subscribe-input').val('').attr('placeholder', jQuery('.subscribe-submit').data('success-input'));
            },
            error: function(data){ }
        });
        e.preventDefault();
    });


    // NAVIGATION

    function toggleNavigationVisibility() {
        if(!jQuery('.navigation').hasClass('navigation__open')) {
            jQuery(document).bind('mouseup', navigationHandler);
        } else {
            jQuery(document).unbind('mouseup', navigationHandler);
        }
        jQuery('.navigation').toggleClass('navigation__open');
        jQuery('.navigation-icon').toggleClass('navigation-icon__active');
        jQuery('.navigation-main').toggleClass('navigation-main__active');
    }

    jQuery('.navigation-button').on('click', function(){
        toggleNavigationVisibility();
    });

    var navigationHandler = function (e) {
        var container = jQuery('.navigation');
        if(!jQuery('.navigation').is(e.target) && jQuery('.navigation').has(e.target).length === 0){
            toggleNavigationVisibility();
            jQuery(document).unbind('mouseup', navigationHandler);
        }
    }


    // POST - FLOATING

    var bottomInView = false;
    var scrolledPastTop = true;

    var floatingTopWaypoint = jQuery('.postmain').waypoint(function(direction){
        if(direction == "down"){
            scrolledPastTop = false;
            if(!bottomInView) {
                jQuery('.postflow').addClass('postflow__visible');
                jQuery('.postreadingtime').addClass('postreadingtime__visible');
            }
        }else{
            scrolledPastTop = true;
            jQuery('.postflow').removeClass('postflow__visible');
            jQuery('.postreadingtime').removeClass('postreadingtime__visible');
        }
    }, {
        offset: '130px'
    });

    var floatingBottomWaypoint = jQuery('.postfooter').waypoint(function(direction){
        if(direction == "down"){
            bottomInView = true;
            jQuery('.postreadingtime').removeClass('postreadingtime__visible');
        }else{
            bottomInView = false;
            jQuery('.postreadingtime').addClass('postreadingtime__visible');
        }
    }, {
        offset: '100%'
    });

    // INDEX WAYPOINTS

    if(jQuery('.postcontents').length){
        var list = [];
        jQuery('.postcontents h1, .postcontents h2, .postcontents h3').waypoint(function(direction) {
            var e = jQuery(this);
            if(direction === "down"){
                jQuery('.postflow .postflow-current').fadeOut(200, function() {
                    list.push(jQuery('.postflow .postflow-current').text());
                    jQuery(this).text(e["0"].element.innerText).fadeIn(200);
                });
            }
            if(direction === "up"){
                jQuery('.postflow .postflow-current').fadeOut(200, function() {
                    jQuery(this).text(list.pop()).fadeIn(200);
                });
            }
        });
    }


    // POST COVER - SCROLL

    jQuery('.postcover-arrow').on('click', function() {
        jQuery("html, body").animate({
            scrollTop: jQuery('.postcover').height()
        }, 600);
    });


    // POST - READ STATUS

    if(jQuery('.postflow-readtime').length){
        var userScrolled = false;
        jQuery(window).scroll(function() {
            userScrolled = true;
        });
        setInterval(function() {
            if(userScrolled){
                updatePostReadStatus();
                userScrolled = false;
            }
        }, 500);
    }

    function updatePostReadStatus(){
        var ppc = jQuery('.postflow-readtime');
        var percent = 100 * jQuery(window).scrollTop() / ((jQuery('.postcontents').height() + 280) - jQuery(window).height() + jQuery('.postcontents').offset().top);
        var deg = 360 * percent / 100;
        if(deg > 360) deg = 360;
        if (percent > 50) {
            ppc.addClass('postflow-readtime-gt-50');
        } else {
            ppc.removeClass('postflow-readtime-gt-50');
        }
        jQuery('.postflow-readtime-progress-fill').css('transform', 'rotate(' + deg + 'deg)');
    }


});
