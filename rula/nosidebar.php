<?php
/**
 * Template Name: No Sidebar Template
 * Description: A Page Template with no sidebar, i.e. only one column
 *
 * @package WordPress
 * @subpackage RULA
 * @since RULA 0.5
 */

get_header(); ?>

		<div id="primary">
            <div class="breadcrumbs">
                <?php if(function_exists('bcn_display'))
                {
                    bcn_display();
                }?>
            </div>
			<div id="content" role="main">

				<?php while ( have_posts() ) : the_post(); ?>

					<?php get_template_part( 'content', 'page' ); ?>

					<?php //comments_template( '', true ); ?>

				<?php endwhile; // end of the loop. ?>

			</div><!-- #content -->
		</div><!-- #primary -->

<?php get_footer(); ?>