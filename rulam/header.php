<?php
/**
 * The header for our theme.
 *
 * Displays all of the <head> section and everything up till <div id="main">
 *
 * @package WordPress
 * @subpackage mRULA
 * @since RULAm 0.1
 */

setcookie("mobile","m", time()+3600, "/","library.ryerson.ca");

?><!DOCTYPE html>
<!--[if IE 6]>
<html class="lt-ie9 lt-ie8 lt-ie7"  <?php language_attributes(); ?>>
<![endif]-->
<!--[if IE 7]>
<html class="lt-ie9 lt-ie8" <?php language_attributes(); ?>>
<![endif]-->
<!--[if IE 8]>
<html class="lt-ie9" <?php language_attributes(); ?>>
<![endif]-->
<!--[if !(IE 6) | !(IE 7) | !(IE 8)  ]><!-->
<html <?php language_attributes(); ?> class="fullsize">
<!--<![endif]-->
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>" />
<meta name="viewport" content="width=device-width" />
<title><?php
	/*
	 * Print the <title> tag based on what is being viewed.
	 */
	global $page, $paged;

	wp_title( '|', true, 'right' );

	// Add the blog name.
	bloginfo( 'name' );

	// Add the blog description for the home/front page.
	$site_description = get_bloginfo( 'description', 'display' );
	if ( $site_description && ( is_home() || is_front_page() ) )
		echo " | $site_description";

	// Add a page number if necessary:
	if ( $paged >= 2 || $page >= 2 )
		echo ' | ' . sprintf( __( 'Page %s', 'twentyeleven' ), max( $paged, $page ) );

	?></title>
<link rel="profile" href="http://gmpg.org/xfn/11" />
<link rel="shortcut icon" href="<?php bloginfo('template_directory'); ?>/images/favicon-rula.ico" />
<link rel="apple-touch-icon" href="<?php bloginfo('template_directory'); ?>/images/home-icon.png"/>
<link rel="stylesheet" type="text/css" media="all" href="<?php bloginfo( 'stylesheet_url' ); ?>" />

<?php
	wp_head();
?>
<script type="text/javascript">
  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-34738397-1']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();
</script>
</head>

<body <?php body_class(); ?>>
<div id="page" class="hfeed">
	<div id="cwarn">You must enable cookies for full site access.</div>
	<header id="branding" role="banner">
        <div class="skip-link"><a class="assistive-text" href="#content" title="Skip to content">Skip to content</a></div>
        <a href="/m"><img id="logo" src="<?php bloginfo('template_directory'); ?>/images/mobile-logo.png" alt="Ryerson Library and Archives logo" /></a>
        <?php if(is_front_page()) : ?><a href="http://m.ryerson.ca/" title="Ryerson Mobile"><img id="mlogo" src="<?php bloginfo('template_directory'); ?>/images/r-logo.png" alt=""></a><?php endif; ?>
	</header><!-- #branding -->

	<div id="main">