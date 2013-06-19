<?php
/**
 * Template Name: Main Site Frontpage Template
 * Description: Custom front page template that has no title, no comments, no wpautop.
 *
 * @package WordPress
 * @subpackage RULA
 * @since RULA 0.1
 */

get_header('libfront'); ?>

		<div id="primary">
			<div id="content" role="main">

				<?php while ( have_posts() ) : the_post(); ?>

					<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
                      <div class="entry-content">
                        <?php remove_filter( 'the_content', 'wpautop' );
                          the_content(); ?>
                        <?php wp_link_pages( array( 'before' => '<div class="page-link"><span>' . __( 'Pages:', 'twentyeleven' ) . '</span>', 'after' => '</div>' ) ); ?>
                      </div><!-- .entry-content -->
                      <footer class="entry-meta">
                        <?php edit_post_link( __( 'Edit', 'twentyeleven' ), '<span class="edit-link">', '</span>' ); ?>
                      </footer><!-- .entry-meta -->
                    </article><!-- #post-<?php the_ID(); ?> -->

				<?php endwhile; // end of the loop. ?>

			</div><!-- #content -->
		</div><!-- #primary -->
		
<?php get_sidebar('front'); ?>
<?php get_footer(); ?>