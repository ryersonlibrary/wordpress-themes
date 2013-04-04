<?php
/**
 * The header area for the theme.
 *
 * Displays all of the <head> section and everything up till <div id="main">
 *
 * @package WordPress
 * @subpackage RULA-ASC
 * @since RULA-ASC 0.5
 */
?><!DOCTYPE html>
<!--[if IE 7]>
<html id="ie7" class="lt-ie9 lt-ie8" <?php language_attributes(); ?>>
<![endif]-->
<!--[if IE 8]>
<html id="ie8" class="lt-ie9" <?php language_attributes(); ?>>
<![endif]-->
<!--[if !(IE 6) | !(IE 7) | !(IE 8)  ]><!-->
<html <?php language_attributes(); ?>>
<!--<![endif]-->
<head>

<meta charset="<?php bloginfo( 'charset' ); ?>" />
<title><?php
	/*
	 * Print the <title> tag based on what is being viewed.
	 * We filter the output of wp_title() a bit -- see
	 * twentyten_filter_wp_title() in functions.php.
	 */
	wp_title( '|', true, 'right' );

	?></title>
	
<link rel="stylesheet" type="text/css" media="all" href="<?php bloginfo( 'stylesheet_url' ); ?>" />
<link rel="pingback" href="<?php bloginfo( 'pingback_url' ); ?>" />

<!--[if IE 7]>
<link rel="stylesheet" type="text/css" media="all" href="<?php bloginfo('template_directory'); ?>/style-ie7.css" />
<![endif]-->

<?php
	/* We add some JavaScript to pages with the comment form
	 * to support sites with threaded comments (when in use).
	 */
	if ( is_singular() && get_option( 'thread_comments' ) )
		wp_enqueue_script( 'comment-reply' );

	/* Always have wp_head() just before the closing </head>
	 * tag of your theme, or you will break many plugins, which
	 * generally use this hook to add elements to <head> such
	 * as styles, scripts, and meta tags.
	 */
	wp_head();
?>
</head>

<body <?php body_class(); ?>>
	<div id="page">
		<header id="header" role="banner">
			<div class="skip-link">
				<a class="assistive-text" href="#nav"
				  title="<?php esc_attr_e('Skip to main menu', 'asc'); ?>">
					<?php _e('Skip to main menu', 'asc'); ?>
				</a>
			</div>
			<div class="skip-link">
				<a class="assistive-text" href="#main"
				  title="<?php esc_attr_e('Skip to content', 'asc'); ?>">
					<?php _e('Skip to content', 'asc'); ?>
				</a>
			</div>
			
			<div id="branding">
				<a id="asc-logo" href="<?php echo home_url(); ?>">
					<img src="<?php bloginfo('template_url'); ?>/images/asc.jpg"
					  alt="Archives and Special Collections" />
				</a>
				<a id="rula-logo" href="<?php echo network_home_url(); ?>">
					<img src="<?php bloginfo('template_url'); ?>/images/rula.jpg"
					alt="Ryerson University Library &amp; Archives" />
				</a>
				
				<? // Use the Ryerson Library search rather than WP default ?>
				<form method="get" id="headersearch" action="http://search.ryerson.ca/search">
					<input type="hidden" name="site" value="Library" /> 
					<input type="hidden" name="output" value="xml_no_dtd" /> 
					<input type="hidden" name="client" value="default_frontend" />								
					<input type="hidden" name="proxystylesheet" value="default_frontend" />
					<label for="q" class="assistive-text"><?php _e( 'Search site', 'asc' ); ?></label>
					<input type="text" name="q" class="search" placeholder="<?php esc_attr_e( 'Search this site', 'asc' ); ?>" />
					<input type="image" name="submit" src="<?php bloginfo('template_url'); ?>/images/search.jpg" class="searchsubmit" value="" />
				</form>
			</div>
			<nav id="nav" role="navigation">
				<ul id="main-menu">
					<?php
						wp_nav_menu(
							array(
								'theme_location'	=> 'main',
								'container'			=> false,
								'items_wrap'		=> '%3$s',
								'fallback_cb'		=> 'wp_page_menu_parents'
							)
						);
					?>
					<li style="clear: both;"></li>
				</ul>
				<div style="clear:both"></div>
			</nav>
		</header>
		
		<div id="main">	
	