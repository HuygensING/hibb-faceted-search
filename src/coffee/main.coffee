Backbone = require 'backbone'
$ = require 'jquery'
Backbone.$ = $

_ = require 'underscore'

Fn = require 'hilib/src/utils/general'
dom = require 'hilib/src/utils/dom'

pubsub = require 'hilib/src/mixins/pubsub'

config = require './config'
facetViewMap = require './facetviewmap'

MainModel = require './models/main'

Views =
	TextSearch: require './views/search'
	Facets:
		List: require './views/facets/list'
		Boolean: require './views/facets/boolean'
		Date: require './views/facets/date'

tpl = require '../jade/main.jade'

class MainView extends Backbone.View

	# ### Initialize
	initialize: (options) ->

		@facetViews = {}

		_.extend @, pubsub

		_.extend facetViewMap, options.facetViewMap
		delete options.facetViewMap

		_.extend config.facetNameMap, options.facetNameMap
		delete options.facetNameMap

		_.extend config, options
		queryOptions = _.extend config.queryOptions, config.textSearchOptions

		# Set the default of config type in case the user sends an unknown string.
		config.textSearch = 'advanced' if ['none', 'simple', 'advanced'].indexOf(config.textSearch) is -1
		
		# Initialize the FacetedSearch model.
		@model = new MainModel queryOptions
		
		@render()


		# DEV
		useDevData = =>
			responseModel = new Backbone.Model {"facets":[{"name":"content_type","title":"Content Type","type":"LIST","options":[{"name":"publications (all)","count":2972},{"name":"painting","count":2526},{"name":"books/e-books","count":1646},{"name":"drawing","count":871},{"name":"articles in magazines/journals","count":646},{"name":"newspaper articles","count":464},{"name":"book reviews","count":326},{"name":"notarial acts","count":320},{"name":"municipal records","count":182},{"name":"personal accounts (manuscripts)","count":176},{"name":"reproductive print","count":117},{"name":"baptism, marriage and burial records","count":113},{"name":"court records","count":103},{"name":"works of art","count":95},{"name":"print","count":92},{"name":"color drawing","count":56},{"name":"dissertations/theses","count":31},{"name":"school records","count":16},{"name":"overmantel","count":11},{"name":"unknown","count":8},{"name":"church records","count":8},{"name":"portrait miniature","count":6},{"name":"oil sketch","count":5},{"name":"reference material/other media","count":5},{"name":"decorative wall component","count":4},{"name":"overdoor","count":3},{"name":"wallpaper painting","count":3},{"name":"interior (as artwork)","count":2},{"name":"watercolor","count":2},{"name":"triptych","count":1},{"name":"unfinished painting","count":1},{"name":"mezzotint","count":1}]},{"name":"person_type","title":"Person Type","type":"LIST","options":[{"name":"artist","count":3703},{"name":"authors of secundary literature after 1800","count":2063},{"name":"depicted","count":725},{"name":"notary","count":321},{"name":"art theorist","count":270},{"name":"art dealer/broker","count":223},{"name":"auctioneer/broker/distributor","count":163},{"name":"cataloguer/compiler","count":112},{"name":"cashier/accountant","count":108},{"name":"inventory clerk","count":78},{"name":"court clerk","count":56},{"name":"painter","count":55},{"name":"poet","count":48},{"name":"sexton/parish clerk","count":40},{"name":"draftsman","count":39},{"name":"letter writer","count":34},{"name":"lexicographer","count":32},{"name":"chronicler","count":28},{"name":"secretary","count":28},{"name":"publisher","count":26},{"name":"advertiser","count":23},{"name":"genealogist","count":19},{"name":"diarist","count":18},{"name":"magistrate/alderman","count":18},{"name":"printmaker","count":17},{"name":"commissioner","count":17},{"name":"orphan master","count":16},{"name":"pupil/student","count":11},{"name":"solicitor/attorney","count":11},{"name":"etcher","count":9},{"name":"reviewer","count":8},{"name":"vicar/clergyman","count":7},{"name":"appraiser","count":6},{"name":"bookseller","count":6},{"name":"scribe","count":5},{"name":"consistory","count":4},{"name":"playwright","count":4},{"name":"decorative painter (of interiors)","count":3},{"name":"miniaturist painter","count":3},{"name":"authors of (published) source material before 1800","count":3},{"name":"collector","count":3},{"name":"engraver","count":3},{"name":"biographer","count":3},{"name":"art collector","count":2},{"name":"reproduction etcher","count":2},{"name":"councillor ordinary","count":2},{"name":"editor","count":2},{"name":"messenger","count":2},{"name":"rector/headmaster","count":2},{"name":"art dealer","count":1},{"name":"collector of Dutch and Flemish painting","count":1},{"name":"collector of ethnographica","count":1},{"name":"court painter","count":1},{"name":"designer","count":1},{"name":"graphic reproduction artist","count":1},{"name":"interior decorator","count":1},{"name":"merchant","count":1},{"name":"mezzotinter","count":1},{"name":"musician","count":1},{"name":"naturalia collector","count":1},{"name":"painting dealer","count":1},{"name":"pastelist","count":1},{"name":"printseller","count":1},{"name":"sculptor","count":1},{"name":"watercolorist","count":1},{"name":"wood engraver","count":1},{"name":"applicant/petitioner","count":1},{"name":"burgomaster","count":1},{"name":"counsel/justice of the court","count":1},{"name":"holy ghost master","count":1},{"name":"master of the estate","count":1},{"name":"treasurer","count":1}]},{"name":"date_range","title":"date range","type":"RANGE","options":[{"lowerLimit":14240101,"upperLimit":20131231}]}],"numFound":7650,"results":{"rkdimages":{"solrquery":"q=*%3A*&fl=ft_title%2Cui_attributions%2Cui_img_src%2Cft_naam%2Cid%2Cscore%2Ccontent_type%2Cperson_type%2Cui_publication_date&rows=50000&facet.field=content_type&facet.field=person_type&facet.field=publication_date_lower&facet.field=publication_date_upper&facet=true&facet.mincount=1&facet.limit=10000&hl=true&hl.fragsize=100&hl.maxAnalyzedChars=-1&hl.fl=ft_name_artwork&hl.fl=ft_alternative_titles&hl.fl=ft_title&hl.fl=ft_naam&hl.fl=ft_rkd_algemene_trefwoorden&hl.fl=ft_collectienaam&hl.fl=ft_auctioneer&hl.fl=ft_buyer&hl.fl=ft_commissioner&hl.fl=ft_auction_house&hl.fl=ft_opmerking_algemeen&hl.q=*%3A*","term":"*:*","numFound":3600,"ids":["rkdimages_55","rkdimages_125","rkdimages_126","rkdimages_305","rkdimages_520"],"results":[{"id":"rkdimages_55","_kwic":{},"ft_title":"Portrait of an unknown young woman","ui_attributions":["huidig manner of/circle of Baen, Jan de"],"ft_naam":"Baen, Jan de; Mijtens, Johannes; Maes, Nicolaes","person_type":["artist"],"score":1.0,"ui_img_src":["http://imagehandler.rkd.nl/wwwopac.ashx?command=getcontent&server=images&width=600&height=600&value=jpg\\483\\0000003483.jpg"],"ui_publication_date":["ca. 1640-1670"],"content_type":["painting"]},{"id":"rkdimages_125","_kwic":{},"ft_title":"Portrait of an unknown man","ui_attributions":["huidig  Maes, Nicolaes"],"ft_naam":"Maes, Nicolaes","person_type":["artist"],"score":1.0,"ui_img_src":["http://imagehandler.rkd.nl/wwwopac.ashx?command=getcontent&server=images&width=600&height=600&value=jpg\\535\\0000003535.jpg"],"ui_publication_date":["ca. 1678"],"content_type":["painting"]},{"id":"rkdimages_126","_kwic":{},"ft_title":"Portrait of a young woman","ui_attributions":["huidig  Maes, Nicolaes"],"ft_naam":"Maes, Nicolaes","person_type":["artist"],"score":1.0,"ui_img_src":["http://imagehandler.rkd.nl/wwwopac.ashx?command=getcontent&server=images&width=600&height=600&value=jpg\\533\\0000003533.jpg"],"ui_publication_date":["ca. 1676"],"content_type":["painting"]},{"id":"rkdimages_305","_kwic":{},"ft_title":null,"ui_attributions":["huidig  Fabritius, Carel"],"ft_naam":"Fabritius, Carel","person_type":["artist"],"score":1.0,"ui_img_src":["http://imagehandler.rkd.nl/wwwopac.ashx?command=getcontent&server=images&width=600&height=600&value=jpg\\888\\0000136888.jpg","http://imagehandler.rkd.nl/wwwopac.ashx?command=getcontent&server=images&width=600&height=600&value=jpg\\792\\0000002792.jpg","http://imagehandler.rkd.nl/wwwopac.ashx?command=getcontent&server=images&width=600&height=600&value=jpg\\043\\0000063043.jpg","http://imagehandler.rkd.nl/wwwopac.ashx?command=getcontent&server=images&width=600&height=600&value=jpg\\791\\0000002791.jpg"],"ui_publication_date":["tweede helft jaren 1640"],"content_type":["painting"]},{"id":"rkdimages_520","_kwic":{},"ft_title":null,"ui_attributions":["huidig attributed to Bisschop, Cornelis"],"ft_naam":"Bisschop, Cornelis; Maes, Nicolaes","person_type":["artist"],"score":1.0,"ui_img_src":["http://imagehandler.rkd.nl/wwwopac.ashx?command=getcontent&server=images&width=600&height=600&value=jpg\\020\\ONS9500020.jpg","http://imagehandler.rkd.nl/wwwopac.ashx?command=getcontent&server=images&width=600&height=600&value=jpg\\032\\ONS9501032.jpg"],"ui_publication_date":["jaren 1650"],"content_type":["painting"]}],"start":0,"rows":5,"sortableFields":["id"],"_next":"http://demo7.huygens.knaw.nl/rembench-backend/search/1399532925742?database=rkdimages&start=5&rows=5"},"rkdartists":{"solrquery":"q=*%3A*&fl=ui_img_src%2Cft_artist_name%2Cui_date%2Cid%2Cscore%2Ccontent_type%2Cperson_type%2Cui_publication_date&rows=50000&facet.field=content_type&facet.field=person_type&facet.field=publication_date_lower&facet.field=publication_date_upper&facet=true&facet.mincount=1&facet.limit=10000&hl=true&hl.fragsize=100&hl.maxAnalyzedChars=-1&hl.fl=ft_artist_name&hl.fl=ft_spelling_variants&hl.fl=ft_activity_places&hl.fl=ft_qualifications&hl.fl=ft_opmerking_algemeen&hl.q=*%3A*","term":"*:*","numFound":59,"ids":["rkdartists_7991","rkdartists_10080","rkdartists_10858","rkdartists_13052","rkdartists_22804"],"results":[{"id":"rkdartists_7991","_kwic":{},"ft_artist_name":"Beijeren, Leendert van","person_type":["painter"],"score":1.0,"ui_date":["1619-1620 - 1649"],"ui_img_src":null,"ui_publication_date":["1619-1620 - 1649"],"content_type":null},{"id":"rkdartists_10080","_kwic":{},"ft_artist_name":"Bol, Ferdinand","person_type":["painter","draftsman","printmaker","decorative painter (of interiors)"],"score":1.0,"ui_date":["1616 - 1680"],"ui_img_src":["http://imagehandler.rkd.nl/wwwopac.ashx?command=getcontent&server=images&width=600&height=600&value=jpg\\320\\0000271320.jpg","http://imagehandler.rkd.nl/wwwopac.ashx?command=getcontent&server=images&width=600&height=600&value=jpg\\679\\0000108679.jpg","http://imagehandler.rkd.nl/wwwopac.ashx?command=getcontent&server=images&width=600&height=600&value=jpg\\899\\IB00019899.jpg","http://imagehandler.rkd.nl/wwwopac.ashx?command=getcontent&server=images&width=600&height=600&value=jpg\\679\\0000030679.jpg","http://imagehandler.rkd.nl/wwwopac.ashx?command=getcontent&server=images&width=600&height=600&value=jpg\\174\\0000063174.jpg","http://imagehandler.rkd.nl/wwwopac.ashx?command=getcontent&server=images&width=600&height=600&value=jpg\\948\\0000000948.jpg","http://imagehandler.rkd.nl/wwwopac.ashx?command=getcontent&server=images&width=600&height=600&value=jpg\\949\\0000000949.jpg","http://imagehandler.rkd.nl/wwwopac.ashx?command=getcontent&server=images&width=600&height=600&value=jpg\\122\\0000063122.jpg","http://imagehandler.rkd.nl/wwwopac.ashx?command=getcontent&server=images&width=600&height=600&value=jpg\\579\\0000079579.jpg","http://imagehandler.rkd.nl/wwwopac.ashx?command=getcontent&server=images&width=600&height=600&value=jpg\\227\\IB00045227.jpg","http://imagehandler.rkd.nl/wwwopac.ashx?command=getcontent&server=images&width=600&height=600&value=jpg\\936\\0000000936.jpg","http://imagehandler.rkd.nl/wwwopac.ashx?command=getcontent&server=images&width=600&height=600&value=jpg\\947\\0000000947.jpg","http://imagehandler.rkd.nl/wwwopac.ashx?command=getcontent&server=images&width=600&height=600&value=jpg\\867\\0000082867.jpg","http://imagehandler.rkd.nl/wwwopac.ashx?command=getcontent&server=images&width=600&height=600&value=jpg\\869\\0000082869.jpg","http://imagehandler.rkd.nl/wwwopac.ashx?command=getcontent&server=images&width=600&height=600&value=jpg\\123\\1000313123.jpg","http://imagehandler.rkd.nl/wwwopac.ashx?command=getcontent&server=images&width=600&height=600&value=jpg\\531\\0000031531.jpg","http://imagehandler.rkd.nl/wwwopac.ashx?command=getcontent&server=images&width=600&height=600&value=jpg\\532\\0000031532.jpg","http://imagehandler.rkd.nl/wwwopac.ashx?command=getcontent&server=images&width=600&height=600&value=jpg\\533\\0000031533.jpg"],"ui_publication_date":["1616 - 1680"],"content_type":null},{"id":"rkdartists_10858","_kwic":{},"ft_artist_name":"Borssom, Anthonie van","person_type":["printmaker","etcher","painter","draftsman","scribe"],"score":1.0,"ui_date":["1630-1631 - 1677"],"ui_img_src":null,"ui_publication_date":["1630-1631 - 1677"],"content_type":null},{"id":"rkdartists_13052","_kwic":{},"ft_artist_name":"Brouwer, Cornelis (?-1681)","person_type":["painter"],"score":1.0,"ui_date":[" - 1681"],"ui_img_src":null,"ui_publication_date":[" - 1681"],"content_type":null},{"id":"rkdartists_22804","_kwic":{},"ft_artist_name":"Dijck, Abraham van","person_type":["painter","draftsman"],"score":1.0,"ui_date":["1635-1636 - 1680"],"ui_img_src":null,"ui_publication_date":["1635-1636 - 1680"],"content_type":null}],"start":0,"rows":5,"sortableFields":["id"],"_next":"http://demo7.huygens.knaw.nl/rembench-backend/search/1399532925742?database=rkdartists&start=5&rows=5"},"ruquest":{"solrquery":"q=*%3A*&fl=ft_authors%2Cft_title%2Cft_publicationtitle%2Cft_publicationplace%2Cui_publisher%2Cui_isbn%2Cui_issn%2Cui_volume%2Cui_issue%2Cui_startpage%2Cui_endpage%2Cid%2Cscore%2Ccontent_type%2Cperson_type%2Cui_publication_date&rows=50000&facet.field=content_type&facet.field=person_type&facet.field=publication_date_lower&facet.field=publication_date_upper&facet=true&facet.mincount=1&facet.limit=10000&hl=true&hl.fragsize=100&hl.maxAnalyzedChars=-1&hl.fl=ft_title&hl.fl=ft_publicationtitle&hl.fl=ft_publicationplace&hl.fl=ft_authors&hl.fl=ft_subjectterms&hl.fl=ft_abstract&hl.q=*%3A*","term":"*:*","numFound":2066,"ids":["ruquest_FETCH-radboud_catalog_8621297531","ruquest_FETCH-radboud_catalog_2895753891","ruquest_FETCH-radboud_catalog_2965298261","ruquest_FETCH-radboud_catalog_2772746991","ruquest_FETCH-radboud_catalog_2176419971"],"results":[{"ft_publicationplace":"Leipzig","ui_issue":null,"person_type":["authors of secundary literature after 1800"],"score":1.0,"ui_isbn":null,"ui_volume":null,"id":"ruquest_FETCH-radboud_catalog_8621297531","ui_publisher":["Meulenhoff"],"_kwic":{},"ft_title":"Rembrandt","ui_endpage":null,"ft_authors":null,"ui_startpage":null,"ft_publicationtitle":"Rembrandt","ui_publication_date":["1905"],"content_type":["articles in magazines/journals","publications (all)"],"ui_issn":null},{"ft_publicationplace":"Zwolle","ui_issue":null,"person_type":["authors of secundary literature after 1800"],"score":1.0,"ui_isbn":["9789040091650"],"ui_volume":null,"id":"ruquest_FETCH-radboud_catalog_2895753891","ui_publisher":["Waanders"],"_kwic":{},"ft_title":"Rembrandt","ui_endpage":null,"ft_authors":null,"ui_startpage":null,"ft_publicationtitle":null,"ui_publication_date":["2006"],"content_type":["books/e-books","publications (all)"],"ui_issn":null},{"ft_publicationplace":"Dresden","ui_issue":null,"person_type":["authors of secundary literature after 1800"],"score":1.0,"ui_isbn":null,"ui_volume":null,"id":"ruquest_FETCH-radboud_catalog_2965298261","ui_publisher":["Kupferstich-Kabinett, Staatliche Kunstsammlungen Dresden"],"_kwic":{},"ft_title":"Rembrandt","ui_endpage":null,"ft_authors":null,"ui_startpage":null,"ft_publicationtitle":null,"ui_publication_date":["2006"],"content_type":["books/e-books","publications (all)"],"ui_issn":null},{"ft_publicationplace":"Bedburg-Hau [etc.]","ui_issue":null,"person_type":["authors of secundary literature after 1800"],"score":1.0,"ui_isbn":["3935166273"],"ui_volume":null,"id":"ruquest_FETCH-radboud_catalog_2772746991","ui_publisher":["Stiftung Museum Schloß Moyland [etc.]"],"_kwic":{},"ft_title":"Rembrandt","ui_endpage":null,"ft_authors":null,"ui_startpage":null,"ft_publicationtitle":null,"ui_publication_date":["2005"],"content_type":["books/e-books","publications (all)"],"ui_issn":null},{"ft_publicationplace":"Ljubljana","ui_issue":null,"person_type":["authors of secundary literature after 1800"],"score":1.0,"ui_isbn":null,"ui_volume":null,"id":"ruquest_FETCH-radboud_catalog_2176419971","ui_publisher":["Cankarjev dom, kulturni in kongresni center"],"_kwic":{},"ft_title":"Rembrandt","ui_endpage":null,"ft_authors":null,"ui_startpage":null,"ft_publicationtitle":null,"ui_publication_date":["2000"],"content_type":["books/e-books","publications (all)"],"ui_issn":null}],"start":0,"rows":5,"sortableFields":["id"],"_next":"http://demo7.huygens.knaw.nl/rembench-backend/search/1399532925742?database=ruquest&start=5&rows=5"},"remdoc":{"solrquery":"q=*%3A*&fl=ft_entry_name%2Cui_name_of_object%2Cui_author_name%2Cui_author_role%2Cid%2Cscore%2Ccontent_type%2Cperson_type%2Cui_publication_date&rows=50000&facet.field=content_type&facet.field=person_type&facet.field=publication_date_lower&facet.field=publication_date_upper&facet=true&facet.mincount=1&facet.limit=10000&hl=true&hl.fragsize=100&hl.maxAnalyzedChars=-1&hl.fl=ft_entry_name&hl.fl=ft_diplomatic&hl.fl=ft_translation&hl.fl=ft_comments&hl.q=*%3A*","term":"*:*","numFound":1925,"ids":["remdoc_14121","remdoc_14097","remdoc_14096","remdoc_14100","remdoc_14095"],"results":[{"id":"remdoc_14121","_kwic":{},"person_type":["art theorist"],"score":1.0,"ui_name_of_object":["L'Academia Todesca della architectura, scultura e pittura, oder Teutsche Academi der edlen Bau-Bild-Mahlerey-Künste, 4 vols, Nürnberg 1675-1679"],"ui_author_role":["kunsttheoreticus [art theorist]"],"ui_author_name":["Joachim von Sandrart"],"ui_publication_date":["1675"],"content_type":["books/e-books","publications (all)"],"ft_entry_name":"Joachim von Sandrart Rembrandt’s harmony of colours in his “Academia Todesca” (1675)"},{"id":"remdoc_14097","_kwic":{},"person_type":["art theorist"],"score":1.0,"ui_name_of_object":["L'Academia Todesca della architectura, scultura e pittura, oder Teutsche Academi der edlen Bau-Bild-Mahlerey-Künste, 4 vols, Nürnberg 1675-1679"],"ui_author_role":["kunsttheoreticus [art theorist]"],"ui_author_name":["Joachim von Sandrart"],"ui_publication_date":["1675"],"content_type":["books/e-books","publications (all)"],"ft_entry_name":"Joachim von Sandrart’s biography of Rembrandt in his “Academia Todesca” (1675)"},{"id":"remdoc_14096","_kwic":{},"person_type":["art theorist"],"score":1.0,"ui_name_of_object":["L'Academia Todesca della architectura, scultura e pittura, oder Teutsche Academi der edlen Bau-Bild-Mahlerey-Künste, 4 vols, Nürnberg 1675-1679"],"ui_author_role":["kunsttheoreticus [art theorist]"],"ui_author_name":["Joachim von Sandrart"],"ui_publication_date":["1675"],"content_type":["books/e-books","publications (all)"],"ft_entry_name":"Johann Ulrich Mayr recorded as a pupil of Rembrandt in Joachim von Sandrart’s “Academia Todesca” (1675)"},{"id":"remdoc_14100","_kwic":{},"person_type":["art theorist"],"score":1.0,"ui_name_of_object":["L'Academia Todesca della architectura, scultura e pittura, oder Teutsche Academi der edlen Bau-Bild-Mahlerey-Künste, 4 vols, Nürnberg 1675-1679"],"ui_author_role":["kunsttheoreticus [art theorist]"],"ui_author_name":["Joachim von Sandrart"],"ui_publication_date":["1675"],"content_type":["books/e-books","publications (all)"],"ft_entry_name":"Rembrandt pays a high price for prints by Lucas van Leyden according to Joachim von Sandrart in his “Academia Todesca” (1675)"},{"id":"remdoc_14095","_kwic":{},"person_type":["inventory clerk"],"score":1.0,"ui_name_of_object":["Register van de Inventarissen MM. Anno 1674 [CHECK]"],"ui_author_role":["inventarisator [inventory clerk]"],"ui_author_name":[""],"ui_publication_date":["1675-03-27/1675-04-27"],"content_type":["municipal records"],"ft_entry_name":"Rembrandt paintings of a “Jewess”, a “little David” (or “Danae”), and an unfinished “Portrait of Lady” in the estate of Gerrit Uylenburgh (27 March 1675)"}],"start":0,"rows":5,"sortableFields":["id"],"_next":"http://demo7.huygens.knaw.nl/rembench-backend/search/1399532925742?database=remdoc&start=5&rows=5"}}}
			@model.searchResults.current = responseModel
			@model.searchResults.current.options = {}
			@model.searchResults.add responseModel
			@updateFacets()
			setTimeout (=>
				@trigger 'change:results', responseModel
				@$('.overlay').hide()
			), 100
		
		# useDevData()
		# /DEV
		@addListeners()
		
	# ### Render
	render: ->
		@$el.html tpl()

		if config.templates.hasOwnProperty 'main'
			@$('form').html config.templates.main()

		@$('.faceted-search').addClass "search-type-#{config.textSearch}"

		# See config for more about none, simple and advanced options.
		if config.textSearch is 'simple' or 'advanced'
			@renderTextSearch()
		
		if config.textSearch is 'none' or 'advanced'
			setTimeout @showLoader.bind(@), 0

		@

	renderTextSearch: ->
		textSearch = new Views.TextSearch()
		@$('.text-search-placeholder').html textSearch.el

		@listenTo textSearch, 'change', (queryOptions) => @model.set queryOptions
		@listenTo textSearch, 'change:silent', (queryOptions) => @model.set queryOptions, silent: true
		
		# TODO Remove textSearch from @facetViews
		@facetViews['textSearch'] = textSearch

	destroyFacets: ->
		for own viewName, view of @facetViews
			if viewName isnt 'textSearch' 
				view.destroy()
				delete @facetViews[viewName]

	createFacetView: (facetData) =>
		if _.isString(facetData)
			facetData = _.findWhere @model.searchResults.first().get('facets'), name: facetData

		View = facetViewMap[facetData.type]
		view = @facetViews[facetData.name] = new View attrs: facetData

		# fetchResults and updateFacets when user changes a facets state
		@listenTo view, 'change', (queryOptions) => @model.set queryOptions

		view
	renderFacets: ->

		if config.templates.hasOwnProperty 'main'
			for facetData, index in @model.searchResults.current.get('facets')
				if facetViewMap.hasOwnProperty facetData.type
					@$(".#{facetData.name}-placeholder").html @createFacetView(facetData).el
		else
			fragment = document.createDocumentFragment()		

			for own index, facetData of @model.searchResults.current.get('facets')
				if facetViewMap.hasOwnProperty facetData.type
					fragment.appendChild @createFacetView(facetData).el
					fragment.appendChild document.createElement 'hr'
				else 
					console.error 'Unknown facetView', facetData.type

			@$('.facets').html fragment
				
	updateFacets: ->
		return if config.textSearch is 'simple'

		@$('.loader').hide()
		@$('.faceted-search > i.fa').css 'visibility', 'visible'

		current = @model.searchResults.current

		# If the size of the searchResults is 1 then it's the first time we render the facets
		if @model.searchResults.length is 1 or current.get('reset')
			
			@destroyFacets()

			# Render facets and attach to DOM
			@renderFacets()

		# If the size is greater than 1, the facets are already rendered and we call their update methods.
		else
			@update()

	# ### Events
	events: ->
		'click ul.facets-menu li.collapse-expand': 'toggleFacets'
		# Don't use @refresh as String, because the ev object will be passed.
		'click ul.facets-menu li.reset': (ev) -> 
			ev.preventDefault()
			@reset()
		'click ul.facets-menu li.switch button': (ev) ->
			ev.preventDefault()

			config.textSearch = if config.textSearch is 'advanced' then 'simple' else 'advanced'

			@$('.faceted-search').toggleClass 'search-type-simple'
			@$('.faceted-search').toggleClass 'search-type-advanced'

			if @model.searchResults.length is 0
				@model.trigger 'change'
			else
				@update()

	# The facets are slided one by one. When the slide of a facet is finished, the
	# next facet starts sliding. That's why we use a recursive function.
	toggleFacets: (ev) ->
		ev.preventDefault()

		icon = $(ev.currentTarget).find('i.fa')
		span = $(ev.currentTarget).find('span')

		open = icon.hasClass 'fa-expand'
		icon.toggleClass 'fa-compress'
		icon.toggleClass 'fa-expand'

		text = if open then 'Collapse' else 'Expand'
		span.text "#{text} facets"

		facetNames = _.keys @facetViews
		index = 0
		
		slideFacet = =>
			facetName = facetNames[index++]
			facet = @facetViews[facetName]

			if facet?
				# Don't close textSearch facet, but close others.
				if facetName is 'textSearch'
					slideFacet()
				else
					if open
						facet.showBody -> slideFacet()
					else
						facet.hideBody -> slideFacet()

		slideFacet()

	# ### Methods

	destroy: -> 
		@destroyFacets()
		@remove()

	addListeners: ->
		# Listen to the change:results event and (re)render the facets everytime the result changes.
		@listenTo @model.searchResults, 'change:results', (responseModel) =>
			@updateFacets()
			@trigger 'change:results', responseModel

		# The cursor is changed when @next or @prev are called. They are rarely used, since hilib
		# pagination uses @page.
		@listenTo @model.searchResults, 'change:cursor', (responseModel) => @trigger 'change:results', responseModel

		@listenTo @model.searchResults, 'change:page', (responseModel, database) => @trigger 'change:page', responseModel, database
		
		@listenTo @model.searchResults, 'request', @showLoader
			
		@listenTo @model.searchResults, 'sync', => @$('.overlay').hide()

		@listenTo @model.searchResults, 'unauthorized', => @trigger 'unauthorized'

	showLoader: ->
		facetedSearch = @$('.faceted-search')
		overlay = @$('.overlay')
		loader = overlay.find('div')

		overlay.width facetedSearch.width()
		overlay.height facetedSearch.height()
		overlay.css 'display', 'block'

		left =  facetedSearch.offset().left + facetedSearch.width()/2 - 12
		loader.css 'left', left

		top =  facetedSearch.offset().top + facetedSearch.height()/2 - 12
		top = '50vh' if facetedSearch.height() > $(window).height()
		loader.css 'top', top

	page: (pagenumber, database) -> @model.searchResults.current.page pagenumber, database

	next: -> @model.searchResults.moveCursor '_next'
	prev: -> @model.searchResults.moveCursor '_prev'

	hasNext: -> @model.searchResults.current.has '_next'
	hasPrev: -> @model.searchResults.current.has '_prev'

	# TODO: Restore change:sort listener
	sortResultsBy: (field) -> @model.set sort: field

	update: ->
		@facetViews.textSearch.update() if @facetViews.hasOwnProperty 'textSearch'
		
		for own index, data of @model.searchResults.current.get('facets')
			@facetViews[data.name]?.update(data.options)

	reset: ->
		@facetViews.textSearch.reset() if @facetViews.hasOwnProperty 'textSearch'

		for own facetView of @facetViews
			facetView.reset() if facetView.reset?

		@model.reset()

	refresh: (newQueryOptions) -> @model.refresh newQueryOptions

module.exports = MainView