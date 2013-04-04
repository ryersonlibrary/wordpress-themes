<?php
/**
 * The Sidebar containing the blog widget area.
 *
 * @package WordPress
 * @subpackage RULA
 * @since RULA 0.1
 */

$options = twentyeleven_get_theme_options();
$current_layout = $options['theme_layout'];

if ( 'content' != $current_layout ) :
?>
		<div id="secondary" class="widget-area" role="complementary">
			<?php if ( ! dynamic_sidebar( 'sidebar-6' ) ) : ?>

				<aside id="categories" class="widget">
					<h3 class="widget-title"><?php _e( 'Categories', 'twentyeleven' ); ?></h3>
					<ul>
						<?php wp_list_categories('title_li='); ?>
					</ul>
				</aside>

				<aside id="meta" class="widget">
					<h3 class="widget-title"><?php _e( 'Meta', 'twentyeleven' ); ?></h3>
					<ul>
						<?php wp_register(); ?>
						<li><?php wp_loginout(); ?></li>
						<?php wp_meta(); ?>
					</ul>
				</aside>

			<?php endif; // end sidebar widget area ?>
		</div><!-- #secondary .widget-area -->
<?php endif; ?>