<?php
/**
 * Custom header options
 * 
 * @package WordPress
 * @subpackage RULA-ASC
 * @since RULA-ASC 0.5
 */

add_action('after_setup_theme', 'extra_ops_init');

add_action('admin_menu', 'add_admin_page');

function add_admin_page() {
	add_theme_page('Extra Options', 'Extra Options', 'manage_options', 'extra-theme-options', 'extra_ops_generate');
}

function extra_ops_init() {
	$temp_ops = get_option('extraOps');
	
	if($temp_ops === false) {
		$temp_ops = array(
			'rulaURL' => 'library.ryerson.ca'
		);
	}
	
	update_option('extraOps', $temp_ops);
}

function extra_ops_generate() {
	if ( ! isset( $_REQUEST['settings-updated'] ) ) $_REQUEST['settings-updated'] = false;
?>
	<div class="wrap">
		<?php screen_icon(); ?><h2>Header Options</h2>
		<?php if ( false !== $_REQUEST['settings-updated'] ) : ?>
		<div class="updated">
			<p><strong><?php _e( 'Options saved', 'asc' ); ?></strong></p>
		</div>
		<?php endif; ?>
		<p>The following values can be changed in the header of the theme.</p>
		<form method="post" action="options.php">
			<?php settings_fields('extraOps'); ?>
			<?php do_settings_sections('extra-theme-options'); ?>
			<br />
			<input name="Submit" type="submit" class="button-primary" value="<?php esc_attr_e('Save Changes'); ?>" />
		</form>
	</div>
	<?php 
}

add_action('admin_init', 'plugin_admin_init');

function plugin_admin_init() {
	register_setting('extraOps', 'extraOps');
	
	// Header settings
	add_settings_section('header_sect', 'Header Settings', 'header_section_txt', 'extra-theme-options');
	add_settings_field('rulaurl_text', 'Set the main RULA URL', 'header_rula_func', 'extra-theme-options', 'header_sect');
}

function header_section_txt() {
	echo '<p>Options in this section affect the site header.';
}

function header_rula_func() {
	$ops = get_option('extraops');
	echo "<input id='rulaurl_text' name='extraOps[rulaURL]' size='40' type='text' value='" . $ops['rulaURL'] . "' />";
}

?>