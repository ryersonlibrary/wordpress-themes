<?php
/**
 * The Sidebar containing the main widget area.
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
			<?php if ( ! dynamic_sidebar( 'sidebar-2' ) ) : ?>

               
                <h2 class="grey-gradient"><a href="http://news.library.ryerson.ca/" style="text-decoration: none">Library News</a></h2>

					<!--Library News Feed-->
  						<script language="JavaScript" src="http://news.library.ryerson.ca/feed2js/feed2js.php?src=http%3A%2F%2Fnews.library.ryerson.ca%2Fapi%2Fmerge&amp;chan=n&amp;num=5&amp;desc=0&amp;date=n&amp;targ=n&amp;utf=y" type="text/javascript"></script> 
						<noscript> 
							<a href="http://news.library.ryerson.ca/feed2js/feed2js.php?src=http%3A%2F%2Fnews.library.ryerson.ca%2Fapi%2Fmerge&amp;chan=n&amp;num=5&amp;desc=0&amp;date=n&amp;targ=n&amp;html=y">View RSS feed</a>
						</noscript>
				<!--original theme bit-->
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