//=begin app/cells/availability/availability.js
$(function() {
  var tokens = []
  var availabilities = {}
  var Availability = $.klass({
    initialize: function() {
      this.href = this.element.attr('href')
      this.availLabel = this.element.find('.label')
      this.textCont = this.element.find('.text')
      this.availDetail = this.element.find('.availDetail')
      this.throbber = this.element.find('.throbber')
      this.token = this.element.attr('token')
      tokens.push(this.token)
      availabilities[this.token] = this
    },
    toggleAvail: function() {
      this.availLabel.parent('.availability[token]').click(function(e) {
        var availSection = $(e.target).closest('.availability[token]')
        var availDetail = $(availSection).find('.availDetail')
        var availLabel = $(availSection).find('.label')

        var availMore = $(availSection).find('span.availCount')
        var availArrow = $(availSection).find('span.availArrow')

        if (availArrow.html() == "â–¼") {
          availDetail.slideUp('fast', function() {
            availMore.fadeIn({duration: 300, easing: 'easeInExpo'})
            availArrow.html("&#9658;")
            availArrow.show('slow')
          }
                  )
        } else {
          availDetail.slideDown('fast', function() {
            availMore.fadeOut({duration: 500, easing: 'easeOutExpo'})
            availArrow.html("&#9660;")
            availArrow.show()
          })
          availDetail.css({'display':'block'})
        }
      })
    },
    set: function(copies) {
      this.unthrob()
      this.fetched = true
      this.setAvailabilityText(copies)

      if (copies.length > 1) {
        this.count(copies.length - 1)
        this.availLabel.parent('.availability[token]').css({"cursor": "pointer"})
        this.availLabel.html( T('Availability') + ':')
        this.toggleAvail()
      }
    },
    setAvailabilityText: function(copies) {
      var availtext = ""
      var additionalAvailtext = ""

      jQuery.each(copies, function(i) {
        if (i == 0) {
          availtext = this.displayString
        } else {
          additionalAvailtext = additionalAvailtext + this.displayString + "<br/>"
        }
      })

      this.text(availtext)
      this.detailedAvail(additionalAvailtext)
    },
    halt: function() {
      this.unthrob()
      if (!this.fetched) {
        this.text('<a href="' + this.href + '" target="_blank">' + T('Check Availability') + '</a>')
      }
    },
    throb: function() {
      this.throbber.show()
    },
    unthrob: function() {
      this.throbber.hide()
    },
    text: function(text) {
      this.textCont.html(text)
    },
    detailedAvail: function(text) {
      this.availDetail.html(text)
    },
    count: function(copies) {
      if (copies == "1") {
        this.textCont.html(this.textCont.html() + "<span class='availArrow colors-text-headline'>&#9658;</span><span class='availCount colors-text-headline'>" + T('show 1 more copy') + "</span>")
      } else {
        var st = $template( T('show %{n} more copies').replace('%{n}', '{{n}}'), {n: copies})
        this.textCont.html(this.textCont.html() + "<span class='availArrow colors-text-headline'>&#9658;</span><span class='availCount colors-text-headline'>" + st + "</span>")
      }
    }
  })
  $(".availability[token]").attach(Availability)

  var documentStatusURL = $('#documentStatusService').html()
  var serverSession = $('#serverSession').html()

  $discovery.loadAvailabilities = function() {
    log.debug(tokens.length + " tokens total")
    if (tokens.length <= 0) return;
    log.debug(documentStatusURL + "?" + $.map(tokens, function(token) {
      return "s.id=" + token
    }).join('&'))
    $.ajax({
      url: documentStatusURL + "?" + $.map(tokens, function(token) {
        return "s.id=" + token
      }).join('&'),
      timeout: 60 * 1000,
      dataType: 'json',
      beforeSend: function(xhr) {
        xhr.setRequestHeader('Accept', 'application/json')
        xhr.setRequestHeader('X-Summon-Session-Id', serverSession)
      },
      success: function(response, status) {
        try {
          $.each(response.availabilityItems, function() {
            var availability = availabilities[this.id]
            if (availability) {
              var copies = this.availabilities
              if (copies) {
                availability.set(copies)
              }
            }
          })
        } catch(e) {
          log.error("error handling server response while loading availabilities: " + e.message)
          $.each(Availability.instances, function() {
            this.halt()
          })
          throw e
        }
      },
      error: function(xhr, textStatus, errorThrown) {
        log.error('AJAX error while loading availabilities: ' + (textStatus != 'error' ? textStatus : xhr.status))
      },
      complete: function() {
        $.each(Availability.instances, function() {
          this.halt()
        })
        // this is a hack to restore thumbnails on IE6..stupid IE6 - jl
        if ($.browser.msie) {
          $(".thumbnail-frame").css({"position":"static"}).css({"position":"relative"})
        }
      }
    })
  }

  if ($discovery.loadAvailabilities) {
    $discovery.loadAvailabilities()
  }
})
//=end app/cells/availability/availability.js
//=begin app/cells/saved_items/dialog.js
$(function() {
  function SavedItemsDialog(element) {
    var self = this
    this.format = 'summon'
  
    this.loading = function(isLoading) {
      element.find('.references').html(isLoading ? '<div class="loading"></div>' : '<ul></ul>')
      self.toggle(!isLoading)
    }
    this.toggle = function(enable) {
      var buttons = element.find('button')
      if (enable) {
        buttons.removeAttr('disabled').removeClass('inactive')
      } else {
        buttons.attr('disabled', true).addClass('inactive')
      }
    }
    this.renumber = function() {
      index = 0
      element.find('.references .index').each(function() {
        $(this).html(++index + ".")
      })
    }
    this.show = function() {
      $summon.dialog.savedItems({
        title: T('Saved Items') + "<span class=\"saved-items-count-label\">(" + T('loading') + ")</span>",
        width: 670,
        height: 448
      }).center()
      this.loadFormat(this.format)
    }
    this.fail = function() {
			element.find('.references').html("<p class='note'>" + T('Sorry. Saved Items is currently unavailable. Please try again later.') + ".</p>")
    },
    this.loadFormat = function(format) {
      this.format = format
      
      element.find('.formats a').removeClass('active')
      element.find('#format_' + format).addClass('active')
      element.find('.print').unbind('click').click(function() { open( ($query.originalParams.locale == "en" ? '' : '/' + $query.originalParams.locale) + '/references/print?reference_format=' + format, '_blank') })

      self.loading(true)
		
      $.ajax({
        url: '/references.json',
        data: {reference_format: format},
        timeout: 60000,
        success: function(listJson, status, req) {
		      self.loading(false)
					var expired = false
		      if (listJson["session_expired"] == 1) {
						$savedItems.count(0)
		        $savedItems.sessionExpired()
						expired = true
		      } 
					if (expired || listJson.length == 0) {
						// todo: fix this horribleness by using $template and $translate
			      element.find('.references').html("<p class='note'>" + T('You currently have no saved items') + ".</p>" +
			        "<p class='note'>" + T("You can add results to this folder by clicking the 'save this item' icon from the upper right of every search result. Any saved items will be available for the duration of your search session. If you would like to save your items beyond the session, you can copy/paste, email, print, or export your list to bibliographic management software at any time.") + "</p>")
		      } else {
		        var list = element.find('.references ul')
		        $.each(listJson, function() {
		          var item = $("<li class='reference'></li>")
		          item.attr("openurl", this.openurl)
		              .attr("reference_id", this.reference_id)
		              .html(this.formats[format])
		              .prepend("<span class='index'></span>")
		              .appendTo(list)
		        })
		        self.renumber()
		        element.find('.references li').attach(Reference)
		      }
		      $savedItems.count(listJson.length)
        },
        error: function(req, status, err) {
		      self.loading(false)
          self.fail()
        }
      })
    }
  }
  
  // email form
  (function() {
    var link = $('.saved-items-dialog .email')
    var form = $('.saved-items-dialog #email-form')
    var cancelLink = $('.saved-items-dialog #email-form a.cancel')
  
    var show = function() {
      $('.share-actions').fadeOut().queue(function() {
        form.fadeIn()
        $('#address').focus()
        $(this).dequeue()
      })
    }
    var hide = function() {
      form.fadeOut().queue(function() {
        $('.share-actions').fadeIn()
        $(this).dequeue()
      })
      return false;
    }
    var submit = function() {
      $.post(form.attr('action'), 
             {
               address:form.find('#address').val(), 
               reference_format:$savedItemsDialog.format
             }, 
             function(data) {
               var exportActions = $('.export-actions'), shareActions = $('.share-actions'), flash = $('.flash-message');
               
               exportActions.hide(); shareActions.hide();
               flash.text(data).show().css({backgroundColor:"orange"})
               flash.animate({backgroundColor:"white"}, 500).queue(function() {
                 flash.fadeOut({duration: 4000, easing: 'easeInExpo'}).queue(function() {
                   exportActions.show(); shareActions.show();
                   $(this).dequeue()
                 })
                 $(this).dequeue()
               })
             })
      hide()
      return false;
    }
    
    form.hide()
    link.click(show)
    form.submit(submit)
    cancelLink.click(hide)
  })()
  
  $savedItemsDialog = new SavedItemsDialog($('.saved-items-dialog'))
  
  var Reference = $.klass({
    initialize: function() {
      this.placeLinks();
    },
    deleteMe: function(e) {
      e.preventDefault()
      var self = this
      self.element.css('opacity', 0.5)
      $.post("/references/" + self.element.attr("reference_id"), {"_method":"delete"}, function() {
        self.element.remove();
        
        $.each(Reference.instances, function() {
          this.placeLinks();
        })
        $savedItemsDialog.renumber()
        $(document).trigger('saveditemsupdated')
      }, 'script')
    },
    placeLinks: function() {
      if (this.actions) this.actions.remove()
      
      var pos = this.element.position();
      var url = this.element.attr('openurl');
      
      this.actions = $('<div class="reference-actions"></div>')
          .css({top:pos.top, right:"5px", position:"absolute"})
          .appendTo(this.element.parent())

       $('<a href="#" class="theme-remove" title="' + T('remove this item') + '"></a>')
          .click($bind(this.deleteMe, this))
          .appendTo(this.actions)

      if (url) {
        $('<span> &nbsp; | &nbsp; </span>').appendTo(this.actions)
          $('<a href="' + url + '" target="_blank">' + T('Link') + '</a>').appendTo(this.actions)
      }
    }
  })
})
//=end app/cells/saved_items/dialog.js
//=begin app/cells/saved_items/folder.js
$(function() {
  function SavedItemsFolder(selector) {
    var element = $(selector);
    var clearLink = element.find('.clear-saved-items')
    var self = this
    var busy = false
    
    this.showDialog = function() {
      if (busy) {
        // nothing..
      } else {
        $savedItemsDialog.show()
      }
    }
    this.count = function(value) {
      var oldValue = parseInt(element.find('.saved-items-count').html(), 10);
      
      if (typeof value == "undefined") {
        return oldValue
      } else {
				value = parseInt(value, 10)
        if (value > 0) {
          clearLink.show()
          $('.theme-folder').removeClass('theme-folder-empty')
          $savedItemsDialog.toggle(true)
        } else {
          clearLink.hide()
          $('.theme-folder').addClass('theme-folder-empty')
          $savedItemsDialog.toggle(false)
        }
        
        $('.saved-items-count').html(value)
        $('.saved-items-count-label').html("(" + value + ")")
        if (oldValue != value) {
          element.css("background-color", "#FFFF00")
          var animation = element.animate({backgroundColor: "#F2F2F2"}, 1500)
          if (oldValue == 0 && value > 0) {
            animation.queue(function() {
              $savedItems.tooltip("information", $translate('This is a temporary folder, your saved items will be cleared when you leave.  You can export, email, or print your saved items at any time.'))
              $(this).dequeue()
            })
          }
        }
      }
			this.updateDocument()
    }
    this.add = function(itemElement) {
      var zombie = $("<div class='zombie'></div>").appendTo('body');
      zombie.css(itemElement.absolutePosition())
      var finish = element.absolutePosition()
      finish.height = finish.height - 9
      if ($.browser.safari && parseInt($.browser.version) < 526) {
        finish.top += window.pageYOffset
      }

      zombie.animate(finish, 800, "easeOutExpo", function() {zombie.remove()})
      
      $.ajaxQueue.post("/references", {
        data:{
          document_id:itemElement.attr('id'),
          "s.ho":$query.holdingsOnlyEnabled
        },
        beforeSend:function() {
          busy = true
          $('a.saved-items-link').addClass('saved-items-no-link')
          element.addClass('loading')
        },
        complete:function() {
          busy = false
          $('a.saved-items-link').removeClass('saved-items-no-link')
          element.removeClass('loading')
          self.updateDocument()
        },
        dataType:"script"
      })
    }
    this.clear = function() {
      if (confirm( T('Are you sure you want to clear your saved items?'))) {
        $.dialog().close()
        $.post("/references/clear", {"_method":"delete"}, function() {
          self.updateDocument()
        }, "script")
      }
      
      self.updateDocument()
    }
    this.updateDocument = function() {
      var items = ($.cookie('saved_items') || "").split(';')
      $('.document').each(function() {
        if ($.inArray($(this).attr('id'), items) != -1)
          $(this).addClass('document-saved')
        else
          $(this).removeClass('document-saved')
      })
    }
    function close(element) {
      element.animate({opacity: "hide"}, 800, "easeOutExpo")
    }
    function open(element) {
      element.animate({opacity: "show"}, 800, "easeInExpo")
    }
    this.tooltip = function(type, value) {
      var tooltip = $('#dock #tooltip')
      tooltip.css('opacity', 'hide')
      open(tooltip)
      tooltip.removeClass().addClass("tooltip-" + type)
             .find('.content').html(value).end()
             .find('.theme-tooltip-close').unbind("click").click(function() {close(tooltip)}).end()
             .css({
                    position:"absolute",
                    left:element.position().left,
                    top:-tooltip.outerHeight()
                  })
      setTimeout(function() {close(tooltip)}, 5000)
    }

		this.sessionExpired = function() {
			this.tooltip('error', $translate('Sorry.  Your session has timed out.'))
			this.updateDocument()
		}
		this.serviceUnavailable = function() {
			this.tooltip('error', $translate('Sorry. Saved Items is currently unavailable. Please try again later.'))
			this.updateDocument()
		}
        
    setInterval(function() { 
      if ($.cookie('refworks_session') && parseInt(element.find('.saved-items-count').html()) > 0) $.get("/references/ping") 
    }, 5 * 60 * 1000)
    
    $(document).bind('saveditemsupdated', self.updateDocument)
    self.updateDocument() // update on page load
  }
  $savedItems = new SavedItemsFolder('.saved-items-folder')
  
  $leavingSite = true;
})
//=end app/cells/saved_items/folder.js
//=begin app/cells/syndetics/preview.js
;(function(jQuery, window, undefined) {
  // modified bowker syndetics plus scripts
  // this one won't remove jQuery from your page..
  // - db
  //
  // also removed some stuff we don't user
  
  var $syndetics = {};

  $syndetics.jQuery = jQuery.sub() // don't spill your methods on our jQuery..

  $syndetics.get_all_enhancements = function(doc) {
    return $syndetics.jQuery.map(
      $syndetics.jQuery("*[id^='syn_']", doc),
      function(tag) {
        return tag.id;
      }
    );
  };

  $syndetics.valid_isbn = function(isbn) {
    switch(isbn.length) {
      case 10:
        return $syndetics.valid_isbn10(isbn);
      case 13:
        return $syndetics.valid_isbn13(isbn);
      default:
        return false;
    }
  };

  $syndetics.valid_isbn10 = function(isbn) {
    var total = 0;
    for (var i=0; i<10; i++) {
      var digit = isbn.charAt(i).toUpperCase();
      if(digit == 'X') {
        total += 10;
      }
      else {
        total += parseInt(digit) * (10 - i);
      }
    }
    return total%11==0;
  };

  $syndetics.valid_isbn13 = function(isbn) {
    var total = 0;
    for (var i=0; i<13; i++) {
      var digit = parseInt(isbn.charAt(i));
      if(i%2 == 0) {
        total += digit;
      }
      else {
        total += digit * 3;
      }
    }
    return total%10==0;
  };

  $syndetics.valid_upc = function(upc) {
    var total = 0;
    for (var i=0; i<12; i++) {
      var digit = parseInt(upc.charAt(i));
      if(i%2 == 0) {
        total += digit * 3;
      } 
      else {
        total += digit;
      }
    } 
    return total%10==0;
  }

  $syndetics.unique = function(list) {
    var h = {};
    return $syndetics.jQuery.grep(
      list,
      function(item) {
        if(h[item] == undefined) {
          h[item] = 1;
          return true;
        } 
        else {
          return false;
        }
      }
    );
  };

  $syndetics.truncate_enhancements = function(doc) {
    $syndetics.jQuery('.syn_truncate', doc).truncate({
      max_length: 600,
      more: '...read more',
      less: 'less'
    });
    return;
  };

  $syndetics.lb_show = function(enhancement,isbn,upc,oclc,tag,value,start,range) {
    if(!document.getElementById('syn_lb')) {
      $syndetics.jQuery(document.body).append(
          "<div id='syn_lb_overlay'/>"
        + "<div id='syn_lb'>"
        + "  <div id='syn_lb_head'>"
        + "    <div id='syn_lb_title'></div>"
        + "    <form id='syn_lb_search_form'>"
        + "      <input id='syn_lb_search_enhancement' type='hidden'/>"
        + "      <input id='syn_lb_search_isbn' type='hidden'/>"
        + "      <input id='syn_lb_search_upc' type='hidden'/>"
        + "      <input id='syn_lb_search_oclc' type='hidden'/>"
        + "      <input id='syn_lb_search_text' type='text'/>"
        + "      <input id='syn_lb_search' type='submit' value='Search'/>"
        + "      <input id='syn_lb_close' type='submit' value='Close'/>"
        + "    </form>"
        + "  </div>"
        + "  <div id='syn_lb_body'>"
        + "    <div id='syn_lb_loading'><image src='"+$syndetics.base_uri+"/images/ajax-loader.gif' alt='Loading...'/></div>"
        + "    <div id='syn_lb_left' /><div id='syn_lb_right' />"
        + "  </div>"
        + "</div>"
      );
      $syndetics.jQuery("#syn_lb_close,#syn_lb_overlay").click(
        function(){
          $syndetics.lb_hide(); 
          return false;
        }
      );
      $syndetics.jQuery("#syn_lb_search_form").submit(function(){
        $syndetics.lb_show(
          $syndetics.jQuery("#syn_lb_search_enhancement").val(),
          $syndetics.jQuery("#syn_lb_search_isbn").val(),
          $syndetics.jQuery("#syn_lb_search_upc").val(),
          $syndetics.jQuery("#syn_lb_search_oclc").val(),
          'q', 
          $syndetics.jQuery("#syn_lb_search_text").val()
        );
        return false;
      });
    }

    $syndetics.lb_style();
    $syndetics.jQuery("#syn_lb_search_enhancement").val(enhancement);
    $syndetics.jQuery("#syn_lb_search_isbn").val(isbn);
    $syndetics.jQuery("#syn_lb_search_upc").val(upc);
    $syndetics.jQuery("#syn_lb_search_oclc").val(oclc);
    $syndetics.jQuery("#syn_lb,#syn_lb_overlay,#syn_lb_loading").show();

    // Issue web service request for lightbox content
    var query = (tag == 'q') ? value
                             : tag + ':"' + value + '"';
    var url= $syndetics.base_uri + '/widget_response_lightbox.php'
      + '?id=' + $syndetics.id
      + '&enhancement=' + enhancement
      + '&isbn=' + isbn   
      + '&upc=' + upc   
      + '&oclc=' + oclc  
      + '&q=' + query
      + '&isbn_uri=' + encodeURIComponent($syndetics.isbn_uri);
    if(start) { url += '&s=' + start; }
    if(range) { url += '&n=' + range; }
    $syndetics.jQuery.getScript(
      url, 
      function() { 
        $syndetics.jQuery("#syn_lb_loading").hide(); 
        $syndetics.jQuery("#syn_lb_title").html($syndetics.jQuery("#syn_lb_left .syn_title").text());
        $syndetics.jQuery("#syn_lb_left .syn_title").remove(); 
        $syndetics.jQuery("#syn_lb_left .syn_terms").remove(); 
      }
    );
  };

  $syndetics.lb_hide = function() {
    $syndetics.jQuery("#syn_lb,#syn_lb_overlay").hide();
    $syndetics.jQuery("#syn_lb_left,#syn_lb_right").html("");
    $syndetics.jQuery("#syn_lb_search_text").val("");
    $syndetics.jQuery("#syn_lb_title").html("");
    if ($syndetics.jQuery.browser.msie) {
      $syndetics.jQuery("html,body").css({
        height:"auto",
        overflow:"auto"
      });
    }
  };

  $syndetics.lb_style = function() {
    if($syndetics.jQuery.browser.opera) {
      $doc_width = window.innerWidth;
      $doc_height = window.innerHeight;
  	}
    else {
      $doc_width = $syndetics.jQuery(window).width();
      $doc_height = $syndetics.jQuery(window).height();
    }
    $lb_width = 750;
    $lb_title_height = 30;
    $padding = 50;
    $syndetics.jQuery("#syn_lb").css({
      position:"fixed",
      width:$lb_width+"px",
      height:($doc_height-$padding)+"px",
      top:($padding/2)+"px",
      left:(($doc_width-$lb_width)/2)+"px",
      background:"#fff",
      overflow:"auto",
      "z-index":"1500"    
    });
    $syndetics.jQuery("#syn_lb_overlay").css({
      position:"fixed",
      "background-color":"#222222",
      cursor:"pointer",
      height:"100%",
      left:"0",
      opacity:"0.5",
      top:"0",
      width:"110%",
      "z-index":"1000"
    });
    $syndetics.jQuery("#syn_lb_loading").css({
      position:"absolute",
      top:"45%",
      left:"50%"
    });
    $syndetics.jQuery("#syn_lb_head").css({
      height:$lb_title_height+"px"
    });
    $syndetics.jQuery("#syn_lb_head form").css({
      position:"absolute",
      top:"1px",
      right:"1px",
      display:"inline"
    });
    $syndetics.jQuery("#syn_lb_title").css({
      "padding-top":"4px"
    });
    $syndetics.jQuery("#syn_lb_left").css({
      float:"left",
      overflow:"auto",
      width:"310px",
      height:($doc_height-$padding-$lb_title_height)+"px"
    });
    $syndetics.jQuery("#syn_lb_right").css({
      overflow:"auto",
      height:($doc_height-$padding-$lb_title_height)+"px"
    });
    /* IE Specific hack to properly render lightbox */
    if ($syndetics.jQuery.browser.msie) {
      $syndetics.jQuery("html,body").css({
        height:"100%",
        overflow:"hidden"
      });
      $syndetics.jQuery("#syn_lb,#syn_lb_overlay").css({
        position:"absolute"
      });
      window.scrollTo(0,0);
    }
  };

  // Allow customers to register a callback function that gets executed after
  // widgets are returned
  $syndetics.callback = function() {};

  // Minified $syndetics.jQuery Truncate plugin HTML Truncator 
  // by Henrik Nyh http://henrik.nyh.se 2008-02-28,
  // Free to modify and redistribute with credit
  (function($){var trailing_whitespace=true;$.fn.truncate=function(options){var opts=$.extend({},$.fn.truncate.defaults,options);$(this).each(function(){var content_length=$.trim(squeeze($(this).text())).length;if(content_length<=opts.max_length)
  return;var actual_max_length=opts.max_length-opts.more.length-3;var truncated_node=recursivelyTruncate(this,actual_max_length);var full_node=$(this).hide();truncated_node.insertAfter(full_node);findNodeForMore(truncated_node).append(' (<a href="#show more content">'+opts.more+'</a>)');findNodeForLess(full_node).append(' (<a href="#show less content">'+opts.less+'</a>)');truncated_node.find('a:last').click(function(){truncated_node.hide();full_node.show();return false;});full_node.find('a:last').click(function(){truncated_node.show();full_node.hide();return false;});});}
  $.fn.truncate.defaults={max_length:100,more:'Ã¢â‚¬Â¦more',less:'less'};function recursivelyTruncate(node,max_length){return(node.nodeType==3)?truncateText(node,max_length):truncateNode(node,max_length);}
  function truncateNode(node,max_length){var node=$(node);var new_node=node.clone().empty();var truncatedChild;node.contents().each(function(){var remaining_length=max_length-new_node.text().length;if(remaining_length==0)return;truncatedChild=recursivelyTruncate(this,remaining_length);if(truncatedChild)new_node.append(truncatedChild);});return new_node;}
  function truncateText(node,max_length){var text=squeeze(node.data);if(trailing_whitespace)
  text=text.replace(/^ /,'');trailing_whitespace=!!text.match(/ $/);var text=text.slice(0,max_length);text=$('<div/>').text(text).html();return text;}
  function squeeze(string){return string.replace(/\s+/g,' ');}
  function findNodeForMore(node){var $node=$(node);var last_child=$node.children(":last");if(!last_child)return node;var display=last_child.css('display');if(!display||display=='inline')return $node;return findNodeForMore(last_child);};function findNodeForLess(node){var $node=$(node);var last_child=$node.children(":last");if(last_child&&last_child.is('p'))return last_child;return node;};}
  )($syndetics.jQuery);

  $syndetics.base_uri = 'http://plus.syndetics.com';
  $syndetics.isbn_uri = '';

  $syndetics.isbn = '';
  $syndetics.upc = '';
  $syndetics.oclc = '';
  
  $syndetics.enhance = function(element) {
    element = element || document
    $syndetics.enhancements = $syndetics.get_all_enhancements(element);
    if( $syndetics.id != ''
     && ($syndetics.isbn != '' || $syndetics.upc != '' || $syndetics.oclc != '')
     && $syndetics.enhancements != ''
    ) {
      // Load widget data
      var widget_uri=$syndetics.base_uri 
        + '/widget_response.php?id='+ $syndetics.id 
        + '&isbn=' + $syndetics.isbn
        + '&upc=' + $syndetics.upc
        + '&oclc=' + $syndetics.oclc
        + '&enhancements=' + $syndetics.enhancements;
     $syndetics.jQuery.getScript(widget_uri, $syndetics.callback());
    }
  }

  window.$syndetics = $syndetics

})(jQuery, this);


