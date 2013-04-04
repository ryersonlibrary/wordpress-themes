<?php
/**
 * The template for displaying the footer.
 *
 * Contains the closing of the id=main div and all content after
 *
 * @package WordPress
 * @subpackage RULA
 * @since RULA 0.1
 */
?>

	</div><!-- #main -->

	<footer id="colophon" role="contentinfo">

			<?php
				/* A sidebar in the footer? Yep. You can can customize
				 * your footer with three columns of widgets.
				 */
				if ( ! is_404() )
					get_sidebar( 'footer' );
			?>

			<div id="footer"> 		
				<p> 
					<a href="<?php echo home_url(); ?>">Home</a> | <?php $hfoptions = get_option('hfoptions'); echo $hfoptions['footerlinks'];
                if(isset($hfoptions['smchkbox'])) { ?>Follow us on: 
                    <a href="http://www.facebook.com/pages/Toronto-ON/Ryerson-University-Library/5863804371?ref=mf" data-ga-event="Footer,SocialMedia,Facebook"><img src="<?php bloginfo( 'template_directory' ); ?>/images/facebook_icon.gif" alt="Facebook" title="Facebook" /></a> 
                    <a href="http://www.twitter.com/ryersonlibrary" data-ga-event="Footer,SocialMedia,Twitter"><img src="<?php bloginfo( 'template_directory' ); ?>/images/twitter_icon.png" alt="Twitter" width="16" height="16" /></a> 
                    <a href="http://www.flickr.com/photos/ryersonlibrary" data-ga-event="Footer,SocialMedia,Flickr"><img src="<?php bloginfo( 'template_directory' ); ?>/images/flickr_icon.gif" alt="Flickr" width="16" height="16" /></a> 
                    <a href="http://www.youtube.com/user/ryersonlibrary/videos" data-ga-event="Footer,SocialMedia,Youtube"><img src="<?php bloginfo( 'template_directory' ); ?>/images/youtube_icon.png" alt="YouTube" width="16" height="16" /></a>
                    <a href="http://pipes.yahoo.com/pipes/pipe.run?_id=46e7ea505e28c621582d37a391b705d6&_render=rss" data-ga-event="Footer,SocialMedia,RSS"><img src="<?php bloginfo( 'template_directory' ); ?>/images/feed_icon.png" alt="RSS Feed" width="16" height="16" /></a> | 
                    <?php } ?>
                &copy;<?php echo date('Y'); ?> <a href="http://www.ryerson.ca/" data-ga-event="Footer,SocialMedia,RU"><img src="<?php bloginfo( 'template_directory' ); ?>/images/RUfooter_logo.gif" alt="Ryerson University" width="114" height="20" /></a>
				</p> 
			</div>
	</footer><!-- #colophon -->
</div><!-- #page -->

<?php wp_footer(); ?>

</body>
</html>