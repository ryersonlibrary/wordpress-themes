<?php
/**
 * The main template file.
 *
 * @package WordPress
 * @subpackage RULAm
 */

get_header(); ?>
    <div id="content" role="main">
        <?php while ( have_posts() ) : the_post(); ?>
    
            <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
                <div class="entry-content">
                    <?php remove_filter( 'the_content', 'wpautop' );
                  the_content(); ?>
                    <?php wp_link_pages( array( 'before' => '<div class="page-link"><span>' . 'Pages:' . '</span>', 'after' => '</div>' ) ); ?>
                </div><!-- .entry-content -->
                <footer class="entry-meta">
                    <?php edit_post_link( 'Edit', '<span class="edit-link">', '</span>' ); ?>
                </footer><!-- .entry-meta -->
            </article><!-- #post-<?php the_ID(); ?> -->
        <?php endwhile; // end of the loop. ?>
    </div><!-- #content -->
</div><!--#main-->
</div><!-- #page -->

<?php
wp_footer();
?>
<script>
	
	var cookieEnabled=(navigator.cookieEnabled)? true : false   
	if (typeof navigator.cookieEnabled=="undefined" && !cookieEnabled){ 
		document.cookie="testcookie";
		cookieEnabled=(document.cookie.indexOf("testcookie")!=-1)? true : false;
	}
	if(!cookieEnabled){
		showCookieFail();
	}
	
	function showCookieFail(){
		//alert("Please enable cookies!");
		document.getElementById("cwarn").style.display="block";
	}
	
	//Event Tracking
	var elements = document.querySelectorAll("a[data-ga-event]"),
		len = elements.length, i, element;
	for(i=0; i<len; i++) {
		element = elements[i];
		element.addEventListener("click", (function(e) {
			return function(evt) {
				var data = e.getAttribute("data-ga-event").split(",");
				data.unshift("_trackEvent");
				//console.log(data);
				_gaq.push(data);
			};
		}(element)), false);
	}
</script>
</body>
</html>
