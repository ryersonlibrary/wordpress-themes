<?php
/**
 * The template for displaying search forms in Twenty Eleven
 *
 * @package WordPress
 * @subpackage RULA
 * @since RULA 0.1
 */
?>
	<form method="get" id="searchform" action="<?php echo esc_url( home_url( '/' ) ); ?>">
		<label for="s" class="assistive-text"><?php _e( 'Search site', 'asc' ); ?></label>
		<input type="text" name="s" id="search" placeholder="<?php esc_attr_e( 'Search this site', 'asc' ); ?>" />
		<input type="image" name="submit" src="<?php bloginfo('template_url'); ?>/images/search.jpg" id="searchsubmit" value="" />
	</form>
