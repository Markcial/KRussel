/**
 * @plugin KRussel Carrousel
 * @author Mark Garcia a.k.a. Markcial
 * @license LGPL
 */

/*
 *
 * TERMS OF USE - KRussel Carrousel plugin
 *
 * Open source under the LGPL License.
 *
 * Copyright � 2012 Mark Garcia a.k.a. Markcial
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list of
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list
 * of conditions and the following disclaimer in the documentation and/or other materials
 * provided with the distribution.
 *
 * Neither the name of the author nor the names of contributors may be used to endorse
 * or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */
(function( $ ){
    $.fn.KRussel = function( options )
    {
        var $ctx;

        var settings = $.extend( {
              'slides'             : '.kr-slide',
              'auto'			   : true,
              'interval'		   : 8000,
              'start'              : 1,
              'direction'          : 'rtl',
              'speed'			   : 1000,
              'easing'			   : 'easeOutExpo',
              'opacityOtherSlides' : .4,
              'useForeignNav'	   : false,
              'foreignControlsBox' : '',
              'autoResize'			   : true,
              'currentClass'	   : 'kr-current'
            }, options);

        return this.each(function(){
            var $this = $( this );
            if(!settings.useForeignNav)
            {
                $this.append( '<div class="kr-controls"><a rel="prev" href="javascript:;">prev</a><a rel="pause" href="javascript:;">pause</a><a rel="next" href="javascript:;">next</a></div>' );
                var $ctls = $this.find( '.kr-controls' );
               }
            else
            {
                var $ctls = $( settings.foreignControlsBox );
            }
            var $prev = $ctls.find( 'a[rel=prev]' );
            var $pause = $ctls.find( 'a[rel=pause]' );
            var $next = $ctls.find( 'a[rel=next]' );
            var $slides = $this.find( settings.slides );
            var $wrap = $slides.wrapAll( '<div class="kr-wrap"></div>' ).parent( '.kr-wrap' );
            var $scroll = $wrap.wrap( '<div class="kr-scroll"></div>' ).parent( '.kr-scroll' );
            var _locked = false;
            var _paused = false;
            var _intervalid = 0;

            var methods = {
                /** private methods **/
                _get_total_slides_width : function()
                {
                    var w = 0;
                    m._find_slides().each(function(i,el){
                        w += $(el).width();
                    });
                    return w;
                },
                _get_total_slides_height : function()
                {
                    var h = 0;
                    m._find_slides().each(function(i,el){
                        h += $(el).height();
                    });
                    return h;
                },
                _find_slides : function()
                {
                    return $wrap.find( settings.slides )
                },
                _get_first_slide : function()
                {
                    return m._find_slides().first();
                },
                _get_current_slide : function()
                {
                    return m._get_slide_at( 1 );
                },
                _get_last_slide : function()
                {
                    return m._find_slides().last();
                },
                _get_slide_at : function( pos )
                {
                    return m._find_slides().eq( pos );
                },
                _get_start_left_pos : function()
                {
                    return ( $( window ).width() - m._get_slide_at( 1 ).width() ) / 2;
                },
                _get_start_top_pos : function()
                {
                    return ( $this.height() - m._get_slide_at( 1 ).height() ) / 2;
                },
                _bind_resize:function()
                {
                    $(window).bind('resize',function(evt){
                        m._positionate();
                    });
                },
                _positionate:function()
                {
                    if( settings.direction == 'ttb' || settings.direction == 'btt' )
                    {
                        $scroll.height( m._get_current_slide().height() );
                        $wrap.height( m._get_total_slides_height());
                        var spos = m._get_first_slide().height() - m._get_start_top_pos();
                        $scroll.scrollTop( spos );
                    }
                    else
                    {
                        $wrap.width( m._get_total_slides_width() );
                        var spos = m._get_first_slide().width() - m._get_start_left_pos();
                        $scroll.scrollLeft( spos );
                    }
                },
                _start:function()
                {
                    $wrap.css({
                        display:'block'
                    });
                    $scroll.css({
                        position:'absolute',
                        top:'0px',
                        left:'0px',
                        overflow:'hidden',
                        width:'100%'
                    });
                    $slides.css({
                        display:'inline-block',
                        opacity:settings.opacityOtherSlides,
                        '-webkit-transition': 'all '+settings.speed+'ms ease-out',  /* Saf3.2+, Chrome */
                        '-moz-transition': 'all '+settings.speed+'ms ease-out',  /* FF4+ */
                        '-ms-transition': 'all '+settings.speed+'ms ease-out',  /* IE10 */
                        '-o-transition': 'all '+settings.speed+'ms ease-out',  /* Opera 10.5+ */
                        transition: 'all '+settings.speed+'ms ease-out'
                    });
                    m._positionate();
                    m._get_current_slide().css({opacity:1});

                    $next.bind('click', m.next_slide);
                    $prev.bind('click', m.prev_slide);
                    $pause.bind('click',m.pause_slides);

                    if( settings.auto )m.resume_slides();
                    if( settings.autoResize)m._bind_resize()
                },
                _move_slides_ltr : function()
                {
                    if(_locked )return;
                    _locked = true;
                    m._get_current_slide().css({opacity:settings.opacityOtherSlides});
                    m._get_slide_at( 0 ).css({opacity:1});
                    var clone = m._get_last_slide().clone();
                    m._get_last_slide().hide();
                    $wrap.prepend( clone );
                    $scroll.scrollLeft( $scroll.scrollLeft() + clone.width() )
                    $scroll.animate({
                        scrollLeft: $scroll.scrollLeft() - m._get_current_slide().width()
                        }, {
                            duration : settings.speed,
                            queue: false,
                            easing: settings.easing,
                            complete : m._on_ltr_transition_end
                    });
                },
                _move_slides_rtl : function()
                {
                    if(_locked )return;
                    _locked = true;
                    m._get_current_slide().css({opacity:settings.opacityOtherSlides});
                    m._get_slide_at( 2 ).css({opacity:1});
                    var clone = m._get_first_slide().clone();
                    clone.hide();
                    $wrap.append( clone );
                    $scroll.animate({
                        scrollLeft: $scroll.scrollLeft() + m._get_current_slide().width()
                        }, {
                            duration : settings.speed,
                            queue: false,
                            easing: settings.easing,
                            complete: m._on_rtl_transition_end
                        });
                },
                _move_slides_ttb : function()
                {
                    if(_locked )return;
                    _locked = true;
                    m._get_current_slide().css({opacity:settings.opacityOtherSlides});
                    var clone = m._get_last_slide().clone();
                    clone.css({opacity:1});
                    $wrap.prepend( clone );
                    $scroll.scrollTop( $scroll.scrollTop() + clone.height() )
                    $scroll.animate({
                        scrollTop: $scroll.scrollTop() - m._get_current_slide().height()
                        }, {
                            duration : settings.speed,
                            queue: false,
                            easing: settings.easing,
                            complete : m._on_ttb_transition_end
                    });
                },
                _move_slides_btt : function()
                {
                    if(_locked )return;
                    _locked = true;
                    m._get_slide_at( 0 ).css({opacity:settings.opacityOtherSlides});
                    m._get_slide_at( 1 ).css({opacity:1});
                    $wrap.append( m._get_first_slide().clone() );
                    $scroll.animate({
                        scrollTop: $scroll.scrollTop() + m._get_current_slide().height()
                        }, {
                            duration : settings.speed,
                            queue: false,
                            easing: settings.easing,
                            complete: m._on_btt_transition_end
                        });
                },
                _on_rtl_transition_end : function()
                {
                    m._get_first_slide().remove();
                    var scleft =  $scroll.scrollLeft() - m._get_slide_at(1).width();
                    $scroll.scrollLeft( scleft );
                    m._get_last_slide().show();
                    m._positionate();
                   _locked = false;
                },
                _on_ltr_transition_end : function()
                {
                    m._get_last_slide().remove();
                    m._positionate();
                    _locked = false;
                },
                _on_btt_transition_end : function()
                {
                    m._get_first_slide().remove();
                    $scroll.scrollTop( $scroll.scrollTop() - m._get_current_slide().height() );
                    m._get_first_slide().show();
                    m._positionate();
                    _locked = false;
                },
                _on_ttb_transition_end : function()
                {
                    m._get_last_slide().remove();
                    m._positionate();
                    _locked = false;
                },
                _toggle_pause_icon:function()
                {
                    $pause.attr('rel', _paused ? "paused" : "pause" );
                },
                /** public methods **/
                next_slide:function()
                {
                    !_paused ? m.pause_slides() : false;
                    switch( settings.direction )
                    {
                        case 'ttb':
                            m._move_slides_ttb();
                            break;
                        case 'btt':
                            m._move_slides_btt();
                            break;
                        case 'rtl':
                            m._move_slides_rtl();
                            break;
                        case 'ltr':
                        default:
                            m._move_slides_ltr();
                            break;
                    }
                },
                prev_slide:function()
                {
                    !_paused ? m.pause_slides() : false;
                    switch( settings.direction )
                    {
                        case 'ttb':
                            m._move_slides_btt();
                            break;
                        case 'btt':
                            m._move_slides_ttb();
                            break;
                        case 'rtl':
                            m._move_slides_ltr();
                            break;
                        case 'ltr':
                        default:
                            m._move_slides_rtl();
                            break;
                    }
                },
                pause_slides:function()
                {
                    if( !_paused )
                    {
                        clearInterval( _interval_id );
                        _paused = true;
                    }
                    else
                    {
                        m.resume_slides();
                        _paused = false;
                    }
                    m._toggle_pause_icon();
                },
                resume_slides:function()
                {
                    var next_slide_func;
                    switch( settings.direction )
                    {
                        case 'ttb':
                            next_slide_func = m._move_slides_ttb;
                            break;
                        case 'btt':
                            next_slide_func = m._move_slides_btt;
                            break;
                        case 'rtl':
                            next_slide_func = m._move_slides_rtl;
                            break;
                        case 'ltr':
                        default:
                            next_slide_func = m._move_slides_ltr;
                            break;
                    }
                    _interval_id = setInterval(next_slide_func,settings.interval);
                }
            }
            var m = methods;
            m._start();
        });
    }
})( jQuery );