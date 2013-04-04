<?php
/**
 * The Header for our front page.
 *
 * Displays all of the <head> section and everything up till <div id="main">
 *
 * @package WordPress
 * @subpackage RULA
 * @since RULA 0.1
 */

include("inc/mobile_detect.php");
$detect = new Mobile_Detect();
if ($detect->isMobile() && isset($_COOKIE['mobile']))
{
	$detect = "false";
}
elseif($detect->isTablet()){
    $detect = "false";
}
elseif ($detect->isMobile())
{
	header("Location:http://library.ryerson.ca/m/");
}

?><!DOCTYPE html>
<!--[if IE 6]>
<html id="ie6" class="lt-ie9 lt-ie8 lt-ie7 no-js"  <?php language_attributes(); ?>>
<![endif]-->
<!--[if IE 7]>
<html id="ie7" class="lt-ie9 lt-ie8 no-js" <?php language_attributes(); ?>>
<![endif]-->
<!--[if IE 8]>
<html id="ie8" class="lt-ie9 no-js" <?php language_attributes(); ?>>
<![endif]-->
<!--[if !(IE 6) | !(IE 7) | !(IE 8)  ]><!-->
<html <?php language_attributes(); ?>>
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
<link rel="icon" href="<?php bloginfo('template_directory'); ?>/images/favicon-rula.ico" type="image/ico"/>
<link rel="apple-touch-icon" href="<?php bloginfo('template_directory'); ?>/images/home-icon.png" type="image/png"/>
<link rel="stylesheet" type="text/css" media="all" href="<?php bloginfo( 'stylesheet_url' ); ?>" />

<!--[if IE 7]>
<link rel="stylesheet" type="text/css" media="all" href="<?php bloginfo('template_directory'); ?>/style-ie7.css" />
<![endif]-->
<!--[if IE 8]>
<link rel="stylesheet" type="text/css" media="all" href="<?php bloginfo('template_directory'); ?>/style-ie8.css" />
<![endif]-->
<!--[if lt IE 9]>
<script src="<?php bloginfo('template_directory'); ?>/js/html5shiv.js"></script>
<script src="<?php bloginfo('template_directory'); ?>/js/html5shiv-printshiv.js"></script>
<script src="<?php bloginfo('template_directory'); ?>/js/respond.min.js"></script>
<![endif]-->

<link rel="pingback" href="<?php bloginfo( 'pingback_url' ); ?>" />
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

	//insert analytics code
	$hfoptions = get_option('hfoptions');
	$analytics = $hfoptions['analytics'];
	if(isset($analytics) && ($analytics != NULL)): 
		echo $analytics;
	endif;
?>
</head>

<body <?php body_class(); ?>>
<div id="page" class="hfeed">
	<header id="branding" role="banner">
            <div id="sitename">
                <div class="skip-link"><a class="assistive-text" href="#access" title="<?php esc_attr_e( 'Skip to main menu', 'twentyeleven' ); ?>"><?php _e( 'Skip to main menu', 'twentyeleven' ); ?></a></div>
                <div class="skip-link">
					<script type="text/javascript">
                        document.write("<a class=\"assistive-text\" href=\"javascript:document.getElementById('searcheverythinginput').focus()\" title=\"Skip to search everything\">Skip to Search Everything</a>");
                    </script> 
                    <noscript><a class="assistive-text" href="#searcheverythinginput" title="Skip to search everything">Skip to Search Everything</a></noscript>
                <a href="../index.html"><img src="<?php bloginfo( 'template_directory' ); ?>/images/RULA_logo.png" alt="Ryerson University Library &amp; Archives" /></a>
                </div>
            </div> <!-- end div logo_images -->
            <div class="skip-link"><a class="assistive-text" href="#access" title="<?php esc_attr_e( 'Skip the list of new books', 'twentyeleven' ); ?>"><?php _e( 'Skip the list of new books', 'twentyeleven' ); ?></a></div>
            <div id="flash_content"><!-- New Book Titles Slider -->
					<div id="home-page-aligner"> 
						<div id="title-position-fix"> 
							<div id="featured-title"><span class="nubbin"></span><span class="nubbin2"></span><a href="#"></a></div> 
						</div> 
						<div id="titles-wrap"> 
						  <ul id="new-titles" class="jcarousel-skin-tango"> 
						  </ul> 
						  <div id="next-button" style="display: block; "></div> 
						</div> <!-- end title-wrap -->
					</div><!-- home-page-aligner -->
			</div><!-- end flash_content -->

			<nav id="access" role="navigation">
				<?php /*  Allow screen readers / text browsers to skip the navigation menu and get right to the good stuff. */ ?>
                <h3 class="assistive-text"><?php _e( 'Main menu', 'twentyeleven' ); ?></h3>
                <div class="skip-link"><a class="assistive-text" href="#content" title="<?php esc_attr_e( 'Skip to content', 'twentyeleven' ); ?>"><?php _e( 'Skip to content', 'twentyeleven' ); ?></a></div>
                <div class="skip-link"><a class="assistive-text" href="#secondary" title="<?php esc_attr_e( 'Skip to news', 'twentyeleven' ); ?>"><?php _e( 'Skip to news', 'twentyeleven' ); ?></a></div>
				<div id="top-nav">
					<ul id="top-nav-list" class="grey-gradient">
					<?php $hfoptions = get_option('hfoptions');
                        if(isset($hfoptions['parentpgchkbox'])) {
                            wp_nav_menu( 
                                array( 
                                'theme_location' => 'primary' ,
                                'container'       => false, 
                                'fallback_cb'     => 'wp_page_menu_parentonly',
                                'items_wrap'      => '%3$s'
                            ));
                        } else {
                            wp_nav_menu( 
                                array( 
                                'theme_location' => 'primary' ,
                                'container'       => false, 
                                'items_wrap'      => '%3$s'
                            ));
                        }
                        ?>
                        <li class="menu-item menu-item-search">
							<!-- Search this Site Section -->
							<?php $hfoptions = get_option('hfoptions');
                                if(isset($hfoptions['menusearchchkbox'])): ?>
                                <form method="get" role="search" id="sitesearch" action="<?php echo esc_url( home_url( '/' ) ); ?>">
                                    <label for="s" class="assistive-text"><?php _e( 'Search this website', 'twentyeleven' ); ?></label>
                                    <input type="search" class="field" name="s" id="s" placeholder="<?php esc_attr_e( 'Search this website', 'twentyeleven' ); ?>" />
                                    <input type="submit" class="submit" value="" alt="Submit"  /> 
                                </form>
                            <?php else: ?>
							<form id="sitesearch" role="search" name="sitesearch" method="get" action="http://search.ryerson.ca/search"> 
								<input type="hidden" name="site" value="Library" /> 
								<input type="hidden" name="output" value="xml_no_dtd" /> 
								<input type="hidden" name="client" value="default_frontend" />
								<input type="hidden" name="proxystylesheet" value="default_frontend" />
                                <label for="sitesearchbox" class="assistive-text"><?php _e( 'Search the Library website', 'twentyeleven' ); ?></label>
                                <input type="search" id="sitesearchbox" name="q" maxlength="255" value="Search the Library Website" onClick="if(this.value=='Search the Library Website') {this.value='';}"/> 
								<input type="image" src="<?php bloginfo( 'template_directory' ); ?>/images/search-icon.png" alt="Submit"  /> 
							</form> 
                            <?php endif; ?>
						</li>
						<li style="clear:both;"></li>
					</ul>
					<div style="clear:both;"></div>
				</div>
			</nav><!-- #access -->
	</header><!-- #branding -->


	<div id="main">