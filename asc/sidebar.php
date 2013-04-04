<?php
/**
 * The Sidebar containing the primary and secondary sidebars.
 *
 * @package WordPress
 * @subpackage RULA-ASC
 * @since RULA-ASC 0.5
 */
?>

<?php
	// A second sidebar for widgets, just because.
	if ( is_active_sidebar( 'secondary-sidebar' ) ) : ?>

		<div id="secondary" class="widget-area" role="complementary">
			<ul class="xoxo">
				<?php dynamic_sidebar( 'secondary-sidebar' ); ?>
			</ul>
			<div class="clear-both"></div>
		</div><!-- #secondary .widget-area -->
		
		<script>
			jQuery(document).ready(function() {
				var hM = jQuery("#main").height();
				var	hS = jQuery("#secondary").height();
				if (hS > hM) {
					jQuery("#main").height(hS);
				}
			});
		</script>
		
<?php endif; ?>
