<?php
/**
 * The template for displaying all pages.
 *
 * This is the template that displays all pages by default.
 * Please note that this is the wordpress construct of pages
 * and that other 'pages' on your wordpress site will use a
 * different template.
 *
 * @package WordPress
 * @subpackage RULA-ASC
 * @since RULA-ASC 0.5
 */

get_header();?>
		<div id="container">
			<div class="breadcrumbs">
				<a href="<?php site_url(); ?>"><span class="arch-title">Archives</span> &amp; <span class="sc-title">Special Collections</span></a> | 
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
