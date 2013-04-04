<?php
/**
 * Template Name: Exhibition template.
 *
 * Description: A custom exhibit page with no sidebars.  Includes three widget areas to
 * display the content the contain.
 *
 * @package WordPress
 * @subpackage RULA-ASC
 * @since RULA-ASC 0.6
 */

get_header(); ?>

		<div id="container" class="exhibit">
			<div id="content" role="main">

			<?php if ( have_posts() ) while ( have_posts() ) : the_post(); ?>

				<div id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
					<h1 class="entry-title"><?php the_title(); ?></h1>
					<div class="entry-content">
						<?php the_content(); ?>
						<?php wp_link_pages( array( 'before' => '<div class="page-link">' . __( 'Pages:', 'twentyten' ), 'after' => '</div>' ) ); ?>
						<?php edit_post_link( __( 'Edit', 'twentyten' ), '<span class="edit-link">', '</span>' ); ?>
					</div><!-- .entry-content -->
				</div><!-- #post-## -->

				<?php //comments_template( '', true ); ?>

			<?php endwhile; ?>
			
			<?php 
			
			/* Do a bunch of work to determine if the current page has
			 * anthing to display in the three widget areas.  This does so
			 * by actually capturing the output rather than relying on the
			 * result of 'is_dynamic_sidebar' or 'is_active_sidebar' since
			 * they do not correctly report when using the Section Widget.
			 * The Section Widget will always return true/active regardless
			 * of whether or not the widget is displaying its contents on
			 * the current page.
			 */
		
			// Start output buffering.
			ob_start();
			
			// 'dynamic_sidebar' echos the contents of the widget
			dynamic_sidebar('first-exhibit-area');
			$a1 = ob_get_contents();
			
			// Clear and repeat for the remaining two areas.
			ob_clean();
			
			dynamic_sidebar('second-exhibit-area');
			$a2 = ob_get_contents();
			
			ob_clean();
			
			dynamic_sidebar('third-exhibit-area');
			$a3 = ob_get_contents();
			
			ob_end_clean();
			
			// Count the number of areas where the content is non-empty.
			$exhibit_areas = 0;
			if ($a1) {
				$exhibit_areas += 1;
			}

			if ($a2) {
				$exhibit_areas += 1;
			}

			if ($a3) {
				$exhibit_areas += 1;
			}
			?>
			
			<div id="exhibit-cols-<?php echo $exhibit_areas ?>" class="widget-area" style="clear:both;">
			
				<?php if ($a1): ?>
				<div id="exhibit-col-first">
					<ul class="xoxo">
						<?php echo $a1 ?>
					</ul>
				</div>
				<?php endif; ?>
				
				<?php if ($a2): ?>
				<div id="exhibit-col-second">
					<ul class="xoxo">
						<?php echo $a2 ?>
					</ul>
				</div>
				<?php endif; ?>
				
				<?php if ($a3): ?>
				<div id="exhibit-col-third">
					<ul class="xoxo">
						<?php echo $a3 ?>
					</ul>
				</div>
				<?php endif; ?>
				
			</div>
			

			</div><!-- #content -->
		</div><!-- #container -->

<?php get_footer(); ?>