;(function($, window, undefined) {

  function push(arr) {
    for (var i = 1; i < arguments.length; i++)
      arr.push(arguments[i])
  }

  function generatePlaceholders(fields) {
    var s = [], field, i
    for (i = 0; i < fields.length; i++) {
      field = fields[i]
      push(s, '<div data-syndeticsid="', field, '" class="syndetics-item ', field, '"/>')
    }
    return s.join('')
  }

  $(function() {
    $('.preview').bind('show', function() {
      var preview = $(this),
          syndetics = preview.find('.syndetics-plus'),
          loading = syndetics.find('.syndetics-loading'),
          content = syndetics.find('.syndetics-content')
        
      if (!syndetics.length || syndetics.data('processed')) return
      // mark as processed so we only request it once
      syndetics.data('processed', true)

      var isbn = $.trim(content.attr('rel'))
      var fields = content.data('fields').split(' ')

      $syndetics.callback = function() {
        loading.remove()
        content.show()
        $syndetics.callback = $.noop
      }

      // id's are unique on the page, remove so we can reuse them
      // $('#syndetics-plus').removeAttr('id') // added .syndetics-item class so it doesn't touch the dom again
      $('.syndetics-item').removeAttr('id')
      // $('#syndetics-plus.syndetics-item').removeAttr('id') // incompatible with jsdom
    
      // assign id's so syndetics can find them
      content
        .attr('id', 'syndetics-plus')
        .append(generatePlaceholders(fields))
        .find('.syndetics-item').each(function() {
          var item = $(this)
          item.attr('id', item.data('syndeticsid'))
        })
    
      $syndetics.id = syndetics.data('clientid');
      $syndetics.isbn = isbn
      $syndetics.enhance(syndetics)
    })
  })
  
})(jQuery, this);//=end app/cells/syndetics/preview.js
//=begin app/cells/spotlight/spotlight.js
$(window).ready(function() {
  // ie actually supports load errors on images
  $('.spotlight img').bind('error', function() {
    $(this).parents('.spotlight-document').hide()
  })
})

