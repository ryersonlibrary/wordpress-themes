<?php
/**
 * The template for displaying 404 pages (Not Found).
 *
 * @package WordPress
 * @subpackage RULA
 * @since RULA 0.5
 */

get_header(); ?>

	<div id="primary">
		<div id="content" role="main">

			<article id="post-0" class="post error404 not-found">
				<header class="entry-header">
					<h1 class="entry-title"><?php _e( '404&#58; Page Not Found', 'twentyeleven' ); ?></h1>
				</header>

				<div class="entry-content">
					<p>We recently moved! Please use the search to find the page you were looking for and update your bookmarks. Apologies for any inconvenience.</p>

					<?php get_search_form(); ?>

				</div><!-- .entry-content -->
			</article><!-- #post-0 -->

		</div><!-- #content -->
	</div><!-- #primary -->

<?php get_footer(); ?>