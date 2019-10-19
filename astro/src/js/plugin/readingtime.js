;(function ($, window, document, undefined) {

    var pluginName = "readingTime";

    var defaults = {
        bubble: '#postreadingtime'
    };

    function Plugin(element, options) {
        this.element = element;
        this.options = $.extend({}, defaults, options);
        this.scroll_timer = null;
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    Plugin.prototype = {
        init: function () {
            $(window).scroll($.proxy(this.updateTime, this));
        },
        updateTime: function () {
            var total_reading_time = 0,
                bubble = $(this.options.bubble),
                post_content = $(this.element);
            var viewportHeight = $(window).height(),
                scrollbarHeight = viewportHeight / $(document).height() * viewportHeight,
                progress = $(window).scrollTop() / ($(document).height() - viewportHeight),
                distance = progress * (viewportHeight - scrollbarHeight) + scrollbarHeight / 2 - bubble.height() / 2;
            var total_reading_time = this.calculate_total_time_words(post_content, this.element) / 60;
            var total_reading_time_remaining = Math.ceil(total_reading_time - (total_reading_time * progress));
            var text = '';

            if(total_reading_time_remaining > 1) {
                text = total_reading_time_remaining + ' ' + bubble.data('minutes');
            } else if(progress >= 1) {
                text = bubble.data('thanks');
            } else if (total_reading_time_remaining <= 1) {
                text = '1 ' + bubble.data('minute');
            }

            bubble.text(text).fadeIn(500);

            if (this.scroll_timer !== null) {
                clearTimeout(this.scroll_timer);
            }

            this.scroll_timer = setTimeout(function() {
                bubble.fadeOut();
            }, 1500);
        },
        calculate_total_time_words: function(post_content, element){
            var total = 0;
            post_content.each(function() {
                total += Math.round(60*$(element).text().split(' ').length/200); // 200 = number of words per minute
            });
            return total;
        }
    };

    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, new Plugin(this, options));
            }
        });
    };
})(jQuery, window, document);