$(window).load(function() {
  // when spotlight images are loaded, remove empty ones
  $('.spotlight img').each(function() {
    ($(this).width() <= 1) && $(this).parents('.spotlight-document').hide()
  })
  
  if (!$('.spotlight img:visible').length) {
    $('.spotlight').hide()
  }
})
//=end app/cells/spotlight/spotlight.js
//=begin app/cells/preview/cite.js
$(function() {

  $citations = function(element) {
    $(element).firstAttached(Citations).load()
  }

  var Citations = $.klass({
    initialize: function() {
      this.docid = this.element.attr('docid')
      this.tabs = this.element.find('.tabs')
      this.url = this.element.attr('url')
      this.content = this.element.find('.content')
      this.throbber = this.element.find('.throbber')
      this.components = this.element.find('.tabs, .quote')
    },
    load: function() {
      log.debug('load citations: ' + this.docid)
      this.throbber.toggleClass('hidden', false)
      $.ajax({
        url: this.url,
        success: $bind(this.success, this),
        error: $bind(this.error, this),
        complete: $bind(this.complete, this)
      })
    },
    success: function(data) {
      this.tabs.prepend(data).find('.tab').attach(CitationTab, this)
      this.components.fadeIn('fast')
      this.load = $noop
    },
    error: function() {
      alert('Sorry, unable to load citation data at this time.')
    },
    complete: function() {
      this.throbber.toggleClass('hidden', true)
    }
  })
  $('.citation').attach(Citations)

  var CitationTab = $.klass({
    initialize: function(pane) {
      this.pane = pane
      this.text = this.element.find('.text')
      this.content = pane.content
      this.element.hover(function() {
        $(this).addClass('hover')
      }, function() {
        $(this).removeClass('hover')
      })
      if (this.element.hasClass('first')) {
        this.select(true)
      }

    },
    onclick: function() {
      this.select()
    },
    select: function(immediately) {
      if (this.pane.current) {
        this.pane.current.deselect()
      }
      this.pane.current = this
      this.element.addClass('selected')

      var text = this.text
      var content = this.content
      if (immediately) {
        content.html(text.html())
      } else {
        content.fadeOut('fast').queue(function() {
          content.html(text.html())
          content.fadeIn('fast')
          $(this).dequeue()
        })
      }
    },
    deselect: function() {
      this.element.removeClass('selected')
    }
  })
})
//=end app/cells/preview/cite.js
//=begin app/cells/preview/details.js
$(function() {
  $('.previewAuthorOverflowToggle').click(function() {
    $(this).next('.previewAuthorOverflow').slideToggle('fast', 'easeOutExpo')
  })
})
//=end app/cells/preview/details.js
//=begin app/cells/document/isi_cited_references_count.js
$(function() {
  var TimesCited = $.klass({
    initialize: function() {
      this.stash = this.element.find('.isi_loader').html() 

      this.popup = this.element.find('.preview')
      this.moved = false
      this.cached = false
      this.xhr = null
      
      setTimeout($bind(function() {
        this.element.find('.count').hoverIntent({
          sensitivity: 7,
          interval: 500,
          over: $bind(this.preview, this),
          out: $noop}).bind('mouseover', $bind(this.ping, this)).bind('mouseleave', $bind(this.unpreview, this))
      }, this), 0)
    },
    previewToggle: function(e) {
      $togglePreview(this.popup, e)
    },
    preview: function(e) {
      var details = this.element.find('.details')
      var loader = this.element.find('.isi_loader')
      if (!this.moved) {
        // nasty nasty - but beats rewriting the popup stuff at the last minute -db
        // what this does is move the preview elements themselfs outside of the document frame, 
        // so the element is positioned relative to the body, not the current document
        this.popup.remove().insertAfter(this.element.parents('.document-frame'))
        this.popup.bind('mouseover', $bind(this.ping, this)).bind('mouseleave', $bind(this.unpreview, this))
      }
      if (!this.cached) {
        var self = this
        loader.html(this.stash)
        if (this.xhr === null) {
          this.xhr = $.ajax({
            url: "/isi_info?id=" + details.attr('wos-ut')+ "&cc=" + details.attr('wos-cc'),
            success: function(data, status, xhr) {
              loader.html(data)
              self.cached = true
            },
            complete: function(xhr, status) {
              self.xhr = null
            }
          })
        }
      }
      
      $preview(this.popup, e)
    },
    unpreview: function(e) {
      // could abort xhr if still going.. (this.xhr != null)
      $hidePreview(this.popup, e)
    },
    ping: function(e) {
      $pingPreview(this.popup, e) 
    }
  })

  $('.isi-cited-references').each(function() {
    if ($(this).attr('enableFlyout') == "true" && $(this).attr('citationCount') !== "0") {
      $(this).attach(TimesCited)
      $(this).css('cursor', 'pointer')
    }
  })
})//=end app/cells/document/isi_cited_references_count.js
//=begin app/cells/document/summon_summary.js
$(function() {
  $(document).click(function(e) {
    var trigger = e.target
    if ($(trigger).is('a.theme-preview')) {
      $(trigger).parents('.document').firstAttached(Summary).previewToggle(e)
      return false
    } else if ($(trigger).is('.theme-save-item')) {
      $(trigger).parents('.document').firstAttached(Summary).save()
      return false
    }
  })

  var Summary = $.klass({
    initialize: function() {
      setTimeout($bind(function() {
        this.element.find('.title a.documentLink').hoverIntent({
          sensitivity: 7,
          interval: 500,
          over: $bind(this.preview, this),
          out: $noop}).bind('mouseover', $bind(this.ping, this)).bind('mouseleave', $bind(this.unpreview, this))

        this.element.find('.actions').hoverIntent({
          over: function() {
            $(this).find('.theme-preview').addClass('theme-preview-hover')
            $(this).find('.theme-drag').addClass('theme-drag-hover')
            $(this).find('.theme-save-item').addClass('theme-save-item-hover')
          },
          out: function() {
            $(this).find('.theme-preview').removeClass('theme-preview-hover')
            $(this).find('.theme-drag').removeClass('theme-drag-hover')
            $(this).find('.theme-save-item').removeClass('theme-save-item-hover')
          }
        })

        this.element.bind('mouseenter', function() {
            $(this).addClass('document-hover')
        }).bind('mouseleave', function() {
            $(this).removeClass('document-hover')
            $hideCurrentPreview()
        })
      }, this), 0)
    },
    previewToggle: function(e) {
      $togglePreview(this.element.find('.preview'), e)
    },
    preview: function(e) {
      $preview(this.element.find('.preview'), e)
    },
    unpreview: function(e) {
      $hidePreview(this.element.find('.preview'), e)
    },
    ping: function(e) {
      $pingPreview(this.element.find('.preview'), e) 
    },
    save: function() {
      $savedItems.add(this.element)
    }
  })
  $('.document').attach(Summary)

  var Tooltip = $.klass({
    initialize: function() {
      this.guard = this.element.find('.guard')
      this.content = this.element.find('.content')
      this.element.hoverIntent($bind(this.over, this), $bind(this.out, this))
      this.guard.hoverIntent($noop, $bind(this.out, this))
    },
    over: function(e) {
      var trigger = $(e.target)
      var tpos = trigger.position()
      this.guard.css({
        top: tpos.top,
        left: tpos.left - (this.guard.width() - trigger.width()) + this.guard.width() / 4
      }).fadeIn("slow", "easeOutExpo")
    },
    out: function() {
      this.guard.fadeOut("slow", "easeInExpo")
    }
  })
  $('.document .authors .tooltip').attach(Tooltip)
})
//=end app/cells/document/summon_summary.js
//=begin app/cells/facet/checkboxes.js
$(function() {
  $('.AnyToggle').each(function() {
    var applied = $(this).attr('applied') == "true"
    this.checked = applied
    $(this).click(function(e) {
      if (applied) {
        return false
      } else {
        jump(this.value) 
      }
    })
  })
})
//=end app/cells/facet/checkboxes.js
//=begin app/cells/facet/more.js
$(function() {
  $('.MoreFacetsTrigger').click(function() {
    $(this).trigger({
      type: 'morefacets',
      facetName: $(this).attr('facet'),
      facetLabel: $(this).attr('label')
    })
    return false
  })    
})
//=end app/cells/facet/more.js
//=begin app/cells/facet/range.js
$(function() {
  var movement = null

  var num = function(el, attr) {
    var str = $(el).attr(attr)
    if ($.trim(str) != '') {
      return new Number(str).valueOf()
    }
  }

  function normalizeMouseCoords(e) {
    var orig = e.originalEvent
    if (orig.changedTouches) {
      e.pageX = orig.changedTouches[0].pageX
      e.pageY = orig.changedTouches[0].pageY
    }
    return e
  }

  var leftLTR = new (function() {
    $.extend(this, {
      bound: 'lower',
      slotIndex: function(thumb, mouseX) {
        var rest = thumb.selector.rest
        if (mouseX < (rest.offset().left + rest.outerWidth() / 2)) {
          return -1
        }
        for (var index = 0; index < thumb.selector.slots.length; index++) {
          var slot = $(thumb.selector.slots.get(index))
          if (mouseX < (slot.offset().left + slot.outerWidth() / 2) || index == thumb.opposite().slot) {
            break;
          }
        }
        return index
      },
      slotIndexRaw: function(thumb, mouseX) {
        var rest = thumb.selector.rest
        if (mouseX < (rest.offset().left)) {
          return -1
        }
        for (var index = 0; index < thumb.selector.slots.length; index++) {
          var slot = $(thumb.selector.slots.get(index))
          if (mouseX < (slot.offset().left)) {
            break;
          }
        }
        return index - 1
      },
      positionAtSlot: function(thumb, i) {
        var left
        if (i < 0) {
          left = 0
        } else {
          var slot = $(thumb.selector.slots.get(i))
          left = slot.offset().left - thumb.selector.rule.offset().left - thumb.element.outerWidth()
        }
        thumb.element.css('left', left)
      }
    })
  })()

  var rightLTR = new (function() {
    $.extend(this, {
      bound: 'upper',
      slotIndex: function(thumb, mouseX) {
        var slots = thumb.selector.slots
        if (thumb.opposite().slot == -1 && mouseX < $(slots.get(0)).offset().left) {
          return -1
        }
        for (var index = 1; index < slots.length; index++) {
          var slot = $(slots.get(index))
          if (index - 1 < thumb.opposite().slot) {
            continue
          }
          if (mouseX < slot.offset().left + slot.outerWidth() / 2) {
            break;
          }
        }
        return index - 1
      },
      slotIndexRaw: function(thumb, mouseX) {
        var slots = thumb.selector.slots
        if (mouseX < $(slots.get(0)).offset().left) {
          return -1
        }
        for (var index = 1; index < slots.length; index++) {
          var slot = $(slots.get(index))
          if (mouseX < slot.offset().left) {
            break;
          }
        }
        return index - 1
      },
      positionAtSlot: function(thumb, index) {
        var rest = thumb.selector.rest
        var slots = thumb.selector.slots
        var rule = thumb.selector.rule
        var right
        if (index < 0) {
          right = rule.outerWidth() - rest.outerWidth() - thumb.element.outerWidth() + 2
        } else if (index >= slots.length - 1) {
          right = 0
        } else {
          var slot = $(slots.get(index))
          right =  rule.offset().left + rule.outerWidth() - (slot.offset().left + slot.outerWidth() + thumb.element.outerWidth())
        }
        thumb.element.css('right', right)
      }
    })
  })()

  var leftRTL = new (function() {
    $.extend(this, {
      bound: 'lower',
      slotIndex: function(thumb, mouseX) {
        var rest = thumb.selector.rest
        if (mouseX > (rest.offset().left + rest.outerWidth() / 2)) {
          return -1
        }
        for (var index = 0; index < thumb.selector.slots.length; index++) {
          var slot = $(thumb.selector.slots.get(index))
          if (mouseX > (slot.offset().left + slot.outerWidth() / 2) || index == thumb.opposite().slot) {
            break;
          }
        }
        return index
      },
      slotIndexRaw: function(thumb, mouseX) {
        var rest = thumb.selector.rest
        if (mouseX > rest.offset().left) {
          return -1
        }
        var slots = thumb.selector.slots
        for (var index = 0; index < slots.length; index++) {
          var slot = $(slots.get(index))
          if (mouseX > slot.offset().left) {
            break;
          }
        }
        return index
      },
      positionAtSlot: function(thumb, i) {
        var right
        if (i < 0) {
          right = 0
        } else {
          var slot = $(thumb.selector.slots.get(i))
          var rule = thumb.selector.rule
          right = ((rule.offset().left + rule.outerWidth()) - (slot.offset().left + slot.outerWidth())) - thumb.element.outerWidth()
        }
        thumb.element.css('right', right)
      }
    })
  })()

  var rightRTL = new (function() {
    $.extend(this, {
      bound: 'upper',
      slotIndex: function(thumb, mouseX) {
        var slots = thumb.selector.slots
        if (mouseX < slots.last().offset().left + slots.last().outerWidth() / 2) {
          return slots.length - 1
        }
        for (var index = 0; index < slots.length; index++) {
          var slot = $(slots.get(index))
          if (index - 1 < thumb.opposite().slot) {
            continue
          }
          if (mouseX > slot.offset().left + slot.outerWidth() / 2) {
            break;
          }
        }
        return index - 1
      },
      slotIndexRaw: function(thumb, mouseX) {
        var rest = thumb.selector.rest
        if (mouseX > rest.offset().left) {
          return -1
        }
        var slots = thumb.selector.slots
        for (var index = 0; index < slots.length; index++) {
          var slot = $(slots.get(index))
          if (mouseX > slot.offset().left) {
            break;
          }
        }
        return index
      },
      positionAtSlot: function(thumb, index) {
        var rest = thumb.selector.rest
        var slots = thumb.selector.slots
        var rule = thumb.selector.rule
        var right
        if (index < 0) {
          right = (rule.offset().left + rule.outerWidth()) - rest.offset().left
        } else if (index >= slots.length - 1) {
          right = rule.outerWidth() - thumb.element.outerWidth()
        } else {
          var slot = $(slots.get(index))
          right = (rule.offset().left + rule.outerWidth()) - slot.offset().left
        }
        thumb.element.css('right', right)
      }
    })
  })()

  var Thumb = $.klass({
    initialize: function(selector, side, name) {
      this.selector = selector
      this.side = side
      selector[name] = this
      this.set(this.start = num(this.element, 'start'))
    },

    set: function(slot) {
      if (slot != this.slot) {
        this.slot = slot
        this.side.positionAtSlot(this, slot)
        this.selector[this.side.bound](slot, slot != this.start)
      }
    },

    opposite: function() {
      return this.selector.opposingThumb(this)
    },
    slotIndexByClick: function(mouseEvent) {
      return this.side.slotIndexRaw(this, normalizeMouseCoords(mouseEvent).pageX)
    },
    slotIndex: function(mouseEvent) {
      return this.side.slotIndex(this, normalizeMouseCoords(mouseEvent).pageX)
    },
    move: function(e) {
      var slotIndex = this.side.slotIndex(this, normalizeMouseCoords(e).pageX)
      if (this.slot != slotIndex) {
        this.set(slotIndex)
      }
    }
  })
  
  var RangeSelector = $.klass({
    initialize: function() {
      var self = $summon.slider = this    
      this.query = this.element.attr('query')
      this.sep = this.query.indexOf('?') != -1 ? '&' : '?'

      this.min = num(this.element, 'min')
      this.max = num(this.element, 'max')
      this.flasher = this.element.find('.flash a')
      this.rule = this.element.find('.rule')
      this.rest = this.element.find('.slot.rest')
      this.slots = this.element.find('.slot.standard')
      this.activate = this.element.find('.legend button')
      this.clear = this.element.find('.clear')
      this.flash = $noop
      var upper, lower
      if ($.bidi.rtl) {
        upper = this.element.find('.thumbs .theme-slider-thumb-right').attachAndReturn(Thumb, this, rightRTL, 'right')[0]
        lower = this.element.find('.thumbs .theme-slider-thumb-left').attachAndReturn(Thumb, this, leftRTL, 'left')[0]
      } else {
        upper = this.element.find('.thumbs .theme-slider-thumb-right').attachAndReturn(Thumb, this, rightLTR, 'right')[0]
        lower = this.element.find('.thumbs .theme-slider-thumb-left').attachAndReturn(Thumb, this, leftLTR, 'left')[0]
      }

      this.minYear = this.element.find('.date-entry .min .year')
      this.maxYear = this.element.find('.date-entry .max .year')
      this.dateEntry = this.element.find('.date-entry')
                                      .change($bind(this._flash, this))
      this.activate.click($bind(this.go, this))
      this.clear.click($bind(this.reset, this))
      this.element.find('.bar').click($bind(this.barClick, this))
      this.element.find('.bar').bind("dblclick", ($bind(this.barDoubleClick, this)) )
      this.flash = this._flash
      this.flash(true)
      
      
      $(document).bind({
        'mousedown touchstart': function(e) {
          var target = $(e.target)
          if (target.hasClass('thumb')) {
            $(document.body).toggleClass('moving', true)

            if (target.hasClass('lower')) {
              movement = {
                thumb: lower
              }
            } else {
              movement = {
                thumb: upper
              }
            }
            return false
          }      
        },
        'mousemove touchmove': function(e) {
          if (movement) {
            var orig = e.originalEvent
            movement.thumb.move(e)
            return false
          }
        },
        'mouseup touchend': function(e) {
          if (movement) {
            $(document.body).removeClass('moving', false)
            movement = null
          }
        }
      })      
      
    },
    go: function() {
      if (this.dateEntry.hasClass('invalid')) { return false }

      var range = this.element.find('.date-entry .range').val()
      var cmd = (range == "PublicationDate,*:*") ? 'removeRangeFilter(PublicationDate)' : 'setRangeFilter(' + range + ')'
      jump(this.query + this.sep + "s.cmd=" + cmd)
      return false
    },
    reset: function() {
      $(this.element.find('form input,select')).val('')
      this.left.set(-1)
      this.right.set(11)
      this.go()
      return false
    },
    barClick: function(e) {
      clickSlotIndexRight = this.right.slotIndexByClick(e)
      this.left.set(clickSlotIndexRight) 
      this.right.set(clickSlotIndexRight)
    },
    barDoubleClick: function(e) {
      this.go()
    },
    opposingThumb: function(thumb) {
      return thumb == this.left ? this.right : this.left
    },
    
    validateYear: function(input) {
      var val = $(input).val() || ''
      var validFormat = val.match(/^\d{4}/)
      var numeric = new Number(val)
      var valid = validFormat && !isNaN(numeric) && numeric >= 1 && numeric <= 2020
      $(input).toggleClass('invalid', !valid) 
    },
    
    enableSubmit: function() {
      this.activate.removeAttr('disabled').removeClass('inactive')
    },

    lower: function(idx, dirty) {
      this._dirtyLower = true
      if (idx < 0) {
        delete this._lower
      } else {
        this._lower = {
          value: num($(this.slots.get(idx)), 'min')
        }
      }
      this.flash()
    },
    upper: function(idx, dirty) {
      this._dirtyUpper = true
      if (idx >= this.slots.length - 1) {
        delete this._upper
      } else if (idx == -1) {
        this._upper = {
          value: num(this.rest, 'max')
        }
      } else {
        this._upper = {
          value: num($(this.slots.get(idx)), 'max')
        }
      }
      this.flash()
    },
    _flash: function(first) {
      var lower = this._lower ? this._lower.value : ''
      var upper = this._upper ? this._upper.value : ''
      if (!first && this._dirtyLower) {
        $(this.element).find('.date-entry .min select').val('')
        this.minYear.val(lower).change();
        this.enableSubmit();
      }
      if (!first && this._dirtyUpper) {
        $(this.element).find('.date-entry .max select').val('')
        this.maxYear.val(upper).change();
        this.enableSubmit();
      }
      this._dirtyLower = this._dirtyUpper = false;

      lower = this.minYear.val();
      upper = this.maxYear.val();
      if (lower && upper) {
        this.flasher.html(lower + " " + T("to") + " " + upper);
      } else if (lower && !upper) {
        this.flasher.html(lower + " " + T("to present") + " ");
      } else if (!lower && upper) {
        this.flasher.html($template( T("before #year#").replace('%{year}', '{{year}}'), {year: parseInt(upper, 10) + 1}) + " ");
      } else if (!lower && !upper) {
        this.flasher.html( T("Any") );
      }
    },
    count: function() {
      var count = 0;
      var lower = this.left.slot
      var upper = this.right.slot
      if (lower == -1) {
        count = num(this.rest, 'count')
        if (upper == -1) {
          return count
        }
        lower = 0
      }
      for (var i = lower; i <= upper; i++) {
        var slot = $(this.slots.get(i))
        count += num(slot, 'count')
      }
      return this.delimit(count)
    },
    delimit: function(num) {
      var s = "" + num
      var buff = ""
      var idx = 0
      for (var i = s.length; i > 0; i--) {
        if ( idx > 0 && idx % 3 == 0) {
          buff = "," + buff
        }
        buff = s.charAt(i - 1) + buff
        idx++
      }
      return buff
    }

  })
  $('.slider').attach(RangeSelector)
})
//=end app/cells/facet/range.js
//=begin app/cells/facet/select.js
$(function() {
  $('.FacetSelect').change(function() {
    jump(this.value)
  })
})
//=end app/cells/facet/select.js
//=begin app/cells/facet/values.js
$(function() {
  $('.FacetValues').bind('morefacets', function(e) {
    var group = this
    var arrow = $(this).find('.arrow').text('â–¶')
    var body = $(this).find('.renderer').each(function() {
      $(this).slideUp('fast', 'easeInOutExpo').queue(function() {
        $selectMoreFacets($(group), e.facetName, $(group).attr('label'), function() {
          $(arrow).text('â–¼')
          $(body).slideDown('fast', 'easeInOutExpo')
        })
        $(this).dequeue()
      })
    })
  })  
})
//=end app/cells/facet/values.js
//=begin app/cells//dialog.js
/*
$(function() {
  var self = '#feedback'
  $(self).each(function() {
    var showing = false
    var valid = true
    var url = $(this).find('.url').html()
    var type = $(this).find('select')
    var height = $(this).height()
    var pageurl = $(this).find('input[type=hidden]')
    var useremail = $(this).find('input[type=text]')
    var text = self + ' textarea'
    var selectLabel = $(this).find('form .selectLabel')
    var select = $(this).find('form select').get(0)
    var error = $(this).find('.error')
    var form = $(this).find('.form')
    var throbber = $(this).find('.throbber')
    var success = $(this).find('.success')
    var failure = $(this).find('.failure')
    var twiddleElement = $('<span class="twiddle"></span>')

    $('.send', this).click(send)
    $(text).keyup(validate)

    function twiddle(state) {
      if (state == 'show') {
        $(self).find('.twiddle').replaceWith($(select))
      } else {
        $(self).find('select').replaceWith(twiddleElement)
      }
    }

    function throb(toggle) {
      if (typeof toggle == 'undefined') {
        toggle = true
      }
      $(throbber).toggleClass('hidden', !toggle)
    }

    function show(trigger) {
      success.toggleClass('hidden', true)
      failure.toggleClass('hidden', true)
      $(self).css({'height': null, overflow: 'visible'})
      $(self).find('input[type=radio]').each(function() {
        this.checked =
        false
      })
      showing = true
      twiddle('show')
      $(self).find('form').each(function() {
        this.reset()
      })
      //document.forms.feedback.reset()
      validate()
      var options = {
        title: T('Feedback'),
        flyIn: function(el) {
          var travel = $(el).height() * 5
          $.ie6hack(function() { $(el).css({width:550}) })
          $.ie7hack(function() { $(el).css({width:550}) })
          $(el).place(trigger, function(elem, trig) {
            elem.NorthEast.placeAt(trig.NorthEast, {vertical: -travel})
              .animate({top: "+=" + travel}, {duration: 300, easing: 'easeOutExpo', queue: false})
              .animate({opacity: 'show'}, {duration: 5000, easing: 'easeOutExpo', queue: false})
          })
        },
        flyOut: function(el) {
          el.animate({top: "-=1000"}, {duration: 400, easing: 'easeInExpo'})
            .queue(function() {
              throb(false)
              $(throbber).removeClass('invisible')
              $(form).css('opacity', 1)
              $(this).dequeue()
            })
        }
      }
      $summon.dialog.feedback(options)
    }

    function send() {
      if (!valid) return false;
      twiddle('hide')
      $(form).fadeTo(0, 0).queue(function() {
        throb()
        $(self).animate({height: 70}, 500, $.easing.easeOutExpo).queue(function() {
          submit()
          $(self).css({height: 70, overflow: 'hidden'})
          $(this).dequeue()
        })
        $(this).dequeue()
      })
      return false
    }

    function submit() {
      $.ajax({
        url: url,
        type: "POST",
        timeout: 60000,
        data: {
          type: $(type).val(),
          pageurl: $(pageurl).val(),
          useremail: $(useremail).val(),
          text: $(text).val(),
          recommendation: recommendation(),
          browser: $.userAgentInfo
        },
        success: function() {
          $(self).queue(function() {
            $(success).toggleClass('hidden', false)
            $(failure).toggleClass('hidden', true)
            $(this).dequeue()
          })
        },
        error: function() {
          $(self).queue(function() {
            $(success).toggleClass('hidden', true)
            $(failure).toggleClass('hidden', false)
            $(this).dequeue()
          })
        },
        complete: function() {
          throb(false)
        }
      })
    }

    function validate() {
      var txt = $(text).val()
      if (!txt) {
        valid = true
        return
      }
      if (valid = txt.length <= 1000) {
        hideError()
      } else {
        showError()
      }
      return valid
    }

    function showError() {
      if ($(error).is('.invisible')) {
        $(error).removeClass('invisible').fadeIn('slow')
      }
    }

    function hideError() {
      if (!$(error).is('.invisible')) {
        $(error).fadeOut('slow').queue(function() {
          $(error).addClass('invisible').css('display', 'block')
          $(this).dequeue()
        })
      }
    }

    function recommendation() {
      var recommendation = "N/A"
      $(self).find('input[type=radio]').each(function() {
        if (this.checked) {
          recommendation = this.value
        }
      })
      return recommendation
    }

    $feedback = show
  })
})*/
//=end app/cells/feedback/dialog.js
//=begin app/cells/more_facets/dialog.js
$(function() {

  var $commaEscape = function(s) {
    if (s) {
      return s.replace(/,/g,'&comma;')
    }
  }

  var $scrollHeight = function() {
      return $(document.documentElement).attr('scrollHeight')
  }

  var MoreFacetsDialog = $.klass({
    initialize: function() {
      var self = this
      var element = this.element
      this.throbber = $('#moreFacetsDialogThrobber')
      this.content = element.find('.content')
      this.html = $(document.documentElement)
      this.headerText = element.find('.headerText')
      this.facetQuery = element.attr('facetQuery')
      this.baseQuery = element.attr('baseQuery')
      this.tableHeader = element.find('table.head')
      this.valueHeader = element.find('.head .values .text')
      this.builder = element.find('.query .builder')

      $(document).keyup(function(e) {
        if (e.which == 27 && self.showing) self.hide()
      })

      element.find('.theme-close, .buttons .cancel').click(function() {
        self.hide()
        return false;
      })

      var includeAll = this.includeAll = this.tableHeader.find('.includeAll')
      var excludeAll = this.excludeAll = this.tableHeader.find('.excludeAll')
      includeAll.click(function() {
        var checked = this.checked
        self.content.find('.include input[type=checkbox]').each(function() {
          if (checked) {
            this.checked = true
          } else {
            this.checked = false
          }
        })
        if (checked) {
          excludeAll.get(0).checked = false
          self.content.find('.exclude input').each(function() {
            this.checked = false
          })
        }
      })

      excludeAll.click(function() {
        var checked = this.checked
        self.content.find('.exclude input[type=checkbox]').each(function() {
          if (checked) {
            this.checked = true
          } else {
            this.checked = false
          }
        })
        if (checked) {
          includeAll.get(0).checked = false
          self.content.find('.include input').each(function() {
            this.checked = false
          })
        }
      })
      element.find('.continue').click(function() {
        var selected = [],
            deselected = []

        self.content.find('input[type=checkbox].toggle').each(function() {
            var wasChecked = $(this).attr('waschecked')
            if (this.checked && !wasChecked) {
                selected.push(this)
            } else if (!this.checked && wasChecked) {
                deselected.push(this)
            }
        })

        self.applyFacets(selected, deselected)
        return false
      })

      this.content.click(function(e) {
        var target = $(e.target)
        if (target.hasClass('toggle')) {
          var facet = {
            name: $(e.target).attr('name'),
            value: $(e.target).attr('value')
          }
          if (e.target.checked) {
            var opposite = $(target).parent().siblings().find('input').get(0)
            opposite.checked = false
            if (target.hasClass('inclusion')) {
              self.strategy.include(facet)
              self.strategy.unexclude(facet)
            } else if (target.hasClass('exclusion')) {
              self.strategy.exclude(facet)
              self.strategy.uninclude(facet)
            }
          } else {
            if (target.hasClass('inclusion')) {
              self.strategy.uninclude(facet)
            } else {
              self.strategy.unexclude(facet)
            }
          }
        }
      })

  function setSort(alphanumeric) {
	if (alphanumeric) {
		self.sort('alpha')
	} else {
		self.sort('result-count')
	}
  }

  element.find('.sort-toggle').click(function() {setSort(this.checked)})
      
      element.find(".sorts a").click(function() { element.find('.sorts').toggle() })
      element.find(".sort-by-alpha a").click(function() { self.sort("alpha"); return false; })
      element.find(".sort-by-result-count a").click(function() { self.sort("result-count"); return false; })          
    },
    showMask: function(callback) {
      var self = this
      $.overlay(function() {
        self.throb()
        callback.call()
      })
    },
    throb: function() {
      this.throbber.place(window, function(throbber, win) {
        throbber.Center.placeAt(win.Center).show()
      })
    },
    unthrob: function() {
      this.throbber.hide()
    },
    hide: function() {
      var callback = this.callback
      this.builder.empty().parent().removeClass('active')
      if (this.showing) {
        this.flyOut(callback)
      } else {
        $.overlay().hide()
        callback.call()
      }
      delete this.cluster
      delete this.facet
      delete this.callback
      delete this.showing
      delete this.included
    },

    flyIn: function() {
      this.showing = true
      
      var anim = { top: "-=100", left: ($.bidi && $.bidi.rtl) ? "+=100" : "-=100" }
      
      $(this.element).place(this.cluster, function(element, cluster) {
        element.NorthWest.placeAt(cluster.East, {horizontal: 125, vertical: -55})
          .show().css({opacity: 0.00})
          .animate(anim, {duration: 500, easing: 'easeOutExpo', queue: false})
          .animate({opacity: 1.00}, 'slow', 'linear').queue(function() {
            // scroll window
            var dialog = $(this),
                win = $(window),
                windowHeight = win.height(),
                windowScroll = win.scrollTop(),
                dialogTop = dialog.offset().top + windowScroll,
                dialogHeight = dialog.outerHeight()
            dialog.css({opacity:'none'}) // arrow won't show in IE, even with no opacity
            var overhang = Math.ceil(dialogTop + dialogHeight - windowHeight - windowScroll)
            if (overhang > 0) $.scrollBy(overhang)
            var underhang = Math.ceil(dialogTop - windowScroll)
            if (underhang < 0) $.scrollBy(underhang)
                
            $(this).dequeue()
          })
      })
    },
    flyOut: function(callback) {
      var anim = { top: "+=50", left: ($.bidi && $.bidi.rtl) ? "-=50" : "+=50" }
      this.element.animate(anim, {duration: 600, easing: 'easeOutExpo', queue: false}).
          animate({opacity: 'hide'}, 300, 'easeOutExpo').queue(function() {
            $.overlay().hide(callback)
            $(this).dequeue()
          })
    },
    load: function(sort) {
      var facetName = this.facet.replace(/\s+/, '')
      var self = this
      var sep = this.facetQuery.match(/\?/) ? '&' : '?'
      var url = this.facetQuery + sep + "id=" + facetName + "&facet_sort=" + sort
      $('#moreFacetsDialog .sort-by-result-count').hide();
      $('#moreFacetsDialog .sort-by-alpha').show();
      $.ajax({
        url: url,
        success: function(data) {
          self.content.html(data)
          self.strategy.onload(self.content)
          self.unthrob()
          self.flyIn()
        },
        error: function(xhr, textStatus, errorThrown) {
          log.error('AJAX Fetching Facets: ' + textStatus + (errorThrown ? " exception: " + errorThrown : ""))
          self.unthrob()
          alert("More options are currently unavailable")
          self.hide()
        }
      })
    },

    show: function(cluster, facet, displayName, callback) {
      var self = this
      var title = displayName
      this.headerText.html(title)
      this.valueHeader.html(title)
      this.includeAll.attr('checked', false)
      this.excludeAll.attr('checked', false)
      this.content.empty()
      this.cluster = cluster
      this.facet = facet
      this.callback = callback
      this.querySep = this.baseQuery.match(/\?/) ? '&' : '?'

      log.debug('facet: ' + facet + ", displayName: " + displayName)
      this.strategy = facet == "SubjectTerms" ? new this.ComplexFaceting(self) : new this.SimpleFaceting(self)
      this.showMask(function() {
        self.load()
      })
      this.included = $.map($.grep($search.included(facet), function(f) {return $query.isFacetValueFilterApplied(facet, f.value)}), function(f) { return f.value })
    },
    applyFacets: function(selected, deselected) {
      var query = this.strategy.assembleQuery(selected, deselected)
      var href = query.length > 0 ? this.baseQuery + this.querySep + query : this.baseQuery
      this.element.animate({opacity: 'hide'}, 400, 'easeInExpo').queue(function() {
        $updating()
        goto(href)
      })
    },
    sort: function(sort_by) {
      var table = $(this.content.find('table.content')[0]);
      var rows = table.find('tr').get();
      rows.sort(function(a, b) {
        var keyA = null;
        var keyB = null;
        if (sort_by == "alpha") {
          keyA = $(a).attr('value').toLowerCase();
          keyB = $(b).attr('value').toLowerCase();
        } else {
          keyA = -parseInt($(a).attr('count'));
          keyB = -parseInt($(b).attr('count'));
        }
        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
        return 0;
      });
      $.each(rows, function(index, row) {
        table.children('tbody').append(row);
      });
    },
    SimpleFaceting: function(dialog) {
      dialog.element.removeClass('MoreFacetsDialogComplex')
      $.extend(this, {
        include: $noop, uninclude: $noop, exclude: $noop, unexclude: $noop, onload: $noop, 
        assembleQuery: function(selected, deselected) {
          var values = [], commands = []

          $.each(selected, function() {
            if ($(this).is('.inclusion')) {
              values.push($(this).attr('escapedValue'))
            } else {
              values.push($(this).attr('escapedValue') + ":t")
            }
          })
          
          if (values.length > 0) {
            commands.push("addFacetValueFilters(" + dialog.facet + "," + values.join(",") + ")")
          }
          $.each(deselected, function() {
            commands.push($(this).attr('rm'))
          })
          
          return commands.length > 0 ? "s.cmd=" + commands.join(" ") : ""
        }
      })
    },

    ComplexFaceting: function(dialog) {
      dialog.element.addClass('MoreFacetsDialogComplex')
      $.extend(this, {
        dialog: dialog,
        inclusions: [],
        exclusions: $search.excluded(dialog.facet),
        include: function(facet) {
          log.debug('include: {name: ' + facet.name + ', value: ' + facet.value + '}')
          this.inclusions.push(facet)
          this.renderTitle()
        },
        uninclude: function(facet) {
          log.debug('uninclude: {name: ' + facet.name + ', value: ' + facet.value + '}')
          this.inclusions = $.grep(this.inclusions, function(f) {
            return f.value != facet.value
          })
          this.renderTitle()
        },
        exclude: function(facet) {
          log.debug('exclude: {name: ' + facet.name + ', value: ' + facet.value + '}')
          this.exclusions.push(facet)
          this.renderTitle()
        },
        unexclude: function(facet) {
          log.debug('unexclude: {name: ' + facet.name + ', value: ' + facet.value + '}')
          this.exclusions = $.grep(this.exclusions, function(f) {return f.value != facet.value})
          this.renderTitle()
        },

        onload: function(content) {
          content.find('tr').each(function(i) {
            var value = $(this).attr('value')
            if ($.inArray(value, dialog.included) >= 0 || $query.isFacetValueFilterApplied(dialog.facet, value)) {
              this.parentNode.removeChild(this)
            }
          })
        },
        assembleQuery: function(selected) {
          var group = [], exclude = [], commands = []

          $.each(selected, function() {
            if ($(this).is('.inclusion')) {
              group.push(this)
            } else {
              exclude.push(this)
            }
          })
          if (group.length > 0) {
            var values = $.map(group, function(checkbox) {return $(checkbox).attr('escapedValue')}).join(',')
            commands.push("addFacetValueGroupFilter(" + dialog.facet + ",or," + values + ')')
          }
          if (exclude.length > 0) {
            var values = $.map(exclude, function(checkbox) {return $(checkbox).attr('escapedValue') + ":t"}).join(',')
            commands.push("addFacetValueFilters(" + dialog.facet + "," + values + ")")
          }
          return commands.length > 0 ? "s.cmd=" + commands.join(' ') : ""
        },
        renderTitle: function() {
          var exclusions = $.map(this.exclusions, function(f) { return f.value })

          var groups = $query.facetValueGroupFilterValuesFor(dialog.facet)
          if (this.inclusions.length > 0) groups.push($.map(this.inclusions, function(f) {return f.value}))
          // I18n TODO
          var components = [];
          components = components.concat($query.facetValueFilterValuesFor(dialog.facet));
          components = components.concat($.map(groups, function(group) {
            return "(" + group.join(' <span class="operator or">OR</span> ') + ")"
          }));
          // I18n TODO
          var title = components.join(' <span class="operator and">AND</span> ') 
                      + $.map(exclusions, function(f) {return " <span class='operator not'>NOT</span> " + f}).join("")
          if (title.length > 0) {
            dialog.builder.parent().addClass('active')
          } else {
            dialog.builder.parent().removeClass('active')
          }
          dialog.builder.html(title)
        }
      })
      this.renderTitle()
    }
  })
  var dialog = $('#moreFacetsDialog')
  dialog.attach(MoreFacetsDialog)

  //noinspection JSUndeclaredVariable
  $selectMoreFacets = function(element, clusterName, displayName, callback) {
    //console.debug(arguments)
    dialog.firstAttached(MoreFacetsDialog).show(element, clusterName, displayName, callback)
  }
})
//=end app/cells/more_facets/dialog.js
//=begin app/cells/filter/toolbar.js

