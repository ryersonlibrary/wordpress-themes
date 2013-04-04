<?php
/**
 * The Sidebar containing the pages widget area.
 *
 * @package WordPress
 * @subpackage RULA
 * @since RULA 0.5
 */

$options = twentyeleven_get_theme_options();
$current_layout = $options['theme_layout'];

if ( 'content' != $current_layout ) :
?>
		<div id="secondary" class="widget-area" role="complementary">
			<?php if ( ! dynamic_sidebar( 'sidebar-1' ) ) : ?>

				<aside id="pages" class="widget">
					<h3 class="widget-title"><?php _e( 'Pages', 'twentyeleven' ); ?></h3>
					<ul>
						 <?php wp_list_pages(); ?> 
					</ul>
				</aside>


			<?php endif; // end sidebar widget area ?>
		</div><!-- #secondary .widget-area -->
<?php endif; ?>