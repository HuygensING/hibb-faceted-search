Backbone = require 'backbone'
$ = require 'jquery'
_ = require 'underscore'
tpl = require '../../../jade/facets/main.jade'

class Facet extends Backbone.View

	# ### Initialize

	# ### Render
	render: ->
		# console.log @model.attributes
		rtpl = tpl @model.attributes
		@$el.html rtpl

		@

	# ### Events
	events: ->
		'click h3': 'toggleBody'
		# 'click header i.openclose': 'toggleMenu'
		# 'focus header input[name="dummy"]': 'toggleMenu'
		# 'blur header input[name="dummy"]': 'toggleMenu'

	# ### Show/hide menu/body
	# toggleMenu: (ev) ->
	# 	# $button = $ ev.currentTarget
	# 	# $button.toggleClass 'fa-plus-square-o'
	# 	# $button.toggleClass 'fa-minus-square-o'
	# 	@$('header input[name="dummy"]').hide()
		
	# 	@$('header .options').slideToggle 150, => 
	# 		@$('header .options input[name="filter"]').focus()
	# 		@$('header .options input[name="filter"]').focus()

	hideMenu: ->
		$button = @$ 'header i.openclose'
		$button.addClass 'fa-plus-square-o'
		$button.removeClass 'fa-minus-square-o'

		@$('header .options').slideUp(150)

	toggleBody: (ev) ->
		func = if @$('.body').is(':visible') then @hideBody else @showBody

		# If ev is a function, than it is the callback. Use call to pass the context.
		if _.isFunction ev then func.call @, ev else func.call @

	hideBody: (done) ->
		@hideMenu()

		@$('.body').slideUp 100, => 
			done() if done?
			@$('header i.fa').fadeOut 100

	showBody: (done) ->
		@$('.body').slideDown 100, => 
			done() if done?
			@$('header i.fa').fadeIn 100

	# ### Methods
	# Override in child
	update: (newOptions) -> # console.log newOptions

module.exports = Facet