$(function() {
  $('#toolbar .static input').click(function() {
    jump(this.value)
  }).each(function (i, box) {
    if ($(box).attr('applied')) {
      box.checked = true
    } else {
      box.checked = false
    }
  })

  var MoreFacetsTrigger = $.klass({
    initialize: function() {
      this.cluster = this.element.parents('.cluster').eq(0)
      this.displayName = this.cluster.find('.displayName').html()
      this.body = this.cluster.find('.body')
      this.facet = this.cluster.attr('facet')
      this.arrow = this.cluster.find('.arrow')
    },
    onclick: function() {
      var trigger = this
      trigger.closeArrow()
      trigger.body.slideUp('fast', 'easeInOutExpo').queue(function() {
        $selectMoreFacets(trigger.cluster, trigger.facet, trigger.displayName, function() {
          trigger.openArrow()
          trigger.body.slideDown('fast', 'easeInOutExpo')
        })
        $(this).dequeue()
      })
    },

    openArrow: function() {
      this.arrow.html('â–¼')
    },
    closeArrow: function() {
      this.arrow.html('â–¶')
    }
  })
  $('#toolbar input[href]').click(function() {
    jump($(this).attr("href"))
  })
})
//=end app/cells/filter/toolbar.js
//=begin app/cells/search/box.js
$(function() {

  var SearchBox = function() {
    var self = this
    var search = $('#search')
    self.searchButtonDisabled = false
    self.queryMaxLimit = 1000
    self.queryDisplayRemainingLimitAt = 800

    self.simple = $(search).find('.simple')
    $(self.simple).find('.toggle').click(function(e) {
      e.preventDefault()
      self.showAdvanced()
    })
    self.simpleForm = $(self.simple).find('form')
    $(self.simpleForm).submit($.proxy(self.onSimpleSearch, self))

    self.advanced = $(search).find('.advanced')
    $(self.advanced).find('.toggle').click(function(e) {
      e.preventDefault()
      self.showSimple()
    })
    self.advancedForm = $(self.advanced).find('form')
    $(self.advancedForm).submit($.proxy(self.onAdvancedSearch, self))

    self.query = $(self.simple).find('.query')
    $(self.query).suregrow({
      maxlines: 5,
      easing: 'easeOutExpo'
    })

    var useTextCounter = true
    $.iehack(function(version) {
      /*
          apparently, IE won't let you hit "enter" on a form to submit it if the submit button
          for that form was hidden on page load.. It just beeps at you. How crazy is that?
          -db
       */
      $(self.advancedForm).keypress(function(e) {
        if (e.which == 13) {
          e.preventDefault()
          $(self.advancedForm).trigger('submit')
        }
      })
      // no textcounter for IE7 and below for performance reasons -db
      if (version < 8) {
        self.textCounter = $noop
        useTextCounter = false
      }
    })

    $(self.query).keypress(function(e) {
      if (e.which == 13) {
        e.preventDefault()
        $(self.simpleForm).submit()
      }
      else if (useTextCounter) {
        $.proxy(self.textCounter, self)() // ugh -db
      }
    })
  }
  SearchBox.prototype = {
    getQueryLength: function() {
     if (typeof($(this.query).val()) != "undefined"){
		return $(this.query).val().length;
	 }
	 else return 0;
    },
    textCounter: function() {
      var queryLength = this.getQueryLength()
      var countRemaining = this.queryMaxLimit - queryLength
      var counter = $('#status-field-char-counter')

      if (countRemaining <= (this.queryMaxLimit - this.queryDisplayRemainingLimitAt)) {
        if (countRemaining >= 0) {
          $(counter).html($template(T('You have %{n} of 1000 characters remaining').replace('%{n}', '{{n}}'), { n: countRemaining }))
        } else {
          $(counter).html(T('Your query must be less than 1000 characters.'))
        }
        this.searchBarHighlighting($(counter), countRemaining)
      } else {
        this.enableSearchButton()
        if (queryLength < this.queryDisplayRemainingLimitAt) {
          $(counter).html('')
        }
      }
    },
    searchBarHighlighting: function(field, counter) {
      if (counter < 0) {
        field.css({'color' : 'red'})  // this should be changed to adding a class -db
        this.disableSearchButton()
      } else {
        field.css({'color' : ''})
        this.enableSearchButton()     // and we should remove that class here -db
      }
    },
    disableSearchButton: function() {
      if (this.searchButtonDisabled) {
        // nothing
      } else {
        $(".bgh-search-button")
          .attr("disabled", "true")
          .addClass('bgh-search-button-disabled')
        this.searchButtonDisabled = true
      }
    },
    enableSearchButton: function() {
      if (this.searchButtonDisabled) {
        $(".bgh-search-button")
          .removeAttr("disabled")
          .removeClass('bgh-search-button-disabled')
        this.searchButtonDisabled = false
      }
    },
    disableEmptyFields: function() {
      var emptySelectors = [
        ':input[value=""]', // empty fields
        ':checkbox[checked=false]', // unchecked checkboxes
        '.range[value$=\\*\\:\\*]' // empty date range
      ]
      this.advancedForm.find(emptySelectors.join(',')).attr('disabled', true)
    },
    enableEmptyFields: function() {
      this.advancedForm.find(':disabled').attr('disabled', false)
    },
    onAdvancedSearch: function() {
      if ($(this.advancedForm).find('.date-entry').hasClass('invalid')) {
        return false
      }
      this.disableEmptyFields()
      $.cookies.set('fromAdvanced', location.href)
    },
    onSimpleSearch: function() {
      $.cookies.del('fromAdvanced')
      if (this.getQueryLength() > this.queryMaxLimit) {
        var query = $(this.query).val()
        $(this.query).val(query.substring(0, this.queryMaxLimit))
        $("#status-field-char-counter").hide()
        $.cookies.set('queryTruncated', 'yes')
      }
    },
    newSearch: function() {
      $('.SearchRefinement').attr('disabled', true)
      $('.keepsearch').attr("checked", false)
      $('.newsearch').attr("checked", 'checked')
      $.cookies.set('refinement', 'no')
      $.cookies.del('queryTruncated')
    },
    keepRefinement: function() {
      $('.SearchRefinement').removeAttr('disabled')
      $('.keepsearch').attr("checked", 'checked')
      $('.newsearch').attr("checked", false)
      $.cookies.set('refinement', 'yes')
    },
    showAdvanced: function(immediately) {
      var advanced = this.advanced
      this.enableEmptyFields()
      if (immediately) {
        this.simple.hide()
        advanced.show().removeClass('hidden')
        document.forms.advanced['s.q'].focus()
      } else {
        this.simple.fadeOut('fast').queue(function() {
          advanced.removeClass('hidden').hide().fadeIn('slow')
          $(this).dequeue()
          document.forms.advanced['s.q'].focus()
        })
      }
    },
    showSimple: function() {
      this.onSimpleSearch()
      var simple = this.simple
      this.advanced.fadeOut('fast').queue(function() {
        simple.fadeIn('slow')
        $('#slogan-text').fadeIn('slow')
        $(this).dequeue()
        document.forms.search['s.q'].focus()
      })
    },
    focus: function() {
      this.query.focus()
      if ($.cookies.get('queryTruncated') == 'yes') {
        $.cookies.del('queryTruncated')
        $("#status-field-char-counter").html( T('Your query has been truncated.') ).css({color: 'red'})  // red should be a class -db
      } else {
        this.textCounter()
      }
    }
  }

  $discovery.search = new SearchBox()
  log.info('Search Box Initialized')
  $discovery.search.focus()
})

