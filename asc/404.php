<?php
/**
 * The template for displaying 404 pages (Not Found).
 *
 * @package WordPress
 * @subpackage RULA-ASC
 * @since RULA-ASC 0.5
 */

get_header(); ?>

	<div id="container">
		<div id="content" role="main">

			<article id="post-0" class="post error404 not-found">
				<header class="entry-header">
					<h1 class="entry-title"><?php _e( 'We\'ve Moved', 'twentyeleven' ); ?></h1>
				</header>
				
				<div class="entry-content">
					<p><?php _e( 'Apologies, but we recently moved and not all the links are the same. Please update your bookmarks.', 'twentyten' ); ?></p>
                    <p>The menu above or the search box below should help you find the page you were looking for.</p>
					<?php get_search_form(); ?>
				</div><!-- .entry-content -->
			</article><!-- #post-0 -->

		</div><!-- #content -->
	</div><!-- #container -->

<?php
get_sidebar('page');
get_footer(); ?>