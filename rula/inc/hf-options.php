<?php
/**
 * Custom Theme Options
 *
 * This is a separate file as these were theme options in addition to the original Twenty Eleven theme for the RULA theme.
 *
 * @package WordPress
 * @subpackage RULA
 * @since RULA 0.7
 */

/* Create the options page */
// Initialize Theme options
add_action('after_setup_theme','hfoptions_init');
// add the admin options page
add_action('admin_menu', 'plugin_admin_add_page');
function plugin_admin_add_page() {
	add_theme_page('Header & Footer Options', 'Head/Foot Options', 'manage_options', 'custom-options', 'hfoptions_page');
}

//initialize default settings
function hfoptions_init() {
     // set options equal to defaults
	 $tmp_options = get_option('hfoptions');
	 if($tmp_options === false) {
		 $tmp_options = array(
			'subsitetitle' => '',
			'askuschkbox' => 'true',
			'parentpgchkbox' => 'true',
			'menusearchchkbox' => 'true',
			'footerlinks' => '',
			'smchkbox' => 'true'
		);
	 }
     update_option('hfoptions',$tmp_options);
}


/* Generate options page */
function hfoptions_page() {
	if ( ! isset( $_REQUEST['settings-updated'] ) ) $_REQUEST['settings-updated'] = false;
?>
  <div class="wrap">
    <?php screen_icon(); ?><h2>Header &amp; Footer Options</h2>
    <?php if ( false !== $_REQUEST['settings-updated'] ) : ?>
        <div class="updated">
        	<p><strong><?php _e( 'Options saved', 'RULA' ); ?></strong></p>
        </div>
    <?php endif; ?>
    <p>You can customize what to have in the header and footer.</p>
    <form method="post" action="options.php">
      <?php settings_fields('hfoptions'); ?>
      <?php do_settings_sections('custom-options'); ?>
      <br>
      <input name="Submit" type="submit" class="button-primary" value="<?php esc_attr_e('Save Changes'); ?>" />
    </form>
  </div>
<?php
}

// add the admin settings and such
add_action('admin_init', 'plugin_admin_init');
function plugin_admin_init(){
	register_setting( 'hfoptions', 'hfoptions', 'hfoptions_validate' );
	add_settings_section('analytics_sect', 'Analytics Settings', 'analytics_section_text', 'custom-options');
	add_settings_field('analytics_code', 'Insert Analytics Code', 'analytics_setting_string', 'custom-options', 'analytics_sect');

	add_settings_section('header_sect', 'Header Settings', 'header_section_text', 'custom-options');
	add_settings_field('headertitleoption', 'Add a subsite title', 'header_title_func', 'custom-options', 'header_sect');
	add_settings_field('askus_chkbox', 'Show Ask Us in Header?', 'askus_func', 'custom-options', 'header_sect');

	add_settings_section('menu_sect', 'Main Navigation Settings', 'main_section_text', 'custom-options');
	add_settings_field('parentpg_chkbox', 'Display Parent Pages Only <br>(when not using custom menu)', 'parentpg_func', 'custom-options', 'menu_sect');
	add_settings_field('searchsite_chkbox', 'Make Search to Search the Site <br>(instead of the library website)', 'searchsite_func', 'custom-options', 'menu_sect');

	add_settings_section('footer_sect', 'Footer Links Settings', 'footer_section_text', 'custom-options');
	add_settings_field('footerlinks_text', 'Add links after "Home": <br>Remember to add \' | \' after each link.', 'footerlinks_setting_string', 'custom-options', 'footer_sect');
	add_settings_field('sm_chkbox', 'Display Social Media buttons', 'sm_func', 'custom-options', 'footer_sect');
}

// add analytics section text
function analytics_section_text() {
	echo '<p>Options here are inserted into the end of the head element.</p>';
}

// display analytics option
function analytics_setting_string() {
	$options = get_option('hfoptions');
	echo "<textarea id='analytics_code' name='hfoptions[analytics]' rows='6' cols='70'>" . esc_textarea($options['analytics']) . "</textarea>";
}

// add header section text
function header_section_text() {
	echo '<p>Options here are to set the site title and show/hide the Ask Us.</p>';
}

// display Header subsite title option
function header_title_func() {
	$options = get_option('hfoptions');
	echo "<input id='headertitle_text' name='hfoptions[subsitetitle]' size='40' type='text' value='{$options['subsitetitle']}' />";
}

// checkbox - if checked, show Ask Us in Header
function askus_func() {
	$options = get_option('hfoptions');
	if($options['askuschkbox']) { $checked = ' checked="checked" '; }
	echo "<input ".$checked." id='askus_chkbox' name='hfoptions[askuschkbox]' type='checkbox' value='true' />";
}

// add header section text
function main_section_text() {
	echo '<p>Options to change the main navigation bar.</p>';
}

// checkbox - if checked, shows only Parent Pages when using wp_page_menu Fallback
function parentpg_func() {
	$options = get_option('hfoptions');
	if($options['parentpgchkbox']) { $checked = ' checked="checked" '; }
	echo "<input ".$checked." id='parentpg_chkbox' name='hfoptions[parentpgchkbox]' type='checkbox' value='true' />";
}

// checkbox - if checked, change the search bar to search the WP site instead of the library website
function searchsite_func() {
	$options = get_option('hfoptions');
	if($options['menusearchchkbox']) { $checked = ' checked="checked" '; }
	echo "<input ".$checked." id='menusearch_chkbox' name='hfoptions[menusearchchkbox]' type='checkbox' value='true' />";
}

// add footer section text
function footer_section_text() {
	echo '<p>Add links to be included between Home and Contact Us. Remember to add \' | \' after each link.</p>';
}

// display Footer Links option
function footerlinks_setting_string() {
	$options = get_option('hfoptions');
	echo "<textarea id='footerlinks_text' name='hfoptions[footerlinks]' rows='3' cols='70'>" . esc_textarea($options['footerlinks']) . "</textarea>";
}

// checkbox - if checked, shows Social Media buttons
function sm_func() {
	$options = get_option('hfoptions');
	if($options['smchkbox']) { $checked = ' checked="checked" '; }
	echo "<input ".$checked." id='sm_chkbox' name='hfoptions[smchkbox]' type='checkbox' value='true' />";
}

// validate our input options
function hfoptions_validate($input) {
	$input['subsitetitle'] =  wp_filter_nohtml_kses($input['subsitetitle']);	//strips all HTML
	$input['footerlinks'] = wp_kses_stripslashes(wp_filter_kses($input['footerlinks'])); //strips non-allowed HTML and \ from \" inserted by the filter or user
	return $input;
}

?>