//=end app/cells/search/box.js
//=begin app/cells/search/suggest.js
/******************************************************************************
 * All source and examples in this project are subject to the
 * following copyright, unless specifically stated otherwise
 * in the file itself:
 *
 * Copyright (c) 2007-2009, Metaweb Technologies, Inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *     * Redistributions of source code must retain the above copyright
 *       notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 *       copyright notice, this list of conditions and the following
 *       disclaimer in the documentation and/or other materials provided
 *       with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY METAWEB TECHNOLOGIES ``AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL METAWEB TECHNOLOGIES BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR
 * BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE
 * OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN
 * IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *****************************************************************************/

/*
 unwrapped source using online javascript beautifier: http://jsbeautifier.org/
 renamed some variables to make more sense
 -db
*/
;
(function ($, q) {
  if (!("console" in window)) {
    var n = window.console = {};
    n.log = n.warn = n.error = n.debug = function () {}
  }

  function replaceAll(s, sub, repl) {
    while (s.indexOf(sub) != -1) {
      s = s.replace(sub, repl)
    }
    return s
  }

	var blacklistedTitles = {}
	function blacklist(titleOrArray) {
		function add(s) {
			blacklistedTitles[s.toLowerCase()] = true
		}
		
		if ($.isArray(titleOrArray))
			$.each(titleOrArray, function(i, s) {	add(s) })
		else
			add(title_or_array)
	}
	
	function blacklisted(title) {
		var s = title.toLowerCase()
		return (s in blacklistedTitles)
	}
	
  $.suggest = function (a, b) {
    $.fn[a] = function (e) {
      //this.length || console.warn("Suggest: invoked on empty element set");
      return this.each(function () {
        if (this.nodeName)
          if (this.nodeName.toUpperCase() === "INPUT"){}
            //this.type && this.type.toUpperCase() !== "TEXT" && console.warn("Suggest: unsupported INPUT type: " + this.type);
        else{}
          //console.warn("Suggest: unsupported DOM element: " + this.nodeName);
        var i = $.data(this, a);
        i && i._destroy();
        $.data(this, a, new $.suggest[a](this, e))._init()
      })
    };
    $.suggest[a] = function (e, i) {
      var self = this,
        options = this.options = $.extend(true, {}, $.suggest.defaults, $.suggest[a].defaults, i),
        f = options.css_prefix = options.css_prefix || "",
        j = options.css;
			blacklist(options.blacklist)
      this.name = a;
      $.each(j, function (h) {
        j[h] = f + j[h]
      });
      options.ac_param = {};
      $.each(["type", "type_strict", "mql_filter", "as_of_time", "exclude_guids", "category", "all_types"], function (h, k) {
        h = options[k];
        if (!(h === null || h === "")) {
          if (typeof h === "object") h = JSON.stringify(h);
          options.ac_param[k] = h
        }
      });
      if (options.ac_param.type) {
				this.options._type = $.map(options.ac_param.type.split(/[, ]/), function (h) {
        	return h.replace(/[\"\[\]]/g, "")
      	});
			}
      this._status = {
        START: "",
        LOADING: "",
        SELECT: "",
        ERROR: ""
      };
      if (options.status && options.status instanceof Array && options.status.length >= 3) {
        this._status.START = options.status[0] || "";
        this._status.LOADING = options.status[1] || "";
        this._status.SELECT = options.status[2] || "";
        if (options.status.length === 4) this._status.ERROR = options.status[3] || ""
      }
      i = this.status = $('<div style="display:none;">').addClass(j.status);
      var l = this.list = $("<ul>").addClass(j.list);
      f = this.pane = $('<div style="display:none;" class="fbs-reset">').addClass(j.pane);
      f.append(i).append(l);
      if (options.parent) {
				$(options.parent).append(f);
			} else {
        f.css("position", "absolute");
        options.zIndex && f.css("z-index", options.zIndex);
        $(document.body).append(f)
      }
      f.bind("mousedown", function (h) {
        self.input.data("dont_hide", true);
        h.stopPropagation()
      }).bind("mouseup", function (h) {
        self.input.data("dont_hide") && self.input.focus();
        self.input.removeData("dont_hide");
        h.stopPropagation()
      }).bind("click", function (h) {
        h.stopPropagation();
        if (h = self.get_selected()) {
          self.onselect(h, true);
          self.hide_all()
        }
      });
      l.hover(function (h) {
        self.hoverover_list(h)
      }, function (h) {
        self.hoverout_list(h)
      });
      this.input = $(e).attr("autocomplete", "off").unbind(".suggest").bind("keydown.suggest", function (h) {
        self.keydown(h)
      }).bind("keypress.suggest", function (h) {
        self.keypress(h)
      }).bind("keyup.suggest", function (h) {
        self.keyup(h)
      }).bind("blur.suggest", function (h) {
        self.blur(h)
      }).bind("textchange.suggest", function () {
        self.textchange()
      }).bind("focus.suggest", function (h) {
        self.focus(h)
      }).bind($.browser.msie ? "paste.suggest" : "input.suggest", function () {
        clearTimeout(self.paste_timeout);
        self.paste_timeout = setTimeout(function () {
          self.textchange()
        }, 0)
      });
      this.input.placeholder();
      this.onresize = function () {
        self.invalidate_position();
        if (f.is(":visible")) {
          self.position();
          if (options.flyout && self.flyoutpane && self.flyoutpane.is(":visible")) {
            var h = self.get_selected();
            h && self.flyout_position(h)
          }
        }
      };
      $(window).bind("resize.suggest", this.onresize).bind("scroll.suggest", this.onresize)
    };
    $.suggest[a].prototype = $.extend({}, $.suggest.prototype, b)
  };
  $.suggest.prototype = {
    _init: function () {},
    _destroy: function () {
      this.pane.remove();
      this.list.remove();
      this.input.unbind(".suggest");
      $(window).unbind("resize.suggest", this.onresize).unbind("scroll.suggest", this.onresize);
      this.input.removeData("data.suggest")
    },
    invalidate_position: function () {
      self._position = null
    },
    status_start: function () {
      this.hide_all();
      this.status.siblings().hide();
      if (this._status.START) {
        this.status.text(this._status.START).show();
        if (!this.pane.is(":visible")) {
          this.position();
          this.pane_show()
        }
      }
      this._status.LOADING && this.status.removeClass("loading")
    },
    status_loading: function () {
      this.status.siblings().show();
      if (this._status.LOADING) {
        this.status.addClass("loading").text(this._status.LOADING).show();
        if (!this.pane.is(":visible")) {
          this.position();
          this.pane_show()
        }
      } else this.status.hide()
    },
    status_select: function () {
      this.status.siblings().show();
      this._status.SELECT ? this.status.text(this._status.SELECT).show() : this.status.hide();
      this._status.LOADING && this.status.removeClass("loading")
    },
    status_error: function () {
      this.status.siblings().show();
      this._status.ERROR ? this.status.text(this._status.ERROR).show() : this.status.hide();
      this._status.LOADING && this.status.removeClass("loading")
    },
    focus: function (a) {
      var b =
      this.input.val();
      b === "" || b === this.input.attr("placeholder") ? this.status_start() : this.focus_hook(a)
    },
    focus_hook: function () {
      if (!this.input.data("data.suggest") && !this.pane.is(":visible") && $("." + this.options.css.item, this.list).length) {
        this.position();
        this.pane_show()
      }
    },
    keydown: function (a) {
      var b = a.keyCode;
      if (b === 9) this.tab(a);
      else if (b === 38 || b === 40) a.shiftKey || a.preventDefault()
    },
    keypress: function (a) {
      var b = a.keyCode;
      if (b === 38 || b === 40) a.shiftKey || a.preventDefault();
      else b === 13 && this.enter(a)
    },
    keyup: function (a) {
      var b =
      a.keyCode;
      if (b === 38) {
        a.preventDefault();
        this.up(a)
      } else if (b === 40) {
        a.preventDefault();
        this.down(a)
      } else if (a.ctrlKey && b === 77) $(".fbs-more-link", this.pane).click();
      else if (b === 13) {
        this.hide_all()
        this.escape(a) 
      } else if ($.suggest.is_char(a)) {
        clearTimeout(this.keypress.timeout);
        var e = this;
        this.keypress.timeout = setTimeout(function () {
          e.textchange()
        }, 0)
      } else b === 27 && this.escape(a);
      return true
    },
    blur: function (a) {
      if (!this.input.data("dont_hide")) {
        this.input.data("data.suggest") || this.check_required(a);
//        this.hide_all()	// -db
				setTimeout($.proxy(this.hide_all, this), 200) // +db
      }
    },
    tab: function (a) {
      if (!(a.shiftKey || a.metaKey || a.ctrlKey)) {
        a = this.options;
        a = this.pane.is(":visible") && $("." + a.css.item, this.list).length;
        var b = this.get_selected();
        if (a && b) {
          this.onselect(b);
          this.hide_all()
        }
      }
    },
    enter: function (a) {
      var b = this.options;
      if (this.pane.is(":visible")) if (a.shiftKey) {
        this.shift_enter(a);
        a.preventDefault()
      } else if ($("." + b.css.item, this.list).length) {
        var e = this.get_selected();
        if (e) {
          this.onselect(e);
          this.hide_all();
          a.preventDefault()
        }
      }
    },
    shift_enter: function () {},
    escape: function () {
      this.hide_all()
    },
    up: function (a) {
      this.updown(true, a.ctrlKey || a.shiftKey)
    },
    down: function (a) {
      this.updown(false, null, a.ctrlKey || a.shiftKey)
    },
    updown: function (a, b, e) {
      var i = this.options.css,
        d = this.list;
      if (this.pane.is(":visible")) {
        var g = $("." + i.item + ":visible", d);
        if (g.length) {
          d = $(g[0]);
          g = $(g[g.length - 1]);
          var f = this.get_selected() || [];
          clearTimeout(this.ignore_mouseover.timeout);
          this._ignore_mouseover = false;
          if (a) if (b) this._goto(d);
          else if (f.length) if (f[0] == d[0]) {
            d.removeClass(i.selected);
            this.input.val(this.input.data("original.suggest"));
            this.hoverout_list()
          } else this._goto(f.prevAll("." + i.item + ":visible:first"));
          else this._goto(g);
          else if (e) this._goto(g);
          else if (f.length) if (f[0] == g[0]) {
            g.removeClass(i.selected);
            this.input.val(this.input.data("original.suggest"));
            this.hoverout_list()
          } else this._goto(f.nextAll("." + i.item + ":visible:first"));
          else this._goto(d)
        }
      } else a || this.textchange()
    },
    _goto: function (a) {
      a.trigger("mouseover.suggest");
      var b = a.data("data.suggest");
      this.input.val(b ? b.name : this.input.data("original.suggest"));
      this.scroll_to(a)
    },
    scroll_to: function (a) {
      var b = this.list,
        e = b.scrollTop(),
        i = e + b.innerHeight(),
        d = a.outerHeight();
      a = a.prevAll().length * d;
      d = a + d;
      if (a < e) {
        this.ignore_mouseover();
        b.scrollTop(a)
      } else if (d > i) {
        this.ignore_mouseover();
        b.scrollTop(e + d - i)
      }
    },
    textchange: function () {
      this.input.removeData("data.suggest");
      this.input.trigger("fb-textchange", this);
      var a = this.input.val();
      if (a === "") this.status_start();
      else {
        this.status_loading();
        this.request(a)
      }
    },
    request: function () {},
    response: function (a) {
      "cost" in a && this.trackEvent(this.name, "response", "cost", a.cost);
      if (this.check_response(a)) {
        var b = [];
        if ($.isArray(a)) b = a;
        else if ("result" in a) b = a.result;
        var e = $.map(arguments, function (f) {
          return f
        });
        this.response_hook.apply(this, e);
        var i = null,
          d = this,
          g = this.options;
        $.each(b, function (f, j) {
          j = d.create_item(j, a).bind("mouseover.suggest", function (l) {
            d.mouseover_item(l)
          }).data("data.suggest", j);
          d.list.append(j);
          if (f === 0) i = j
        });
        this.input.data("original.suggest", this.input.val());
        // $("." + g.css.item, this.list).length === 0 && g.nomatch && this.list.append($('<li class="fbs-nomatch">').html(g.nomatch).bind("click.suggest", function (f) {
        //   f.stopPropagation()
        // }));
				$("." + g.css.item, this.list).length === 0 && this.hide_all()	// hide list when no suggestions instead of showing tips -db

        e.push(i);
        this.show_hook.apply(this, e);
        this.position();
        this.pane_show()
      }
    },
    pane_show: function () {
      var a = false;
      if ($("> li", this.list).length) a = true;
      a || this.pane.children(":not(." + this.options.css.list + ")").each(function () {
        a = $(this).is(":visible");
        return !a
      });
      if (a) if (this.options.animate) {
        var b = this;
        this.pane.slideDown("fast", function () {
          b.input.trigger("fb-pane-show", b)
        })
      } else {
        this.pane.show();
        this.input.trigger("fb-pane-show", this)
      } else {
        this.pane.hide();
        this.input.trigger("fb-pane-hide", this)
      }
    },
    create_item: function (a) {
      var b = this.options.css;
      li = $("<li>").addClass(b.item);
      var e = $("<label>").html(a.name);
      a.name = e.html();
      li.append($("<div>").addClass(b.item_name).append(e));
      return li
    },
    mouseover_item: function (a) {
      if (!this._ignore_mouseover) {
        a = a.target;
        if (a.nodeName.toLowerCase() !== "li") a = $(a).parents("li:first");
        var b = $(a),
          e = this.options.css;
        $("." + e.item, this.list).each(function () {
          this !== b[0] && $(this).removeClass(e.selected)
        });
        if (!b.hasClass(e.selected)) {
          b.addClass(e.selected);
          this.mouseover_item_hook(b)
        }
      }
    },
    mouseover_item_hook: function () {},
    hoverover_list: function () {},
    hoverout_list: function () {},
    check_response: function () {
      return true
    },
    response_hook: function () {
      this.list.empty()
    },
    show_hook: function () {
      this.status_select()
    },
    position: function () {
      var a =
      this.pane,
        b = this.options;
      if (!b.parent) {
        if (!self._position) {
          var e = this.input,
            i = e.offset(),
            d = e.outerWidth(true),
            g = e.outerHeight(true);
          i.top += g;
          var f = a.outerWidth(),
            j = a.outerHeight(),
            l = i.top + j / 2,
            h = $(window).scrollLeft();
          e = $(window).scrollTop();
          var k = $(window).width(),
            m = $(window).height() + e,
            o = true;
          if ("left" == b.align) o = true;
          else if ("right" == b.align) o = false;
          else if (i.left > h + k / 2) o = false;
          if (!o) {
            o = i.left - (f - d);
            if (o > h) i.left = o
          }
          if (l > m) {
            b = i.top - g - j;
            if (b > e) i.top = b
          }
          this._position = i
        }
        a.css({
          top: this._position.top,
          left: this._position.left
        })
      }
    },
    ignore_mouseover: function () {
      this._ignore_mouseover = true;
      var a = this;
      this.ignore_mouseover.timeout = setTimeout(function () {
        a.ignore_mouseover_reset()
      }, 1E3)
    },
    ignore_mouseover_reset: function () {
      this._ignore_mouseover = false
    },
    get_selected: function () {
      var a = null,
        b = this.options.css.selected;
      $("li", this.list).each(function () {
        var e = $(this);
        if (e.hasClass(b) && e.is(":visible")) {
          a = e;
          return false
        }
      });
      return a
    },
    onselect: function (a) {
      var b = a.data("data.suggest");
      if (b) {
        this.input.val(b.name).data("data.suggest", b).trigger("fb-select", b);
        this.trackEvent(this.name, "fb-select", "index", a.prevAll().length)
      }
    },
    trackEvent: function (a, b, e, i) {
      this.input.trigger("fb-track-event", {
        category: a,
        action: b,
        label: e,
        value: i
      })
    },
    check_required: function (a) {
      var b = this.options.required;
      if (b === true) {
        b = this.input.val();
        if (!(b === "" || b === this.input.attr("placeholder"))) {
          this.input.trigger("fb-required", {
            domEvent: a
          });
          return false
        }
      } else if (b === "always") {
        this.input.trigger("fb-required", {
          domEvent: a
        });
        return false
      }
      return true
    },
    hide_all: function () {
      this.pane.hide();
      this.input.trigger("fb-pane-hide", this)
    }
  };
  $.extend($.suggest, {
    defaults: {
      status: [T('Start typing to get suggestions...'), T('Searching...'), T('Select an item from the list:'), T('Sorry, something went wrong. Please try again later')],
      required: false,
      soft: false,
      nomatch: "no matches",
      css: {
        pane: "fbs-pane",
        list: "fbs-list",
        item: "fbs-item",
        item_name: "fbs-item-name",
        selected: "fbs-selected",
        status: "fbs-status"
      },
      css_prefix: null,
      parent: null,
      animate: false,
      zIndex: null,
			blacklist: []
    },
    $$: function (a, b) {
      return $("." + a, b)
    },
    use_jsonp: function (a) {
      if (!a) return false;
      var b = window.location.href;
      b = b.substr(0, b.length - window.location.pathname.length);
      if (b === a) return false;
      return true
    },
    strongify: function (a, b) {
      var e = a,
        i = a.toLowerCase().indexOf(b.toLowerCase());
      if (i >= 0) {
        b = b.length;
        e = $("<div>").text(a.substring(0, i)).append($("<strong>").text(a.substring(i, i + b))).append(document.createTextNode(a.substring(i + b))).html()
      }
      return e
    },
    keyCode: {
      CAPS_LOCK: 20,
      CONTROL: 17,
      DOWN: 40,
      END: 35,
      ENTER: 13,
      ESCAPE: 27,
      HOME: 36,
      INSERT: 45,
      LEFT: 37,
      NUMPAD_ENTER: 108,
      PAGE_DOWN: 34,
      PAGE_UP: 33,
      RIGHT: 39,
      SHIFT: 16,
      SPACE: 32,
      TAB: 9,
      UP: 38,
      OPTION: 18,
      APPLE: 224
    },
    is_char: function (a) {
      if (a.type === "keypress") if ((a.metaKey || a.ctrlKey) && a.charCode === 118) return true;
      else {
        if ("isChar" in a) return a.isChar
      } else {
        var b = $.suggest.keyCode.not_char;
        if (!b) {
          b = {};
          $.each($.suggest.keyCode, function (e, i) {
            b["" + i] = 1
          });
          $.suggest.keyCode.not_char = b
        }
        return !("" + a.keyCode in b)
      }
    }
  });
  var p = {
    _destroy: $.suggest.prototype._destroy,
    show_hook: $.suggest.prototype.show_hook
  };
  $.suggest("suggest", {
    _init: function () {
      var self = this, options = this.options;
      if (!options.flyout_service_url) options.flyout_service_url = options.service_url;
      this.jsonp = $.suggest.use_jsonp(options.service_url);
      if (!$.suggest.cache) $.suggest.cache = {};
      if (options.flyout) {
        this.flyoutpane = $('<div style="display:none;" class="fbs-reset">').addClass(options.css.flyoutpane);
        if (options.flyout_parent) $(options.flyout_parent).append(this.flyoutpane);
        else {
          this.flyoutpane.css("position", "absolute");
          options.zIndex && this.flyoutpane.css("z-index", options.zIndex);
          $(document.body).append(this.flyoutpane)
        }
        this.flyoutpane.hover(function (e) {
          self.hoverover_list(e)
        }, function (e) {
          self.hoverout_list(e)
        }).bind("mousedown.suggest", function (e) {
          e.stopPropagation();
//          self.pane.click()
        });
        if (!$.suggest.flyout) $.suggest.flyout = {};
        if (!$.suggest.flyout.cache) $.suggest.flyout.cache = {}
      }
    },
    _destroy: function () {
      p._destroy.call(this);
      this.flyoutpane && this.flyoutpane.remove();
      this.input.removeData("request.count.suggest");
      this.input.removeData("flyout.request.count.suggest")
    },
    shift_enter: function (a) {
      if (this.options.suggest_new) {
        this.suggest_new();
        this.hide_all()
      } else this.check_required(a)
    },
    hide_all: function () {
      this.pane.hide();
      this.flyoutpane && this.flyoutpane.hide();
      this.input.trigger("fb-pane-hide", this);
      this.input.trigger("fb-flyoutpane-hide", this)
    },
    request: function (a, start_pos) {
      var e = this,
        i = this.options;
      if (this.ac_xhr) {
        this.ac_xhr.abort();
        this.ac_xhr = null
      }
      a = {
        prefix: a
      };
      if (start_pos) a.start = start_pos;
      $.extend(a, i.ac_param);
      var d = i.service_url + i.service_path + "?" + $.param(a),
        g = $.suggest.cache[d];
      if (g) this.response(g, start_pos ? start_pos : -1, true);
      else {
        clearTimeout(this.request.timeout);
        var f = {
          url: i.service_url + i.service_path,
          data: a,
          beforeSend: function () {
            var j = e.input.data("request.count.suggest") || 0;
            j || e.trackEvent(e.name, "start_session");
            j += 1;
            e.trackEvent(e.name, "request", "count", j);
            e.input.data("request.count.suggest", j)
          },
          success: function (j) {
            // lets filter! -db
            if (j == null) {
              return true
            }
            e.terms = start_pos ? e.terms || {} : {}
            var idx, res, res_name, new_result = []
            for (idx = 0; idx < j.result.length; idx++) {
              res = j.result[idx]
              res.name = replaceAll(res.name, '&amp;', '&')
              if (res.name.toUpperCase() in e.terms) {
                // skip
							} else if (blacklisted(res.name)) {
								// skip
              } else {
                new_result.push(res)
                e.terms[res.name.toUpperCase()] = true
              }
            }
            j.result = new_result;
            // end of filter
            $.suggest.cache[d] = j;
            e.response(j, start_pos ? start_pos : -1)
          },
          error: function (j) {
            e.status_error();
            e.trackEvent(e.name, "request", "error", {
              url: this.url,
              response: j ? j.responseText : ""
            });
            e.input.trigger("fb-error", Array.prototype.slice.call(arguments))
          },
          complete: function (j) {
            j && e.trackEvent(e.name, "request", "tid", j.getResponseHeader("X-Metaweb-TID"))
          },
          dataType: e.jsonp ? "jsonp" : "json",
          cache: true
        };
        this.request.timeout = setTimeout(function () {
          e.ac_xhr = $.ajax(f)
        }, i.xhr_delay)
      }
    },
    create_item: function (a, b) {
      var e = this.options.css,
        i = $("<li>").addClass(e.item);
      b = $("<div>").addClass(e.item_name).append($("<label>").append($.suggest.strongify(a.name || a.guid, b.prefix)));
      a.name = b.text();
      i.append(b);
      var d = a["n:type"] || a["notable:type"];
      if (d) if (typeof d === "object") b.prepend($("<div>").addClass(e.item_type).text(d.name));
      else {
        var g, f, j = false;
        $.each(a.type, function (l, h) {
          if (h.id === d) g = h.name;
          if (h.id === "/common/topic") j = "Topic";
          else if (!f) f = h.name
        });
        if (g || f || j) b.prepend($("<div>").addClass(e.item_type).text(g || f || j))
      }
      return i
    },
    mouseover_item_hook: function (a) {
      a = a.data("data.suggest");
      this.options.flyout && a && this.flyout_request(a)
    },
    check_response: function (a) {
      return a.prefix === this.input.val()
    },
    response_hook: function (a, b) {
      this.flyoutpane && this.flyoutpane.hide();
      b > 0 ? $(".fbs-more", this.pane).remove() : this.list.empty()
    },
    show_hook: function (a, b, e) {
      p.show_hook.apply(this, [a]);
      var i = this.options,
        d = this,
        g = this.pane,
        f = this.list,
        j = a.result,
        l = $(".fbs-more", g),
        h = $(".fbs-suggestnew", g);
      if (j && j.length && "start" in a) {
        if (!l.length) {
          j = $('<a class="fbs-more-link" href="#" title="' + T('(Ctrl+m)') + '" ' + T('view more') + '</a>');
          l = $('<div class="fbs-more">').append(j);
          j.bind("click.suggest", function (k) {
            k.preventDefault();
            k.stopPropagation();
            k = $(this).parent(".fbs-more");
            d.more(k.data("start.suggest"))
          });
          f.after(l)
        }
        l.data("start.suggest", a.start);
        l.show()
      } else l.remove();
      if (i.suggest_new) {
        if (!h.length) {
          a = $('<button class="fbs-suggestnew-button">');
          a.text(i.suggest_new);
          h = $('<div class="fbs-suggestnew">').append('<div class="fbs-suggestnew-description">' + T('Your item not in the list?') + '</div>').append(a).append('<span class="fbs-suggestnew-shortcut">' + T('(Shift+Enter)') + '</span>').bind("click.suggest", function (k) {
            k.stopPropagation();
            d.suggest_new(k)
          });
          g.append(h)
        }
        h.show()
      } else h.remove();
      if (e && e.length && b > 0) {
        b = e.prevAll().length * e.outerHeight();
        f.scrollTop();
        f.animate({
          scrollTop: b
        }, "slow", function () {
          e.trigger("mouseover.suggest")
        })
      }
    },
    suggest_new: function () {
      var a =
      this.input.val();
      if (!(a === "" || a === this.input.attr("placeholder"))) {
        this.input.data("data.suggest", a).trigger("fb-select-new", a);
        this.trackEvent(this.name, "fb-select-new", "index", "new");
        this.hide_all()
      }
    },
    more: function (a) {
      if (a) {
        var b = this.input.data("original.suggest");
        b !== null && this.input.val(b);
        this.request(this.input.val(), a);
        this.trackEvent(this.name, "more", "start", a)
      }
      return false
    },
    flyout_request: function (a) {
      var b = this;
      if (this.flyout_xhr) {
        this.flyout_xhr.abort();
        this.flyout_xhr = null
      }
      var e = this.options,
        i = this.flyoutpane.data("data.suggest");
      if (i && a.id === i.id) {
        if (!this.flyoutpane.is(":visible")) {
          this.flyout_position(this.get_selected());
          this.flyoutpane.show();
          this.input.trigger("fb-flyoutpane-show", this)
        }
      } else if (i = $.suggest.flyout.cache[a.id]) this.flyout_response(i);
      else {
        var d = {
          id: a.id
        };
        if (e.as_of_time) d.as_of_time = e.as_of_time;
        var g = {
          url: e.flyout_service_url + e.flyout_service_path,
          data: d,
          beforeSend: function () {
            var f = b.input.data("flyout.request.count.suggest") || 0;
            f += 1;
            b.trackEvent(b.name, "flyout.request", "count", f);
            b.input.data("flyout.request.count.suggest", f)
          },
          success: function (f) {
            f = b.jsonp ? f : {
              id: d.id,
              html: f
            };
            $.suggest.flyout.cache[f.id] = f;
            b.flyout_response(f)
          },
          error: function (f) {
            b.trackEvent(b.name, "flyout", "error", {
              url: this.url,
              response: f ? f.responseText : ""
            })
          },
          complete: function (f) {
            f && b.trackEvent(b.name, "flyout", "tid", f.getResponseHeader("X-Metaweb-TID"))
          },
          dataType: b.jsonp ? "jsonp" : "html",
          cache: true
        };
        clearTimeout(this.flyout_request.timeout);
        this.flyout_request.timeout = setTimeout(function () {
          b.flyout_xhr =
          $.ajax(g)
        }, e.xhr_delay)
      }
    },
    flyout_response: function (a) {
      var b = this.pane,
        e = this.get_selected() || [];
      if (b.is(":visible") && e.length) if ((b = e.data("data.suggest")) && a.id === b.id) if (a.html.length) {
        this.flyoutpane.html(a.html);
        this.flyout_position(e);
        this.flyoutpane.show().data("data.suggest", b);
        this.input.trigger("fb-flyoutpane-show", this)
      }
    },
    flyout_position: function (a) {
      if (!this.options.flyout_parent) {
        var b = this.pane,
          e = this.flyoutpane,
          i = this.options.css,
          d = q,
          g = {
            top: parseInt(e.css("top"), 10),
            left: parseInt(e.css("left"), 10)
          },
          f =
          b.offset(),
          j = b.outerWidth(),
          l = e.outerHeight(),
          h = e.outerWidth();
        if (this.options.flyout === "bottom") {
          d = f;
          j = this.input.offset();
          if (f.top < j.top) d.top -= l;
          else d.top += b.outerHeight();
          e.addClass(i.flyoutpane + "-bottom")
        } else {
          d = a.offset();
          a = a.outerHeight();
          d.left += j;
          var k = d.left + h;
          b = $(document.body).scrollLeft();
          var m = $(window).width() + b;
          d.top = d.top + a - l;
          if (d.top < f.top) d.top = f.top;
          if (k > m) {
            f = d.left - (j + h);
            if (f > b) d.left = f
          }
          e.removeClass(i.flyoutpane + "-bottom")
        }
        d.top === g.top && d.left === g.left || e.css({
          top: d.top,
          left: d.left
        })
      }
    },
    hoverout_list: function () {
      this.flyoutpane && !this.get_selected() && this.flyoutpane.hide()
    }
  });
  $.extend($.suggest.suggest, {
    defaults: {
      type: null,
      type_strict: "any",
      mql_filter: null,
      as_of_time: null,
      service_url: "http://ryerson.summon.serialssolutions.com",
      service_path: "/metadata/suggest/suggest",
      align: null,
      flyout: true,
      flyout_service_url: "http://ryerson.summon.serialssolutions.com",
      flyout_service_path: "/metadata/suggest/flyout",
      flyout_parent: null,
      suggest_new: null,
      nomatch: '<em class="fbs-nomatch-text">' + T('No suggested matches.') + '</em><h3>' + T('Tips on getting better suggestions:') + '</h3><ul class="fbs-search-tips"><li>' + T('Enter more or fewer characters') + '</li><li>' + T('Add words related to your original search') + '</li><li>' + T('Try alternate spellings') + '</li><li>' + T('Check your spelling') + '</li></ul>',
      css: {
        item_type: "fbs-item-type",
        flyoutpane: "fbs-flyout-pane"
      },
      xhr_delay: 200,
      all_types: false
    }
  });
  var r = document.createElement("input");
  $.fn.placeholder = function () {
    return this.each(function () {
      var a = $(this);
      if (a.attr("placeholder") && !("placeholder" in r)) {
        a.unbind(".placeholder").bind("focus.placeholder", function () {
          var b = $(this);
          b.val() === b.attr("placeholder") ? b.val("") : b.select();
          b.removeClass("fbs-placeholder")
        }).bind("blur.placeholder", function () {
          var b = $(this);
          b.val() === "" && b.val(b.attr("placeholder")).addClass("fbs-placeholder")
        });
        a.val() === "" && a.val(a.attr("placeholder")).addClass("fbs-placeholder")
      }
    })
  }
})(jQuery);

// I guess this is the json lib -db
"JSON" in window && window.JSON || (JSON = {});
(function () {
  function c(d) {
    return d < 10 ? "0" + d : d
  }

  function q(d) {
    r.lastIndex = 0;
    return r.test(d) ? '"' + d.replace(r, function (g) {
      var f = e[g];
      return typeof f === "string" ? f : "\\u" + ("0000" + g.charCodeAt(0).toString(16)).slice(-4)
    }) + '"' : '"' + d + '"'
  }

  function n(d, g) {
    var f, j, l = a,
      h, k = g[d];
    if (k && typeof k === "object" && typeof k.toJSON === "function") k = k.toJSON(d);
    if (typeof i === "function") k = i.call(g, d, k);
    switch (typeof k) {
    case "string":
      return q(k);
    case "number":
      return isFinite(k) ? String(k) : "null";
    case "boolean":
    case "null":
      return String(k);
    case "object":
      if (!k) return "null";
      a += b;
      h = [];
      if (Object.prototype.toString.apply(k) === "[object Array]") {
        j = k.length;
        for (d = 0; d < j; d += 1) h[d] = n(d, k) || "null";
        g = h.length === 0 ? "[]" : a ? "[\n" + a + h.join(",\n" + a) + "\n" + l + "]" : "[" + h.join(",") + "]";
        a = l;
        return g
      }
      if (i && typeof i === "object") {
        j = i.length;
        for (d = 0; d < j; d += 1) {
          f = i[d];
          if (typeof f === "string") if (g = n(f, k)) h.push(q(f) + (a ? ": " : ":") + g)
        }
      } else for (f in k) if (Object.hasOwnProperty.call(k, f)) if (g = n(f, k)) h.push(q(f) + (a ? ": " : ":") + g);
      g = h.length === 0 ? "{}" : a ? "{\n" + a + h.join(",\n" + a) + "\n" + l + "}" : "{" + h.join(",") + "}";
      a = l;
      return g
    }
  }

  if (typeof Date.prototype.toJSON !== "function") {
    Date.prototype.toJSON = function () {
      return this.getUTCFullYear() + "-" + c(this.getUTCMonth() + 1) + "-" + c(this.getUTCDate()) + "T" + c(this.getUTCHours()) + ":" + c(this.getUTCMinutes()) + ":" + c(this.getUTCSeconds()) + "Z"
    };
    String.prototype.toJSON = Number.prototype.toJSON = Boolean.prototype.toJSON = function () {
      return this.valueOf()
    }
  }
  var p = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
    r = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
    a, b, e = {
      "\u0008": "\\b",
      "\t": "\\t",
      "\n": "\\n",
      "\u000c": "\\f",
      "\r": "\\r",
      '"': '\\"',
      "\\": "\\\\"
    },
    i;
  if (typeof JSON.stringify !== "function") JSON.stringify = function (d, g, f) {
    var j;
    b = a = "";
    if (typeof f === "number") for (j = 0; j < f; j += 1) b += " ";
    else if (typeof f === "string") b = f;
    if ((i = g) && typeof g !== "function" && (typeof g !== "object" || typeof g.length !== "number")) throw new Error("JSON.stringify");
    return n("", {
      "": d
    })
  };
  if (typeof JSON.parse !== "function") JSON.parse = function (d, g) {
    function f(j, l) {
      var h, k, m = j[l];
      if (m && typeof m === "object") for (h in m) if (Object.hasOwnProperty.call(m, h)) {
        k = f(m, h);
        if (k !== undefined) m[h] = k;
        else delete m[h]
      }
      return g.call(j, l, m)
    }

    p.lastIndex = 0;
    if (p.test(d)) d = d.replace(p, function (j) {
      return "\\u" + ("0000" + j.charCodeAt(0).toString(16)).slice(-4)
    });
    if (/^[\],:{}\s]*$/.test(d.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, "@").replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, "]").replace(/(?:^|:|,)(?:\s*\[)+/g, ""))) {
      d = eval("(" + d + ")");
      return typeof g === "function" ? f({
        "": d
      }, "") : d
    }
    throw new SyntaxError("JSON.parse");
  }
})();


