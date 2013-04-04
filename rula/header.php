<?php
/**
 * The Header for our theme.
 *
 * Displays all of the <head> section and everything up till <div id="main">
 * Remember to make changes to other template headers if changing shared elements.
 *
 * @package WordPress
 * @subpackage RULA
 * @since RULA 0.1
 */
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
<script src="<?php bloginfo('template_directory'); ?>/js/iframefixie.js"></script>
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
            <div class="skip-link"><a class="assistive-text" href="#access" title="<?php esc_attr_e( 'Skip to main menu', 'twentyeleven' ); ?>"><?php _e( 'Skip to main menu', 'twentyeleven' ); ?></a></div>
            <div id="sitename">
                <a href="<?php echo network_home_url(); ?>"><img id="headerlogo" src="<?php bloginfo( 'template_directory' ); ?>/images/RULA_logo.png" alt="Ryerson University Library &amp; Archives" /></a>
                <?php $hfoptions = get_option('hfoptions');
					  $subtitle = $hfoptions['subsitetitle'];
					if(isset($subtitle) && ($subtitle != NULL)): ?>
                    	<a href="<?php echo home_url(); ?>"><h1 id="subsitename"><?php echo $subtitle; ?></h1></a>
            	<?php endif; ?>
            </div> <!-- end div logo_images -->
			<?php if(isset($hfoptions['askuschkbox'])): ?>
            		<div id="askushead"><a href="http://library.ryerson.ca/contactus"><img src="<?php bloginfo( 'template_directory' ); ?>/images/askus_logo.png" alt="Need Help? Ask Us"></a></div>
            <?php endif; ?>
			<nav id="access" role="navigation">
				<?php /*  Allow screen readers / text browsers to skip the navigation menu and get right to the good stuff. */ ?>
                <h3 class="assistive-text"><?php _e( 'Main menu', 'twentyeleven' ); ?></h3>
                <div class="skip-link"><a class="assistive-text" href="#content" title="<?php esc_attr_e( 'Skip to content', 'twentyeleven' ); ?>"><?php _e( 'Skip to content', 'twentyeleven' ); ?></a></div>
                <div class="skip-link secondary"><a class="assistive-text" href="#secondary" title="<?php esc_attr_e( 'Skip to page navigation', 'twentyeleven' ); ?>"><?php _e( 'Skip to page navigation', 'twentyeleven' ); ?></a></div>
				<div id="top-nav">
					<ul id="top-nav-list" class="grey-gradient">
					<?php if(isset($hfoptions['parentpgchkbox'])) {
                            wp_nav_menu( 
                                array( 
                                'theme_location' => 'primary' ,
                                'container' => false, 
                                'fallback_cb'     => 'wp_page_menu_parentonly',
                                'items_wrap'      => '%3$s'
                            ));
                        } else {
                            wp_nav_menu( 
                                array( 
                                'theme_location' => 'primary' ,
                                'container' => false, 
                                'items_wrap' => '%3$s'
                            ));
                        }
                        ?>
						<li class="menu-item menu-item-search">
							<!-- Search this Site Section -->
							<?php if(isset($hfoptions['menusearchchkbox'])): ?>
                                <form method="get" role="search" id="sitesearch" action="<?php echo esc_url( home_url( '/' ) ); ?>">
                                    <label for="s" class="assistive-text"><?php _e( 'Search this website', 'twentyeleven' ); ?></label>
                                    <input type="search" class="field" name="s" id="s" placeholder="<?php esc_attr_e( 'Search this website', 'twentyeleven' ); ?>" />
                                    <input type="submit" class="submit" value="" /> 
                                </form>
                            <?php else: ?>
							<form id="sitesearch" role="search" name="sitesearch" method="get" action="http://search.ryerson.ca/search"> 
								<input type="hidden" name="site" value="Library" /> 
								<input type="hidden" name="output" value="xml_no_dtd" /> 
								<input type="hidden" name="client" value="default_frontend" />								
								<input type="hidden" name="proxystylesheet" value="default_frontend" />
                                <label for="sitesearchbox" class="assistive-text"><?php _e( 'Search the Library website', 'twentyeleven' ); ?></label>
                                <input type="search" id="sitesearchbox" name="q" maxlength="255" value="Search the Library Website" onClick="if(this.value=='Search the Library Website') {this.value='';}"/> 
								<input type="image" src="<?php bloginfo( 'template_directory' ); ?>/images/search-icon.png" alt="Submit Search"  /> 
							</form> 
                            <?php endif; ?>
						</li>
						<li style="clear:both;border:0;"></li>
					</ul>
					<div style="clear:both;"></div>
				</div>
			</nav><!-- #access -->
	</header><!-- #branding -->


	<div id="main">