<?php
/**
 * The main template file.
 *
 * This is the most generic template file in a WordPress theme
 * and one of the two required files for a theme (the other being style.css).
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
			<h1 class="entry-title"><?php single_post_title(); ?></h1>
			
			<?php
			/* Run the loop to output the posts.
			 * If you want to overload this in a child theme then include a file
			 * called loop-index.php and that will be used instead.
			 */
			 get_template_part( 'loop', 'index' );
			?>
			</div><!-- #content -->
		</div><!-- #container -->

<?php 
get_sidebar('page');
get_sidebar();
get_footer(); ?>
