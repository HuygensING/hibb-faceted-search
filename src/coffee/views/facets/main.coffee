define (require) ->

	Views = 
		Base: require 'hilib/views/base'

	# Templates =
	# 	Facet: require 'text!html/facet.html'
	tpls = require 'tpls'
	

	class Facet extends Views.Base

		# ### Initialize
		initialize: ->
			super

		# ### Render
		render: ->
			# console.log @model.attributes
			rtpl = tpls['faceted-search/facets/main']  @model.attributes
			@$el.html rtpl

			@

		# ### Events
		events: ->
			'click h3': 'toggleBody'
			'click header i.openclose': 'toggleMenu'

		# ### Show/hide menu/body
		toggleMenu: (ev) ->
			$button = $ ev.currentTarget
			$button.toggleClass 'fa-plus-square-o'
			$button.toggleClass 'fa-minus-square-o'

			@$('header .options').slideToggle(150)
			@$('header .options input[name="filter"]').focus()

		hideMenu: ->
			$button = $ 'header i.fa'
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