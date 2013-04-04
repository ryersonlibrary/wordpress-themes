<?php
/**
 * Template Name: Special Collection template
 *
 * A template identical to the default page but with a special class indicating
 * this is a page in the Special Collections section of the site, allowing for
 * specially coloured headers and breadcrumbs.
 *
 * @package WordPress
 * @subpackage RULA-ASC
 * @since RULA-ASC 0.7
 */

get_header();?>
		<div id="container" class="sc">
			<div class="breadcrumbs">
				<?php if(function_exists('bcn_display'))
                {
                    bcn_display();
                }?>
            </div>
			<div id="content" role="main">

			<?php if ( have_posts() ) while ( have_posts() ) : the_post(); ?>

				<div id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
					<?php if ( is_front_page() ) { ?>
						<h2 class="entry-title"><?php the_title(); ?></h2>
					<?php } else { ?>	
						<h1 class="entry-title"><?php the_title(); ?></h1>
					<?php } ?>				

					<div class="entry-content">
						<?php the_content(); ?>
						<?php wp_link_pages( array( 'before' => '<div class="page-link">' . __( 'Pages:', 'twentyten' ), 'after' => '</div>' ) ); ?>
						<?php edit_post_link( __( 'Edit', 'twentyten' ), '<span class="edit-link">', '</span>' ); ?>
					</div><!-- .entry-content -->
				</div><!-- #post-## -->

				<?php //comments_template( '', true ); ?>

				<?php endwhile; ?>

			</div><!-- #content -->
		</div><!-- #container -->
<?php 
get_sidebar('page');
get_footer(); ?>