jQuery.suggest.version='Version:r94143M Built:Thu Apr 29 2010 by daepark';
//=end app/cells/search/suggest.js
//=begin app/cells/search/topbar.js
$(function() {
  $('.InfoPopup').bind('click', function(e) {
    e.preventDefault()
    
		var element = $(this),
        title = $(element).text().replace(/ /g, "").replace(/\&.*\;/g, ""),
        href = $(element).attr('href'),
		    pos = $(element).position(),
		    x = typeof window.screenX != 'undefined' ? window.screenX : window.screenLeft,
		    y = typeof window.screenY != 'undefined' ? window.screenY : window.screenTop,
		    top = y + pos.top + 100,
		    left = x + pos.left - 500

		window.open(href, title, 'resizable,scrollbars,width=600,height=300,personalbar=0,location=0,menubar=0,status=0,toolbar=0,directories=0,top=' + top + ',left=' + left + ',alwaysRaised')
  })
  
  /*
  $('.FeedbackLink').bind('click', function(e) {
    e.preventDefault()
    $feedback(this)
  })
  
  */
})
//=end app/cells/search/topbar.js
//=begin app/cells/home/home.js
$query = {
  originalParams: {}
}
//=end app/cells/home/home.js
//=begin app/cells/library_things/rating.js

function libraryThingsHandler(books) {
    for (var i in books)	{
		var book = books[i];
		$('#library_thing_rating').trigger({ type: 'ratingready', rating: book.rating, book: book}, $('#library_thing_rating'));
    }
}

