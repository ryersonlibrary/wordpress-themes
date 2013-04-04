<?php
/**
 * The template for displaying the footer.
 *
 * Contains the closing of the id=main div and all content
 * after.  Calls sidebar-footer.php for bottom widgets.
 *
 * @package WordPress
 * @subpackage RULA-ASC
 * @since RULA-ASC 0.5
 */
?>
		<div class="clear-both"></div>
		</div><!-- #main -->
		
		<footer>
			<p><img src="<?php bloginfo('template_url'); ?>/images/colorbar.jpg" width="100%" height="2" alt="color" /></p>
			
			<?php
				if (!is_404()) { get_sidebar('footer'); }
			?>
		</footer>
	</div>

<?php
	/* Always have wp_footer() just before the closing </body>
	 * tag of your theme, or you will break many plugins, which
	 * generally use this hook to reference JavaScript files.
	 */

	wp_footer();
?>
</body>
</html>
