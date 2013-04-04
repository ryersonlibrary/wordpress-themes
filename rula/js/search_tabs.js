


		$('.s_tab_link[data-tab_content]').click(function(e){
		
			$('.s_tab_link.s_tab_selected').removeClass('s_tab_selected');
			$(this).addClass('s_tab_selected');
			
			var tabContain = $(this).attr('data-tab_content');
			
			$('#s_content .s_tab_open').removeClass('s_tab_open');
			$('#s_content #s_tab-'+tabContain).addClass('s_tab_open');
			
			return false;
		});
		
		$('.s_sub_tab_link[data-sub_tab_content]').click(function(e){
			
			var tabContext = $(this).parent().parent().parent() ;
			
			$('.s_sub_tab_link.s_sub_tab_selected').removeClass('s_sub_tab_selected');
			$(this).addClass('s_sub_tab_selected');
			
			var tabContain = $(this).attr('data-sub_tab_content');
			
			$('.s_sub_tab_open', tabContext).removeClass('s_sub_tab_open');
			$('#s_sub_tab-'+tabContain, tabContext).addClass('s_sub_tab_open');
			
			return false;
		});

		$('input[speech], input[x-webkit-speech]').bind('webkitspeechchange', function() {
			var e = jQuery.Event("keypress");
			e.keyCode = 32; // # Some key code value
			$(this).trigger('keydown.suggest');
		});

		$("#subjectSelect").change(function() {
			window.location = $("#subjectSelect option:selected").val();
		})
		
								   
		$('#s_tab-everything .query').val($(this).searchBox);

		// $('#s_tab-everything .query').suggest({
			// type:[
			  // '/time/event',
			  // '/event',
			  // '/base/newsevents/news_reported_event',
			  // '/base/argumentmaps/morally_disputed_activity',
			  // '/book/book_subject',
			  // '/education/field_of_study',
			  // '/location',
			  // '/education/academic',
			  // '/common/topic/subject_of',
			  // '/medicine',
			  // '/base/argumentmaps'
			// ],
			// animate: true,
			// type_strict:'should'
		// }).bind("fb-select", function(e, data) {
			// $(this).closest("form").submit()
		// })

		$('.fbs-flyout-pane').delegate("a", "click", function(e) {
			e.preventDefault()
			e.stopPropagation()
			window.open($(e.target).attr('href'), '_blank')
		})
		