$(function() {
    
  function displayRating(e) {
      if (!isNaN(e.rating)) {
  	    var adjusted_rating = Math.round((e.rating/2) * 2)/2;
  	    var half = adjusted_rating % 1;

  	    var full_star_template = "<div class='theme-full-star' style='float: left'></div>";
  	    var half_star_template = "<div class='theme-half-star' style='float: left'></div>";
  	    var empty_star_template = "<div class='theme-empty-star' style='float: left'></div>";

          var rating_markup = "";
          $(this).html('');

          for (var i = 0; i < parseInt(adjusted_rating); i++) {
             $(this).append(full_star_template);
          }

          if (half > 0) {
              $(this).append(half_star_template);
          }
          for (var i = 0; i < parseInt(5 - adjusted_rating); i++) {
              $(this).append(empty_star_template);
  		}
  	} else {
  		$(this).innerHTML = "No Rating";  
      }
  }
  
  $('.ltRating').live('ratingready', displayRating);  
  
  $('.ltRating').each(function() {
    if ($(this).attr('rating')) {
     $(this).trigger({type: 'ratingready', rating: $(this).attr('rating')});
    } 
  });
});
//=end app/cells/library_things/rating.js
//=begin app/cells/metadata/query.js
$(function() {
  var metadata = $.trim($('#query-metadata').text())
  var body = "return " + ($.isEmpty(metadata) ? "{}" : metadata)
  $query = new Function(body).call()
  $query.originalParams = $query.originalParams || {}
  
  $query.facetValueFilterValuesFor = function(fieldName) {
    var filters = $.grep(this.facetValueFilters, function(filter) {return filter.fieldName == fieldName && !filter.isNegated})
    return $.map(filters, function(filter) {return filter.value})
  }
  $query.negatedFacetValueFilterValuesFor = function(fieldName) {
    var filters = $.grep(this.facetValueFilters, function(filter) {return filter.fieldName == fieldName && filter.isNegated == true})
    return $.map(filters, function(filter) {return filter.value})
  }
  $query.facetValueGroupFilterValuesFor = function(fieldName) {
    var groups = $.grep(this.facetValueGroupFilters, function(group) {return group.fieldName == fieldName})
    var values = []
    $.each(groups, function(i, group) {
      values.push($.map(group.values, function(value) {return value.value}))
    })
    return values;
  }
  $query.isFacetValueFilterApplied = function(fieldName, value) {
    if ($.findOne(this.facetValueFilters, function(filter) {
      return filter.fieldName == fieldName && filter.value == value
    })) return true;
    
    if ($.findOne(this.facetValueGroupFilters, function(group) { 
      return $.findOne(group.values, function(filter) {
        return filter.value == value
      })
    })) return true;

    return false;
  }
})
//=end app/cells/metadata/query.js
//=begin app/cells/metadata/search.js
$(function() {
  var source = $.trim($('#search-metadata').text())
  var search = new Function("return " + source).call()

  $search = {
    data: search,
    included: function(cluster) {
      return this.facets(cluster, function(f) {
        return f.isIncluded
      })
    },
    excluded: function(cluster) {
      return this.facets(cluster, function(f) {
        return f.isExcluded
      })
    },
    facets: function(name, predicate) {
      if (typeof name == 'function') {
        predicate = name
        name = null
      }
      var facets = []
      for (var clusterName in search.clusters) {
        if (!name || name == clusterName) {
          var cluster = search.clusters[clusterName]
          for (var i = 0; i < cluster.facets.length; i++) {
            var facet = cluster.facets[i]
            if (predicate.call(this, facet)) {
              facets.push(facet)
            }
          }
        }
      }
      return facets
    }
  }
})
//=end app/cells/metadata/search.js
//=begin app/cells/worldcat/results.js
$(function() {
  $('#worldcat').each(function() {
    var worldcat = this
    var url = $template('/search/worldcat?q={{query}}', {query: encodeURIComponent($query.searchBox)})
    var see_all_link = $template($(worldcat).attr('url') + '{{query}}', {query: encodeURIComponent($query.searchBox)})
    $('.footer a').attr('href', see_all_link)
    $.get(url, function(data){
      if (data != "\n") {
        $('.heading').after(data)
        $(worldcat).fadeIn("slow", "easeOutExpo")
      }
    })
  })
})

