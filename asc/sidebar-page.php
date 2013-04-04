<?php
/**
 * The main sidebar area.
 *
 * @package WordPress
 * @subpackage RULA-ASC
 * @since RULA-ASC 0.5
 */
?>
		<div id="primary" class="widget-area" role="complementary">
			<ul id="submenu">

<?php
	// The call displays the content of any wiget in the sidebar.
	dynamic_sidebar( 'primary-sidebar' );
?>

			</ul>
		</div><!-- #primary .widget-area -->