//=end app/cells/worldcat/results.js
//=begin app/cells/splash/update.js
$(function() {
  var splash = '#splash-update'
  $updating = function() {
    $(splash).show().ie6hack(function() {
      $(this).css({
        position: 'absolute',
        marginTop: document.documentElement.scrollTop + 50,
        opacity: 0.9
      })
    })
  }

  $(window).bind('unload', function() {
    $(splash).hide()
  })
})
//=end app/cells/splash/update.js
//=begin app/cells/vpn/warning.js

$(function() {
  var url = $('#vpnwarning').attr('url')
  if (url && url.length > 0) {
    $('#vpnwarning').css('cursor', 'pointer');
    $('#vpnwarning').click(function() {
      document.location = $(this).attr('url')
    })
  }
	function Konami() {
		this.codes = [38,38,40,40,37,39,37,39,66,65,66,65]
		this.thunk = function(code) {
			var first = this.codes.shift()
			if (code != first) {
				reset()
			}
			if (this.codes.length == 0) {
				hide()
			}
		}
	}

	var sequence
	function reset() {
		sequence = new Konami()
	}

	function hide() {
		$('#vpnwarning').slideUp('slow', 'easeOutExpo')
		sequence = {thunk: $noop}
	}

	$(window).keydown(function(e) {
		sequence.thunk(e.keyCode)
	})

	window.setTimeout(function() {
		reset()
	}, 10 * 1000)

	reset()
})

//=end app/cells/vpn/warning.js
//=begin app/cells/page/main.js
$(function() {
  $(document).click(function(e) {
    var trigger = e.target
    if ($(trigger).is('a.print-icon')) {
      window.print()
    }
  }).mouseover(function(e) {
    var trigger = $(e.target)
    if ($(trigger).is('a.print-icon')) {
      $('.print-icon').removeClass('theme-grey-print-icon')
      trigger.addClass('theme-color-print-icon')
    }
  }).mouseout(function(e) {
    var trigger = $(e.target)
    if ($(trigger).is('a.print-icon')) {
      $('.print-icon').removeClass('theme-color-print-icon')
      trigger.addClass('theme-grey-print-icon')
    }
  })
  
  $(document).mouseover(function(e) {
    var trigger = $(e.target)
    if ($(trigger).is('a.rss-icon')) {
      $('.rss-icon').removeClass('theme-grey-rss')
      trigger.addClass('theme-blue-rss')
    }
  }).mouseout(function(e) {
    var trigger = $(e.target)
    if ($(trigger).is('a.rss-icon')) {
      $('.rss-icon').removeClass('theme-blue-rss')
      trigger.addClass('theme-grey-rss')
    }
  })
})
//=end app/cells/page/main.js
//=begin app/cells/page/navigation.js
$(function() {
  $('#selectPageSize').change(function() {
    jump(this.value)
  })
})
//=end app/cells/page/navigation.js
//=begin app/cells/page/sort.js
$(function() {
  var SortBox = $.klass({
    initialize: function() {
      this.current = this.element.attr('sort')
      this.element.attr('value', this.current)
    },
    onchange: function() {
      jump(this.element.attr('value'))
    }
  })
  $('#SortBox').attach(SortBox)
})
//=end app/cells/page/sort.js
